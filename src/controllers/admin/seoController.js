const fs = require('fs');
const db = require('./../../db/mysql');
const appFunction = require('../../../app-function');
const Joi = require('joi');

let Paths = [
    '/',
    '/about-us',
    '/contact-us',
    '/careers',
    '/term-and-conditions',
    '/dashboard',
    '/account-list',
    '/my-profile',
    '/setting',
    '/matched-scholarship-list',
    '/saved-scholarship-list',
    '/entrance-exam-list',
    '/scholarship-history-list',
    '/document-list'
];

const SeoController = {
    addSeoWeb: (req, res) => {
        return res.render('admin/add-seo', {
            Paths
        })
    },
    addSeoPost: async (req, res) => {
        let body = req.body
        let seo = db.Seo.create(body);
        try {
            let a = await seo.then();
        } catch (err) {
            if (err.name == 'SequelizeValidationError' || err.name == 'SequelizeUniqueConstraintError') {
                req.flash('error', err.errors.map((d) => d.message));
            }
            return res.redirect('back');
        }
        req.flash('success', 'Seo added successfully');
        return res.redirect('back');
    },
    seoListWeb: async (req, res) => {
        let data = await db.Seo.findAll();
        return res.render('admin/seo-list', {
            data
        });
    },
    updateSeoWeb: async (req, res) => {
        let id = req.params.id;
        let data = await db.Seo.findByPk(id);
        return res.render('admin/update-seo', {
            data,
            Paths
        })
    },
    updateSeoPost: (req, res) => {
        let id = req.params.id;
        db.Seo.update(req.body, {
            where: { id }
        })
            .then(() => {
                req.flash('success', 'Seo updated successfully');
                return res.redirect('back');
            }).catch((err) => {
                if (err.name == 'SequelizeValidationError' || err.name == 'SequelizeUniqueConstraintError') {
                    req.flash('error', err.errors.map((d) => d.message));
                }
                return res.redirect('back');
            })
    },
    deleteSeoById: (req, res) => {
        let id = req.params.id;
        db.Seo.destroy({ where: { id } })
            .then(() => {
                req.flash('success', 'Seo deleted successfully');
                return res.redirect('back');
            }).catch((err) => {
                return res.redirect('back');
            })
    }
}

module.exports = SeoController;