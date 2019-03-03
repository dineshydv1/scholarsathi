const path = require('path');
const fs = require('fs');
const appFunction = require('../../../app-function');

const Category = require('./../../db/mysql').Category;
const db = require('./../../db/mysql');

const CategoryController = {
    addCategoryWeb: (req, res) => {
        return res.render('admin/add-category', {
            headTitle: 'add new category',
        });
    },
    categoryListWeb: async (req, res) => {
        let data = await db.Category.findAll();
        return res.render('admin/category-list', { data });
    },
    addCategoryPost: async (req, res) => {

        if (!req.body.category_name) {
            return res.render('admin/add-category', {
                errors: [{ message: 'name is required' }]
            });
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
        const category = Category.build({
            name: req.body.category_name,
            img: filePath
        });
        category.save()
            .then((result) => {
                // console.log(result);
                return res.render('admin/add-category', {
                    success: 'Category added successfully'
                });
            }).catch((err) => {
                return res.render('admin/add-category', {
                    errors: err.errors
                });
            });
    },
    deleteCategory: (req, res) => {
        // res.redirect('/admin/category-list');
        Category.findById(req.params.id)
            .then((result) => {
                Category.destroy({
                    where: { id: req.params.id }
                })
                    .then(() => {
                        console.log(result.img);
                        fs.unlinkSync(sourcePath + result.img);
                        return res.redirect(baseUrl + '/admin/category-list');
                    }).catch((err) => {
                        return res.redirect(baseUrl + '/admin/category-list');
                        console.log(err);
                    });
            }).catch(() => {

            })



    },
    updateCategoryWeb: (req, res) => {
        Category.findByPk(req.params.id, { raw: true })
            .then((result) => {
                // console.log(result);
                return res.render('admin/update-category', {
                    headTitle: 'Update category',
                    data: result
                });
            }).catch((err) => {
                // console.log(err);
                return res.render('admin/update-category', {
                    headTitle: 'Update category',
                    errors: err
                });

            });
    },
    updateCategoryPost: async (req, res) => {
        if (!req.body.category_name) {
            return res.render('admin/update-category', {
                errors: [{ message: 'name is required' }]
            });
        }
        var myfile = req.files.file;
        var filePath = null;
        if (myfile) {
            try {
                filePath = await appFunction.fileUpload(myfile, 'img');
            } catch (err) {
                return res.status(500).send(err);
            }
        } else {
            filePath = req.body.img_url ? req.body.img_url : null;
        }

        Category.update({
            name: req.body.category_name,
            img: filePath
        }, {
                where: {
                    id: req.params.id
                }
            }).then((result) => {
                console.log('result', result);
                return res.redirect(baseUrl + '/admin/update-category/' + req.params.id);
            }).catch((err) => {
                console.log(err);
                return res.redirect(baseUrl + '/admin/update-category/' + req.params.id);
            });
    }
}



module.exports = CategoryController;