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

Day 2 - Employee & Leave Management)

# HR & Payroll Management Tool

Express.js + SQLite + Vanilla JS internal HR tool with real business logic.

## Setup

```bash
npm install
sqlite3 hr_payroll.db < sql/schema.sql
npm start

Server runs at http://localhost:3000

Implemented Features
Employee Management
Create, view, update, deactivate employees

Manager relationships and team views

Leave balance tracking

Leave Management (Core Focus)
Request leave with validation

Approve/reject workflow

Automatic balance deduction

Business Rules
7-day advance notice - Requests must be 7+ days before start date

No self-approval - Managers can't approve their own leave

Team coverage - Only 1 employee per team on leave at a time

Balance enforcement - Cannot exceed available balance

No overlap - Cannot have overlapping requests

Escalation
Requests pending > 3 days flagged for manager attention

What I Prioritized
Leave Management was my focus because spreadsheets and WhatsApp fail at enforcing business rules. The 5 rules above prevent common problems: last-minute requests, team under-coverage, and self-approval.

API Endpoints
Employees
GET /api/employees - List all

GET /api/employees/:id - Get one

POST /api/employees - Create

PUT /api/employees/:id - Update

DELETE /api/employees/:id - Deactivate

Leave
GET /api/leave - List all

GET /api/leave/pending - Pending requests

POST /api/leave - Create request

PUT /api/leave/:id/approve - Approve

PUT /api/leave/:id/reject - Reject

GET /api/leave/balance/:employeeId - Get balance

Next Up
Payroll Module

Dashboard UI

Frontend integration