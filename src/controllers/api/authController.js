const Joi = require('joi');
const db = require('./../../db/mysql');

const AuthController = {
    // registerPost: (req, res, next)=>{
    //     const schema = Joi.object().keys({
    //         first_name: Joi.string().min(2).required().label('first name'),
    //         last_name: Joi.string().min(2).required().label('last name'),
    //         email: Joi.string().required(),
    //         mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(()=>'Please Enter valid mobile'),
    //         password: Joi.string().required()
    //     }).unknown(true);
    //     const isValidate = Joi.validate(req.body, schema);
    //     if(isValidate.error){
    //         return next(isValidate.error);
    //     }

    //     let user = db.User.create(req.body)
    //     user.then((result)=>{
    //         return res.send(result);
    //     }).catch((err)=>{
    //         return next(err);
    //     })


    //     // return res.send({a: 'ddd'});
    // }
}

module.exports = AuthController;