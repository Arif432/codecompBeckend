const express = require('express');
const taskController = require('../controllers/TaskControl');
const { verifyToken, authorizeRole } = require('../middlewares/AuthMiddle');
const router = express.Router();

router.post('/createTask', verifyToken, authorizeRole(['team_lead']), taskController.assignTask); // Assign a new task
router.patch('/:taskId/status', verifyToken, taskController.updateTaskStatus);
router.post('/:taskId/timer/start', verifyToken,taskController.startTimer);
router.post('/:taskId/timer/stop', verifyToken,taskController.stopTimer);
router.get('/getTasks/:projectId', verifyToken, authorizeRole(['team_lead','admin']), taskController.getProjectTasks);
router.get('/getUserTasks', verifyToken, taskController.getUserTasks);
module.exports = router;
