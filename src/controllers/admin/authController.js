const fs = require('fs');
const db = require('../../db/mysql');
const appFunction = require('../../../app-function');

const AuthController = {
    loginWeb: (req, res) => {
        return res.render('admin/login');
    },
    loginPost: (req, res) => {
        let body = req.body;
        if (!body.email || !body.password) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('back');
        }
        db.Admin.login(body, db)
            .then((admin) => {
                req.session.admin = admin;
                req.session.role = admin.admin_role.name;
                return res.redirect('back');
            }).catch((err) => {
                req.flash('error', err);
                return res.redirect('back');
            })
    },
    logout: (req, res) => {
        req.session.destroy();
        // return res.send(req.originalUrl);
        return res.redirect('back');
    }
}



module.exports = AuthController;