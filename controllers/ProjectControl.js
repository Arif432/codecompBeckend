const Project = require('../models/ProjectModel');
const Workspace = require('../models/WorkModel');
const Task = require('../models/TaskModel');

// Create a Project within a Workspace (Admin only)
exports.createProject = async (req, res) => {
    const { workspaceId, projectName, teamLeadId } = req.body;
    console.log("sdd",workspaceId, projectName, teamLeadId)
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        const project = new Project({
            name: projectName,

            workspace: workspaceId,
            teamLead: teamLeadId,
        });

        await project.save();
        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
};

// Add Team Members to a Project
exports.addTeamMembersToProject = async (req, res) => {
    const { projectId, memberIds } = req.body; // Array of member IDs
    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // Check if members are part of the workspace
        const workspace = await Workspace.findById(project.workspace);
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        memberIds.forEach(memberId => {
            if (!workspace.users.some(u => u.userId.equals(memberId))) {
                return res.status(400).json({ error: `User ${memberId} is not part of the workspace` });
            }
        });

        project.members.push(...memberIds);
        await project.save();
        res.status(200).json({ message: 'Team members added to project' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add members to project' });
    }
};

exports.getLeadProjects = async (req, res) => {
    console.log("re",req.params)
    try {
        const projects = await Project.find({ teamLead: req.params.leadId }).populate('tasks');
        console.log("projectResponse:", projects);
        return res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

  exports.getProjectsInWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    console.log("word",workspaceId)
    try {
        // Find all projects in the specified workspace
        const projects = await Project.find({ workspace: workspaceId }).populate('teamLead', 'name email');
        console.log("send pro",projects)
        return res.status(200).json(projects); // Use return to avoid further execution
    } catch (error) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({ error: 'Failed to fetch projects' }); // Use return here as well
    }
};

// Get All Tasks for a Specific Project
exports.getProjectTasks = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await Project.findById(projectId).populate('tasks');
        if (!project) return res.status(404).json({ error: 'Project not found' });

        res.status(200).json(project.tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

exports.getProjectsForCurrentUser = async (req, res) => {
    const userId = req.user.id;
    try {
        // replece only id by dete of those id
        const user = await User.findById(userId).populate('workspaces.workspaceId');
        if (!user) return res.status(404).json({ error: 'User not found' });
        // get work speces in which user present 
        const workspaceIds = user.workspaces.map(workspace => workspace.workspaceId);
        // find projects in those work speces
        const projects = await Project.find({ workspace: { $in: workspaceIds } }).populate('teamLead', 'name email');

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects for the current user' });
    }
};

