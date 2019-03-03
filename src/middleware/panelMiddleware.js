
const PanelMiddleware = {
    isNotLogin: (req, res, next) => {
        // console.log('dsadasd a',req.session.user)
        if (req.session.user) {
            return res.redirect(baseUrl);
        } else {
            next();
        }
    },
    isLogin: (req, res, next) => {
        // return res.send(req.session)
        // console.log('dsadasd b',req.session.user)
        if (req.session.user) {
            next();
        } else {
            return res.redirect(baseUrl);
        }
        // next();
    }

}

module.exports = PanelMiddleware;
