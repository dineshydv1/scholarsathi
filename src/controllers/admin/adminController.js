const fs = require('fs');
const db = require('./../../db/mysql');
const appFunction = require('../../../app-function');

const AdminController = {
    addAdminWeb: async (req, res) => {
        let adminRoles = await db.AdminRole.findAll({ attributes: ['id', 'name'] });
        return res.render('admin/add-admin', { adminRoles });
    },
    addAdminPost: async (req, res) => {
        var myfile = req.files.file;
        var filePath = null;
        if (myfile) {
            try {
                filePath = await appFunction.fileUpload(myfile, 'img');
                req.body.img = filePath;
            } catch (err) {
                return res.status(500).send(err);
            }
        }
        const admin = db.Admin.create(req.body)
        admin.then((result) => {
            req.flash('success', 'Admin added successfully');
            return res.redirect('back');
        }).catch((err) => {
            // if (err.name == 'SequelizeValidationError') {
            req.flash('error', err.errors.map((d) => d.message));
            // }
            return res.redirect('back');
        })
    },
    adminListWeb: async (req, res) => {
        let data = await db.Admin.findAll({
            include: [{ model: db.AdminRole, as: 'admin_role', attributes: ['name'] }],
        });
        // return res.send(data);
        return res.render('admin/admin-list', { data });
    },
    updateAdminWeb: async (req, res) => {
        let id = req.params.id;
        let adminRoles = await db.AdminRole.findAll({ attributes: ['id', 'name'] });
        let data = await db.Admin.findByPk(id);
        return res.render('admin/update-admin', { data, adminRoles });
    },
    updateAdminPost: async (req, res) => {
        // return res.send(req.body);
        let id = req.params.id;
        let body = req.body;
        var myfile = req.files.file;
        var filePath = null;
        if (myfile) {
            try {
                filePath = await appFunction.fileUpload(myfile, 'img');
                if (body.img_url) fs.unlinkSync(sourcePath + body.img_url);
            } catch (err) {
                return res.status(500).send(err);
            }
            body.img = filePath;
        }

        db.Admin.update(body, {
            where: { id }
        })
            .then(async (result) => {
                if (id == req.session.admin.id) {
                    const admin = await db.Admin.findByPk(id,
                        { include: [{ model: db.AdminRole, as: 'admin_role', attributes: ['name'] }] });
                    req.session.admin = admin;
                    req.session.role = admin.admin_role.name;
                }
            })
            .then(() => {
                req.flash('success', 'Admin updated successfully');
                return res.redirect('back');
            })
            .catch((err) => {
                req.flash('error', err.errors.map((d) => d.message));
                return res.redirect('back');
            })
    },
    changePasswordPost: (req, res) => {
        let id = req.params.id;
        let password = req.body.password;
        if (!password) {
            req.flash('error', 'Password is required');
            return res.redirect('back');
        } else {
            if (password.length <= 3) {
                req.flash('error', 'Please enter password at least 4 characters');
                return res.redirect('back');
            }
        }
        password = db.Admin.genHashPassword(req.body.password)
        db.Admin.update({ password }, { where: { id } })
            .then((result) => {
                req.flash('success', 'Password is Updated');
                return res.redirect('back');
            }).catch((err) => {
                req.flash('error', err.errors.map((d) => d.message));
                return res.redirect('back');
            });
    },
    deleteAdminWeb: (req, res) => {
        if (req.params.id == req.session.admin.id) {
            req.flash('error', 'You can not delete own');
            return res.redirect('back');
        }

        db.Admin.findByPk(req.params.id, { raw: true })
            .then((result) => {
                db.Admin.destroy({
                    where: { id: req.params.id }
                })
                    .then(() => {
                        // console.log(result.img);
                        fs.unlinkSync(sourcePath + result.img);
                        return res.redirect('back');
                    }).catch((err) => {
                        // console.log(err);
                        return res.redirect('back');
                    });
            }).catch(() => {
                return res.redirect('back');
            });
    }
}

module.exports = AdminController;