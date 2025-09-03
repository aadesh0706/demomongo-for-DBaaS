const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

console.log('🚀 Starting Demo MongoDB API...');
console.log('🔧 Environment variables loaded');
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
let client;

// Connect to MongoDB with timeout
async function connectToMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const uri = process.env.MONGODB_URI || 'mongodb://mongo:mongo123@localhost:27017/demomongodb';
    client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    
    await client.connect();
    db = client.db('demomongodb');
    
    // Test connection
    await db.admin().ping();
    
    console.log('✅ Connected to MongoDB from DBaaS Platform');
    console.log('📍 Database:', 'demomongodb');
    console.log('🔗 Connection URI:', uri.replace(/\/\/.*@/, '//<credentials>@'));
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Starting server without database connection...');
    return false;
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Check if database is connected
const requireDB = (req, res, next) => {
  if (!db) {
    return res.status(503).json({ 
      error: 'Database not connected',
      message: 'Please ensure MongoDB is running and accessible'
    });
  }
  next();
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Demo MongoDB API is running',
    database: db ? 'Connected to DBaaS MongoDB' : 'Database not connected',
    timestamp: new Date().toISOString()
  });
});

// User registration
app.post('/api/register', requireDB, async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      username,
      email,
      fullName,
      password: hashedPassword,
      createdAt: new Date(),
      isActive: true
    };

    const result = await db.collection('users').insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertedId,
        username,
        email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertedId,
        username,
        email,
        fullName,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// User login
app.post('/api/login', requireDB, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Get user profile (protected route)
app.get('/api/profile', authenticateToken, requireDB, async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (protected route)
app.get('/api/users', authenticateToken, requireDB, async (req, res) => {
  try {
    const users = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ 
      users,
      total: users.length,
      message: `Retrieved ${users.length} users from DBaaS MongoDB`
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Database statistics
app.get('/api/stats', requireDB, async (req, res) => {
  try {
    const userCount = await db.collection('users').countDocuments();
    const collections = await db.listCollections().toArray();
    
    const stats = {
      totalUsers: userCount,
      totalCollections: collections.length,
      collections: collections.map(col => ({
        name: col.name,
        type: col.type || 'collection'
      })),
      databaseName: 'demomongodb',
      connectedFrom: 'DBaaS Platform'
    };

    res.json(stats);

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
async function startServer() {
  console.log('🚀 Starting Express server...');
  
  // Start server first
  const server = app.listen(PORT, () => {
    console.log(`🌟 Demo MongoDB API running on port ${PORT}`);
    console.log(`📊 Access API at: http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  });
  
  // Try to connect to MongoDB
  const connected = await connectToMongoDB();
  
  if (!connected) {
    console.log('⚠️  Server is running but database is not connected');
    console.log('🔧 Check if MongoDB is running: docker ps | findstr mongo');
    console.log('🔧 Check connection string in .env file');
  }
  
  return server;
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server...');
  if (client) {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
  process.exit(0);
});
