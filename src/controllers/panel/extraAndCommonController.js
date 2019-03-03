const Joi = require('joi');
const fs = require('fs');
const appFunction = require('../../../app-function');
const db = require('./../../db/mysql');


const ExtraAndCommonController = {
     getCitiesByStateId: async (req, res) => {
          let state = await db.City.findAll({ where: { state_id: parseInt(req.params.stateId) } });
          return res.send(state);
     },
     getSubjectByEducationId: async (req, res) => {
          let subject = await db.Subject.findAll({
               where: db.sequelize.where(db.sequelize.fn('FIND_IN_SET', req.params.educationId, db.sequelize.col('subcategories')), '>', 0)
          });
          return res.send(subject);
     },
     contactUsPost: (req, res, next) => {
          let body = req.body;
          const schema = Joi.object().keys({
               first_name: Joi.string().required().label('first name'),
               last_name: Joi.string().required().label('last name'),
               mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile'),
               email: Joi.string().email(),
               subject: Joi.string().required(),
               message: Joi.string().required()
          }).unknown(true);
          const isValidate = Joi.validate(body, schema);
          if (isValidate.error) {
               return next(isValidate.error);
          }

          return db.Contact.create(body)
               .then((result) => {
                    req.flash('success', 'Contact submitted successfully. we will contact you soon');
                    return res.send({
                         message: 'Contact submitted successfully'
                    })
               }).catch((err) => {
                    next(err);
               })
     },
     careersFormPost: async (req, res) => {
          // return res.send(req.body)
          let body = req.body;
          const schema = Joi.object().keys({
               full_name: Joi.string().required().label('full name'),
               // date_of_birth: Joi.string().required().label('date of birth'),
               qualification: Joi.string().required().label('qualification'),
               mobile: Joi.string().regex(/^[6-9]\d{9}$/).required().error(() => 'Please Enter valid mobile'),
               area_of_interest: Joi.string().required().label('area of interest'),
               join: Joi.string().required().label('How soon ready to join'),
               // resume_one_linear: Joi.string().required().label('resume one linear'),
          }).unknown(true);
          const isValidate = Joi.validate(body, schema);
          if (isValidate.error) {
               req.flash('error', isValidate.error.details[0].message);
               return res.redirect('back');
          }

          // upload document
          var doc = req.files.file;
          if (!doc) {
               req.flash('error', 'Resume field is required');
               return res.redirect('back');
          }
          var docPath = null;
          if (doc) {
               try {
                    docPath = await appFunction.fileUpload(doc, 'doc');
               } catch (err) {
                    return res.status(500).send(err);
               }
          }
          body.doc = docPath;

          return db.Career.create(body)
               .then((result) => {
                    req.flash('success', 'Career submitted successfully. we will contact you soon');
                    req.flash('formValue');
                    return res.redirect('back');
               }).catch((err) => {
                    next(err);
               })
     }

};

module.exports = ExtraAndCommonController;