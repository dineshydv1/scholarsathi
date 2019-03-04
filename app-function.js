const fs = require('fs');
const db = require('./src/db/mysql');

const appFunction = {
    fileUpload: (file, type) => {
        console.log('file upload');
        var fileName = (Date.now().toString() + '-' + file.name).replace(/ /g, '');
        let uploadPath = `/public/uploads/${type}/`;
        let path = sourcePath + uploadPath;
        return new Promise(function (resolve, reject) {
            file.mv(`${path}/${fileName}`, function (err) {
                if (err) {
                    reject(err);
                }
                resolve(uploadPath + fileName);
            });
        });
    },
    base64Upload: (base64, type) => {
        console.log('1');
        var base64Data = base64.replace(/^data:image\/png;base64,/, "");
        var fileName = (Date.now().toString()).replace(/ /g, '');
        let uploadPath = `/public/uploads/${type}/`;
        let path = sourcePath + uploadPath;
        return new Promise(function (resolve, reject) {
            fs.writeFileSync(path + `${fileName}.png`, base64Data, 'base64', function (err) {
                if (err) {
                    reject(err);
                }
                resolve(uploadPath + fileName);
            });
        })
    },
    appHeaderMenuData: async (req, res, next) => {
        // console.log(req.url);
        
        // get seo meta tag
        // console.log('path ',req.path);
        let seo = await db.Seo.findOne({where: { path: req.path }});
        res.locals.seo = seo;

        // header menu
        let headerMenu = await db.HeaderMenu.findAll({ where: { search_below: 'n' }, attributes: ['id', 'name'], order: [['order', 'ASC']] });
        res.locals.headerMenu = headerMenu;

        // app detail
        let appDetail = await db.AppDetail.findOne();
        res.locals.appDetail = appDetail;

        if (req.session.user) {
            let parent_id = req.session.user.parent_id;
            if (parent_id) {
                // get parent profile user
                let parentProfileUser = await db.User.findByPk(parent_id, { attributes: ['id', 'first_name', 'last_name'] });
                res.locals.parentUser = parentProfileUser;
            }
        } else {
            
        }
        next();
    },
    updateUserSession: (req, data) => {
        req.session.user = data;
    }
}

module.exports = appFunction;
