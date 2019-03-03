const moment = require('moment');
const db = require('./../../db/mysql');
const request = require('request');

const HomeController = {
    homeWeb: async (req, res) => {
        // console.log('hey i am home route');
        let searchMenu = await db.HeaderMenu.findAll({ where: { search_below: 'y' }, attributes: ['id', 'name'], order: [['order', 'ASC']] });

        let popularScholarship = await db.Scholarship.scope('onlyActive').findAll({
            order: [['views_count', 'DESC']],
            limit: 6
        });
        // return res.send(popularScholarship)
        let recentlyAddedScholarship = await db.Scholarship.scope('onlyActive').findAll({
            order: [['created_at', 'DESC']],
            limit: 6
        });

        let bestScholarsip = await db.BestScholarship.findAll({});
        // return res.send(popularScholarship)
        // console.log(bestScholarsip);
        // return res.send({
        //     popularScholarship,
        //     recentlyAddedScholarship,
        //     bestScholarsip,
        //     searchMenu
        // })
        return res.render('panel/home', {
            popularScholarship,
            recentlyAddedScholarship,
            bestScholarsip,
            searchMenu
        });
        // console.log('1221212121212121212122122212121');
    },
    aboutUsWeb: (req, res) => {
        console.log('aboutUsWeb 1221212121212121212122122212121');
        return res.render('panel/about');
    },
    contactUsWeb: (req, res) => {
        return res.render('panel/contact');
    },
    dashboardWeb: (req, res) => {
        return res.render('panel/dashboard');
    },
    careersWeb: (req, res) => {
        return res.render('panel/career');
    },
    settingWeb: (req, res) => {
        return res.render('panel/setting');
    },
    termAndConditions: async (req, res) => {
        return res.render('panel/term-and-conditions');
    }
}

module.exports = HomeController;