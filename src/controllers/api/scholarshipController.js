const db = require('./../../db/mysql')

const ScholarshipController = {
    getScholarshipList: async (req, res, next) => {
        let whereCondition = {};
        if (req.query.search) {
            whereCondition.name = {
                [db.sequelize.Op.like]: `%${req.body.search}%`
            }
        }

        let page = +req.query.page ? +req.query.page : 1;
        let limit = +req.query.limit || 10;
        let offset = limit * (page - 1);
        let scholarshipData = await db.Scholarship.scope('onlyActive').findAndCountAll({
            where: whereCondition,
            limit, offset
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