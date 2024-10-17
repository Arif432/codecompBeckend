const Workspace = require('../models/WorkModel');
const Project = require('../models/ProjectModel');
const mongoose = require('mongoose');
const Message = require('../models/ChatModel')
const User= require('../models/UserModel')

exports.sendMessage = async (req, res) => {
    const { projectId } = req.params;
    const { text } = req.body; // Ensure you extract the message text correctly
    

    console.log('Received projectId:', req.user);

    // Check if text is provided
    if (!text) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const message = {
            _id: new mongoose.Types.ObjectId(), // Create a new ObjectId for the message
            content: text, // Save the message content
            sender: req.user.userId, // Store the sender's ID
            timestamp: new Date(), // Optionally add a timestamp
        };

        // Add the message to the project's messages array
        project.messages.push(message);
        await project.save(); // Save the updated project

        res.status(201).json({ message: 'Message sent successfully', message });
    } catch (error) {
        console.error('Error sending message:', error); // Log the error
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
};


// Get All Messages within a Workspace
exports.getMessagesInWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    try {
        const messages = await Message.find({ workspace: workspaceId }).populate('sender', 'name email');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Get All Messages within a Project
exports.getMessagesInProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const messages = project.messages;
        const populatedMessages = await Promise.all(messages.map(async (msg) => {
            const sender = await User.findById(msg.sender).select('name email');
            return {
                ...msg,
                sender: sender ? { name: sender.name, email: sender.email } : null,
            };
        }));
        console.log("popul",populatedMessages)
        res.status(200).json(populatedMessages);
    } catch (error) {
        console.error("Erroulr fetching messages:", error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};