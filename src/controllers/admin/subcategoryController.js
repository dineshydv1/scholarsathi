const fs = require('fs');
const appFunction = require('../../../app-function');

const Subcategory = require('./../../db/mysql').Subcategory;
const Category = require('./../../db/mysql').Category;
const db = require('./../../db/mysql');

const SubcategoryController = {
    addSubcategoryWeb: (req, res) => {
        Category.findAll({
            attributes: ['id', 'name']
        })
            .then((result) => {
                res.render('admin/add-subcategory', {
                    data: result
                });
            }).catch((err) => {
                return res.status(500).send(err);
            });
    },
    addSubcategoryPost: async (req, res) => {
        if (!req.body.subcategory_name) {
            req.flash('error', 'subcategory name is required');
            return res.redirect('back');
        } else
            if (!req.body.category_id) {
                req.flash('error', 'category is required');
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
        const subcategory = Subcategory.build({
            name: req.body.subcategory_name,
            category_id: req.body.category_id,
            img: filePath
        });
        subcategory.save()
            .then((result) => {
                req.flash('success', 'Sub category added successfully');
                return res.redirect('back');
            }).catch((err) => {
                if (err.name == 'SequelizeValidationError') {
                    req.flash('error', err.errors.map((d) => d.message));
                }
                return res.redirect('back');
            });
    },
    subcategoryListWeb: async (req, res) => {
        // let search = req.query.search;
        // let page = +req.params.page ? +req.params.page : 1;
        // let limit = 20;
        // let offset = limit * (page - 1);
        // let condition = {
        //     attributes: ['id', 'name', 'category_id'],
        //     include: [{ model: Category, attributes: ['name'], as: 'category'}],
        //     limit,
        //     offset
        // }
        // if(search){
        //     condition.where = {
        //         name: {
        //             [db.Sequelize.Op.like]: `%${search}%`
        //         }
        //     }
        // }
        // Subcategory.findAndCountAll(condition)
        //     .then((result) => {
        //         res.render('admin/subcategory-list', {
        //             data: result.rows,
        //             pages: Array.from({ length: Math.ceil(result.count / limit) }, (x, y) => y + 1),
        //             pagesCount: Math.ceil(result.count / limit),
        //             activePage: page,
        //             search
        //         });
        // }).catch((err) => {
        //         res.render('admin/subcategory-list', {
        //             error: err
        //         });
        //     });

        let data = await db.Subcategory.findAll({
            attributes: ['id', 'name', 'img', 'category_id'],
            include: [{ model: Category, attributes: ['name'], as: 'category' }],
        });
        res.render('admin/subcategory-list', { data });
    },
    deleteSubcategory: (req, res) => {
        // res.redirect('/admin/category-list');
        Subcategory.findByPk(req.params.id, { raw: true })
            .then((result) => {
                Subcategory.destroy({
                    where: { id: req.params.id }
                })
                    .then(() => {
                        console.log(result.img);
                        fs.unlinkSync(sourcePath + result.img);
                        return res.redirect(baseUrl + '/admin/subcategory-list');
                    }).catch((err) => {
                        return res.redirect(baseUrl + '/admin/subcategory-list');
                        console.log(err);
                    });
            }).catch(() => {

            });
    },
    updateSubcategoryWeb: async (req, res) => {
        Subcategory.findByPk(req.params.id, {
            include: [{ model: Category, attributes: ['id', 'name'], as: 'category' }]
        })
            .then(async (result) => {
                let categories = await Category.findAll({
                    attributes: ['id', 'name']
                }).then();
                res.render('admin/update-subcategory', {
                    data: result,
                    categories,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            }).catch((err) => {
                res.send(err);
            });
    },
    updateSubcategoryPost: async (req, res) => {
        if (!req.body.subcategory_name) {
            req.flash('error', 'subcategory name is required');
            return res.redirect('back');
        } else
            if (!req.body.category_id) {
                req.flash('error', 'category is required');
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

        Subcategory.update({
            name: req.body.subcategory_name,
            category_id: req.body.category_id,
            img: filePath
        }, {
                where: {
                    id: req.params.id
                }
            }).then((result) => {
                // console.log('result', result);
                req.flash('success', 'Sub category updated successfully');
                return res.redirect(baseUrl + `/admin/update-subcategory/${req.params.id}`);
            }).catch((err) => {
                if (err.name == 'SequelizeValidationError') {
                    req.flash('error', err.errors.map((d) => d.message));
                }
                return res.redirect(baseUrl + `/admin/update-subcategory/${req.params.id}`);
            });
    },
    subcategoryByCategoryId: async (req, res) => {
        let id = req.params.id;
        const subcategory = await db.Subcategory.findAll({ where: { category_id: id }, attributes: ['id', 'name'] });
        res.send({ message: 'data found', data: subcategory });
    }

}

module.exports = SubcategoryController;