# HR & Payroll Management Tool

A lightweight internal HR and payroll management system with real business logic, built with Express.js, SQLite, and vanilla JavaScript.

## Project Status

**Complete** - Employee Management, Leave Management, Payroll, Dashboard, and automated tests all implemented, including frontend UI.

## Features

### Employee Management
- Create, view, update, deactivate employees (soft delete)
- Manager relationships and team views
- Leave balance tracking
- Employee fields: name, email, role, team, manager, start date, salary, employment type (full-time/part-time/contract)

### Leave Management (Core Focus)
- 5 business rules: 7-day advance notice, no self-approval, team coverage, balance enforcement, no overlap
- Approve/reject workflow
- Automatic balance deduction on approval
- Escalation for requests pending > 3 days

### Payroll
- Monthly payslip generation
- Progressive tax calculation (10%, 20%, 30% brackets)
- Social security deduction (5%)
- Pro-rata calculation for mid-month joiners
- Unpaid leave deductions
- Payroll history tracking

### Dashboard
- Stats cards (total employees, pending leave, approved leave)
- Who's on leave today
- Upcoming leave (next 7 days)
- Pending requests with escalation alerts
- Leave balances for all employees
- Recent activity feed
- Payroll generation trigger from UI

### Frontend
- Single-page application with tab navigation (Dashboard, Employees, Leave, Payroll)
- Dynamic content loading per view
- Employee list with active/inactive status badges
- Leave request list with status badges (pending, approved, rejected)
- Payroll summary (total gross, tax, net) with detailed payslip table and period selector
- Responsive, card-based design with a badge and alert system

### Testing
- 26 unit tests covering:
  - Leave rules (advance notice, self-approval, team coverage, balance, overlap)
  - Payroll calculations (tax, social security, net pay, pro-rata)
  - Edge cases and boundary conditions

## What I Prioritized

**Leave Management** was my initial focus because spreadsheets and WhatsApp fail at enforcing business rules. The rules above prevent common problems: last-minute requests, team under-coverage, and self-approval. Payroll and the dashboard were built on top of that foundation once the core leave logic was solid.

## Tech Stack

**Backend:** Express.js  
**Database:** SQLite  
**ORM/Query Builder:** None (raw SQL for simplicity)  
**Frontend:** HTML + CSS + Vanilla JS  

## Setup

```bash
# Clone the repository
git clone https://github.com/Nonga001/hr-payroll-management-tool.git
cd hr-payroll-management-tool

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Create database with schema
sqlite3 hr_payroll.db < sql/schema.sql

# (Optional) seed with sample data
npm run seed

# Start the server
npm start

# Or run in development mode with auto-reload
npm run dev
```

Server runs at `http://localhost:3000`

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

**Test Coverage**
* Leave Rules Engine: tests all 5 business rules
* Payroll Calculator: tests tax brackets, social security, pro-rata calculations
* 26 passing tests covering core business logic

## API Endpoints

### Employees
* `GET /api/employees` - List all
* `GET /api/employees/:id` - Get one
* `GET /api/employees/:id/team` - Get team members
* `GET /api/employees/:id/balance` - Get leave balance
* `POST /api/employees` - Create
* `PUT /api/employees/:id` - Update
* `DELETE /api/employees/:id` - Deactivate

### Leave
* `GET /api/leave` - List all
* `GET /api/leave/pending` - Pending requests with escalation info
* `GET /api/leave/employee/:id` - Employee's leave history
* `GET /api/leave/balance/:employeeId` - Get balance
* `GET /api/leave/pending/count` - Pending count for dashboard
* `POST /api/leave` - Create request
* `PUT /api/leave/:id/approve` - Approve
* `PUT /api/leave/:id/reject` - Reject

### Payroll
* `GET /api/payroll/employee/:id` - Get employee's payroll history
* `GET /api/payroll/:id` - Get payslip by ID
* `GET /api/payroll/period/:month/:year` - Get payroll for period
* `GET /api/payroll/period/:month/:year/summary` - Get payroll summary
* `POST /api/payroll/generate` - Generate payroll for all employees
* `POST /api/payroll/generate/employee/:id` - Generate payslip for single employee

### Dashboard
* `GET /api/dashboard` - Get all dashboard data
* `GET /api/dashboard/stats` - Get stats only
* `GET /api/dashboard/onleave` - Get who's on leave today
* `GET /api/dashboard/upcoming` - Get upcoming leave
* `GET /api/dashboard/pending` - Get pending requests with escalation
* `GET /api/dashboard/balances` - Get all leave balances
* `GET /api/dashboard/activity` - Get recent activity

## Database Schema

See `sql/schema.sql` for complete schema with:
* Employees
* Leave requests
* Leave balances
* Payroll
* Notifications

## Project Structure

```
hr-payroll-management-tool/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── models/
│   │   ├── Employee.js          # Employee CRUD operations
│   │   ├── LeaveRequest.js      # Leave management
│   │   └── Payroll.js           # Payroll generation
│   ├── routes/
│   │   ├── employeeRoutes.js    # Employee API endpoints
│   │   ├── leaveRoutes.js       # Leave API endpoints
│   │   ├── payrollRoutes.js     # Payroll API endpoints
│   │   └── dashboardRoutes.js   # Dashboard API endpoints
│   ├── services/
│   │   ├── leaveRules.js        # 5 business rules engine
│   │   ├── payrollCalculator.js # Tax and payroll calculations
│   │   └── dashboardService.js  # Dashboard data aggregation
│   ├── utils/
│   │   ├── dateHelpers.js       # Date utility functions
│   │   └── validators.js        # Input validation
│   └── index.js                 # Application entry point
├── public/
│   ├── index.html               # Frontend HTML
│   ├── css/
│   │   └── styles.css           # CSS styling
│   └── js/
│       └── app.js               # Frontend JavaScript
├── sql/
│   └── schema.sql               # Database schema
├── tests/
│   ├── leaveRules.test.js       # Leave rules unit tests
│   └── payrollCalculator.test.js # Payroll unit tests
├── package.json
└── README.md
```