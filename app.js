const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const fs = require('fs');
const secret = 'scholarsathiSecret';
const apiError = require('./src/controllers/api/apiError');
const MySQLStore = require('connect-mysql')(session)
// gloabl variable js
require('./global-variable');
// routes
const { webRoutes, apiRoutes, adminRoutes } = require('./src/routes');
// app functions
const appFunction = require('./app-function');

process.on('unhandledRejection', error => {
    // Won't execute
    console.log('unhandledRejection', error);
});

process.on('referenceError', error => {
    // Won't execute
    console.log('ReferenceError', error);
});

// app
const app = express();

// use urlencoding and json data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// file upload
app.use(fileUpload());

var sessionStore = new session.MemoryStore;
// var sessionStore = new MySQLStore({
//     config: {
//         user: 'root',
//         password: '',
//         database: 'scholarsathi'
//     }
// });

app.use(session({
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    store: sessionStore,
    saveUninitialized: false,
    resave: false,
    secret: secret
}));

// app.use(function (req, res, next) {
//     if (!req.session) {
//         return next(new Error('oh no')) // handle error
//     }
//     next() // otherwise continue]
// })

// cookieParser
app.use(cookieParser(secret));

// flash
app.use(flash());

// views engine
app.set('view engine', '.html');

// hbs config
app.engine('.html', hbs({
    extname: '.html',
    layoutsDir: __dirname + '/src/views/layouts/',
    partialsDir: __dirname + '/src/views/partials/',
    helpers: require('./helper')
}));

// views
app.set('views', path.join(__dirname, '/src/views/'));

// static files
app.use('/public', express.static(__dirname + '/src/public/'));


app.use((req, res, next) => {
    console.log(req.url);
    res.locals.formValue = req.flash('formValue')[0];
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error');
    res.locals.admin = req.session.admin;
    res.locals.role = req.session.role;
    res.locals.user = req.session.user;
    req.flash('formValue', req.body);
    res.locals.path = req.path;
    req.clientIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    next();
});


// route for admin
app.use('/admin', adminRoutes);

// route for api
app.use('/api', apiRoutes);

// route for web
app.use('', appFunction.appHeaderMenuData, webRoutes);


// app.use((req, res, next) => {
//     console.log('hey');
//     res.locals.test = '312313213'
//     next();
// });

// send error
app.use((err, req, res, next) => {
    console.log(err);
    error = apiError(err);
    res.status(error.status || 500);
    res.send(error);
});

// exports app
module.exports = app;