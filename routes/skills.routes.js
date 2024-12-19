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
    res.render('main', {skillTreeName: req.params.skillTreeName});
});

router.get('/:skillTreeName/view/:skillID', (req, res) => {
    if (!req.session.username) {
        res.redirect('/');
    }
    res.render('skillspecifics', {skillTreeName: req.params.skillTreeName, skillID: req.params.skillID});
})

module.exports = router;