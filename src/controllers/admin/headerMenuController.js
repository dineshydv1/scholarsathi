const fs = require('fs');
const db = require('./../../db/mysql');
const appFunction = require('../../../app-function');
const Joi = require('joi');

const HeaderMenuController = {
    headerMenuListWeb: async (req, res) => {
        const headerMenuList = await db.HeaderMenu.findAll();
        return res.render('admin/header-menu-list', { data: headerMenuList })
    },
    addHeaderMenuWeb: async (req, res) => {
        let category = await db.Category.findAll();
        return res.render('admin/add-header-menu', {
            data: category
        })
    },
    addHeaderMenuPost: (req, res, next) => {
        // return res.send(req.body);
        let body = req.body;
        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('name'),
            order_number: Joi.any().required().label('order'),
            subcategories: Joi.any().required().label('subcategory'),
            search_below: Joi.any().required().label('search below'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            req.flash('error', isValidate.error.details[0].message);
            return res.redirect('back');
        }
        db.HeaderMenu.create({
            name: body.name,
            order: body.order_number,
            subcategories: body.subcategories.toString(),
            search_below: body.search_below
        })
            .then((result) => {
                req.flash('success', 'Header menu successfully added');
                return res.redirect('back');
            }).catch((err) => {
                console.log(err);
                return res.send(err);
                req.flash('error', err.errors.map((d) => d.message));
                return res.redirect('back');
            })


    },
    updateHeaderMenuWeb: async (req, res) => {
        let id = req.params.id;
        let data = await db.HeaderMenu.findByPk(id);
    
        const tempSQL = db.sequelize.dialect.QueryGenerator.selectQuery('subcategories',{
            attributes: ['category_id'],
            where: {
                id: data.subcategories.split(',')[0]
            }}).slice(0,-1);

        let subcategory = await db.Subcategory.findAll({
            where: {
                category_id: {
                    [db.sequelize.Op.eq]: db.sequelize.literal('(' + tempSQL + ')')
                }
            },
            attributes: { exclude: ['img'] }
        })

        let category = await db.Category.findAll();
        return res.render('admin/update-header-menu', { data, category, subcategory, categoryId: subcategory[0].category_id })
        // return res.send({ data, category, subcategory, categoryId: subcategory[0].category_id })
    },
    updateHeaderMenuPost: (req, res) => {
        let id = req.params.id;
        let body = req.body;
        // return res.send(body);
        const schema = Joi.object().keys({
            name: Joi.string().min(2).required().label('name'),
            order_number: Joi.any().required().label('order'),
            subcategories: Joi.any().required().label('subcategory'),
            search_below: Joi.any().required().label('search below'),
        }).unknown(true);
        const isValidate = Joi.validate(body, schema);
        if (isValidate.error) {
            req.flash('error', isValidate.error.details[0].message);
            return res.redirect('back');
        }
        db.HeaderMenu.update({
            name: body.name,
            order: body.order_number,
            subcategories: body.subcategories.toString(),
            search_below: body.search_below
        }, {
                where: { id }
            })
            .then((result) => {
                req.flash('success', 'Header menu successfully Updated');
                return res.redirect('back');
            }).catch((err) => {
                console.log(err);
                req.flash('error', err.errors.map((d) => d.message));
                return res.redirect('back');
            })
    },
    deleteHeaderMenuPost: (req, res)=>{
        db.HeaderMenu.findByPk(req.params.id, { raw: true })
        .then((result) => {
            db.HeaderMenu.destroy({
                where: { id: req.params.id }
            })
                .then(() => {
                    console.log(result.img);
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

module.exports = HeaderMenuController;