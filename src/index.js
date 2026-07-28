const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE (with relaxed CSP for development)
// ============================================

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// ROUTES
// ============================================

const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leave', leaveRoutes);

const payrollRoutes = require('./routes/payrollRoutes');
app.use('/api/payroll', payrollRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HR & Payroll Management Tool API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: ['Employees', 'Leave Management', 'Payroll', 'Dashboard']
  });
});

// ============================================
// FRONTEND
// ============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
  ============================================
  HR & Payroll Management Tool
  ============================================
  Server:    http://localhost:${PORT}
  Health:    http://localhost:${PORT}/api/health
  Employees: http://localhost:${PORT}/api/employees
  Leave:     http://localhost:${PORT}/api/leave
  Payroll:   http://localhost:${PORT}/api/payroll/test
  Dashboard: http://localhost:${PORT}/api/dashboard/test
  ============================================
  `);
});

module.exports = app;
