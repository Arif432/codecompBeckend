const express = require('express');
const workspaceController = require('../controllers/WorkspaceControl');
const { verifyToken, authorizeRole } = require('../middlewares/AuthMiddle');

const router = express.Router();

// Routes for Workspace
router.post('/createWorkSpace', verifyToken, authorizeRole(['admin']), workspaceController.createWorkspace); // Create Workspace
router.post('/addUser', verifyToken, authorizeRole(['admin']), workspaceController.addUserToWorkspace); // Add User to Workspace
router.post('/assignLead', verifyToken, authorizeRole(['admin']), workspaceController.assignTeamLead); // Assign Team Lead
router.get('/getAllWorkSpace', verifyToken, workspaceController.getWorkspacesForUser) // Get All Workspaces for a User

module.exports = router;
