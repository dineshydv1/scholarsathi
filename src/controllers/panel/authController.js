const Joi = require('joi');
const db = require('./../../db/mysql');
const appFunction = require('../../../app-function');
const { SmsController, EmailController } = require('./../others');

const AuthController = {
    registerPost: async (req, res, next) => {
        let body = req.body;
        const schema = Joi.object().keys({
            first_name: Joi.string().min(2).required().label('first name'),
            last_name: Joi.string().min(2).required().label('last name'),
            // mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(()=>'Please Enter valid mobile'),
            // email: Joi.string().required(),
            password: Joi.string().min(4).required()
        }).unknown(true);
        const isValidate = Joi.validate(req.body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        if (body.tnc == 'false') {
            return next({ message: 'Please accept the term and conditions' });
        }

        if (!body.email && !body.mobile) {
            return next({ message: 'Please enter valid email or mobile' });
        }

        // check email
        if (body.email) {
            const isValidate = Joi.validate({ email: body.email }, { email: Joi.string().email() });
            if (isValidate.error) {
                return next(isValidate.error);
            }

            try {
                let isEmail = await db.User.isEmailUnique(body.email);
            } catch (e) {
                return next(e);
            }
        }

        // check mobile
        if (body.mobile) {
            const isValidate = Joi.validate({ mobile: body.mobile }, { mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile') });
            if (isValidate.error) {
                return next(isValidate.error);
            }

            try {
                let isMobile = await db.User.isMobileUnique(body.mobile);
            } catch (e) {
                return next(e);
            }
        }

        // create user
        let user = db.User.create(req.body)
        user
            .then(async (result)=>{
                if(result.email){
                    try{
                        await EmailController.sendWelcomeEmail({
                            user_id: result.id,
                            first_name: result.first_name,
                            last_name: result.last_name,
                            email: result.email,
                            clientIp: req.clientIp
                        });
                    }catch(e){
                        console.log(e);
                    }
                }
                return result;
            })
            .then((result) => {
            req.session.user = result;
            return res.send({
                message: 'register successfully',
                success: true,
                data: result
            });
        }).catch((err) => {
            return next(err);
        })
    },
    loginPost: (req, res, next) => {
        const schema = Joi.object().keys({
            email: Joi.string().required().error(e => 'Please enter email or mobile'),
            password: Joi.string().min(4).required()
        }).unknown(true);
        const isValidate = Joi.validate(req.body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        db.User.login(req.body)
            .then((result) => {
                req.session.user = result;
                return res.send({
                    message: 'login successfully',
                    data: result
                });
            }).catch((err) => {
                return next(err);
            });
    },
    loginOtpGet: (req, res, next) => {
        let body = req.query;
        body.clientIp = req.clientIp;
        const schema = Joi.object().keys({
            mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }
        db.User.scope('masterAccount').findOne({
            attributes: ['id'],
            where: { mobile: body.mobile }
        })
            .then((user) => {
                if (!user) return Promise.reject({ message: 'Invalid credentials' });
                body.user_id = user.id;
                body.type = 'login';
                return SmsController.sendMobileOtp(body)
            })
            .then((result) => {
                return res.send({
                    message: 'Otp Sent to your mobile',
                    result
                })
            })
            .catch((err) => {
                console.log(err)
                return next(err);
            })
    },
    loginWithOtpPost: (req, res, next) => {
        let body = req.body;
        let clientIp = req.clientIp;
        const schema = Joi.object().keys({
            mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile'),
            otp: Joi.number().required(),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        db.User.scope('masterAccount').findOne({
            where: { mobile: body.mobile }
        })
            .then(async (user) => {
                if (!user) return Promise.reject({ message: 'Invalid credentials' });
                let whereCondition = { mobile: body.mobile, otp: body.otp };
                let a = await db.Otp.verifyOtp(whereCondition);
                user.mobile_verified = 'y';
                return user.save();
            })
            .then((user) => {
                appFunction.updateUserSession(req, user);
                return res.send({
                    message: 'login successfully',
                    data: user
                });
            })
            .catch((err) => {
                console.log(err);
                return next(err);
            })
    },
    forgotPasswordOtpGet: (req, res, next) => {
        let body = req.query;
        body.clientIp = req.clientIp;
        const schema = Joi.object().keys({
            mobile: Joi.string().error(() => 'Please Enter valid Email/Mobile'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }
        let whereCondition = null;
        let isMobile = !isNaN(body.mobile);
        if (isMobile) {
            // mobile validate
            const isValidate = Joi.validate({ mobile: body.mobile }, {
                mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile')
            });
            if (isValidate.error) {
                return next(isValidate.error);
            }
            whereCondition = {
                mobile: body.mobile
            }
        } else {
            // email validate
            const isValidate = Joi.validate({ mobile: body.mobile }, {
                mobile: Joi.string().email().error(() => 'Please Enter valid email')
            });
            if (isValidate.error) {
                return next(isValidate.error);
            }
            whereCondition = {
                email: body.mobile
            }
        }



        db.User.scope('masterAccount').findOne({
            attributes: ['id'],
            where: whereCondition
        })
            .then((user) => {
                if (!user) return Promise.reject({ message: 'Invalid credentials' });
                body.user_id = user.id;
                body.type = 'forgot';
                if (isMobile) {
                    return SmsController.sendMobileOtp(body);
                } else {
                    body.email = body.mobile;
                    return EmailController.sendEmailOtp(body);
                }
            })
            .then((result) => {
                return res.send({
                    message: 'Otp Sent to your ' + (isMobile ? 'mobile' : 'email'),
                    result
                })
            })
            .catch((err) => {
                console.log(err)
                return next(err);
            })
    },
    verifyForgotPasswordOtp: (req, res, next) => {
        let body = req.body;
        const schema = Joi.object().keys({
            mobile: Joi.string().error(() => 'Please Enter valid Email/Mobile'),
            otp: Joi.number().required(),
            password: Joi.string().min(4).required().label('password'),
            confirm_password: Joi.string().min(4).required().label('confirm password'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            return next(isValidate.error);
        }

        let whereCondition = null;
        let isMobile = !isNaN(body.mobile);
        if (isMobile) {
            // mobile validate
            const isValidate = Joi.validate({ mobile: body.mobile }, {
                mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile')
            });
            if (isValidate.error) {
                return next(isValidate.error);
            }
            whereCondition = {
                mobile: body.mobile
            }
        } else {
            // email validate
            const isValidate = Joi.validate({ mobile: body.mobile }, {
                mobile: Joi.string().email().error(() => 'Please Enter valid email')
            });
            if (isValidate.error) {
                return next(isValidate.error);
            }
            whereCondition = {
                email: body.mobile
            }
        }

        if (body.password !== body.confirm_password) {
            return next({ message: 'Password and confirm password does not match' });
        }


        db.User.scope('masterAccount').scope('withPassword').findOne({
            attributes: ['id'],
            where: whereCondition
        })
            .then(async (user) => {
                if (!user) return Promise.reject({ message: 'Invalid credentials' });
                body.user_id = user.id;
                whereCondition.otp = body.otp;
                let a = await db.Otp.verifyOtp(whereCondition);
                if (isMobile) {
                    user.mobile_verified = 'y';
                } else {
                    user.email_verified = 'y';
                }
                return user.save();
            })
            .then((user) => {
                user.password = db.User.genHashPassword(body.password);
                return user.save();
            })
            .then((user) => {
                return res.send({
                    message: 'Password changed successfully, please login to continue',
                });
            })
            .catch((err) => {
                console.log(err);
                return next(err);
            });
    },
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('back');
    }
}

module.exports = AuthController;