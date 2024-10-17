const express = require('express');
const messageController = require('../controllers/MessagesControll'); // Adjust path as necessary
const { verifyToken } = require('../middlewares/AuthMiddle'); // Adjust path as necessary
const router = express.Router();

router.post('/send/:projectId',verifyToken,messageController.sendMessage);
router.get('/workspace/:workspaceId', verifyToken, messageController.getMessagesInWorkspace);
router.get('/project/:projectId', verifyToken, messageController.getMessagesInProject);


module.exports = router;
