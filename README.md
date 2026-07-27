# HR & Payroll Management Tool

Express.js + SQLite + Vanilla JS internal HR tool with real business logic.

## Setup

```bash
npm install
sqlite3 hr_payroll.db < sql/schema.sql
npm start
```

Server runs at `http://localhost:3000`

## Implemented Features

### Employee Management

* Create, view, update, deactivate employees
* Manager relationships and team views
* Leave balance tracking

### Leave Management (Core Focus)

* Request leave with validation
* Approve/reject workflow
* Automatic balance deduction

### Business Rules

1. **7-day advance notice** — Requests must be 7+ days before start date
2. **No self-approval** — Managers can't approve their own leave
3. **Team coverage** — Only 1 employee per team on leave at a time
4. **Balance enforcement** — Cannot exceed available balance
5. **No overlap** — Cannot have overlapping requests

### Escalation

* Requests pending > 3 days are flagged for manager attention

## What I Prioritized

Leave Management was my focus because spreadsheets and WhatsApp fail at enforcing business rules. The 5 rules above prevent common problems: last-minute requests, team under-coverage, and self-approval.

## API Endpoints

### Employees

* `GET /api/employees` - List all
* `GET /api/employees/:id` - Get one
* `POST /api/employees` - Create
* `PUT /api/employees/:id` - Update
* `DELETE /api/employees/:id` - Deactivate

### Leave

* `GET /api/leave` - List all
* `GET /api/leave/pending` - Pending requests
* `POST /api/leave` - Create request
* `PUT /api/leave/:id/approve` - Approve
* `PUT /api/leave/:id/reject` - Reject
* `GET /api/leave/balance/:employeeId` - Get balance

## Next Up

* Payroll Module
* Dashboard UI
* Frontend integration