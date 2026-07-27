# HR & Payroll Management Tool

A lightweight internal HR and payroll management system with real business logic, built with Express.js, SQLite, and vanilla JavaScript.

## Features

### Employee Management
- Create, view, update, and deactivate employees
- Organizational hierarchy with manager relationships
- Employee records: name, role, team, manager, start date, salary, employment type

### Leave Management (Core Focus)
- Request leave with validation rules:
  - 7-day advance notice requirement
  - No self-approval by managers
  - Team coverage (only 1 employee per team on leave)
  - Leave balance enforcement
  - Escalation for pending requests > 3 days
- Approve/reject workflow

### Payroll
- Monthly payslip generation
- Progressive tax calculation (10%, 20%, 30% brackets)
- Social security deduction (5%)
- Pro-rata for mid-month joiners
- Unpaid leave deductions
- Net pay calculation

### Dashboard
- Pending approvals view
- Who's out and when
- Leave balance summaries
- Payslip generation

## Tech Stack

**Backend:** Express.js  
**Database:** SQLite  
**ORM/Query Builder:** None (raw SQL for simplicity)  
**Frontend:** HTML + CSS + Vanilla JS  

##  Installation

```bash
# Clone the repository
git clone https://github.com/Nonga001/hr-payroll-management-tool.git
cd hr-payroll-management-tool

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Setup database with schema
npm run setup-db

# Seed with sample data
npm run seed

# Start the server
npm start

# Or run in development mode with auto-reload
npm run dev