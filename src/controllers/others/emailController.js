const request = require('request');
const hbs = require('express-handlebars').create();

const db = require('./../../db/mysql');
let config = {
    username: '_user25lhj7int7q8jg7_3000',
    password: 'b5fc15b4692576b93eb8f0728dba9f2b',
    domain: 'vfirst.com',
    authorization: Buffer.from('_user25lhj7int7q8jg7_3000' + ':' + 'b5fc15b4692576b93eb8f0728dba9f2b').toString('base64')
}

let emailUrl = `https://sapi.trackcampaigns.com/v1/api/sendmail`;

const emailController = {
    sendEmailOtpViaApi: async (body) => {
        let template = null;
        try {
            let a = await hbs.render('src/email-templates/otp.html', { otp: body.otp });
            template = a;
        } catch (e) {
            console.log(e);
        }
        // console.log('token ', config.authorization);
        // console.log('body ', body);
        return new Promise((resolve, reject) => {
            return request.post(emailUrl,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Basic ${config.authorization}`
                    },
                    body: {
                        "recipients": [{
                            "to": [
                                {
                                    "emailid": body.email
                                }
                            ]
                        }],
                        "from": {
                            "emailid": `noreplay@${config.domain}`
                        },
                        "mailtype": "TRANS",
                        "subject": `OTP`,
                        "content": [
                            {
                                "type": "text/html",
                                "value": template
                            }
                        ]
                    },
                    json: true
                },
                (error, response, body) => {
                    console.log(error);
                    console.log(body);
                    if (error) { return reject({ error }); }
                    if (body.success == 'true') {
                        return resolve({ body });
                    } else {
                        return reject({ message: 'Server error' });
                    }
                });
        });


    },
    sendEmailOtp: async (body) => {
        return db.Otp.isAbleToGetOtp({ user_id: body.user_id, email: body.email })
            .then(async (count) => {
                if (count > 4) return Promise.reject({ message: 'Your OTP limit is exceeded. try again next day' });

                body.otp = Math.floor(1000 + Math.random() * 9000);
                
                let a = await emailController.sendEmailOtpViaApi(body);


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
        // console.log(body);
        let template = null;
        try {
            let a = await hbs.render('src/email-templates/welcome.html', { 
                first_name: body.first_name,
                last_name: body.last_name,
                message: body.message
             });
            template = a;
        } catch (e) {
            console.log(e);
        }
        if(template){
            console.log("-------------------------------00000000000000000000----------------------------------");
        }else{
            console.log("-------------------------------11111111111111111111----------------------------------");
        }
        return new Promise((resolve, reject) => {
            return request.post(emailUrl,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Basic ${config.authorization}`
                    },
                    body: {
                        "recipients": [{
                            "to": [
                                {
                                    "emailid": body.email
                                }
                            ]
                        }],
                        "from": {
                            "emailid": `noreplay@${config.domain}`
                        },
                        // "mailtype": "TRANS",
                        "subject": `Welcome`,
                        "content": [
                            {
                                "type": "text/html",
                                "value": template
                            }
                        ]
                    },
                    json: true
                },
                (error, response, body) => {
                    console.log(error);
                    console.log(body);
                    if (error) { return reject({ error }); }
                    if (body.success == 'true') {
                        return resolve({ body });
                    } else {
                        return reject({ message: 'Server error' });
                    }
                });
        });


    },
}

module.exports = emailController;