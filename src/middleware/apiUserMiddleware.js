const db = require('./../db/mysql');

const apiUserMiddleware = {
    isApiUser: async (req, res, next) => {
        let token = req.query.token;
        try {
            let apiUser = await db.ApiUser.findOne({
                attributes: ['id'],
                where: {
                    token,
                    status: 'y'
                }
            })
            if (!apiUser) {
                return next({ message: 'unauthenticated', status: 401 })
            }
            next();
        } catch (e) {
            return next(e)
        }
    }
}

module.exports = apiUserMiddleware;