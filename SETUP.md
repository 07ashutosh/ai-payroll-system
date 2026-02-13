# Complete Setup Guide - AI Payroll System

This guide will walk you through setting up the entire hybrid MERN + Python ML system.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup (Node.js)](#backend-setup)
4. [ML Service Setup (Python)](#ml-service-setup)
5. [Frontend Setup (React)](#frontend-setup)
6. [Running the System](#running-the-system)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

✅ **Node.js** (v16 or higher)
```bash
node --version
# Should output: v16.x.x or higher
```

✅ **Python** (v3.8 or higher)
```bash
python --version
# or
python3 --version
# Should output: Python 3.8.x or higher
```

✅ **MongoDB** (v5 or higher)
```bash
mongod --version
# Should output: db version v5.x.x or higher
```

✅ **npm** (comes with Node.js)
```bash
npm --version
```

✅ **pip** (comes with Python)
```bash
pip --version
# or
pip3 --version
```

### Optional (Recommended)

- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing
- **VS Code** - Code editor

---

## Project Structure

```
ai-payroll-system/
├── backend/              # Node.js + Express API
├── frontend/             # React Application  
├── ml-service/           # Python Flask ML Service
├── README.md
└── SETUP.md (this file)
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd ai-payroll-system/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- express (Web framework)
- mongoose (MongoDB ORM)
- bcryptjs (Password hashing)
- jsonwebtoken (Authentication)
- axios (HTTP client for ML service)
- node-cron (Job scheduling)
- pdfkit (PDF generation)
- exceljs (Excel generation)
- And more...

### Step 3: Configure Environment

The `.env` file is already created. **Edit it with your settings:**

```bash
# Open in your editor
nano .env
# or
code .env
```

**Important Settings:**

```env
# MongoDB - Option 1: Local
MONGODB_URI=mongodb://localhost:27017/payroll-system

# MongoDB - Option 2: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payroll-system

# JWT Secret - CHANGE THIS!
JWT_SECRET=change_this_to_a_random_secure_string_12345

# ML Service URL
ML_SERVICE_URL=http://localhost:8000

# Email (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Step 4: Start MongoDB

**Option A: Local MongoDB**

```bash
# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb-community

# Windows
# Start MongoDB from Services or run:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

**Option B: MongoDB Atlas (Cloud - Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0 (for development)
5. Get connection string
6. Update MONGODB_URI in .env

### Step 5: Verify Backend Setup

```bash
# Test MongoDB connection
node -e "require('./config/db')()"

# Should see: ✓ MongoDB Connected: localhost
```

---

## ML Service Setup

### Step 1: Navigate to ML Service Directory

```bash
cd ../ml-service
```

### Step 2: Create Virtual Environment

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- Flask (Web framework)
- scikit-learn (Machine learning)
- pandas, numpy (Data processing)
- prophet (Time series forecasting)
- And more...

**Note:** This may take 5-10 minutes.

### Step 4: Configure Environment (Optional)

Create `.env` file in ml-service directory:

```bash
echo "FLASK_ENV=development
FLASK_PORT=8000" > .env
```

### Step 5: Initialize Models

Models will be trained automatically on first run with sample data.

### Step 6: Verify ML Service Setup

```bash
# Test import
python -c "from api import create_app; print('ML Service OK')"

# Should output: ML Service OK
```

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- react, react-dom
- react-router-dom
- axios
- chart.js / recharts
- tailwindcss
- And more...

### Step 3: Configure Environment (Optional)

Create `.env` file:

```bash
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

---

## Running the System

You'll need **3 terminal windows** open simultaneously.

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Should see:
```
╔═══════════════════════════════════════════╗
║   Backend Server Starting                 ║
║   Port: 5000                             ║
╚═══════════════════════════════════════════╝
```

### Terminal 2: ML Service

```bash
cd ml-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
```

Should see:
```
╔═══════════════════════════════════════════╗
║   ML Service Starting                     ║
║   Port: 8000                             ║
╚═══════════════════════════════════════════╝
```

### Terminal 3: Frontend

```bash
cd frontend
npm start
```

Browser will open automatically at `http://localhost:3000`

---

## Testing

### Backend API Test

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response:
# {"success":true,"message":"Server is running"}
```

### ML Service Test

```bash
# Test ML health endpoint
curl http://localhost:8000/ml/health

# Expected response:
# {"status":"healthy","service":"ML Service"}
```

### Test Expense Categorization

```bash
curl -X POST http://localhost:8000/ml/categorize \
  -H "Content-Type: application/json" \
  -d '{"title":"Office rent payment","amount":5000}'

# Should return:
# {"category":"Rent","confidence":0.95}
```

---

## Troubleshooting

### MongoDB Connection Failed

**Problem:** Can't connect to MongoDB

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection string in .env
```

### Port Already in Use

**Problem:** Port 5000 or 8000 already in use

**Solution:**
```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or change port in .env
```

### ML Service Dependencies Error

**Problem:** Error installing Python packages

**Solution:**
```bash
# Upgrade pip
pip install --upgrade pip

# Install packages one by one
pip install Flask
pip install scikit-learn
# etc.

# For M1 Mac users:
pip install --pre torch torchvision  # if using PyTorch
```

### Module Not Found Error

**Problem:** "Cannot find module 'express'" or similar

**Solution:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Error in Frontend

**Problem:** CORS policy blocking requests

**Solution:**
- Check CLIENT_URL in backend .env
- Ensure backend is running
- Clear browser cache

---

## Development Workflow

### Starting Fresh Each Day

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd ml-service && source venv/bin/activate && python run.py

# Terminal 3
cd frontend && npm start
```

### Making Changes

- **Backend changes:** Server auto-restarts (nodemon)
- **ML Service changes:** Restart manually
- **Frontend changes:** Auto-reloads in browser

---

## Next Steps

After successful setup:

1. ✅ Register a test company
2. ✅ Add employees
3. ✅ Track expenses
4. ✅ Process payroll
5. ✅ Test AI features (categorization, anomaly detection)
6. ✅ View reports and dashboard

---

## Quick Reference

### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000
- MongoDB: mongodb://localhost:27017

### Ports
- 3000: React Frontend
- 5000: Node.js Backend
- 8000: Python ML Service
- 27017: MongoDB

### Important Commands

```bash
# Backend
npm run dev          # Start development server
npm start            # Start production server

# ML Service
python run.py        # Start ML service
pip list             # List installed packages

# Frontend
npm start            # Start development server
npm run build        # Build for production

# MongoDB
mongosh              # Open MongoDB shell
```

---

## Support

If you encounter issues:

1. Check this SETUP.md
2. Review error messages carefully
3. Ensure all services are running
4. Check .env configuration
5. Verify port availability

---

**Setup complete! You're ready to build an AI-powered payroll system! 🚀**
