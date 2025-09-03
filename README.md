# Demo MongoDB Project - External Connection to DBaaS Platform

This is a demonstration React application that shows how external projects can connect to and use databases managed by the DBaaS platform.

## 🎯 Purpose

This demo project demonstrates:
- **External Database Connectivity**: How external applications can connect to databases created via the DBaaS platform
- **Real-world Authentication**: User registration and login using MongoDB from DBaaS
- **Database Operations**: CRUD operations on user data stored in DBaaS-managed MongoDB
- **Full-stack Integration**: Complete React frontend + Express backend using DBaaS connection strings

## 🏗️ Architecture

```
demomongo1/
├── backend/          # Express.js API server
│   ├── server.js     # Main server file with MongoDB connection
│   ├── package.json  # Backend dependencies
│   └── .env          # MongoDB connection string from DBaaS
├── src/              # React frontend
│   ├── components/   # Auth and Dashboard components
│   ├── App.js        # Main React app
│   └── App.css       # Styling
└── package.json      # Frontend dependencies
```

## 🔧 Prerequisites

Before running this demo, ensure:
1. **DBaaS Platform is running**: The main DBaaS platform should be running via Docker
2. **MongoDB Database exists**: You should have created a MongoDB database in the DBaaS platform
3. **Connection details**: You have the correct connection string from DBaaS

## 🚀 Setup Instructions

### 1. Check DBaaS Connection String

First, make sure your DBaaS MongoDB is accessible. The connection details should be:
- **Host**: localhost
- **Port**: 27017
- **Database**: demomongodb
- **Username**: mongo
- **Password**: mongo123

### 2. Start the Backend Server

```powershell
# Navigate to backend directory
cd backend

# Install dependencies (if not done already)
npm install

# Start the server
npm start
```

The backend will run on **http://localhost:5001** and connect to your DBaaS MongoDB.

### 3. Start the Frontend

In a new terminal:

```powershell
# Navigate to project root
cd demomongo1

# Install dependencies (if not done already)
npm install

# Start React development server
npm start
```

The frontend will run on **http://localhost:3000**.

## 🎮 Using the Demo

### Registration Flow
1. Open http://localhost:3000
2. Click "Sign Up" to switch to registration mode
3. Fill in:
   - Full Name
   - Username
   - Email
   - Password (minimum 6 characters)
4. Click "Create Account"
5. Upon success, you'll be automatically logged in

### Login Flow
1. Use the email and password from registration
2. Click "Sign In"
3. Access the dashboard with your user data

### Dashboard Features
- **Profile Tab**: View your user information
- **All Users Tab**: See all registered users (from DBaaS MongoDB)
- **Database Stats Tab**: View MongoDB statistics and collection info

## 🔗 Database Connection Details

The backend connects to DBaaS MongoDB using:

```javascript
// Connection String (from .env)
MONGODB_URI=mongodb://mongo:mongo123@localhost:27017/demomongodb
```

This connection string points to:
- The MongoDB container running in the DBaaS Docker setup
- Database: `demomongodb`
- Collection: `users` (created automatically)

## 📊 Data Storage

User data is stored in the `users` collection with this schema:

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  fullName: String,
  password: String (hashed with bcrypt),
  createdAt: Date,
  isActive: Boolean
}
```

## 🔐 Security Features

- **Password Hashing**: Using bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: API endpoints require valid JWT tokens
- **Input Validation**: Server-side validation for all inputs

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Check if DBaaS MongoDB is running
docker ps | grep mongo

# Check backend logs
cd backend
npm start
```

### Frontend Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
1. Ensure DBaaS platform Docker containers are running
2. Check if MongoDB is accessible on port 27017
3. Verify connection string in `backend/.env`

## 📝 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Protected Routes (require JWT token)
- `GET /api/profile` - Get current user profile
- `GET /api/users` - Get all users

### Public Routes
- `GET /health` - Health check
- `GET /api/stats` - Database statistics

## 🎯 Key Takeaways

This demo shows how:

1. **External projects** can easily connect to DBaaS-managed databases
2. **Connection strings** from DBaaS work seamlessly in real applications
3. **Database operations** (create, read, update) work normally with DBaaS MongoDB
4. **Security practices** (authentication, authorization) integrate well
5. **Real-time data** flows between external apps and DBaaS databases

## 🔄 Next Steps

To extend this demo:
- Add user profile editing
- Implement password reset functionality
- Add file upload capabilities
- Create admin panel features
- Add real-time notifications
- Implement data export/import

---

**Note**: This demo project proves that the DBaaS platform successfully enables external applications to connect to and utilize managed databases, making it a viable solution for real-world database-as-a-service scenarios.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
