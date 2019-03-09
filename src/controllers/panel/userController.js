const fs = require('fs');
const Joi = require('joi');
const moment = require('moment');
const appFunction = require('../../../app-function');
const db = require('./../../db/mysql');
const { SmsController, EmailController } = require('./../others');

const UserController = {
    myProfileWeb: async (req, res) => {
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let annualIncome = [
            '0-50000 INR',
            '50000-1Lakh INR',
            '1Lakh - 5Lakh INR',
            '5Lakh - 10Lakh INR',
            '10Lakh - 20Lakh INR',
            'Above 20Lakh'
        ]

        let state = await db.State.findAll({ where: { country_id: 101 } });
        // return res.send(req.session.state_id)
        // city
        let city = [];
        if (req.session.user.state_id) {
            city = await db.City.findAll({ where: { state_id: req.session.user.state_id } });
        }

        // subject
        let subject = [];
        if (req.session.user.subject_id) {
            subject = await db.Subject.findAll({ attributes: ['id', 'name'] });
        }

        // user interest
        let userInterest = await db.UserSub.findAll({
            attributes: ['subcategory_id'],
            where: {
                user_id: req.session.user.id
            }
        }).map(d => d.subcategory_id.toString())


        let categoriesRow = await db.Category.findAll({
            where: {
                name: ['type', 'education', 'gender', 'religion', 'country', 'category']
            },
            attributes: ['id', 'name'],
            include: [
                {
                    model: db.Subcategory,
                    as: 'subcategories',
                    attributes: ['id', 'name']
                }
            ]
        });
        let categories = {};
        categoriesRow.forEach((data) => {
            categories[data.name] = data;
        });

        let physicalChallengeId = categories.type.subcategories.find(d => d.id == 51).id;


        // return res.send({
        //     categories,
        //     subject,
        //     physicalChallengeId,
        //     userInterest
        // });
        return res.render('panel/my-profile', {
            categories,
            state,
            city,
            months,
            subject,
            physicalChallengeId,
            userInterest,
            annualIncome
        });
    },
    updatePersonalData: (req, res, next) => {
        let userId = req.params.id;
        let body = req.body;
        let schema = {};
        if (body.is_master) {
            schema = Joi.object().keys({
                first_name: Joi.string().min(2).required().label('first name'),
                last_name: Joi.string().min(2).required().label('last name')
            }).unknown(true);
        } else {
            schema = Joi.object().keys({
                first_name: Joi.string().min(2).required().label('first name'),
                last_name: Joi.string().min(2).required().label('last name'),
                gender_id: Joi.string().required().label('gender'),
                // address: Joi.string().min(2).required().label('address'),
                date_of_birth: Joi.string().min(2).required().label('date of birth'),
                // pincode: Joi.number().required().label('pincode'),
                // mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile'),
                category_id: Joi.string().required().label('category'),
                // annual_family_income: Joi.string().required().label('annual family income'),
                religion_id: Joi.string().required().label('religion'),
                // city_id: Joi.string().required().label('city'),
                // state_id: Joi.string().required().label('state'),
                interest: Joi.string().required().label('interest').error((e) => 'Please select at least one interest tag')
            }).unknown(true);
        }
        const isValidate = Joi.validate(body, schema);

        if (isValidate.error) {
            return next(isValidate.error);
        }
        // return res.send(body);
        // return res.send(body);
        let interestArray = [];
        if (!body.is_master) {
            if (!body.interest) {
                return next({ message: 'Please select at least one interest tag' })
            }
            body.interest = body.interest.split(',');

            interestArray = body.interest.map((id) => {
                return {
                    user_id: +userId,
                    subcategory_id: +id
                }
            });
        }



        return db.User.update(body, { where: { id: userId } })
            .then(() => {
                if (body.is_master) {
                    return Promise.resolve();
                }
                // destory interest tags
                return db.UserSub.destroy({ where: { user_id: userId } })
            })
            .then(() => {
                if (body.is_master) {
                    return Promise.resolve();
                }
                // update interest tags
                return db.UserSub.bulkCreate(interestArray)
            })
            .then((result) => {
                // find user
                return db.User.findByPk(userId);
            })
            .then((user) => {
                appFunction.updateUserSession(req, user);
                return res.send({
                    message: 'Profile successfully update',
                    user
                });
            })
            .catch((err) => {
                return next(err);
            });
    },
    updateEducationData: (req, res, next) => {
        let userId = req.params.id;
        let body = req.body;
        const schema = Joi.object().keys({
            qualification_id: Joi.string().required().label('class'),
            // subject_id: Joi.string().required().label('subject'),
            // passing_year: Joi.number().integer().max(moment().year()).required().label('passing year'),
            // passing_month: Joi.string().required().label('passing month'),
            // institute_name: Joi.string().min(2).required().label('institute name'),
            // institute_pincode: Joi.number().required().label('institute pincode'),
            // institute_state_id: Joi.string().required().label('institute state'),
            // institute_city_id: Joi.string().required().label('institute city'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);

        if (isValidate.error) {
            return next(isValidate.error);
        }
        // return res.send(body);
        // return res.send(body);
        return db.User.update(body, { where: { id: userId } })
            .then((result) => {
                return db.User.findByPk(userId);
            })
            .then((user) => {
                appFunction.updateUserSession(req, user);
                return res.send({
                    message: 'Profile successfully update',
                    user
                });
            })
            .catch((err) => {
                return next(err);
            });
    },
    updateInterestData: (req, res, next) => {
        let userId = req.params.id;
        let body = req.body;
        const schema = Joi.object().keys({
            interest: Joi.string().required().label('interest'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);

        if (isValidate.error) {
            return next(isValidate.error);
        }



        body.interest = body.interest.split(',');

        let interestArray = body.interest.map((id) => {
            return {
                user_id: +userId,
                subcategory_id: +id
            }
        });
        return db.UserSub.destroy({ where: { user_id: userId } })
            .then(() => {
                return db.UserSub.bulkCreate(interestArray)
            })
            .then(() => {
                return res.send({
                    message: 'Interest tag successfully update'
                });
            }).catch((err) => {
                return next(err);
            });
    },
    createAnotherAccount: async (req, res, next) => {
        let parentId = req.params.id;
        let body = req.body;
        const schema = Joi.object().keys({
            first_name: Joi.string().min(2).required().label('first name'),
            last_name: Joi.string().min(2).required().label('last name'),
            mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile'),
            // email: Joi.string().required(),
            // password: Joi.string().min(4).required(),
            // qualification_id: Joi.string().required().label('qualification'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        // check email
        if (body.email) {
            const isValidate = Joi.validate({ email: body.email }, { email: Joi.string().email() });
            if (isValidate.error) {
                return next(isValidate.error);
            }

            try {
                let isEmail = await db.User.isEmailUnique(body.email, parentId);
            } catch (e) {
                return next(e);
            }
        }

        // check mobile
        if (body.mobile) {
            try {
                let isMobile = await db.User.isMobileUnique(body.mobile, parentId);
            } catch (e) {
                return next(e);
            }
        }

        body.parent_id = parentId;
        let user = db.User.create(body)
        user
            .then(async (user) => {
                let parentChildren = await db.ParentChildren.create({ parent_id: parentId, children_id: user.id });
                return Promise.resolve(user);
            })
            .then(async (user) => {
                if (user.email) {
                    try {
                        await EmailController.sendWelcomeEmail({
                            user_id: user.id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email,
                            clientIp: req.clientIp
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }
            })
            .then((user) => {
                req.flash('success', 'Scholarship profile added successfully. Go to Profile list to switch and complete that profile');
                return res.send({
                    message: 'Scholarship profile added successfully',
                    success: true,
                    user
                });
            }).catch((err) => {
                console.log(err);
                return next(err);
            })
    },
    loginAsChild: async (req, res) => {
        let loginAsChildId = req.params.id;
        try {
            let user = await db.User.findOne({
                where: {
                    id: loginAsChildId,
                    parent_id: req.session.user.id
                }
            })
            if (user) {
                appFunction.updateUserSession(req, user);
            }
            return res.redirect(`${baseUrl}/dashboard`);
        } catch (e) {
            return res.send(e);
        }
    },
    switchToParent: async (req, res) => {
        let parentId = req.session.user.parent_id;
        try {
            let user = await db.User.findOne({
                where: {
                    id: parentId
                }
            })
            if (user) {
                appFunction.updateUserSession(req, user);
            }
            return res.redirect(`${baseUrl}/dashboard`);
        } catch (e) {
            return res.send(e);
        }
    },
    becomePremiumMember: async (req, res) => {
        let userId = req.session.user.id;
        try {
            let user = await db.User.findOne({
                where: {
                    id: userId
                }
            })
            if (user) {
                user.is_premium = 'y';
                await user.save();
                appFunction.updateUserSession(req, user);
            }
            return res.redirect(baseUrl);
        } catch (e) {
            return res.send(e);
        }
    },
    accountList: async (req, res) => {
        let childrenList = await db.User.findAll({
            attributes: ['id', 'first_name', 'last_name', 'email', 'date_of_birth', 'is_premium'],
            where: { parent_id: req.session.user.id }
        });
        return res.render('panel/account-list', { childrenList });
    },
    scholarshipHistory: (req, res, next) => {
        let id = req.params.id;
        let body = req.body;

        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('scholarship name'),
            source: Joi.string().min(2).required().label('source'),
            year: Joi.number().integer().max(moment().year()).required().label('scholarship received year')
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        body.user_id = id;
        let userScholarshipHistory = db.UserScholarshipHistory.create(body)
        userScholarshipHistory
            .then((user) => {
                return res.send({
                    message: 'Scholarship history added successfully',
                    success: true,
                });
            }).catch((err) => {
                console.log(err);
                return next(err);
            })
    },
    editScholarshipHistoryById: (req, res, next) => {
        let userId = req.params.id;
        let body = req.body;

        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('scholarship name'),
            source: Joi.string().min(2).required().label('source'),
            year: Joi.number().integer().max(moment().year()).required().label('scholarship received year')
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        return db.UserScholarshipHistory.update(body, { where: { id: body.id, user_id: userId } })
            .then((user) => {
                return res.send({
                    message: 'Scholarship history update successfully',
                    success: true,
                });
            }).catch((err) => {
                console.log(err);
                return next(err);
            })

    },
    scholarshipHistoryList: async (req, res) => {
        let scholarshipHistory = await db.UserScholarshipHistory.findAll({
            where: { user_id: req.session.user.id }
        });
        return res.render('panel/scholarship-history', { scholarshipHistory });
    },
    deleteUserScholarshipHistoryGet: (req, res) => {
        let id = req.params.id;
        return db.UserScholarshipHistory.destroy({ where: { id } })
            .then(() => {
                return res.redirect('back');
            }).catch(() => {
                return res.redirect('back');
            })
    },
    savedUnSavedScholarship: (req, res) => {
        let scholarshipId = req.params.id;
        let condition = {
            user_id: req.session.user.id,
            scholarship_id: scholarshipId
        }

        return db.SavedScholarship.findOrCreate({ where: condition })
            .then(async (result) => {
                // return res.send({a: result});
                if (!result[1]) {
                    let a = await db.SavedScholarship.destroy({ where: condition })
                }
                return res.redirect('back');
            }).catch((e) => {
                return res.redirect('back');
            })
    },
    updateProfileImage: async (req, res, next) => {
        let userId = req.params.id;
        let body = req.body;
        var myfile = req.files.file;
        var filePath = null;
        if (!myfile) {
            return res.redirect('back');
        }

        if (myfile) {
            try {
                filePath = await appFunction.fileUpload(myfile, 'img');
                if (body.img_url) fs.unlinkSync(sourcePath + body.img_url);
            } catch (err) {
                return res.status(500).send(err);
            }
            body.img = filePath;
        }

        return db.User.update(body, { where: { id: userId } })
            .then((result) => {
                return db.User.findByPk(userId);
            })
            .then((user) => {
                appFunction.updateUserSession(req, user);
                return res.redirect('back');
            })
            .catch((err) => {
                return res.redirect('back');
            });
    },
    addUserDocument: async (req, res) => {
        let userId = req.params.id;
        let body = req.body;
        var myfile = req.files.file;
        var filePath = null;
        if (!myfile) {
            return res.redirect('back');
        }

        if (myfile) {
            try {
                filePath = await appFunction.fileUpload(myfile, 'doc');
            } catch (err) {
                return res.status(500).send(err);
            }
            body.doc = filePath;
        }
        body.user_id = userId;
        if (body.doc_name == 'Others') {
            body.name = body.doc_name_other;
        } else {
            body.name = body.doc_name;
        }

        const userDocument = db.UserDocument.create(body);
        userDocument
            .then((user) => {
                return res.redirect('back');
            })
            .catch((err) => {
                return res.redirect('back');
            });
    },
    documentListWeb: async (req, res) => {
        let document = await db.UserDocument.findAll({ where: { user_id: req.session.user.id } });
        // return res.send(document);
        return res.render('panel/document-list', { document });
    },
    deleteUserDocument: (req, res) => {
        db.UserDocument.findByPk(req.params.id, { raw: true })
            .then((result) => {
                db.UserDocument.destroy({
                    where: { id: req.params.id }
                })
                    .then(() => {
                        console.log(result.img);
                        fs.unlinkSync(sourcePath + result.img);
                        return res.redirect('back');
                    }).catch((err) => {
                        return res.redirect('back');
                    });
            }).catch(() => {
                return res.redirect('back');
            });
    },
    entranceExamListWeb: async (req, res) => {
        let entranceExam = await db.UserEntranceExam.findAll({ where: { user_id: req.session.user.id } });
        return res.render('panel/entrance-exam-list', { data: entranceExam });
    },
    addUserEntranceExam: (req, res, next) => {
        // return res.send({ a: 'dsadsa' });
        let id = req.params.id;
        let body = req.body;

        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('scholarship name'),
            level: Joi.string().min(2).required().label('level'),
            qualification: Joi.string().min(2).required().label('qualification'),
            occupation: Joi.string().min(2).required().label('occupation'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        body.user_id = id;
        let userEntranceExam = db.UserEntranceExam.create(body)
        userEntranceExam
            .then(() => {
                return res.send({
                    message: 'Entrance exam added successfully',
                    success: true,
                });
            }).catch((err) => {
                // console.log(err);
                return next(err);
            })
    },
    editEntranceExamById: (req, res, next) => {
        let userId = req.params.id;
        let body = req.body;

        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('scholarship name'),
            level: Joi.string().min(2).required().label('level'),
            qualification: Joi.string().min(2).required().label('qualification'),
            occupation: Joi.string().min(2).required().label('occupation'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }
        // console.log(body.id, userId);
        return db.UserEntranceExam.update(body, { where: { id: body.id, user_id: userId } })
            .then(() => {
                return res.send({
                    message: 'Entrance exam update successfully',
                    success: true,
                });
            }).catch((err) => {
                console.log(err);
                return next(err);
            })

    },
    deleteUserEntranceExamGet: (req, res) => {
        let id = req.params.id;
        return db.UserEntranceExam.destroy({ where: { id } })
            .then(() => {
                return res.redirect('back');
            }).catch(() => {
                return res.redirect('back');
            })
    },
    changePasswordPost: (req, res, next) => {
        let userId = req.session.user.id;
        let body = req.body;
        const schema = Joi.object().keys({
            password: Joi.string().min(4).required().label('old password'),
            new_password: Joi.string().min(4).required().label('new password'),
            new_confirm_password: Joi.string().min(4).required().label('confirm password')
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }
        if (body.new_password !== body.new_confirm_password) {
            return next({ message: 'New and confirm password does not match' });
        }

        return db.User.scope('withPassword').findByPk(userId)
            .then((user) => {
                return user.compare(body);
            }).then((user) => {
                user.password = db.User.genHashPassword(body.new_password);
                return user.save();
            }).then((user) => {
                return res.send({
                    message: 'Change password successfully',
                    user
                });
            })
            .catch((e) => {
                return next(e);
            })

        // return res.status(400).send({a: 'sdad'})
    },
    getMobileVerifyOtp: async (req, res, next) => {
        let user = req.session.user;
        let body = {
            mobile: user.mobile,
            user_id: user.id,
            type: 'mobile_verify',
            clientIp: req.clientIp
        }
        return SmsController.sendMobileOtp(body)
            .then((result) => {
                return res.send({
                    message: 'Otp Sent to your mobile',
                    result
                });
            })
            .catch((err) => {
                console.log(err)
                return next(err);
            })
    },
    verifyMobileWithOtp: async (req, res, next) => {
        let body = req.body;
        let user = req.session.user;
        const schema = Joi.object().keys({
            otp: Joi.number().required()
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        db.User.findByPk(user.id)
            .then(async (user) => {
                if (!user) return Promise.reject({ message: 'Invalid credentials' });
                let whereCondition = { user_id: user.id, mobile: user.mobile, otp: body.otp };
                let a = await db.Otp.verifyOtp(whereCondition);
                user.mobile_verified = 'y';
                return user.save();
            })
            .then((user) => {
                appFunction.updateUserSession(req, user);
                return res.send({
                    message: 'Mobile verified successfully',
                    data: user
                });
            })
            .catch((err) => {
                console.log(err);
                return next(err);
            });
    },
    getEmailVerifyOtp: (req, res, next) => {
        let user = req.session.user;
        let body = {
            email: user.email,
            user_id: user.id,
            type: 'email_verify',
            clientIp: req.clientIp
        }
        return EmailController.sendEmailOtp(body)
            .then((result) => {
                return res.send({
                    message: 'Otp Sent to your email',
                    result
                });
            })
            .catch((err) => {
                console.log(err)
                return next(err);
            })
    },
    verifyEmailWithOtp: (req, res, next) => {
        let body = req.body;
        let user = req.session.user;
        const schema = Joi.object().keys({
            otp: Joi.number().required()
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        db.User.findByPk(user.id)
            .then(async (user) => {
                if (!user) return Promise.reject({ message: 'Invalid credentials' });
                let whereCondition = { user_id: user.id, email: user.email, otp: body.otp };
                let a = await db.Otp.verifyOtp(whereCondition);
                user.email_verified = 'y';
                return user.save();
            })
            .then((user) => {
                appFunction.updateUserSession(req, user);
                return res.send({
                    message: 'Email verified successfully',
                    data: user
                });
            })
            .catch((err) => {
                console.log(err);
                return next(err);
            });
    },
    changeMobile: async (req, res, next) => {
        let user = req.session.user;
        let body = req.body;
        const schema = Joi.object().keys({
            mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile')
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }
        // check mobile
        if (body.mobile) {
            try {
                let isMobile = await db.User.isMobileUnique(body.mobile, user.id);
            } catch (e) {
                return next(e);
            }
        }
        return db.User.findByPk(user.id)
            .then(async (user) => {
                if (!user) return Promise.reject({ message: 'Invalid credentials' });
                user.mobile = body.mobile;
                user.mobile_verified = 'n';
                return user.save();
            })
            .then((user) => {
                req.flash('success', 'Mobile Changed successfully. Please go to my account and verify your mobile number');
                appFunction.updateUserSession(req, user);
                return res.send({
                    message: 'Mobile Chnage successfully',
                    data: user
                });
            })
            .catch((err) => {
                console.log(err);
                return next(err);
            });
    },
    changeEmail: async (req, res, next) => {
        let user = req.session.user;
        let body = req.body;
        const schema = Joi.object().keys({
            email: Joi.string().email()
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        // check email
        if (body.email) {
            try {
                let isEmail = await db.User.isEmailUnique(body.email, user.id);
            } catch (e) {
                return next(e);
            }
        }

        return db.User.findByPk(user.id)
            .then(async (user) => {
                if (!user) return Promise.reject({ message: 'Invalid credentials' });
                user.email = body.email;
                user.email_verified = 'n';
                return user.save();
            })
            .then((user) => {
                req.flash('success', 'Email Chnaged successfully. Please go to my account and verify your email');
                appFunction.updateUserSession(req, user);
                return res.send({
                    message: 'Email Chnage successfully',
                    data: user
                });
            })
            .catch((err) => {
                console.log(err);
                return next(err);
            });
    },
    unsubscribeServiceGet: async (req, res, next) => {
        let user = req.session.user;
        let action = req.query.action;
        return db.User.findByPk(user.id)
            .then(async (user) => {
                if (!user) return Promise.reject({ message: 'Server error' });
                if(action == 'email'){
                    user.email_verified = 'n';
                }else
                if(action == 'mobile'){
                    user.mobile_verified = 'n';
                }
                return user.save();
            })
            .then((user) => {
                req.flash('success', `Your ${action == 'email' ? 'email' : 'mobile SMS'} service unsubscribed successfully.`);
                appFunction.updateUserSession(req, user);
                return res.redirect('back')
            })
            .catch((err) => {
                console.log(err);
                return next(err);
            });
    }

}

module.exports = UserController;