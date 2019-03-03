const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = 'scholarsathi';

module.exports = (sequelize, Sequelize) => {
    const UserSchema = sequelize.define('User', {
        first_name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'First name is required' },
            }
        },
        last_name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Last name is required' },
            }
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
            // unique: {
            //     msg: 'Email already exists'
            // },
            // validate: {
            //     isEmail: {
            //         msg: 'Please enter valid email address'
            //     }
            // }
        },
        mobile: {
            type: Sequelize.STRING,
            allowNull: true,
            // unique: {
            //     msg: 'Mobile already exists'
            // },
            // validate: {
            //     is: {
            //         args: /^[6-9]\d{9}$/,
            //         msg: 'Please enter valid mobile'
            //     }
            // }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: true,
            // validate: {
            //     notEmpty: {
            //         args: true,
            //         msg: 'Password field is required'
            //     },
            //     min: {
            //         args: 4,
            //         msg: 'Please enter password at least 4 character'
            //     }
            // }
        },
        qualification_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        token: {
            type: Sequelize.STRING,
            allowNull: true
        },
        gender_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        category_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        religion_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        physical_challenge_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        date_of_birth: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        address: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        annual_family_income: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        state_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        city_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        pincode: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        preference_scholarship_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        subject_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        passing_year: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        passing_month: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        institute_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        institute_pincode: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        institute_state_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        institute_city_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        // interest: {
        //     type: Sequelize.STRING,
        //     allowNull: true,
        // },
        parent_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        img: {
            type: Sequelize.STRING,
            allowNull: true
        },
        email_verified: {
            type: Sequelize.ENUM,
            values: ['y', 'n'],
            defaultValue: 'n'
        },
        mobile_verified: {
            type: Sequelize.ENUM,
            values: ['y', 'n'],
            defaultValue: 'n'
        },
        is_premium: {
            type: Sequelize.ENUM,
            values: ['y', 'n'],
            defaultValue: 'n'
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM,
            values: ['y', 'n'],
            defaultValue: 'y'
        },
    }, {
            hooks: {
                beforeCreate: async (user) => {
                    // hash password
                    if (user.password) {
                        user.password = UserSchema.genHashPassword(user.password);
                    }
                },
                afterCreate: async (user) => {
                    // generate token
                    user.token = UserSchema.genToken(user.id);
                    await user.save();
                },
            },
            defaultScope: {
                attributes: { exclude: ['password'] }
            },
            scopes: {
                withPassword: {
                    attributes: {}
                },
                masterAccount: {
                    where: {
                        parent_id: {
                            [sequelize.Op.or]: [null, '']
                        }
                    }
                },
                childAccount: {
                    where: {
                        [sequelize.Op.and]: {
                            [sequelize.Op.or]: [
                                {
                                    parent_id: {
                                        [sequelize.Op.ne]: null
                                    }
                                },
                                {
                                    parent_id: {
                                        [sequelize.Op.ne]: ''
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        });


    UserSchema.genHashPassword = (password) => {
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    UserSchema.genToken = (id) => {
        return jwt.sign({ id }, secretKey);
    }

    // password compare
    UserSchema.prototype.compare = function (body) {
        let user = this;
        let isTrue = bcrypt.compareSync(body.password, user.password);
        if (!isTrue) {
            return Promise.reject({ message: 'Invalid credentials' });
        }
        return user;
    }

    // user login 
    UserSchema.login = function (body) {
        const User = this;
        return User.scope('withPassword').scope('masterAccount').findOne(
            {
                where: {
                    [sequelize.Op.or]: [
                        {
                            email: body.email
                        },
                        {
                            mobile: body.email
                        }
                    ]
                },
            },
        )
            .then((result) => {
                if (result) {
                    return result.compare(body);
                } else {
                    return Promise.reject({ message: 'Invalid credentials' });
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }

    //  user find by email
    UserSchema.isEmailUnique = function (email, notId) {
        let whereCondition = { email };
        if (notId) {
            whereCondition.id = { [sequelize.Op.ne]: notId };
            whereCondition.parent_id = { [sequelize.Op.ne]: notId };
        }
        console.log(whereCondition);
        const User = this;
        return User.findOne({
            where: whereCondition,
            attributes: ['id']
        })
            .then((result) => {
                if (result) {
                    return Promise.reject({ message: 'Email already exists' });
                } else {
                    return Promise.resolve(result);
                }
            })
            .catch((err) => {
                return Promise.reject(err);  
            })
    }

    //  user find by mobile
    UserSchema.isMobileUnique = function (mobile, notId) {
        const User = this;
        let whereCondition = { mobile };
        if (notId) {
            whereCondition.id = { [sequelize.Op.ne]: notId };
            whereCondition.parent_id = { [sequelize.Op.ne]: notId };
        }
        return User.findOne(
            {
                where: whereCondition,
                attributes: ['id']
            },
        )
            .then((result) => {
                if (result) {
                    return Promise.reject({ message: 'Mobile already exists' });
                } else {
                    return Promise.resolve(result);
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }




    return UserSchema;
}
