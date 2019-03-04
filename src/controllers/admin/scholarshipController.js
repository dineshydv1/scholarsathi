const fs = require('fs');
const moment = require('moment');
const csv = require('fast-csv');
const Joi = require('joi');
const XLSX = require('xlsx');
const appFunction = require('../../../app-function');
const { SmsController, EmailController } = require('./../others');
const db = require('./../../db/mysql');


const ScholarshipController = {
    scholarshipListWeb: (req, res) => {

        db.Scholarship.findAll({
            // attributes: ['id', 'end_date'],
            include: [
                {
                    model: db.Subcategory,
                    as: 'subcategories',
                    attributes: ['id', 'name'],
                    through: {
                        attributes: []
                    }
                }
            ]
        })
            .then((result) => {
                // return res.send(result);
                return res.render('admin/scholarship-list', {
                    data: result,
                    action: 'list'
                });
            }).catch((err) => {
                return res.send(err);
            });
    },
    activeScholarshipListWeb: async (req, res) => {
        let scholarship = await db.Scholarship.scope('onlyActive').findAll();
        return res.render('admin/scholarship-list', {
            data: scholarship,
            action: 'list'
        });
    },
    inactiveScholarshipListWeb: async (req, res) => {
        let scholarship = await db.Scholarship.scope('onlyInactive').findAll();
        return res.render('admin/scholarship-list', {
            data: scholarship,
            action: 'inactive'
        });
    },
    alwaysOpenScholarshipListWeb: async (req, res) => {
        let scholarship = await db.Scholarship.scope('onlyAlwaysOpen').findAll();
        return res.render('admin/scholarship-list', {
            data: scholarship,
            action: 'list'
        });
    },
    addScholarshipWeb: async (req, res) => {
        const categories = await db.Category.findAll({
            include: [{ model: db.Subcategory, as: 'subcategories', attributes: ['id', 'name'] }]
        }).then()
        // return res.send(categories);
        return res.render('admin/add-scholarship', {
            categories
        });
    },
    addScholarshipPost: async (req, res) => {
        let body = req.body;
        // return res.send(body);
        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().trim().label('name'),
            description: Joi.string().required(),
            // end_date: Joi.any().required().label('end_date'),
            categories_checkbox: Joi.any().required().label('subcategory'),
            min_age: Joi.number().required(),
            max_age: Joi.number().required()
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            req.flash('error', isValidate.error.details[0].message);
            return res.redirect('back');
        }
        if (+body.min_age > +body.max_age) {
            req.flash('error', 'min age must be less than max age');
            return res.redirect('back');
        }

        // upload thumbnail
        var thumbnail = req.files.thumbnail_image;
        var thumbnailPath = null;
        if (thumbnail) {
            try {
                thumbnailPath = await appFunction.fileUpload(thumbnail, 'img');
            } catch (err) {
                return res.status(500).send(err);
            }
        }
        body.img = thumbnailPath;

        // upload document
        var doc = req.files.additional_document;
        var docPath = null;
        if (doc) {
            try {
                docPath = await appFunction.fileUpload(doc, 'doc');
            } catch (err) {
                return res.status(500).send(err);
            }
        }
        body.document = docPath;


        db.Scholarship.create(body)
            .then((result) => {
                body.scholarship_id = result.id;
                let scholarSubArray = []
                if (body.categories_checkbox) {
                    if (!Array.isArray(body.categories_checkbox)) {
                        body.categories_checkbox = Array(body.categories_checkbox);
                    }
                    scholarSubArray = body.categories_checkbox.map((item) => {
                        return { scholarship_id: result.id, subcategory_id: item };
                    })
                }
                return db.ScholarSub.bulkCreate(scholarSubArray);
            })
            .then((data) => {
                req.flash('formValue');
                req.flash('success', `Scholarship added successfully. view submitted scholarship <a href="${baseUrl}/scholarship-detail/${body.scholarship_id}" target="_blank">here.</a>`);
                return res.redirect('back');
            })
            .catch((err) => {
                console.log(err);
                if (err.name == 'SequelizeValidationError') {
                    req.flash('error', err.errors.map((d) => d.message));
                    return res.redirect('back');
                }
                return res.send(err);
            });
    },
    deleteScholarship: async (req, res) => {
        let id = req.params.id;
        let scholaship = await db.Scholarship.findByPk(id, { raw: true }).then();
        db.Scholarship.destroy({
            where: { id: req.params.id }
        })
            .then((data) => {
                if (scholaship.img) fs.unlinkSync(sourcePath + scholaship.img);
                if (scholaship.document) fs.unlinkSync(sourcePath + scholaship.document);
                req.flash('success', 'Scholarship deleted successfully');
                return res.redirect(baseUrl + '/admin/scholarship-list');
            })
            .catch((err) => {
                if (err.name == 'SequelizeValidationError') {
                    req.flash('error', err.errors.map((d) => d.message));
                    return res.redirect(baseUrl + '/admin/scholarship-list');
                }
                return res.send(err);
            });
    },
    updateScholarshipWeb: async (req, res) => {
        let id = req.params.id;
        let scholaship = await db.Scholarship.findByPk(id, {
            raw: true,
            attributes: {
                include: [
                    [db.sequelize.fn('GROUP_CONCAT', db.sequelize.col('subcategories.id')), 'subcategoriesIds']
                ]
            },
            include: [
                {
                    model: db.Subcategory,
                    as: 'subcategories',
                    attributes: [],
                    through: {
                        attributes: []
                    }
                },
            ]
        }).then();
        // console.log(scholaship)
        const categories = await db.Category.findAll({
            include: [{ model: db.Subcategory, as: 'subcategories', attributes: ['id', 'name'] }]
        }).then();
        // console.log(categories)
        // return res.send({ data: scholaship, categories });

        return res.render('admin/update-scholarship', {
            data: scholaship,
            categories
        });
    },
    updateScholarshipPost: async (req, res) => {
        let id = req.params.id;
        let body = req.body;

        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().trim().label('name'),
            description: Joi.string().required(),
            // end_date: Joi.any().required().label('end_date'),
            categories_checkbox: Joi.any().required().label('subcategory'),
            min_age: Joi.number().required(),
            max_age: Joi.number().required()
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            req.flash('error', isValidate.error.details[0].message);
            return res.redirect('back');
        }

        if (+body.min_age > +body.max_age) {
            req.flash('error', 'min age must be less than max age');
            return res.redirect('back');
        }

        // upload thumbnail
        var thumbnail = req.files.thumbnail_image;
        var thumbnailPath = null;
        if (thumbnail) {
            try {
                thumbnailPath = await appFunction.fileUpload(thumbnail, 'img');
                if (body.img_url) fs.unlinkSync(sourcePath + body.img_url);
            } catch (err) {
                return res.status(500).send(err);
            }
            if (thumbnailPath) body.img = thumbnailPath;
        }


        // upload document
        var doc = req.files.additional_document;
        var docPath = null;
        if (doc) {
            try {
                docPath = await appFunction.fileUpload(doc, 'doc');
                if (body.doc_url) fs.unlinkSync(sourcePath + body.doc_url);
            } catch (err) {
                return res.status(500).send(err);
            }
            if (docPath) body.document = docPath;
        }

        db.Scholarship.update(body,
            {
                where: { id },
                individualHooks: true
            })
            .then(() => {
                return db.ScholarSub.destroy({ where: { scholarship_id: id } });
            })
            .then(() => {
                let scholarSubArray = [];
                if (body.categories_checkbox) {
                    if (!Array.isArray(req.body.categories_checkbox)) {
                        body.categories_checkbox = Array(req.body.categories_checkbox);
                    }
                    scholarSubArray = body.categories_checkbox.map((item) => {
                        return { scholarship_id: id, subcategory_id: item };
                    });
                }
                return db.ScholarSub.bulkCreate(scholarSubArray, { updateOnDuplicate: 'updatedAt' })
            })
            .then(() => {
                req.flash('success', `Scholarship updated successfully. view updated scholarship <a href="${baseUrl}/scholarship-detail/${id}" target="_blank">here.</a>`);

                return res.redirect('back');
            }).catch((err) => {
                if (err.name == 'SequelizeValidationError') {
                    req.flash('error', err.errors.map((d) => d.message));
                }
                return res.redirect('back');
            });
    },
    addScholarshipViaFileGet: (req, res) => {
        return res.render('admin/add-scholarship-via-file');
    },
    addScholarshipViaFilePost: async (req, res) => {
        if (!req.files.document) {
            req.flash('error', 'File is required');
            return res.redirect(`back`);
        }
        // upload document
        var doc = req.files.document;
        var docPath = null;
        if (doc) {
            try {
                docPath = await appFunction.fileUpload(doc, 'doc');
            } catch (err) {
                return res.status(500).send(err);
            }
        }
        // return res.send(docPath);

        let rows = [];
        // var docPath = '/public' + '/uploads/doc/ScholarShip_2003.xls';

        var workbook = XLSX.readFile(sourcePath + docPath);
        var sheet_name_list = workbook.SheetNames;
        var sheet = workbook.Sheets[sheet_name_list[0]];
        var xlData = XLSX.utils.sheet_to_json(sheet, {
            raw: true,
            header: 'A',
            defval: null
        });
        rows = xlData.slice(1, xlData.length);

        var allValueOfSubcategory = (val) => {
            let array = [];
            for (let i = 0; i < rows.length; i++) {
                if (i != 0) {
                    let data = rows[i];
                    if (data[val]) {
                        array.push(data[val].split('-').pop());
                    }
                }
            }
            return array;
        }

        for (let i = 0; i < rows.length; i++) {
            let data = rows[i];
            if (!data.B) {
                continue;
            }
            let test = await db.Scholarship.create({
                name: data.B,
                description: data.C,
                end_date: data.D ? moment(data.D, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']).format('YYYY-MM-DD') : null,
                award_oneliner: data.E,
                award_description: data.F,
                eligibility_oneliner: data.G,
                eligibility_description: data.H,
                country_name: data.O,
                how_to_apply: data.P,
                important_link: data.Q,
                document_required: data.R,
                apply_now_button: data.S,
                contact_person: data.T,
                img: data.U,
                document: data.V,
                min_age: data.W || 1,
                max_age: data.X || 100,
            })
                .then((scholarship) => {
                    let subcategoryIds = [];
                    let a = ['I', 'J', 'K', 'L', 'M', 'N'];
                    let b = ['AA', 'AB', 'AC', 'AD', 'AF', 'AE'];
                    for (let s = 0; s < a.length; s++) {
                        let indexItem = a[s];
                        if (data[indexItem]) {
                            let items = data[indexItem].split(',');
                            items.map((d) => {
                                if (d == 'Select All') {
                                    return subcategoryIds = [...subcategoryIds, ...allValueOfSubcategory(b[s])];
                                }
                                subcategoryIds.push(d.split('-').pop());
                            });
                        }
                    }
                    let scholarSubArray = Array.from(new Set(subcategoryIds)).map((item) => {
                        return { scholarship_id: scholarship.id, subcategory_id: item };
                    });
                    return db.ScholarSub.bulkCreate(scholarSubArray);
                })
                .catch((e) => {
                    console.log(e);
                    return res.send({ e });
                });
        }
        req.flash('success', 'Data upload successfully');
        return res.redirect(`back`);

        // for (let z in sheet) {
        //     if (z.toString().substr(0, 2) === 'AA') {
        //         columnA.push(XLSX.utils.format_cell(sheet[z]));
        //     }
        // }

        // csv.fromPath(sourcePath + docPath)
        //     .on('data', (data) => {
        //         rows.push(data);
        //     })
        //     .on('end', async () => {
        //         console.log('end');
        //         array = rows.slice(1, rows.length);
        //         return res.send(rows);
        // for (let i = 0; i < array.length; i++) {
        //     try {
        //         let scholarshipData = await db.Scholarship.uploadDataFromFile(db, array[i]);
        //         // console.log(i);
        //     } catch (err) {
        //         return res.send(500, err);
        //     }
        // }
        // fs.unlinkSync(sourcePath + docPath);
        // req.flash('success', 'Data upload successfully');
        // return res.redirect(`back`);
        // });

    },
    saveToArchivescholarshipGet: (req, res) => {
        let id = req.params.id;
        db.Scholarship.update(
            {
                archive_at: moment().format()
            },
            {
                where: { id }
            }).then((result) => {
                return res.redirect(`back`);
            }).catch((err) => {
                return res.redirect(`back`);
            });
    },
    saveToInactivecholarshipGet: (req, res) => {
        let id = req.params.id;
        db.Scholarship.update(
            {
                end_date: moment().format()
            },
            {
                where: { id }
            }).then((result) => {
                return res.redirect(`back`);
            }).catch((err) => {
                return res.redirect(`back`);
            });
    },
    matchedUserViaScholarshipWeb: async (req, res) => {
        let id = req.params.id;
        // return res.send({path: req.path})
        let scholarship = await db.Scholarship.findByPk(id, {
            raw: true,
            attributes: {
                include: [
                    [db.sequelize.fn('GROUP_CONCAT', db.sequelize.col('subcategories.id')), 'subcategoriesIds']
                ]
            },
            include: [
                {
                    as: 'subcategories',
                    model: db.Subcategory,
                    attributes: ['id'],
                    through: { attributes: [] }
                }
            ]
        })
        let subcategoriesIds = [];
        if (scholarship.subcategoriesIds) subcategoriesIds = scholarship.subcategoriesIds.split(',');

        // return res.send(scholarship);
        let minDate, maxDate;
        if (scholarship.min_age) {
            minDate = moment().subtract(scholarship.min_age, 'year').format();
        }
        if (scholarship.max_age) {
            maxDate = moment().subtract(scholarship.max_age, 'year').format();
        }

        // return res.send({
        //     minDate, maxDate, a:moment()
        // })

        // let keysArray = ['qualification_id', 'gender_id', 'category_id', 'religion_id', 'physical_challenge_id', 'preference_scholarship_id', 'subject_id'];

        // let whereCondition = keysArray.map((d, i) => {
        //     let data = {};
        //     data[d] = subcategoriesIds;
        //     return data;
        // });
        // return res.send(whereCondition);


        let userInterestIds = await db.UserSub.findAll({
            attributes: ['user_id'],
            where: {
                subcategory_id: subcategoriesIds
            },
            group: ['user_id']
        }).map(d => d.user_id)

        // return res.send(userInterestIds)

        let is_premium = 'y';
        if (req.query.user == 'free') {
            is_premium = 'n';
        }

        let user = await db.User.scope('childAccount').findAll({
            where: {
                is_premium,
                [db.sequelize.Op.or]: [
                    {
                        id: userInterestIds
                    },
                    {
                        qualification_id: subcategoriesIds
                    },
                    {
                        gender_id: subcategoriesIds
                    },
                    {
                        category_id: subcategoriesIds
                    },
                    {
                        religion_id: subcategoriesIds
                    },
                    {
                        physical_challenge_id: subcategoriesIds
                    },
                    {
                        preference_scholarship_id: subcategoriesIds
                    },
                    {
                        subject_id: subcategoriesIds
                    },
                    {
                        date_of_birth: {
                            [db.sequelize.Op.between]: [maxDate, minDate]
                        }
                    }
                ],
            }
        });
        // return res.send({
        //     scholarship,
        //     data: user,
        //     path: req.path,
        //     is_premium
        // })

        return res.render('admin/matched-user', {
            scholarship,
            data: user,
            path: req.path,
            is_premium
        });
    },
    sendSmsAlert: async (req, res) => {
        let body = req.body;    

        let usersMobiles = (await db.User.scope('childAccount').findAll({
            attributes: ['mobile'],
            where: {
                mobile_verified: 'y',
                id: body.checked_user.split(',')
            }
        }).map(d => d.mobile)).toString();

        try {
            let a = await SmsController.sendBulkSms({
                mobiles: usersMobiles,
                short_link: body.short_link,
                text: body.text
            });
            req.flash('success', 'SMS sent successfully')
        } catch (e) {
            console.log('e', e);
            req.flash('error', e)
        }
        return res.redirect('back');
    },
    emailAlert: async (req, res) => {
        let body = req.body;
        let users = await db.User.scope('childAccount').findAll({
            attributes: ['first_name', 'last_name', 'email'],
            where: {
                email_verified: 'y',
                id: body.checked_user.split(',')
            }
        });
        EmailController.sendEmailAlert(users, body).then().catch();
        req.flash('success', 'Email sending in progress....');
        return res.redirect(`back`);
        
    }

}

module.exports = ScholarshipController;