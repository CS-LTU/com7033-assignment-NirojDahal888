# Stroke Patient Management System

A full-stack web application for managing stroke patient data with authentication, CRUD operations, and data visualization capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Contributing](#contributing)

## 🎯 Overview

This application provides a secure platform for healthcare professionals to manage stroke patient records. It includes user authentication, patient data management with pagination and filtering, and uses a real healthcare dataset for stroke prediction analysis.

## ✨ Features

### Authentication
- User registration and login
- Session-based authentication with Flask-Login
- Password hashing with bcrypt
- Protected routes and API endpoints
- CSRF protection

### Patient Management
- Create, Read, Update, Delete (CRUD) operations
- Paginated patient list with sorting
- Filter patients by various criteria
- Detailed patient view
- Data validation and sanitization

### Data Features
- Pre-loaded healthcare stroke dataset
- MongoDB indexing for performance
- Support for 5000+ patient records
- Real-time data updates

### UI/UX
- Modern, responsive design with Tailwind CSS
- Intuitive navigation
- Real-time feedback and error handling
- Loading states and animations

## 🛠 Tech Stack

### Backend
- **Framework**: Flask 3.0.0
- **Database**: MongoDB (with PyMongo 4.6.0)
- **Authentication**: Flask-Login 0.6.3
- **Security**: Flask-WTF (CSRF), bcrypt
- **Data Processing**: Pandas 2.1.4, NumPy 1.26.4
- **Testing**: pytest 7.4.3
- **CORS**: Flask-CORS 6.0.1

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.9.5
- **Styling**: Tailwind CSS 3.4.18
- **HTTP Client**: Axios 1.13.1
- **Icons**: Lucide React 0.548.0
- **Testing**: React Testing Library 16.3.0

## 📁 Project Structure

```
stroke_app/
├── backend/
│   ├── app.py                          # Main Flask application
│   ├── config.py                       # Configuration settings
│   ├── utils.py                        # Utility functions
│   ├── load_data.py                    # Dataset loader
│   ├── requirements.txt                # Python dependencies
│   ├── .env                            # Environment variables
│   ├── healthcare-dataset-stroke-data.csv
│   ├── models/
│   │   ├── __init__.py
│   │   ├── patient.py                  # Patient model & CRUD
│   │   └── user.py                     # User model & auth
│   └── tests/
│       ├── __init__.py
│       ├── test_auth.py                # Authentication tests
│       └── test_patients.py            # Patient CRUD tests
│
├── frontend/
│   ├── package.json                    # Node dependencies
│   ├── tailwind.config.js              # Tailwind configuration
│   ├── postcss.config.js               # PostCSS configuration
│   ├── public/
│   │   ├── index.html
│   │   └── ...
│   └── src/
│       ├── App.jsx                     # Main React component
│       ├── index.js                    # Entry point
│       ├── index.css                   # Global styles
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── PatientForm.jsx
│       │   ├── PatientManager.jsx
│       │   └── ProtectedRoute.js
│       ├── contexts/
│       │   └── AuthContext.js
│       └── pages/
│           ├── Dashboard.jsx
│           ├── LoginRegister.jsx
│           ├── PatientDetail.jsx
│           └── PatientForm.jsx
│
└── README.md
```

## 📦 Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 14.x or higher
- **npm**: 6.x or higher
- **MongoDB**: 4.4 or higher (MongoDB Atlas recommended)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stroke_app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/strokedb?retryWrites=true&w=majority

# Secret Key (generate a secure random string)
SECRET_KEY=your-super-secret-key-here-change-in-production
```

**Important**: 
- Replace `username`, `password`, and `cluster` with your MongoDB credentials
- Generate a strong SECRET_KEY for production
- Never commit `.env` file to version control

### Frontend Configuration

The frontend is configured to connect to `http://localhost:5000` by default. If your backend runs on a different port, update the `API_URL` in [`frontend/src/App.jsx`](frontend/src/App.jsx:7).

## 🏃 Running the Application

### 1. Start MongoDB

Ensure MongoDB is running (if using local instance) or your MongoDB Atlas cluster is accessible.

### 2. Load Initial Data (Optional)

```bash
cd backend
python load_data.py
```

This loads the healthcare stroke dataset into MongoDB.

### 3. Start Backend Server

```bash
cd backend
python app.py
```

The backend will run on `http://localhost:5000`

### 4. Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_patients.py

# Run with coverage
pytest --cov=. --cov-report=html
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### Logout
```http
POST /api/auth/logout
```

#### Get Current User
```http
GET /api/auth/current_user
```

### Patient Endpoints

All patient endpoints require authentication.

#### Get All Patients (Paginated)
```http
GET /api/patients?page=1&per_page=20&sort_field=age&sort_order=1&filter_field=gender&filter_value=Male
```

Query Parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)
- `sort_field`: Field to sort by (default: id)
- `sort_order`: 1 for ascending, -1 for descending
- `filter_field`: Field to filter by (optional)
- `filter_value`: Value to filter (optional)

#### Get Single Patient
```http
GET /api/patients/{patient_id}
```

#### Create Patient
```http
POST /api/patients
Content-Type: application/json

{
  "gender": "Male",
  "age": 50,
  "hypertension": 0,
  "ever_married": "Yes",
  "work_type": "Private",
  "Residence_type": "Urban",
  "avg_glucose_level": 100.5,
  "bmi": 25.0,
  "smoking_status": "Never smoked",
  "stroke": 0
}
```

#### Update Patient
```http
PUT /api/patients/{patient_id}
Content-Type: application/json

{
  "age": 51,
  "bmi": 26.0
}
```

#### Delete Patient
```http
DELETE /api/patients/{patient_id}
```

## 🔒 Security Features

### Backend Security
- **Password Hashing**: bcrypt with salt rounds
- **CSRF Protection**: Flask-WTF CSRF tokens
- **Input Validation**: Sanitization of all user inputs
- **SQL Injection Prevention**: MongoDB parameterized queries
- **Session Security**: HTTPOnly cookies, SameSite policy
- **CORS**: Configured for specific origins only
- **Rate Limiting**: Recommended for production
- **Secure Headers**: Recommended for production

### Frontend Security
- **XSS Prevention**: React's built-in escaping
- **CSRF Tokens**: Included in API requests
- **Secure Storage**: Session-based auth (no localStorage for tokens)
- **Input Validation**: Client-side validation before API calls

### Best Practices Implemented
- Environment variables for sensitive data
- No hardcoded credentials
- Secure MongoDB connection (SRV)
- Logging for security events
- Error handling without exposing internals

## 🔧 Development

### Code Style
- **Backend**: Follow PEP 8 guidelines
- **Frontend**: ESLint with React configuration

### Git Workflow
1. Create feature branch from `main`
2. Make changes and commit with descriptive messages
3. Write/update tests
4. Submit pull request

### Environment Variables
Never commit `.env` files. Use `.env.example` as template.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MONGO_URI in `.env`
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your IP

### CORS Errors
- Verify frontend URL in backend CORS configuration
- Check credentials are included in fetch requests

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

## 📝 License

This project is for educational purposes.

## 👥 Contributors

- Development Team

## 🙏 Acknowledgments

- Healthcare Stroke Dataset from Kaggle
- Flask and React communities
- MongoDB documentation

---

**Note**: This application handles sensitive healthcare data. Ensure compliance with HIPAA, GDPR, or other relevant regulations before deploying to production.

