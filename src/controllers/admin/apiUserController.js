const fs = require('fs');
const db = require('./../../db/mysql');
const appFunction = require('../../../app-function');
const Joi = require('joi');

const ApiUserController = {
    apiUserListWeb: async (req, res) => {
        let apiUser = await db.ApiUser.findAll();
        return res.render('admin/api-user-list', { data: apiUser });
    },
    addApiUserWeb: (req, res) => {
        return res.render('admin/add-api-user');
    },
    addApiUserPost: (req, res) => {
        let body = req.body;
        const schema = Joi.object().keys({
            name: Joi.string().required().label('name'),
            description: Joi.string().required().label('description'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            req.flash('error', isValidate.error.details[0].message);
            return res.redirect('back');
        }
        let apiUser = db.ApiUser.create(body);
        apiUser.then((result) => {
            req.flash('success', 'Api user successfully added');
            return res.redirect('back');
        }).catch((err) => {
            console.log(err)
            return res.send(err)
            req.flash('error', err.errors.map((d) => d.message));
            return res.redirect('back');
        })
    },
    enableApiUserStatus: (req, res)=>{
        let id = req.params.id;
        return db.ApiUser.update({
            status: 'y'
        },{
            where: {id}
        }).then((result) => {
            return res.redirect('back');
        }).catch((err) => {
            return res.redirect('back');
        })
    },
    disableApiUserStatus: (req, res)=>{
        let id = req.params.id;
        return db.ApiUser.update({
            status: 'n'
        },{
            where: {id}
        }).then((result) => {
            return res.redirect('back');
        }).catch((err) => {
            return res.redirect('back');
        })
    }

}

module.exports = ApiUserController;