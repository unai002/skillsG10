const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');

router.get('/', (req, res) => {
    if (!req.session.username) {
        res.redirect('/');
    }
    res.redirect('/skills/electronics');
});

router.get('/:skillTreeName', (req, res) => {
    if (!req.session.username) {
        res.redirect('/');
    }
    res.render('main', {
        skillTreeName: req.params.skillTreeName,
        username: req.session.username,
        admin: req.session.admin
    });
});

router.get('/:skillTreeName/view/:skillID', (req, res) => {
    if (!req.session.username) {
        res.redirect('/');
    }
    res.render('skillspecifics', {
        skillTreeName: req.params.skillTreeName,
        skillID: req.params.skillID,
        username: req.session.username,
        admin: req.session.admin
    });
});

router.get('/:skillTreeName/edit/:skillID', (req, res) => {
    if (!req.session.username) {
        res.redirect('/');
    }
    if (!req.session.admin) {
        res.redirect('/skills/' + req.params.skillTreeName);
    }

    // Obtener los datos de la skill desde la base de datos o cualquier fuente de datos
    const skillData = {
        skillText: 'test pa ver si funciona',
        description: 'Discover the convenience of breadboards for prototyping circuits without soldering, allowing for easy experimentation.',
        tasks: 'Task 1\nTask 2\nTask 55',
        resources: 'Resource 1\nResource 2\nResource 3',
        skillScore: 1000,
        skillID: req.params.skillID
    };

    res.render('editskill', {
        skillTreeName: req.params.skillTreeName,
        username: req.session.username,
        admin: req.session.admin,
        skill: skillData
    });
});

module.exports = router;