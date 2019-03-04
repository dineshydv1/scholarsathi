const db = require('./../../db/mysql')

const ScholarshipController = {
    getScholarshipList: async (req, res, next) => {
        // return res.send(req.query)
        let { page, limit, search, active, tags } = req.query;
        let whereCondition = {};

        // if tags is exist 
        if (tags) {
            tags = tags.split(',');
            let scholarSub = await db.ScholarSub.findAll(
                {
                    where: { subcategory_id: tags },
                    attributes: ['scholarship_id'],
                    group: ['scholarship_id']
                });
            whereCondition = { id: scholarSub.map(d => d.scholarship_id) };
        }

        // if search is exist 
        if (search) {
            whereCondition.name = {
                [db.sequelize.Op.like]: `%${search}%`
            }
        }

        let dbScholarship = db.Scholarship;

        if (active == 'y') {
            // scholarship active and always open
            dbScholarship = dbScholarship.scope('activeAndAlwaysOpen')
        } else if (active == 'n') {
            // scholarship inactive
            dbScholarship = dbScholarship.scope('onlyInactive')
        }

        page = +page ? +page : 1;
        limit = +limit || 10;
        let offset = limit * (page - 1);
        console.log('hey:- ', page, limit, offset);
        // get scholarships
        let scholarshipData = await dbScholarship.findAndCountAll({
            attributes: ['id', 'name', 'end_date', 'award_oneliner', 'eligibility_oneliner', 'short_link', 'slug_url'],
            where: whereCondition,
            limit, offset,
            distinct: true,
            include: [
                {
                    model: db.Subcategory,
                    attributes: ['id', 'name', 'category_id'],
                    as: 'subcategories',
                    through: {
                        attributes: []
                    },
                    include:[
                        {   
                            model: db.Category,
                            as: 'category',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });
        return res.send({
            scholarships: scholarshipData.rows,
            pages: Array.from({ length: Math.ceil(scholarshipData.count / limit) }, (x, y) => y + 1),
            pagesCount: Math.ceil(scholarshipData.count / limit),
            activePage: page,
        })
    },
    getScholarshipListFullDetail: async (req, res, next) => {
        // return res.send(req.query)
        let { page, limit, search, active, tags } = req.query;
        let whereCondition = {};

        // if tags is exist 
        if (tags) {
            tags = tags.split(',');
            let scholarSub = await db.ScholarSub.findAll(
                {
                    where: { subcategory_id: tags },
                    attributes: ['scholarship_id'],
                    group: ['scholarship_id']
                });
            whereCondition = { id: scholarSub.map(d => d.scholarship_id) };
        }

        // if search is exist 
        if (search) {
            whereCondition.name = {
                [db.sequelize.Op.like]: `%${search}%`
            }
        }

        let dbScholarship = db.Scholarship;

        if (active == 'y') {
            // scholarship active and always open
            dbScholarship = dbScholarship.scope('activeAndAlwaysOpen')
        } else if (active == 'n') {
            // scholarship inactive
            dbScholarship = dbScholarship.scope('onlyInactive')
        }

        page = +page ? +page : 1;
        limit = +limit || 10;
        let offset = limit * (page - 1);

        // get scholarships
        let scholarshipData = await dbScholarship.findAndCountAll({
            where: whereCondition,
            limit, offset,
            distinct: true,
            include: [
                {
                    model: db.Subcategory,
                    attributes: ['id', 'name', 'category_id'],
                    as: 'subcategories',
                    through: {
                        attributes: []
                    },
                    include:[
                        {   
                            model: db.Category,
                            as: 'category',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        return res.send({
            scholarships: scholarshipData.rows,
            pages: Array.from({ length: Math.ceil(scholarshipData.count / limit) }, (x, y) => y + 1),
            pagesCount: Math.ceil(scholarshipData.count / limit),
            activePage: page,
        })
    }
}

module.exports = ScholarshipController;