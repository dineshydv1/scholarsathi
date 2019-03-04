const fs = require('fs');
const appFunction = require('../../../app-function');
const db = require('./../../db/mysql');


const ExtraAndCommonController = {
    dashboardWeb: async (req, res) => {

        // return res.send({
        //     scholarshipCount: await db.Scholarship.count()
        // })
        let data = {
            scholarshipCount: await db.Scholarship.count(),
            categoryCount: await db.Category.count(),
            subcategoryCount: await db.Subcategory.count(),
            admins: await db.Admin.findAndCountAll({ attributes: ['id', 'name', 'img'], limit: 4 })
        }
        // return res.send(data)
        return res.render('admin/index', data);
    },
    uploadNewFileWeb: (req, res) => {
        return res.render('admin/upload-file', {
            data: req.flash('data')[0]
        });
    },
    uploadNewFilePost: async (req, res) => {
        // let filePath = sourcePath + '/public/uploads/img/out.png';
        // var writeStream = fs.createWriteStream(publicPath + '/a.png');
        // gm(filePath)
        //     .resize(353, 257)
        //     .autoOrient()
        //     .write(writeStream, function (err) {
        //         if (err) {
        //             console.log(err);
        //             return res.send({ err })
        //         }
        //         return res.send({ a: 'dsad' })

        //     })

        if (!req.files.document) {
            req.flash('error', 'File is required');
            return res.redirect('back');
        }
        // upload document
        var myfile = req.files.document;
        var filePath = null;
        if (myfile) {
            try {
                let type = req.body.upload_type == 'image' ? 'img' : 'doc';
                filePath = await appFunction.fileUpload(myfile, type);
            } catch (err) {
                return res.status(500).send(err);
            }
        }

        req.flash('success', 'File upload successfully');
        req.flash('data', { url: filePath });
        return res.redirect('back');
    },
    deleteAllListById: (req, res) => {
        // return res.send(req.body);
        let ids = req.body.ids.split(',');
        let img = req.body.img.split(',');
        let document = req.body.document.split(',');
        let type = req.body.type;
        if (!ids) return res.redirect('back');
        if (!type) return res.redirect('back');
        let tableModal = null;
        switch (type) {
            case 'category':
                tableModal = db.Category;
                break;
            case 'subcategory':
                tableModal = db.Subcategory;
                break;
            case 'scholarship':
                tableModal = db.Scholarship;
                break;
            case 'admin':
                tableModal = db.Admin;
                break;
            case 'user':
                tableModal = db.User;
                break;
            case 'contact':
                tableModal = db.Contact;
                break;
            case 'career':
                tableModal = db.Career;
                break;
        }

        tableModal.destroy({
            where: {
                id: ids
            }
        })
        .then(async ()=>{
            if(type == 'user'){
                await tableModal.destroy({
                    where: {
                        parent_id: ids
                    }
                })
            }
            return Promise.resolve();
        })
        .then(() => {
            if (img[0]) {
                for (let i = 0; i < img.length; i++) {
                    fs.unlinkSync(sourcePath + img[i]);
                }
            }
            if (document[0]) {
                for (let i = 0; i < document.length; i++) {
                    fs.unlinkSync(sourcePath + document[i]);
                }
            }
            return res.redirect('back');
        }).catch((e) => {
            return res.redirect('back');
        })
    },
    appDetailWeb: async (req, res) => {
        let appDetail = await db.AppDetail.findOne();
        return res.render('admin/app-detail', { data: appDetail });
    },
    updateAppDetailPost: async (req, res) => {
        let appDetail = await db.AppDetail.update(req.body, { where: { id: 1 } })
        return res.redirect('back')
    },
    contactListWeb: async (req, res)=>{
        let contactList = await db.Contact.findAll();
        return res.render('admin/contact-list', {data: contactList});
    },
    careerListWeb: async (req, res)=>{
        let careerList = await db.Career.findAll();
        return res.render('admin/career-list', {data: careerList});
    }

};

module.exports = ExtraAndCommonController;