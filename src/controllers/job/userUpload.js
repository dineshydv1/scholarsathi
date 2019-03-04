const cron = require('node-cron');
const moment = require('moment');

const db = require('./../../db/mysql');
const { EmailController } = require('./../others');

const UserUpload = {
    onUserUpload: async (body, rows, sheetPath) => {
        console.log('go');
        let userCron = cron.schedule('* * * * *', async () => {
            console.log('cron run');
            userCron.destroy();

            let uploadData = {
                totalRows: 0,
                masterRows: 0,
                profileRows: 0,
                beforeDatbaseRows: await db.User.count(),
                afterDatbaseRows: 0
            }

            var getSplitVal = (val) => {
                return val ? val.split('-').pop() : null;
            }

            for (let i = 0; i < rows.length; i++) {
                let data = rows[i];
                if (!data.A) {
                    continue;
                }
                ++uploadData.totalRows
                let password = Math.floor(Math.random() * 899999 + 100000).toString();
                let testData = await db.User.scope('masterAccount').findOne({
                    where: {
                        [db.sequelize.Op.or]: [
                            {
                                email: data.D,
                            },
                            {
                                mobile: data.C
                            }
                        ]
                    }
                }).then((result) => {
                    let dob = data.F ? moment(data.F, ['MM-DD-YYYY']).format('YYYY-MM-DD') : null;

                    return db.User.create({
                        first_name: data.A,
                        last_name: data.B,
                        mobile: data.C,
                        email: data.D,

                        gender_id: getSplitVal(data.E),
                        date_of_birth: dob,

                        religion_id: getSplitVal(data.G),
                        category_id: getSplitVal(data.H),
                        physical_challenge_id: data.I && data.I != 'No' ? getSplitVal(data.I) : null,
                        annual_family_income: data.J,
                        qualification_id: getSplitVal(data.K),
                        is_premium: body.is_premium,
                        address: body.address,
                        state_id: body.state_id,
                        city_id: body.city_id,
                        institute_state_id: body.state_id,
                        institute_city_id: body.city_id,
                        pincode: body.pincode,
                        institute_pincode: body.pincode,
                        institute_name: body.institute_name,
                        parent_id: result ? result.id : null,
                        password: !result ? password : null,
                        description: body.description
                    });
                })
                    .then(async (user) => {
                        // user is mater or profile
                        if (user.parent_id) {
                            ++uploadData.profileRows
                            let parentChildren = await db.ParentChildren.create({ parent_id: user.parent_id, children_id: user.id });
                        } else {
                            ++uploadData.masterRows
                        }
                        return Promise.resolve(user);
                    })
                    .then(async (user) => {
                        if (user.parent_id && body.interest_checkbox.length) {
                            let interestUserArray = body.interest_checkbox.map((id) => {
                                return {
                                    user_id: user.id,
                                    subcategory_id: +id
                                }
                            });
                            await db.UserSub.bulkCreate(interestUserArray);
                        }
                        return user;
                    })
                    .then(async (user) => {
                        if (user.email) {
                            try {
                                await EmailController.sendWelcomeEmail({
                                    user_id: user.id,
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    email: user.email,
                                    password: user.password ? password : null
                                });
                            } catch (e) {
                                console.log(e);
                            }
                        }
                        return user;
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }

            uploadData.afterDatbaseRows = await db.User.count();
            await EmailController.sendEmailToClient(`
            <p>User uploaded via sheet please check below progress</p>
            <ul>
                <li>Sheet Path: ${sheetPath}</li>
                <li>Before upload database rows: ${uploadData.beforeDatbaseRows}</li>
                <li>Total rows: ${uploadData.totalRows}</li>
                <li>Total created master rows: ${uploadData.masterRows}</li>
                <li>Total created profile rows: ${uploadData.profileRows}</li>
                <li>After upload database rows: ${uploadData.afterDatbaseRows}</li>
            </ul>`, 'User uploaded successfully via sheet');
            console.log('end');
        });
    }
}

module.exports = UserUpload;