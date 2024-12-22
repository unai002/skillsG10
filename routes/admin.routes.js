const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Middleware para verificar si el usuario es administrador
function isAdmin(req, res, next) {
    if (req.session && req.session.admin) {
        next(); // Si es administrador, continuar
    } else {
        res.redirect('/skills/electronics');
    }
}

router.get('/dashboard', isAdmin, adminController.getAdminDashboard);

module.exports = router;