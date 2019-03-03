const fs = require('fs');
const csv = require('fast-csv');
const db = require('./../../db/mysql');
const XLSX = require('xlsx');
const appFunction = require('../../../app-function');
const UserUpload = require('./../job/userUpload');

const UserController = {
    masterListWeb: async (req, res) => {
        let user = await db.User.scope('masterAccount').findAll();
        return res.render('admin/master-account-list', {
            data: user
        });
    },
    userListWeb: async (req, res) => {
        let id = req.params.id;
        let is_premium = 'y';
        if (req.query.user == 'free') {
            is_premium = 'n';
        }
        let user = await db.User.findByPk(id, {
            include: [
                {
                    model: db.User,
                    as: 'childrens',
                    where: { is_premium },
                    through: {
                        attributes: []
                    }
                }
            ]
        })
        return res.render('admin/user-list', {
            user,
            is_premium
        })
    },
    deleteUserGet: (req, res) => {
        db.User.findByPk(req.params.id, { raw: true, attributes: ['id', 'img'] })
            .then((result) => {
                db.User.destroy({
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
    },
    addUserViaFileGet: async (req, res) => {
        let state = await db.State.findAll({ where: { country_id: 101 } });
        let interest = await db.Subcategory.findAll({where: { category_id: 1 }})
        return res.render('admin/add-user-via-file', {
            state, interest
        });
    },
    addUserViaFilePost: async (req, res) => {
        // return res.send({
        //     body: req.body
        // });

        // if (!req.files.document) {
        //     req.flash('error', 'File is required');
        //     return res.redirect(`back`);
        // }
        // // upload document
        // var doc = req.files.document;
        // var docPath = null;
        // if (doc) {
        //     try {
        //         docPath = await appFunction.fileUpload(doc, 'doc');
        //     } catch (err) {
        //         return res.status(500).send(err);
        //     }
        // }

        let rows = [];
        var docPath = '/public' + '/uploads/doc/1549979634267-StudentUploadTemplate_97_2003.xls';

        var workbook = XLSX.readFile(sourcePath + docPath);
        var sheet_name_list = workbook.SheetNames;
        var sheet = workbook.Sheets[sheet_name_list[0]];
        var xlData = XLSX.utils.sheet_to_json(sheet, {
            raw: true,
            header: 'A',
            defval: null
        });
        rows = xlData.slice(1, xlData.length);

        return res.send({
            body: req.body,
            rows
        });

        req.flash('success', 'Data upload successfully');
        return res.redirect(`back`);



    }
}

module.exports = UserController;