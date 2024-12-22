const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');

// Middleware para verificar si el usuario ha iniciado sesión
function isLoggedIn(req, res, next) {
    if (req.session && req.session.username) {
        next(); // El usuario está logueado, continuar con la siguiente función
    } else {
        res.redirect('/'); // El usuario no está logueado, redirigir a la página de inicio de sesión
    }
}

// Middleware para verificar si el usuario es administrador
function isAdmin(req, res, next) {
    if (req.session && req.session.admin) {
        next(); // Si es administrador, continuar
    } else {
        res.redirect('/skills/electronics');
    }
}

router.get('/', isLoggedIn, (req, res) => {
    res.redirect('/skills/electronics');
});

router.get('/:skillTreeName', isLoggedIn, (req, res) => {
    res.render('main', {
        skillTreeName: req.params.skillTreeName,
        username: req.session.username,
        admin: req.session.admin
    });
});

router.get('/:skillTreeName/view/:skillID', isLoggedIn, (req, res) => {
    res.render('skillspecifics', {
        skillTreeName: req.params.skillTreeName,
        skillID: req.params.skillID,
        username: req.session.username,
        admin: req.session.admin
    });
});

router.get('/:skillTreeName/edit/:skillID', isAdmin,(req, res) => {
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

router.get('/:skillTreeName/add', isAdmin, (req, res) => {
    res.render('createskill', {
        skillTreeName: req.params.skillTreeName,
        username: req.session.username,
        admin: req.session.admin, });
});

router.post('/:skillTreeName/add', isAdmin, skillsController.addSkill);

router.post('/:skillTreeName/delete/:skillID', isAdmin, skillsController.deleteSkill);

module.exports = router;