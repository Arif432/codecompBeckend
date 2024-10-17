const express = require('express');
const authController = require('../controllers/AuthenticationContol');
const router = express.Router();
const { body } = require('express-validator');
const { route } = require('./WorkspaceRoute');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
