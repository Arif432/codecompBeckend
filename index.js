const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/TaskRoutes'); 
const workspacesRoutes = require('./routes/WorkspaceRoute'); 
const messageRoutes = require("./routes/MessagesRoutes")
const userRoutes = require("./routes/UserRoutes")
const projectRoutes = require("./routes/ProjectRoutes")
const  getDashboardData = require("./controllers/Findings");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/workspace',workspacesRoutes);
app.use('/api/user',userRoutes);
app.use('/api/project',projectRoutes)

app.get('/api/dashboard', async (req, res) => {
  try {
      const dashboardData = await getDashboardData();
      console.log("Sdsd",dashboardData)
      res.json(dashboardData);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

const mongodbURI =
  process.env.MONGODB_URI ||
  "mongodb+srv://MuhammadArifNawaz:03006340067@task-manager-2nd.mesyzb7.mongodb.net/WorkManagement";
const PORT = process.env.PORT || 5000;

mongoose.connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on http://192.168.100.186:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });