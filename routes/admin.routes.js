const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const usersController = require("../controllers/users.controller");

// Middleware para verificar si el usuario es administrador
function isAdmin(req, res, next) {
    if (req.session && req.session.admin) {
        next(); // Si es administrador, continuar
    } else {
        res.redirect('/skills/electronics');
    }
}

router.get('/dashboard', isAdmin, adminController.getAdminDashboard);
router.get('/badges', isAdmin, adminController.getAdminBadges);
router.get('/badges/edit/:id', isAdmin, adminController.getEditBadge);
router.get('/users', isAdmin, adminController.getUserList);

router.post('/badges/edit/:id', isAdmin, adminController.updateBadge);
router.post('/badges/delete/:id', isAdmin, adminController.deleteBadge);
router.post('/change-password', isAdmin, adminController.changePassword);

module.exports = router;