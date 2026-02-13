# AI Smart Expense & Payroll Management System

A hybrid MERN Stack + Python Microservices system for automated payroll management, expense tracking, and AI-powered financial insights.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│          Dashboard, Reports, Employee Management             │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│   • Authentication    • Payroll Calculation                  │
│   • CRUD Operations   • Report Generation                    │
│   • Job Scheduling    • File Generation (PDF/Excel)          │
└───────────┬──────────────────────────────┬──────────────────┘
            │                              │
            │ MongoDB                      │ REST API
            │                              │
┌───────────▼───────────┐     ┌───────────▼──────────────────┐
│   MongoDB Database    │     │  Python ML Service (Flask)   │
│  • Employees          │     │  • Expense Categorization    │
│  • Expenses           │     │  • Anomaly Detection         │
│  • Payroll Records    │     │  • Cash Flow Prediction      │
│  • Financial Data     │     │  • Financial Health Score    │
└───────────────────────┘     └──────────────────────────────┘
```

## 📁 Project Structure

```
ai-payroll-system/
│
├── frontend/                      # React Application
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── Dashboard/
│   │   │   ├── Employees/
│   │   │   ├── Expenses/
│   │   │   ├── Payroll/
│   │   │   └── Reports/
│   │   ├── pages/               # Page components
│   │   ├── services/            # API clients
│   │   ├── utils/               # Helper functions
│   │   └── App.js
│   ├── public/
│   └── package.json
│
├── backend/                      # Node.js + Express API
│   ├── config/                  # Configuration
│   │   └── db.js
│   ├── models/                  # Mongoose schemas
│   │   ├── Employee.js
│   │   ├── Expense.js
│   │   ├── Payroll.js
│   │   ├── Department.js
│   │   └── Budget.js
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── expenseController.js
│   │   ├── payrollController.js
│   │   └── reportController.js
│   ├── routes/                  # API routes
│   ├── middleware/              # Custom middleware
│   ├── services/                # External services
│   │   ├── mlServiceClient.js  # Python ML API client
│   │   ├── pdfService.js       # PDF generation
│   │   └── emailService.js     # Email notifications
│   ├── jobs/                    # Scheduled jobs
│   │   ├── payrollJob.js
│   │   └── alertJob.js
│   ├── utils/                   # Utilities
│   ├── .env
│   └── server.js
│
├── ml-service/                  # Python Flask ML Service
│   ├── api/                    # Flask API
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   └── app.py
│   ├── models/                 # ML models
│   │   ├── expense_classifier.py
│   │   ├── anomaly_detector.py
│   │   ├── cashflow_predictor.py
│   │   └── health_scorer.py
│   ├── training/               # Model training scripts
│   │   ├── train_classifier.py
│   │   └── train_predictor.py
│   ├── data/                   # Sample/training data
│   ├── saved_models/           # Trained models
│   ├── utils/                  # Helper functions
│   ├── requirements.txt
│   ├── config.py
│   └── run.py
│
├── docker-compose.yml          # Container orchestration (optional)
├── .gitignore
└── README.md                   # This file
```

## 🚀 Technology Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Chart.js / Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **date-fns** - Date manipulation

### Backend (Node.js)
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **node-cron** - Job scheduling
- **PDFKit** - PDF generation
- **ExcelJS** - Excel generation
- **Nodemailer** - Email service
- **Winston** - Logging
- **Bull** - Queue management (optional)

### ML Service (Python)
- **Flask** - Web framework
- **scikit-learn** - Machine learning
- **pandas** - Data manipulation
- **numpy** - Numerical computing
- **Prophet** - Time series forecasting
- **joblib** - Model serialization
- **Flask-CORS** - CORS handling

### DevOps
- **Docker** - Containerization (optional)
- **Redis** - Caching (optional)
- **Nginx** - Reverse proxy (production)

## 📋 Features

### Core Features (MERN)
- ✅ Employee Management (CRUD)
- ✅ Salary Management
- ✅ Payroll Processing (automated)
  - Base salary calculation
  - Bonuses and incentives
  - Overtime calculation
  - Deductions (tax, PF, insurance)
  - Leave adjustments
- ✅ Expense Tracking
- ✅ Department Management
- ✅ Budget Management
- ✅ Report Generation (PDF/Excel)
- ✅ Dashboard with Charts
- ✅ Authentication & Authorization
- ✅ Email Notifications
- ✅ Salary Slip Generation

### AI Features (Python ML)
- 🤖 Automatic Expense Categorization
- 🤖 Anomaly Detection (unusual expenses)
- 🤖 Cash Flow Prediction
- 🤖 Burn Rate Analysis
- 🤖 Financial Health Scoring
- 🤖 Spending Pattern Analysis
- 🤖 Budget Optimization Suggestions

## 🔧 Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB (v5+)
- npm or yarn
- pip (Python package manager)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-payroll-system
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. ML Service Setup

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## 🌐 Default Ports

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- ML Service: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`

## 📖 API Documentation

### Backend API Endpoints

#### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login

#### Employees
- GET `/api/employees` - Get all employees
- POST `/api/employees` - Create employee
- GET `/api/employees/:id` - Get employee details
- PUT `/api/employees/:id` - Update employee
- DELETE `/api/employees/:id` - Delete employee

#### Payroll
- GET `/api/payroll` - Get payroll records
- POST `/api/payroll/process` - Process monthly payroll
- GET `/api/payroll/slip/:id` - Generate salary slip
- GET `/api/payroll/employee/:id` - Get employee payroll history

#### Expenses
- GET `/api/expenses` - Get all expenses
- POST `/api/expenses` - Add expense
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense

#### Reports
- GET `/api/reports/monthly` - Monthly financial report
- GET `/api/reports/yearly` - Yearly financial report
- GET `/api/reports/payroll` - Payroll report
- GET `/api/reports/expenses` - Expense report

#### AI Features (calls ML service)
- POST `/api/ai/categorize-expense` - Categorize expense
- POST `/api/ai/detect-anomaly` - Detect anomalies
- GET `/api/ai/predict-cashflow` - Predict cash flow
- GET `/api/ai/financial-health` - Get financial health score

### ML Service API Endpoints

- POST `/ml/categorize` - Categorize expense
- POST `/ml/detect-anomaly` - Detect anomalies
- POST `/ml/predict-cashflow` - Predict cash flow
- POST `/ml/financial-health` - Calculate health score
- GET `/ml/health` - Health check

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/payroll-system
JWT_SECRET=your_jwt_secret
ML_SERVICE_URL=http://localhost:8000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_password
```

### ML Service (.env)
```env
FLASK_ENV=development
FLASK_PORT=8000
MODEL_PATH=./saved_models
```

## 🏃 Running the System

### Development Mode

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm start
```

**Terminal 3: ML Service**
```bash
cd ml-service
source venv/bin/activate
python run.py
```

### Production Mode (Docker)
```bash
docker-compose up -d
```

## 📊 Database Schema

### Employee
- Personal info (name, email, phone)
- Department
- Position
- Salary details
- Join date
- Bank details

### Expense
- Description
- Amount
- Category (auto-categorized by AI)
- Date
- Department
- Receipt/proof

### Payroll
- Employee reference
- Month/Year
- Base salary
- Bonuses
- Deductions
- Overtime
- Net salary
- Payment status

## 🤖 ML Models

### 1. Expense Classifier
- **Algorithm**: Random Forest / Neural Network
- **Purpose**: Categorize expenses automatically
- **Categories**: Salary, Rent, Utilities, Marketing, Software, Travel, etc.

### 2. Anomaly Detector
- **Algorithm**: Isolation Forest / LSTM
- **Purpose**: Detect unusual spending patterns
- **Features**: Amount, frequency, timing, category

### 3. Cash Flow Predictor
- **Algorithm**: Prophet / LSTM
- **Purpose**: Forecast future cash flow
- **Timeframe**: 3-12 months ahead

### 4. Financial Health Scorer
- **Algorithm**: Weighted scoring model
- **Purpose**: Overall financial health assessment
- **Metrics**: Cash reserves, burn rate, expense ratio, growth

## 🔄 Data Flow

1. User adds expense → Backend saves to MongoDB
2. Backend calls ML service to categorize
3. ML service returns category
4. Backend updates expense with category
5. Dashboard displays categorized expense

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# ML service tests
cd ml-service
pytest
```

## 📈 Roadmap

- [x] Basic CRUD operations
- [x] Payroll processing
- [x] Expense tracking
- [ ] AI expense categorization
- [ ] Anomaly detection
- [ ] Cash flow prediction
- [ ] Mobile app (React Native)
- [ ] Multi-company support
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License

## 👥 Authors

- Your Name

## 🆘 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ using MERN Stack + Python ML**
