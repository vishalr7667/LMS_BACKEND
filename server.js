const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const allowedOrigins = process.env.CLIENT_URL.split(',').map(origin => origin.trim());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VFXVault Education API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const agenda = require('./utils/queue');

app.listen(PORT, async () => {
  console.log(`\n🚀 VFXVault Education API running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`💊 Health: http://localhost:${PORT}/api/health\n`);

  try {
    await agenda.start();
    console.log('👷 Agenda worker started successfully');
  } catch (err) {
    console.error('❌ Failed to start Agenda worker:', err.message);
  }
});

module.exports = app;
