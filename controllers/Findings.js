const User = require('../models/UserModel');
const Workspace = require('../models/WorkModel');
const Project = require('../models/ProjectModel');
const Task = require('../models/TaskModel');

async function getDashboardData() {
    try {
        const totalUsers = await User.countDocuments();
        console.log('Total Users:', totalUsers); // Check the output

        const activeUsers = await User.countDocuments({
            lastLogin: { $gte: new Date(Date.now() - 604800000) },
        });
        console.log('Active Users:', activeUsers);

        const totalWorkspaces = await Workspace.countDocuments();
        console.log('Total Workspaces:', totalWorkspaces);

        const totalProjects = await Project.countDocuments();
        console.log('Total Projects:', totalProjects);

        const totalTasks = await Task.countDocuments();
        console.log('Total Tasks:', totalTasks);

        const taskStatusCounts = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        console.log('Task Status Counts:', taskStatusCounts);

        return {
            totalUsers,
            activeUsers,
            totalWorkspaces,
            totalProjects,
            totalTasks,
            taskStatusCounts,
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
        throw error;
    }
}


module.exports = { getDashboardData };
