-- ============================================
-- HR & Payroll Management Tool - Complete Dump
-- ============================================
-- Generated: 2026-07-29
-- Contains: Schema + Sample Data
-- ============================================

-- ============================================
-- SCHEMA
-- ============================================

DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS employees;

-- Employees table
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  team TEXT NOT NULL,
  manager_id INTEGER REFERENCES employees(id),
  start_date DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  employment_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Leave requests
CREATE TABLE leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reason TEXT,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INTEGER REFERENCES employees(id),
  reviewed_at DATETIME
);

-- Leave balances
CREATE TABLE leave_balances (
  employee_id INTEGER PRIMARY KEY REFERENCES employees(id),
  annual_balance DECIMAL(5,2) DEFAULT 20.0,
  sick_balance DECIMAL(5,2) DEFAULT 10.0,
  personal_balance DECIMAL(5,2) DEFAULT 5.0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payroll
CREATE TABLE payroll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_pay DECIMAL(10,2),
  tax DECIMAL(10,2),
  social_security DECIMAL(10,2),
  net_pay DECIMAL(10,2),
  unpaid_leave_days INTEGER DEFAULT 0,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_employees_team ON employees(team);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(period_start, period_end);

-- Triggers
CREATE TRIGGER update_employees_timestamp 
  AFTER UPDATE ON employees
  BEGIN
    UPDATE employees SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
  END;

CREATE TRIGGER update_leave_balances_timestamp 
  AFTER UPDATE ON leave_balances
  BEGIN
    UPDATE leave_balances SET updated_at = CURRENT_TIMESTAMP 
    WHERE employee_id = NEW.employee_id;
  END;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Employees (7 employees across 4 teams)
INSERT INTO employees (id, name, email, role, team, manager_id, start_date, salary, employment_type, is_active, created_at, updated_at) VALUES
(1, 'John Doe', 'john@company.com', 'CEO', 'Executive', NULL, '2020-01-01', 150000.00, 'full-time', 1, '2026-07-27 08:00:50', '2026-07-27 08:00:50'),
(2, 'Jane Smith', 'jane@company.com', 'Engineering Manager', 'Engineering', 1, '2020-06-15', 120000.00, 'full-time', 1, '2026-07-27 08:00:50', '2026-07-27 08:00:50'),
(3, 'Bob Johnson', 'bob@company.com', 'Senior Developer', 'Engineering', 2, '2021-03-01', 90000.00, 'full-time', 1, '2026-07-27 08:00:50', '2026-07-27 08:00:50'),
(4, 'Alice Williams', 'alice@company.com', 'Developer', 'Engineering', 2, '2022-01-15', 70000.00, 'full-time', 1, '2026-07-27 08:00:50', '2026-07-27 08:00:50'),
(5, 'Charlie Brown', 'charlie@company.com', 'HR Manager', 'HR', 1, '2020-08-01', 85000.00, 'full-time', 1, '2026-07-27 08:00:50', '2026-07-27 08:00:50'),
(6, 'Diana Miller', 'diana@company.com', 'Marketing Manager', 'Marketing', 1, '2021-06-01', 95000.00, 'full-time', 1, '2026-07-27 08:00:50', '2026-07-27 08:00:50'),
(7, 'Eve Davis', 'eve@company.com', 'Marketing Specialist', 'Marketing', 6, '2022-07-01', 60000.00, 'full-time', 1, '2026-07-27 08:00:50', '2026-07-27 08:00:50');

-- Leave Balances
INSERT INTO leave_balances (employee_id, annual_balance, sick_balance, personal_balance, updated_at) VALUES
(1, 15.0, 8.0, 3.0, '2026-07-27 08:00:50'),
(2, 20.0, 10.0, 5.0, '2026-07-27 08:00:50'),
(3, 18.0, 9.0, 4.0, '2026-07-27 08:00:50'),
(4, 12.0, 5.0, 2.0, '2026-07-27 08:00:50'),
(5, 20.0, 10.0, 5.0, '2026-07-27 08:00:50'),
(6, 16.0, 7.0, 3.0, '2026-07-27 08:00:50'),
(7, 14.0, 6.0, 2.0, '2026-07-27 08:00:50');

-- Leave Requests (2 pending, 2 approved, 1 rejected)
INSERT INTO leave_requests (id, employee_id, start_date, end_date, leave_type, status, reason, requested_at, reviewed_by, reviewed_at) VALUES
(1, 3, '2026-08-06', '2026-08-08', 'annual', 'pending', 'Family vacation', '2026-07-27 08:00:50', NULL, NULL),
(2, 4, '2026-08-01', '2026-08-02', 'sick', 'pending', 'Doctor appointment', '2026-07-27 08:00:50', NULL, NULL),
(3, 3, '2026-06-27', '2026-06-29', 'annual', 'approved', 'Holiday', '2026-06-20 09:00:00', 2, '2026-06-22 10:00:00'),
(4, 4, '2026-07-07', '2026-07-08', 'sick', 'approved', 'Sick leave', '2026-07-05 08:00:00', 2, '2026-07-06 09:00:00'),
(5, 7, '2026-07-19', '2026-07-20', 'personal', 'rejected', 'Not enough notice', '2026-07-10 14:00:00', 6, '2026-07-12 10:00:00');

-- Payroll (July 2026 - one generated period)
INSERT INTO payroll (id, employee_id, period_start, period_end, gross_pay, tax, social_security, net_pay, unpaid_leave_days, generated_at) VALUES
(1, 1, '2026-07-01', '2026-07-31', 150000.00, 30000.00, 7500.00, 112500.00, 0, '2026-07-29 10:00:00'),
(2, 2, '2026-07-01', '2026-07-31', 120000.00, 19000.00, 6000.00, 95000.00, 0, '2026-07-29 10:00:00'),
(3, 3, '2026-07-01', '2026-07-31', 90000.00, 13000.00, 4500.00, 72500.00, 0, '2026-07-29 10:00:00'),
(4, 4, '2026-07-01', '2026-07-31', 70000.00, 9000.00, 3500.00, 57500.00, 0, '2026-07-29 10:00:00'),
(5, 5, '2026-07-01', '2026-07-31', 85000.00, 12000.00, 4250.00, 68750.00, 0, '2026-07-29 10:00:00'),
(6, 6, '2026-07-01', '2026-07-31', 95000.00, 14000.00, 4750.00, 76250.00, 0, '2026-07-29 10:00:00'),
(7, 7, '2026-07-01', '2026-07-31', 60000.00, 7000.00, 3000.00, 50000.00, 0, '2026-07-29 10:00:00');

-- ============================================
-- END OF DUMP
-- ============================================
