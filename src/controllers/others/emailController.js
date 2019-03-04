const request = require('request');
const hbs = require('express-handlebars').create();
const moment = require('moment');
const nodemailer = require("nodemailer");
const cron = require('node-cron');

const db = require('./../../db/mysql');

let config = {
    username: 'AKIAJGZZBV5FEQAPG7FA',
    password: 'BEya8IIxKzteYrRYjWz/6zvp+QjE/lNp3AGv+6t7G6+y',
    domain: 'scholarsathi.com',
    from: '"ScholarSathi" <noreply@scholarsathi.com>'
}

let transporter = nodemailer.createTransport({
    host: "email-smtp.us-east-1.amazonaws.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.username, // generated ethereal user
        pass: config.password // generated ethereal password
    }
});

let emailUrl = `https://sapi.trackcampaigns.com/v1/api/sendmail`;

const emailController = {
    sendEmailOtpViaSmtp: async (body) => {
        let template = null;
        try {
            template = await hbs.render('src/email-templates/otp.html', {
                otp: body.otp,
                isForogot: body.type == 'forgot' ? true : false
            });
        } catch (e) {
            console.log(e);
        }

        return new Promise(async (resolve, reject) => {
            // setup email data with unicode symbols
            let mailOptions = {
                from: config.from, // sender address
                to: body.email, // list of receivers
                subject: body.type == 'forgot' ? 'Forgot Your Password' : 'Verify Your Account', // Subject line
                html: template // html body
            };

            // send mail with defined transport object
            try {
                let info = await transporter.sendMail(mailOptions);
                return resolve({ body });
            } catch (error) {
                return reject({ error });
            }
        });
    },
    sendEmailOtp: async (body) => {
        return db.Otp.isAbleToGetOtp({ user_id: body.user_id, email: body.email })
            .then(async (count) => {
                if (count > 4) return Promise.reject({ message: 'Your OTP limit is exceeded. try again next day' });

                body.otp = emailController.getOtp();

                let a = await emailController.sendEmailOtpViaSmtp(body);

                return db.Otp.update({ is_verified: 'd' }, { where: { user_id: body.user_id, email: body.email } })
            })
            .then(() => {
                return db.Otp.create({
                    otp: body.otp,
                    user_id: body.user_id,
                    email: body.email,
                    ip: body.clientIp,
                    is_verified: 'n',
                    type: body.type
                });
            })
            .catch((err) => {
                console.log(err)
                return Promise.reject(err);
            })
    },
    sendWelcomeEmail: async (body) => {
        let otp = emailController.getOtp()
        await db.Otp.create({
            otp: otp,
            user_id: body.user_id,
            email: body.email,
            ip: body.clientIp ? body.clientIp : null,
            is_verified: 'n',
            type: 'email_verify'
        });

        let template = null;
        try {
            template = await hbs.render('src/email-templates/welcome.html', {
                first_name: body.first_name,
                last_name: body.last_name,
                otp,
                password: body.password ? body.password : null
            });
        } catch (e) {
            console.log(e);
        }

        let welcomeEmailCron = cron.schedule('*/10 * * * * *', async () => {
            welcomeEmailCron.destroy();
            // setup email data with unicode symbols
            let mailOptions = {
                from: config.from, // sender address
                to: body.email, // list of receivers
                subject: 'Welcome To ScholarSathi', // Subject line
                html: template // html body
            };

            // send mail with defined transport object
            try {
                let info = await transporter.sendMail(mailOptions);
            } catch (error) {
                console.log(error);
            }
        });
    },
    sendEmailToClient: (template, subject) => {
        // dineshydv@gmail.com, support@scholarsathi.com, 
        return new Promise(async (resolve, reject) => {
            // setup email data with unicode symbols
            let mailOptions = {
                from: config.from, // sender address
                to: "dineshydv@gmail.com, support@scholarsathi.com", // list of receivers
                subject: subject, // Subject line
                html: template // html body
            };

            // send mail with defined transport object
            try {
                let info = await transporter.sendMail(mailOptions);
                return resolve();
            } catch (error) {
                return reject({ error });
            }
        });
    },
    sendEmailAlert: async (users, body) => {
        let welcomeEmailCron = cron.schedule('* * * * *', async () => {
            console.log('email alert run');
            welcomeEmailCron.destroy();

            // send email alert to noreply@scholarsathi.com
            if (users && users.length) {
                users.push({
                    first_name: "Scholar",
                    last_name: "",
                    email: config.from
                })
            }

            let scholarship = await db.Scholarship.findByPk(body.scholarship_id, {
                attributes: ['id', 'name', 'end_date', 'award_oneliner', 'eligibility_oneliner']
            });

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

            for (let i = 0; i < users.length; i++) {
                let data = users[i];
                if (!data.email) {
                    continue;
                }
                console.log('email', data.email);
                let template = null;
                try {
                    template = await hbs.render('src/email-templates/scholarship_alert.html', {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        baseUrl,
                        scholarship,
                        popularScholarship,
                        recentlyAddedScholarship
                    }, {
                            helpers: {
                                dateFormat: function (date, formatDate, options) {
                                    if (options == undefined) {
                                        options = formatDate;
                                        formatDate = 'DD-MM-YYYY';
                                    }
                                    // console.log(date, ' - ',moment(date).format(),  moment(date).utcOffset("+05:30").format(), moment(date));
                                    return moment(date).utcOffset("+05:30").format(formatDate);
                                }
                            }
                        });
                } catch (e) {
                    console.log(e);
                }

                // setup email data with unicode symbols
                let mailOptions = {
                    from: config.from, // sender address
                    to: data.email, // list of receivers
                    subject: 'We Found Scholarship Matching Your Profile and Interest', // Subject line
                    html: template // html body
                };

                // send mail with defined transport object
                try {
                    let info = await transporter.sendMail(mailOptions);
                } catch (error) {
                    console.log('error', error);
                }
            }

            await emailController.sendEmailToClient(`
                <p>We have sent email to all match profiles</p>    
            <ul>
                <li>Scholarship: ${baseUrl}/scholarship-detail/${scholarship.id}</li>
            </ul>`, 'Email sent successfully to all match profiles');
            console.log('email alert end');
        });
    },
    getOtp: () => {
        return Math.floor(1000 + Math.random() * 9000);
    }
}

module.exports = emailController;
