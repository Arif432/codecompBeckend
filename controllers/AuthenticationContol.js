const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const secretKey = process.env.JWT_SECRET || 'defaultSecret'; // Use environment variable


exports.register = async (req, res) => {
    try {
        // Debug: Log the incoming request
        console.log('Received registration request:', req.body);

        // Input validation
        if (!req.body || !req.body.email || !req.body.password || !req.body.name) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields (name, email, password)'
            });
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Email already exists:', email);
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "team_member"
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        console.log('User registered successfully:', email);
        
        // Send success response
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error during registration'
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("em",req.body)

    try {
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, { expiresIn: '1h' }); // Token expiration
        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                // Add any other fields you want to send
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log in' });
        console.log("error",error)
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching users' });
    }
};

exports.getUsersInWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    console.log("work",workspaceId)
    try {
        const users = await User.find({ 'workspaces.workspaceId': workspaceId });
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users in workspace:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching users in workspace' });
    }
};