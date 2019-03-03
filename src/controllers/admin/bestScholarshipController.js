const fs = require('fs');
const db = require('./../../db/mysql');
const appFunction = require('../../../app-function');
const Joi = require('joi');

const BestScholarshipController = {
    bestScholarshipListWeb: async (req, res) => {
        const bestSchoolarshipList = await db.BestScholarship.findAll();
        return res.render('admin/best-scholarship-list', { data: bestSchoolarshipList });
    },
    addBestScholarshipWeb: async (req, res) => {
        let category = await db.Category.findAll();
        return res.render('admin/add-best-scholarship', {
            data: category
        })
    },
    addBestScholarshipPost: async (req, res, next) => {
        // return res.send(req.body);
        let body = req.body;
        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('name'),
            sub_title: Joi.string().min(2).required().label('sub title'),
            order_number: Joi.any().required().label('order'),
            subcategories: Joi.any().required().label('subcategory'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            req.flash('error', isValidate.error.details[0].message);
            return res.redirect('back');
        }


        var myfile = req.files.file;
        var filePath = null;
        if (myfile) {
            try {
                filePath = await appFunction.fileUpload(myfile, 'img');
            } catch (err) {
                return res.status(500).send(err);
            }
        }

        db.BestScholarship.create({
            name: body.name,
            sub_title: body.sub_title,
            order: body.order_number,
            subcategories: body.subcategories.toString(),
            img: filePath
        })
            .then((result) => {
                req.flash('success', 'Best scholarship successfully added');
                return res.redirect('back');
            }).catch((err) => {
                console.log(err);
                req.flash('error', err.errors.map((d) => d.message));
                return res.redirect('back');
            })


    },
    updateBestScholarshipWeb: async (req, res) => {
        let id = req.params.id;
        let data = await db.BestScholarship.findByPk(id, { attributes: { exclude: ['created_at', 'updated_at'] } });

        const tempSQL = db.sequelize.dialect.QueryGenerator.selectQuery('subcategories', {
            attributes: ['category_id'],
            where: {
                id: data.subcategories.split(',')[0]
            }
        }).slice(0, -1);

        let subcategory = await db.Subcategory.findAll({
            where: {
                category_id: {
                    [db.sequelize.Op.eq]: db.sequelize.literal('(' + tempSQL + ')')
                }
            },
            attributes: { exclude: ['img', 'created_at', 'updated_at'] }
        })

        let category = await db.Category.findAll();
        return res.render('admin/update-best-scholarship', { data, category, subcategory, categoryId: subcategory[0].category_id })
        // return res.send({ data, category, subcategory, categoryId: subcategory[0].category_id })
    },
    updateBestScholarshipPost: async (req, res) => {
        let id = req.params.id;
        let body = req.body;
        // return res.send(body);
        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('name'),
            sub_title: Joi.string().min(2).required().label('sub title'),
            order_number: Joi.any().required().label('order'),
            subcategories: Joi.any().required().label('subcategory'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            req.flash('error', isValidate.error.details[0].message);
            return res.redirect('back');
        }

        var myfile = req.files.file;
        var filePath = null;
        if (myfile) {
            try {
                filePath = await appFunction.fileUpload(myfile, 'img');
                if (req.body.img_url) fs.unlinkSync(sourcePath + req.body.img_url);
            } catch (err) {
                return res.status(500).send(err);
            }
        } else {
            filePath = req.body.img_url ? req.body.img_url : null;
        }

        db.BestScholarship.update({
            name: body.name,
            sub_title: body.sub_title,
            order: body.order_number,
            subcategories: body.subcategories.toString(),
            img: filePath
        }, {
                where: { id }
            })
            .then((result) => {
                req.flash('success', 'Best scholarship successfully Updated');
                return res.redirect('back');
            }).catch((err) => {
                console.log(err);
                req.flash('error', err.errors.map((d) => d.message));
                return res.redirect('back');
            })
    },
    deleteBestScholarshipWeb: (req, res) => {
        db.BestScholarship.findByPk(req.params.id, { raw: true })
        .then((result) => {
            db.BestScholarship.destroy({
                where: { id: req.params.id }
            })
                .then(() => {
                    console.log(result.img);
                    fs.unlinkSync(sourcePath + result.img);
                    return res.redirect('back');
                }).catch((err) => {
                    console.log(err);
                    return res.redirect('back');
                });
        }).catch(() => {
            return res.redirect('back');
        });
    }

}

module.exports = BestScholarshipController;