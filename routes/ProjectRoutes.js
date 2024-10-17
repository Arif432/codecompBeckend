const express = require('express');
const projectController = require('../controllers/ProjectControl');
const { verifyToken, authorizeRole } = require('../middlewares/AuthMiddle');

const router = express.Router();

router.post('/createProject', verifyToken, authorizeRole(['admin']), projectController.createProject);
router.post('/addMembers', verifyToken, authorizeRole(['team_lead']), projectController.addTeamMembersToProject);
router.get('/getProjects/:workspaceId', verifyToken, projectController.getProjectsInWorkspace);
router.get('/:projectId/tasks', verifyToken, projectController.getProjectTasks);
router.get('/getLeadProjects/:leadId', projectController.getLeadProjects )

module.exports = router;
