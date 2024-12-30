const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/', (req, res) => {
  res.render('login');
});
router.get('/register', (req, res) => {
  res.render('register');
});
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/logout', usersController.logout);
router.get('/info', usersController.info);
router.get('/leaderboard', usersController.leaderboard);
router.get('/badges', usersController.badges);
router.get('/allUsers', usersController.allUsers);

router.post('/register', usersController.register);
router.post('/login', usersController.login);

module.exports = router;