// skills.routes.js

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

router.get('/', isLoggedIn, skillsController.redirectToSkillTree);
router.get('/:skillTreeName', isLoggedIn, skillsController.viewSkillTree);
router.get('/:skillTreeName/view/:skillID', isLoggedIn, skillsController.viewSkill);
router.get('/:skillTreeName/edit/:skillID', isAdmin, skillsController.editSkill);
router.get('/:skillTreeName/add', isAdmin, skillsController.addSkillForm);
router.get('/:skillTreeName/info', isLoggedIn, skillsController.info);
router.get('/:skillTreeName/userTasks', isLoggedIn, skillsController.getUserTasks);
router.get('/:skillTreeName/getEvidence', isLoggedIn, skillsController.getEvidence);
router.get('/:skillTreeName/getAllEvidences', isLoggedIn, skillsController.getAllEvidences);

router.post('/:skillTreeName/add', isAdmin, skillsController.addSkill);
router.post('/:skillTreeName/edit/:skillID', isAdmin, skillsController.updateSkill);
router.post('/:skillTreeName/delete/:skillID', isAdmin, skillsController.deleteSkill);
router.post('/:skillTreeName/updateTasks', isLoggedIn, skillsController.updateUserTasks);
router.post('/:skillTreeName/submit-evidence', isLoggedIn, skillsController.submitEvidence);
router.post('/:skillTreeName/:skillID/verify', isLoggedIn, skillsController.verifyEvidence);


module.exports = router;