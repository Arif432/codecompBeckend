const mongoose = require('mongoose');
const Workspace = require('../models/WorkModel');
const User =require("../models/UserModel")
const { ObjectId } = mongoose.Types;  // Add this import

exports.createWorkspace = async (req, res) => {
    try {
        const { name, admin } = req.body;

        // First verify that the admin user exists
        const adminUser = await User.findById(admin);
        if (!adminUser) {
            return res.status(404).json({ error: 'Admin user not found' });
        }

        // Create the workspace
        const workspace = new Workspace({
            name,
            admin: adminUser._id,
            users: [adminUser._id] // Add admin as a user by default
        });
        
        await workspace.save();

        // // Update the admin's workspaces array
        await User.findByIdAndUpdate(
            adminUser._id,
            {
                $push: {
                    workspaces: {
                        workspaceId: workspace._id,
                        role: 'admin'  // Set role as admin for workspace creator
                    }
                }
            },
            { new: true }
        );

        // Fetch the workspace with populated fields
        const populatedWorkspace = await Workspace.findById(workspace._id)
            .populate('admin', '-password')
            .populate('users', '-password');

        res.status(201).json(populatedWorkspace);
    } catch (error) {
        console.error('Error creating workspace:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation Error', 
                details: error.message 
            });
        }
        res.status(500).json({ error: 'Failed to create workspace' });
    }
};

exports.addUserToWorkspace = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { workspaceId, userIds } = req.body;

        console.log('Received request:', { workspaceId, userIds });

        // Validate inputs
        if (!workspaceId || !userIds) {
            return res.status(400).json({ 
                error: 'WorkspaceId and userIds are required',
                received: { workspaceId, userIds }
            });
        }

        // Ensure userIds is an array
        if (!Array.isArray(userIds)) {
            return res.status(400).json({ 
                error: 'userIds must be an array',
                received: typeof userIds
            });
        }

        // Verify the workspace exists
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        // Verify all users exist
        const users = await User.find({ _id: { $in: userIds } });
        if (users.length !== userIds.length) {
            return res.status(404).json({ 
                error: 'Some users not found',
                found: users.length,
                requested: userIds.length
            });
        }

        // Filter out existing users
        const newUsers = userIds.filter(userId => !workspace.users.includes(userId));

        if (newUsers.length === 0) {
            return res.status(400).json({
                error: 'All users are already in the workspace',
                existingUsers: userIds
            });
        }

        try {
            // Add only new users to workspace
            await Workspace.findByIdAndUpdate(
                workspaceId,
                { $addToSet: { users: { $each: newUsers } } },
                { session }
            );

            // Add workspace to each new user's workspaces array
            await User.updateMany(
                { _id: { $in: newUsers } },
                {
                    $addToSet: {
                        workspaces: {
                            workspaceId: workspaceId,
                            role: 'team_member'
                        }
                    }
                },
                { session }
            );

            await session.commitTransaction();

            // Fetch updated workspace with populated fields
            const updatedWorkspace = await Workspace.findById(workspaceId)
                .populate('admin', '-password')
                .populate('users', '-password');

            res.status(200).json({
                message: 'New users added successfully',
                workspace: updatedWorkspace,
                skippedUsers: userIds.filter(userId => workspace.users.includes(userId)) // Inform about skipped users
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        }

    } catch (error) {
        console.error('Error adding users to workspace:', error);
        res.status(500).json({ 
            error: 'Failed to add users to workspace',
            details: error.message
        });
    } finally {
        session.endSession();
    }
};


exports.removeUserFromWorkspace = async (req, res) => {
    const { workspaceId, userId } = req.body;
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        const userIndex = workspace.users.findIndex(u => u.userId.equals(userId));
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found in this workspace' });
        }

        workspace.users.splice(userIndex, 1);
        await workspace.save();
        res.status(200).json({ message: 'User removed from workspace' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove user from workspace' });
    }
};

// Assign Team Lead
exports.assignTeamLead = async (req, res) => {
    const { workspaceId, userId } = req.body;
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
        
        // Check if the user is part of the workspace
        if (!workspace.users.some(u => u.userId.equals(userId))) {
            return res.status(400).json({ error: 'User not part of the workspace' });
        }

        workspace.users = workspace.users.map(u => {
            if (u.userId.equals(userId)) {
                u.role = 'team lead';
            }
            return u;
        });
        await workspace.save();
        res.status(200).json({ message: 'Team lead assigned' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign team lead' });
    }
};

// Get All Workspaces for a User
exports.getWorkspacesForUser = async (req, res) => {
    const userId = req.user.userId;
    console.log("user", req.user)
    try {
        const workspaces = await Workspace.find({
            $or: [
                { users: userId },
                { admin: userId } 
            ]
        }).populate('admin', 'name email');

        res.status(200).json(workspaces);
        console.log("wordk",workspaces)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
};