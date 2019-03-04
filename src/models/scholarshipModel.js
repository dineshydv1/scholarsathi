const moment = require('moment');
const request = require('request');

module.exports = (sequelize, Sequelize) => {
    const ScholarshipSchema = sequelize.define('Scholarship', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        end_date: {
            type: Sequelize.DATE,
            allowNull: true
        },
        award_oneliner: {
            type: Sequelize.STRING,
            allowNull: true
        },
        award_description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        eligibility_oneliner: {
            type: Sequelize.STRING,
            allowNull: true
        },
        eligibility_description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        country_name: {
            type: Sequelize.STRING,
            allowNull: true
        },
        how_to_apply: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        important_link: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        document_required: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        apply_now_button: {
            type: Sequelize.STRING,
            allowNull: true
        },
        contact_person: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        min_age: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        max_age: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        img: {
            type: Sequelize.STRING,
            allowNull: true
        },
        document: {
            type: Sequelize.STRING,
            allowNull: true
        },
        views_count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        slug_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        short_link: {
            type: Sequelize.STRING,
            allowNull: true
        },
        archive_at: {
            type: Sequelize.DATE,
            allowNull: true
        },
        approved: {
            type: Sequelize.STRING,
            defaultValue: 'y'
        }
    }, {
            hooks: {
                beforeCreate: (scholarship) => {
                    console.log('00 beforeCreate');
                    if (scholarship.name) {
                        scholarship.name = scholarship.name.trim();
                        scholarship.slug_url = ScholarshipSchema.getSlugUrl(scholarship.name);
                    }

                    if (scholarship.end_date) {
                        scholarship.end_date = ScholarshipSchema.getEndDate(scholarship.end_date);
                        scholarship.archive_at = ScholarshipSchema.getArchiveAtDate(scholarship.end_date);
                    } else {
                        scholarship.end_date = null
                    }
                },
                beforeUpdate: (scholarship) => {
                    console.log('11 beforeUpdate');
                    if (scholarship.name) {
                        scholarship.name = scholarship.name.trim();
                        scholarship.slug_url = ScholarshipSchema.getSlugUrl(scholarship.name);
                    }
                    if (scholarship.end_date) {
                        scholarship.end_date = ScholarshipSchema.getEndDate(scholarship.end_date);
                        scholarship.archive_at = ScholarshipSchema.getArchiveAtDate(scholarship.end_date);
                    } else {
                        scholarship.end_date = null
                    }
                },
                afterCreate: async (scholarship) => {
                    scholarship.short_link = await ScholarshipSchema.getShortLink(scholarship.id);
                    return scholarship.save({ hooks: false });
                }
            },
            scopes: {
                end_date_asc: {
                    // return {
                    order: ['end_date']
                    // }
                },
                onlyArchived: function () {
                    return {
                        where: {
                            archive_at: {
                                [sequelize.Op.lt]: moment()
                            }
                        }
                    }
                },
                withoutArchived: function () {
                    return {
                        where: {
                            archive_at: {
                                [sequelize.Op.gt]: moment()
                            }
                        }
                    }
                },
                onlyActive: function () {
                    return {
                        where: {
                            [sequelize.Op.and]: [
                                {
                                    end_date: {
                                        [sequelize.Op.gte]: moment().startOf('day').utc(true).subtract({ h: 5, m: 30 })
                                    }
                                },
                                {
                                    end_date: {
                                        [sequelize.Op.ne]: null
                                    }
                                }
                            ]
                        }
                    }
                },
                onlyInactive: function () {
                    return {
                        where: {
                            [sequelize.Op.and]: [
                                {
                                    end_date: {
                                        [sequelize.Op.lt]: moment().set({ h: 0, m: 0, s: 0 }).utc(true).subtract({ h: 5, m: 30 })
                                    }
                                },
                                {
                                    end_date: {
                                        [sequelize.Op.ne]: null
                                    }
                                }

                            ]

                        }
                    }
                },
                onlyAlwaysOpen: function () {
                    return {
                        where: {
                            end_date: null
                        }
                    }
                },
                activeAndAlwaysOpen: function(){
                    return {
                        where: {
                            [sequelize.Op.or]: [
                                {
                                    end_date: {
                                        [sequelize.Op.gte]: moment().startOf('day').utc(true).subtract({ h: 5, m: 30 })
                                    }
                                },
                                {
                                    end_date: null
                                }
                            ]
                        }
                    }
                },
                all: {
                    where: {}
                }
            }
        });


    ScholarshipSchema.getSlugUrl = function (name) {
        return name.toLowerCase().replace(/[^a-zA-z0-9- ]/g, '').replace(/\s+/g, '-');
    }

    ScholarshipSchema.getEndDate = function (end_date) {
        console.log('33--------------------');
        console.log(end_date);
        return moment(end_date).subtract({ hour: 5, minutes: 30 }).format('YYYY-MM-DD HH:mm:mm');
    }

    ScholarshipSchema.getArchiveAtDate = function (end_date) {
        return moment(end_date).add(2, 'months').format('YYYY-MM-DD HH:mm:mm');
    }

    // get short url
    ScholarshipSchema.getShortLink = function (id) {
        return new Promise((resolve, reject) => {
            return request.get(`https://api-ssl.bitly.com/v3/shorten`,
                {
                    qs: {
                        "access_token": "b60cb10501b1261b44cff6c95e8bf41479ea5579",
                        "longUrl": `${scholarsathiUrl}/scholarship-detail/${id}`
                    },
                    json: true
                },
                (error, response, body) => {
                    if (error) { return reject({ error }); }
                    console.log(body)
                    if (body.status_code == 200) {
                        return resolve(body.data.url);
                    } else {
                        return reject({ message: 'Server error' });
                    }
                });
        });
    }


    ScholarshipSchema.uploadDataFromFile = function (db, scholarshipData) {
        let keyArray = ['name', 'description', 'end_date', 'award_oneliner', 'award_description', 'eligibility_oneliner', 'eligibility_description',
            'country_name', 'how_to_apply', 'important_link', 'document_required', 'apply_now_button', 'contact_person', 'img', 'document', 'min_age', 'max_age'];
        let body = {};
        keyArray.forEach((data, i) => {
            if (data == 'end_date') {
                return body[data] = moment(scholarshipData[i], ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']).format('YYYY-MM-DD');
            }
            body[data] = scholarshipData[i];
        });
        const scolarship = this.create(body);
        return scolarship.then((result) => {
            let subcategory = scholarshipData[keyArray.length];
            if (subcategory) {
                let scholarSubArray = subcategory.split(',').map((item) => {
                    return { scholarship_id: result.id, subcategory_id: item };
                });
                return db.ScholarSub.bulkCreate(scholarSubArray);
            } else {
                return Promise.resolve();
            }
        })
    };

    // prottoype
    ScholarshipSchema.prototype.getName = function () {
        return this.name
    };

    return ScholarshipSchema;
}