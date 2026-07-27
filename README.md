# HR & Payroll Management Tool

A lightweight internal HR and payroll management system with real business logic, built with Express.js, SQLite, and vanilla JavaScript.

## Project Status

**Day 2 Complete** - Employee & Leave Management implemented

## Features

### Employee Management
- Create, view, update, and deactivate employees (soft delete)
- Organizational hierarchy with manager relationships
- Leave balance tracking per employee
- Employee fields: name, email, role, team, manager, start date, salary, employment type (full-time/part-time/contract)

### Leave Management (Core Focus)
- Request leave with validation rules:
  - **7-day advance notice** - Prevents last-minute requests
  - **No self-approval** - Managers can't approve their own leave
  - **Team coverage** - Only 1 employee per team on leave at a time
  - **Balance enforcement** - Cannot exceed available balance
  - **No overlap** - Cannot have overlapping requests
  - **Escalation** - Requests pending > 3 days flagged for manager attention
- Approve/reject workflow
- Automatic balance deduction on approval

### Payroll (Planned)
- Monthly payslip generation
- Progressive tax calculation (10%, 20%, 30% brackets)
- Social security deduction (5%)
- Pro-rata for mid-month joiners
- Unpaid leave deductions

### Dashboard (Planned)
- Pending approvals view
- Who's out and when
- Leave balance summaries
- Payslip generation

## What I Prioritized

**Leave Management** was my focus because spreadsheets and WhatsApp fail at enforcing business rules. The rules above prevent common problems: last-minute requests, team under-coverage, and self-approval.

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

## Database Schema

See `sql/schema.sql` for complete schema with:
* Employees
* Leave requests
* Leave balances
* Payroll (coming soon)
* Notifications

## Project Structure
hr-payroll-management-tool/
├── sql/
│ └── schema.sql # Database schema
├── src/
│ ├── config/ # Database connection
│ ├── models/ # Employee & Leave models
│ ├── routes/ # API routes
│ ├── services/ # Leave rules engine
│ └── index.js # Express server
├── public/ # Frontend files
├── package.json
└── README.md

## Next Up

* Payroll Module
* Dashboard UI
* Frontend integration