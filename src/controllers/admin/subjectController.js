const fs = require('fs');
const db = require('./../../db/mysql');
const appFunction = require('../../../app-function');
const Joi = require('joi');

const SubjectController = {
    subjectListWeb: async (req, res) => {
        const subjectList = await db.Subject.findAll({
            raw: true
            // attributes: ['id'],
            // where: db.sequelize.where( db.sequelize.fn('FIND_IN_SET', '13', db.sequelize.col('subcategories')), 'LIMIT', 1)
        });

        for (var i = 0; i < subjectList.length; i++) {
            subjectList[i].subcategoriesList = await db.Subcategory.findAll({ attributes: ['name'], where: { id: subjectList[i].subcategories.split(',') } }).map((d)=>d.name)
        }

        // return res.send(subjectList);
        return res.render('admin/subject-list', { data: subjectList })
    },
    addSubjectWeb: async (req, res) => {
        let category = await db.Category.findAll({ where: { name: 'education' } });
        return res.render('admin/add-subject', {
            data: category
        })
    },
    addSubjectPost: (req, res, next) => {
        // return res.send(req.body);
        let body = req.body;
        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('name'),
            subcategories: Joi.any().required().label('subcategory'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            req.flash('error', isValidate.error.details[0].message);
            return res.redirect('back');
        }
        db.Subject.create({
            name: body.name,
            subcategories: body.subcategories.toString()
        })
            .then((result) => {
                req.flash('success', 'Subject successfully added');
                return res.redirect('back');
            }).catch((err) => {
                console.log(err);
                req.flash('error', err.errors.map((d) => d.message));
                return res.redirect('back');
            })


    },
    updateSubjectWeb: async (req, res) => {
        let id = req.params.id;
        let data = await db.Subject.findByPk(id, { attributes: { exclude: ['created_at', 'updated_at'] } });
        // return res.send(data);
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
        let category = await db.Category.findAll({ where: { name: 'education' } });
        return res.render('admin/update-subject', { data, category, subcategory, categoryId: subcategory.length ? subcategory[0].category_id : null })
        // return res.send({ data, category, subcategory, categoryId: subcategory[0].category_id })
    },
    updateSubjectPost: (req, res) => {
        let id = req.params.id;
        let body = req.body;
        // return res.send(body);
        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('name'),
            subcategories: Joi.any().required().label('subcategory'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            req.flash('error', isValidate.error.details[0].message);
            return res.redirect('back');
        }
        db.Subject.update({
            name: body.name,
            subcategories: body.subcategories.toString()
        }, {
                where: { id }
            })
            .then((result) => {
                req.flash('success', 'Subject successfully Updated');
                return res.redirect('back');
            }).catch((err) => {
                console.log(err);
                req.flash('error', err.errors.map((d) => d.message));
                return res.redirect('back');
            })
    },
    deleteSubjectGet: (req, res) => {
        db.Subject.destroy({
            where: { id: req.params.id }
        })
            .then(() => {
                return res.redirect('back');
            }).catch((err) => {
                console.log(err);
                return res.redirect('back');
            });

    }

}

module.exports = SubjectController;