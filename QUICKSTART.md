# Quick Start Guide

Get the AI Payroll System running in 10 minutes!

## Prerequisites Check

Run these commands to verify you have everything:

```bash
node --version    # Should be v16+
python3 --version # Should be 3.8+
mongod --version  # Should be v5+
```

## 🚀 Quick Setup (3 Steps)

### 1. Backend Setup (2 minutes)

```bash
cd backend
npm install
```

Edit `.env` file - **ONLY change these lines:**
```env
MONGODB_URI=mongodb://localhost:27017/payroll-system
JWT_SECRET=my_super_secret_key_12345
```

### 2. ML Service Setup (5 minutes)

```bash
cd ../ml-service
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup (2 minutes)

```bash
cd ../frontend
npm install
```

## 🏃 Run All Services

Open **3 terminals** and run:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - ML Service:**
```bash
cd ml-service
source venv/bin/activate  # Windows: venv\Scripts\activate  
python run.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
```

## ✅ Verify It's Working

1. Backend: http://localhost:5000/health
2. ML Service: http://localhost:8000/ml/health
3. Frontend: http://localhost:3000 (opens automatically)

## 🎯 First Use

1. Register your company
2. Add test employee
3. Create expense (watch AI categorize it!)
4. Process payroll
5. View dashboard

## ⚠️ Common Issues

**MongoDB not running?**
```bash
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

**Port already in use?**
```bash
# Change PORT in .env files
# backend/.env: PORT=5001
# ml-service/.env: FLASK_PORT=8001
```

**Python packages won't install?**
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

---

**That's it! You're ready to go! 🎉**

For detailed setup, see [SETUP.md](SETUP.md)
