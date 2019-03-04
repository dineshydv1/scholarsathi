const moment = require('moment');
const db = require('./../../db/mysql');
const _ = require('lodash');

const ScholarshipController = {
    scholarshipDetailWeb: async (req, res) => {
        let { id, slug } = req.params;
        let whereOption = { id };
        if (slug) whereOption.slug_url = slug;

        // popular scholarship
        let popularScholarship = await db.Scholarship.scope('onlyActive').findAll({
            order: [['views_count', 'DESC']],
            limit: 4
        });


        let update = await db.Scholarship.update(
            { views_count: db.sequelize.literal('views_count + 1') },
            { where: whereOption, })

        const scholarship = await db.Scholarship.findOne({
            raw: true,
            attributes: {
                include: [
                    [db.sequelize.fn('COUNT', db.sequelize.col('saved.user_id')), 'saved_count']
                ]
            },
            where: whereOption,
            include: [
                {
                    as: 'saved',
                    model: db.SavedScholarship,
                    attributes: ['user_id'],
                    where: {
                        user_id: req.session.user ? req.session.user.id : null
                    },
                    required: false
                }
            ]
        });
        if (scholarship.document) {
            scholarship.document = scholarship.document.trim();
        }
        // return res.send({scholarship });
        return res.render('panel/scholarship-detail', {
            scholarship,
            popularScholarship
        });
    },
    scholarshipListWeb: async (req, res) => {
        // return res.send(req.query);
        let { action, search } = req.query;
        let { id } = req.params;
        let ids;

        // popular scholarship
        let popularScholarship = await db.Scholarship.scope('onlyActive').findAll({
            order: [['views_count', 'DESC']],
            limit: 4
        });

        // recently added scholarship
        let recentlyAddedScholarship = await db.Scholarship.scope('onlyActive').findAll({
            order: [['created_at', 'DESC']],
            limit: 4
        });


        if (action == 'bestScholarship') {
            let bestScholarship = await db.BestScholarship.findByPk(id, { attributes: ['subcategories'] });
            ids = bestScholarship.subcategories;
            // return res.send(bestScholarship)
        } else if (action == 'headerMenu') {
            let headerMenu = await db.HeaderMenu.findByPk(id, { attributes: ['subcategories'] });
            ids = headerMenu.subcategories;
        }

        let whereCondition = {}
        if (ids) {
            ids = ids.split(',');
            let scholarSub = await db.ScholarSub.findAll(
                {
                    where: { subcategory_id: ids },
                    attributes: ['scholarship_id'],
                    group: ['scholarship_id']
                });
            whereCondition = { id: scholarSub.map(d => d.scholarship_id) };
        }

        let dbScholarship = db.Scholarship;
        if (search) {
            whereCondition[db.sequelize.Op.or] = [
                {
                    name: {
                        [db.sequelize.Op.like]: `%${search}%`
                    }
                },
                {
                    description: {
                        [db.sequelize.Op.like]: `%${search}%`
                    }
                }
            ]
        } else {
            dbScholarship = dbScholarship.scope('onlyActive');
        }

        let page = 1;
        let limit = 10;
        let offset = limit * (page - 1);

        // scholarship
        let scholarshipData = await dbScholarship.findAndCountAll({
            where: whereCondition,
            limit, offset,
            order: ['end_date']
        })

        // category rows
        let categoriesRow = await db.Category.findAll({
            where: {
                name: ['type', 'education', 'gender', 'religion', 'country']
            },
            attributes: ['id', 'name'],
            include: [
                {
                    model: db.Subcategory,
                    as: 'subcategories',
                    attributes: ['id', 'name']
                }
            ]
        });

        // return res.send(categoriesRow);
        let categories = {};
        let selectedSubcategory = [];
        let selectedSubcategoryIds = [];
        categoriesRow.forEach((data) => {
            categories[data.name] = data;
            if (ids) {
                data.subcategories.filter((child) => {
                    if (ids.indexOf(child.id.toString()) > -1) {
                        selectedSubcategory.push(child);
                        selectedSubcategoryIds.push(child.id.toString());
                    }
                });
            }
        });
        // return res.send({scholarship});
        let totalPages = Array.from({ length: Math.ceil(scholarshipData.count / limit) }, (x, y) => y + 1);
        let activePage = page;
        let previousPage = (activePage - 1) > 0 ? (activePage - 1) : 1;
        let nextPage = (activePage + 1) > 0 ? (activePage + 1) : 1;
        let activePageIndex = totalPages.indexOf(page);
        let showPages = totalPages.slice((activePageIndex - 4) > -1 ? activePageIndex - 4 : 0, activePageIndex + 8);

        // return res.send(
        //     {
        //         // categories,
        //         // scholarship: scholarshipData.rows,
        //         // selectedSubcategory,
        //         // selectedSubcategoryIds,
        //         pages: totalPages,
        //         showPages,
        //         pagesCount: Math.ceil(scholarshipData.count / limit),
        //         activePage,
        //         search
        //     });

        return res.render('panel/scholarship-list',
            {
                popularScholarship,
                recentlyAddedScholarship,
                categories,
                scholarship: scholarshipData.rows,
                pages: totalPages,
                showPages,
                pagesCount: Math.ceil(scholarshipData.count / limit),
                activePage,
                previousPage,
                nextPage,
                selectedSubcategory,
                selectedSubcategoryIds,
                search,
                activePageIndex
            });
    },
    filterScholarshipPost: async (req, res) => {
        // return res.send(req.body);
        let body = req.body;
        let ids = req.body.ids;
        let whereCondition = {}
        if (ids) {
            ids = ids.split(',');
            let scholarSub = await db.ScholarSub.findAll(
                {
                    where: { subcategory_id: ids },
                    attributes: ['scholarship_id'],
                    group: ['scholarship_id']
                });
            whereCondition = { id: scholarSub.map(d => d.scholarship_id) };
        }

        if (req.body.search) {
            whereCondition[db.sequelize.Op.or] = [
                {
                    name: {
                        [db.sequelize.Op.like]: `%${req.body.search}%`
                    }
                },
                {
                    description: {
                        [db.sequelize.Op.like]: `%${req.body.search}%`
                    }
                }
            ]
        }

        let page = +req.query.page ? +req.query.page : 1;
        let limit = 10;
        let offset = limit * (page - 1);
        let dbScholarship = null;
        let order = [['end_date', 'ASC']]

        if (body.type == 'active') {
            // if active tab enable
            dbScholarship = db.Scholarship.scope('onlyActive');
        } else if (body.type == 'inactive') {
            // if inactive tab enable
            dbScholarship = db.Scholarship.scope('onlyInactive');
            order = [['end_date', 'DESC']]
        } else if (body.type == 'always_open') {
            // if always_open tab enable
            dbScholarship = db.Scholarship.scope('onlyAlwaysOpen');
        } else {
            // if request by search or else 
            dbScholarship = db.Scholarship;
        }
        let scholarshipData = await dbScholarship.findAndCountAll({
            where: whereCondition,
            limit, offset, order
        });
        // return res.send(scholarship);
        let totalPages = Array.from({ length: Math.ceil(scholarshipData.count / limit) }, (x, y) => y + 1);
        let activePage = page;
        let previousPage = (activePage - 1) > 0 ? (activePage - 1) : 1;
        let nextPage = (activePage + 1) > 0 ? (activePage + 1) : 1;
        let activePageIndex = totalPages.indexOf(page);
        let showPages = totalPages.slice((activePageIndex - 4) > -1 ? activePageIndex - 4 : 0, activePageIndex + 8);
        return res.render('partials/panel/scholarship-card', {
            scholarship: scholarshipData.rows,
            pages: totalPages,
            showPages,
            pagesCount: Math.ceil(scholarshipData.count / limit),
            activePage,
            previousPage,
            nextPage,
            activePageIndex
        });
    },
    savedScholarshipWeb: async (req, res) => {
        let savedScholarship = await db.SavedScholarship.findAll({

            where: { user_id: req.session.user.id },
            attributes: ['scholarship_id'],
            group: ['scholarship_id']
        });
        let savedScholarshipIds = savedScholarship.map(d => d.scholarship_id);

        let page = +req.query.page ? +req.query.page : 1;
        let limit = 10;
        let offset = limit * (page - 1);

        let scholarshipData = await db.Scholarship.scope('onlyActive').findAndCountAll({
            where: { id: savedScholarshipIds },
            limit, offset
        })

        // return res.send({savedScholarship, savedScholarshipIds, scholarshipData})
        return res.render('panel/saved-scholarship', {
            scholarship: scholarshipData.rows,
            pages: Array.from({ length: Math.ceil(scholarshipData.count / limit) }, (x, y) => y + 1),
            pagesCount: Math.ceil(scholarshipData.count / limit),
            activePage: page,
            paginationAjax: false,
            path: req.path
        });
    },
    matchedScholarshipWeb: async (req, res) => {
        let user = req.session.user;
        let userAge = null;
        if (user.date_of_birth) {
            userAge = moment().diff(user.date_of_birth, 'year');
        }

        let keysArray = ['qualification_id', 'gender_id', 'category_id', 'religion_id', 'physical_challenge_id', 'preference_scholarship_id', 'subject_id']
        let subcategoriesIds = Object.keys(user).map((key) => {
            return keysArray.indexOf(key) > -1 ? user[key] : null;
        }).filter(d => d);


        let userInterest = await db.UserSub.findAll({
            attributes: ['subcategory_id'],
            where: {
                user_id: req.session.user.id
            }
        }).map(d => {
            let id = d.subcategory_id;
            subcategoriesIds.push(id);
            return id;
        });

        subcategoriesIds = Array.from(new Set(subcategoriesIds));



        // return res.send({ subcategoriesIds, user, keysArray });
        if (!subcategoriesIds.length) {
            return res.render('panel/matched-scholarship')
        }

        let whereCondition = {}
        let scholarSub = await db.ScholarSub.findAll(
            {
                where: { subcategory_id: subcategoriesIds },
                attributes: ['scholarship_id'],
                group: ['scholarship_id']
            });


        whereCondition = { id: scholarSub.map(d => d.scholarship_id) };



        let page = +req.query.page ? +req.query.page : 1;
        let limit = 10;
        let offset = limit * (page - 1);
        let scholarshipData = await db.Scholarship.scope('onlyActive').findAndCountAll({
            where: {
                [db.sequelize.Op.or]: [
                    whereCondition,
                    {
                        min_age: {
                            [db.sequelize.Op.lte]: userAge
                        },
                        max_age: {
                            [db.sequelize.Op.gte]: userAge
                        }
                    }
                ],
            },
            limit, offset,
            order: ['end_date']
        });
        
        return res.render('panel/matched-scholarship', {
            scholarship: scholarshipData.rows,
            pages: Array.from({ length: Math.ceil(scholarshipData.count / limit) }, (x, y) => y + 1),
            pagesCount: Math.ceil(scholarshipData.count / limit),
            activePage: page,
            paginationAjax: false,
            path: req.path
        });
    }
}

module.exports = ScholarshipController;