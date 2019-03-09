const fs = require('fs');
const path = require('path');
const moment = require('moment');
var basename = path.basename(__filename);
const Sequelize = require('sequelize');
// const env = 'development';
const env = 'production';
const config = require('./../config/db.config.json')[env];
var db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    operatorsAliases: false,
    dialectOptions: {
        // dateStrings: true, // disable mysql conversion
        // typeCast: true,
    },
    define: {
        underscored: true,
        underscoredAll: true,
        getterMethods: {
            // created_at: function(value){
            //     // console.log('0', value, this.getDataValue('created_at'));
            //     return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm:mm')
            // }
        }
    },
    timezone: '+05:30',
    logging: false
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//import all models 
db.Category = sequelize.import('./../models/categoryModel');
db.Subcategory = sequelize.import('./../models/subcategoryModel');
db.Scholarship = sequelize.import('./../models/scholarshipModel');
db.ScholarSub = sequelize.import('./../models/scholarSubModel');
db.Admin = sequelize.import('./../models/adminModel');
db.AdminRole = sequelize.import('./../models/adminRoleModel');
db.User = sequelize.import('./../models/userModel');
db.HeaderMenu = sequelize.import('./../models/headerMenuModel');
db.BestScholarship = sequelize.import('./../models/bestScholarshipModel');

db.Country = sequelize.import('./../models/countryModel');
db.State = sequelize.import('./../models/stateModel');
db.City = sequelize.import('./../models/cityModel');

db.Subject = sequelize.import('./../models/subjectModel');
db.ParentChildren = sequelize.import('./../models/parentChildrenModel');
db.UserScholarshipHistory = sequelize.import('./../models/userScholarshipHistoryModel');
db.SavedScholarship = sequelize.import('./../models/savedScholarshipModel');
db.UserDocument = sequelize.import('./../models/userDocumentModel');
db.AppDetail = sequelize.import('./../models/appDetailModel');
db.UserEntranceExam = sequelize.import('./../models/userEntranceExam');
db.Contact = sequelize.import('./../models/contactModel');
db.Career = sequelize.import('./../models/careerModel');
db.ApiUser = sequelize.import('./../models/apiUserModel');
db.Otp = sequelize.import('./../models/otpModel');
db.UserSub = sequelize.import('./../models/userSubModel');
db.Seo = sequelize.import('./../models/seoModel');

// db.t = sequelize.define('', {
//     email: {
//         unique: true,
//         validate: {
//             isEmail: {
//                 msg: 'dss'
//             }
//         },
//         references: {
//             model: ''
//         }
//     },
// }, {
//     timestamps: 'a',
//         hooks: {
//             beforeCreate: () => {

//             },
//             afterCreate: ()=>{

//             },
//             beforeUpdate: ()=>{

//             }
//         },
//         defaultScope: {
//             attributes: {exclude: ['password']}
//         },
//         scopes: {

//         }
//     })

// relations

// category and subcategory
db.Category.hasMany(db.Subcategory, { foreignKey: 'category_id', sourceKey: 'id', as: 'subcategories' });
db.Subcategory.belongsTo(db.Category, { foreignKey: 'category_id', targetKey: 'id', as: 'category' });

// scholarship and subcategory
db.Scholarship.belongsToMany(db.Subcategory, { through: 'ScholarSub', as: 'subcategories', foreignKey: 'scholarship_id', otherKey: 'subcategory_id', onDelete: 'CASCADE' });
db.Subcategory.belongsToMany(db.Scholarship, { through: 'ScholarSub', foreignKey: 'subcategory_id', otherKey: 'scholarship_id' });
// db.ScholarSub.hasMany(db.Scholarship, { foreignKey: 'id', sourceKey: 'scholarship_id' });
// db.ScholarSub.belongsTo(db.Scholarship, { foreignKey: 'scholarship_id', targetKey: 'id', as: 'scholarship' });

// user to subcategory
db.User.belongsToMany(db.Subcategory, { through: db.UserSub, as: 'subcategories', foriegnKey: 'user_id', otherKey: 'subcategory_id', onDelete: 'CASCADE' })

// admin and admin role
db.AdminRole.hasMany(db.Admin, { foreignKey: 'role_id', sourceKey: 'id' });
db.Admin.belongsTo(db.AdminRole, { foreignKey: 'role_id', targetKey: 'id', as: 'admin_role' });

// parent child
db.User.belongsToMany(db.User, { through: db.ParentChildren, foreignKey: 'parent_id', otherKey: 'children_id', as: 'childrens', onDelete: 'CASCADE' });


// saved scholarship
db.User.belongsToMany(db.Scholarship, { through: db.SavedScholarship, foreignKey: 'user_id', otherKey: 'scholarship_id', as: 'saved', onDelete: 'CASCADE' });
db.Scholarship.belongsToMany(db.User, { through: db.SavedScholarship, foreignKey: 'scholarship_id', otherKey: 'user_id', as: 'users' });

db.Scholarship.hasMany(db.SavedScholarship, { foreignKey: 'scholarship_id', sourceKey: 'id', as: 'saved' });

// associated
db.User.hasMany(db.UserScholarshipHistory, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'CASCADE' });
db.User.hasMany(db.UserEntranceExam, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'CASCADE' });
db.User.hasMany(db.UserDocument, { foreignKey: 'user_id', sourceKey: 'id', onDelete: 'CASCADE' });

// db.sequelize.sync()
//     .then(() => {
//         console.log('database sync successfully.');
//         // add admin roles
//         //addAdminRoles();
//     }).catch((err) => {
//         console.error('Unable to sync to the database:', err);
//     })



// add admin roles
var addAdminRoles = () => {

    db.AdminRole.findOne({ attributes: ['id'] })
        .then((result) => {
            if (result) return;
            db.AdminRole.bulkCreate([
                { id: 1, name: 'super_admin' },
                { id: 2, name: 'admin' }
            ], {
                    updateOnDuplicate: true
                }).then();
        })

}


db.sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = db;