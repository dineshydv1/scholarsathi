const request = require('request');
const Joi = require('joi');
const db = require('./../../db/mysql');
const appFunction = require('../../../app-function');

let config = {
    username: 'scholarhtptrans',
    password: 'schol049',
    from: 'SSATHI'
}

let smsUrl = `http://www.myvaluefirst.com/smpp/sendsms`;
let bulksmsUrl = `http://203.212.70.200/smpp/sendsms`;

const SmsController = {
    sendOtpViaApi: (body) => {
        return new Promise((resolve, reject) => {
            return request.get(smsUrl + `?username=${config.username}&password=${config.password}&from=${config.from}&to=${body.mobile}&text=Welcome to ScholarSathi. Your OTP is ${body.otp}`,
                { json: true },
                (error, response, body) => {
                    if (error) { return reject({ error }); }
                    if (body == 'Sent.') {
                        return resolve({ body });
                    } else {
                        return reject({ message: 'Server error' });
                    }
                });
        });
    },
    sendMobileOtp: async (body) => {
        return db.Otp.isAbleToGetOtp({ user_id: body.user_id, mobile: body.mobile })
            .then(async (count) => {
                if (count > 4) return Promise.reject({ message: 'Your OTP limit is exceeded. try again next day' });

                body.otp = Math.floor(1000 + Math.random() * 9000);
                let a = await SmsController.sendOtpViaApi(body)

                return db.Otp.update({ is_verified: 'd' }, { where: { user_id: body.user_id, mobile: body.mobile } })
            })
            .then(() => {
                return db.Otp.create({
                    otp: body.otp,
                    user_id: body.user_id,
                    mobile: body.mobile,
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
    sendBulkSms: (data) => {
        console.log(data)
        return new Promise(function(resolve, reject) {
            return request.get(`${bulksmsUrl}`,
                {
                    qs: {
                        username: config.username,
                        password: config.password,
                        from: config.from,
                        to: data.mobiles,
                        text: `Dear Scholar, a new scholarship matches your profile. Visit ${data.short_link} to see details. ${data.text}`,
                        category: 'bulk'
                    },
                    json: true
                },
                (error, response, body) => {
                    if (error) { return reject({ error }); }
                    console.log(body)
                    if(body.search('&') < 0){
                        return reject(body);
                    }else
                    if (body.split('&').indexOf('errorcode=0,0') > -1) {
                        return resolve({ body });
                    } else {
                        return reject(body);
                    }
                });
        });
    },
    sendSmsAlert: (data) => {
        return new Promise((resolve, reject) => {
            return request.get(smsUrl,
                {
                    qs: {
                        username: config.username,
                        password: config.password,
                        from: config.from,
                        to: data.mobile,
                        text: `Dear ${data.name}, a new scholarship matches your profile. Visit ${data.short_link} to see details. ${data.text}`,
                    },
                    json: true
                },
                (error, response, body) => {
                    if (error) { return reject({ error }); }
                    console.log(body);
                    if (body == 'Sent.') {
                        return resolve({ body });
                    } else {
                        return reject({ message: 'Server error' });
                    }
                });
        });
    },
}

module.exports = SmsController;