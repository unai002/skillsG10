const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.post('/register', usersController.register);
router.post('/login', usersController.login);

router.get('/info', (req, res) => {
  if (req.session.username) {
    res.json({
      username: req.session.username,
      admin: req.session.admin
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Usuario no autenticado'
    });
  }
});

module.exports = router;