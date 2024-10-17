const Task = require('../models/TaskModel');
const Project = require('../models/ProjectModel');
// Assign Task to a Team Member (Team Lead only)
exports.assignTask = async (req, res) => {
    const { projectId, taskName, description, assigneeId } = req.body; 
    console.log("sdsds",projectId, taskName, description, assigneeId)
    try {
        const task = new Task({ name: taskName, description, assignedTo: assigneeId, project: projectId }); // Use assigneeId for assignedTo
        await task.save();
        res.status(201).json({ message: 'Task assigned successfully', task });
    } catch (error) {
        console.error('Failed to assign task:', error);
        res.status(500).json({ error: 'Failed to assign task' });
    }
};


// Update Task Status
exports.updateTaskStatus = async (req, res) => {
    const { taskId, status } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        task.status = status;
        await task.save();
        res.status(200).json({ message: 'Task status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task status' });
    }
};

exports.getProjectTasks = async (req, res) => {
    const { projectId } = req.params; // Get project ID from request parameters

    try {
        const tasks = await Task.find({ project: projectId });
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ error: 'No tasks found for this project' });
        }
        console.log("Tasks for project:", tasks);
        res.status(200).json(tasks); // Send tasks as response
    } catch (error) {
        console.error("Error fetching project tasks:", error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

exports.getUserTasks = async (req, res) => {
    const userId = req.user.userId; // Assuming user ID is stored in req.user after token verification
    console.log("User ID:",req.user); 
    try {
        const tasks = await Task.find({ assignedTo: userId }).populate('project', 'name');
        console.log("tesks", tasks)
        res.status(200).json( tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks assigned to user' });
    }
};

exports.stopTimer = async (req, res) => {
    const taskId = req.params.taskId; 
    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        
        // Check if the task is already marked as completed
        if (task.status === 'Completed') {
            return res.status(400).json({ error: 'Task is already completed. Cannot stop timer.' });
        }

        task.endTime = Date.now();
        const timeSpent = (task.endTime - task.startTime) / 60000; // Time in minutes
        task.timeSpent += timeSpent;
        task.status = 'Completed'; // Set the task status to completed
        await task.save();
        
        res.status(200).json({ message: 'Task timer stopped and time logged' });
    } catch (error) {
        console.error('Stop timer error:', error);
        res.status(500).json({ error: 'Failed to stop timer' });
    }
};

// startTimer function
exports.startTimer = async (req, res) => {
    const taskId = req.params.taskId; 
    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        if (task.status == 'Completed') {
            return res.status(400).json({ error: 'Task is already completed. Cannot start timer.' });
        }
        if (task.startTime) {
            return res.status(400).json({ error: 'Timer is already running. Please stop it before starting a new one.' });
        }

        task.startTime = Date.now();
        task.status = 'In Progress'; // Set the task status to running
        await task.save();
        
        res.status(200).json({ message: 'Task timer started' });
    } catch (error) {
        console.error('Start timer error:', error);
        res.status(500).json({ error: 'Failed to start timer' });
    }
};

