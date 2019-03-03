
const AdminMiddleware = {
    isNotLogin: (req, res, next) => {
        // console.log('loginAuth', req.session.isAdmin);
        // console.log('dsadasd a',req.session.admin)
        if (req.session.admin) {
            return res.redirect(baseUrl + '/admin/');
        } else {
            next();
        }
    },
    isLogin: (req, res, next) => {
        // return res.send(req.session)
        // console.log('innerAuth', req.session.isAdmin);
        // console.log('dsadasd b',req.session.admin)
        if (req.session.admin) {
            next();
        } else {
            return res.redirect(baseUrl+'/admin/login');
        }
        // next();
    }

}

module.exports = AdminMiddleware;
