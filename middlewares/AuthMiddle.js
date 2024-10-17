const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const Workspace = require('../models/WorkModel');

const secretKey = process.env.JWT_SECRET || 'defaultSecret'; // Use environment variable

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        req.user = decoded; // Store user info in request
        next();
    });
};

// Role-based access control middleware
// Role-based access control middleware with global and workspace checks
// Role-based access control middleware with global and workspace checks
exports.authorizeRole = (roles) => async (req, res, next) => {
    const userRole = req.user.role; // Global role from token
    const userId = req.user.id; // User ID from token
    console.log("roles",roles)

    try {
        if (roles.includes(userRole)) {
            return next(); 
        }

        const workspaces = await Workspace.find({ teamLead: userId });
        console.log("worf",workspaces)
        if (workspaces.length > 0 && roles.includes('team_lead')) {
            return next();
        }
        return res.status(403).json({ error: 'Access denied' });
    } catch (error) {
        console.error('Error in authorizeRole middleware:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

