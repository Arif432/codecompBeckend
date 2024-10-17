const express = require('express');
const router = express.Router();
const userController = require('../controllers/AuthenticationContol');

router.get('/getUsers', userController.getAllUsers);
router.get('/workspace/:workspaceId', userController.getUsersInWorkspace);

module.exports = router;