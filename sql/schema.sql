-- Drop existing tables
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS notifications;

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

-- Leave requests table
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

-- Leave balances table
CREATE TABLE leave_balances (
  employee_id INTEGER PRIMARY KEY REFERENCES employees(id),
  annual_balance DECIMAL(5,2) DEFAULT 20.0,
  sick_balance DECIMAL(5,2) DEFAULT 10.0,
  personal_balance DECIMAL(5,2) DEFAULT 5.0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payroll table
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

-- Notifications table
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample employees
INSERT INTO employees (name, email, role, team, manager_id, start_date, salary, employment_type) VALUES
('John Doe', 'john@company.com', 'CEO', 'Executive', NULL, '2020-01-01', 150000.00, 'full-time'),
('Jane Smith', 'jane@company.com', 'Engineering Manager', 'Engineering', 1, '2020-06-15', 120000.00, 'full-time'),
('Bob Johnson', 'bob@company.com', 'Senior Developer', 'Engineering', 2, '2021-03-01', 90000.00, 'full-time'),
('Alice Williams', 'alice@company.com', 'Developer', 'Engineering', 2, '2022-01-15', 70000.00, 'full-time'),
('Charlie Brown', 'charlie@company.com', 'HR Manager', 'HR', 1, '2020-08-01', 85000.00, 'full-time');

-- Sample leave balances
INSERT INTO leave_balances (employee_id, annual_balance, sick_balance, personal_balance) VALUES
(1, 15.0, 8.0, 3.0),
(2, 20.0, 10.0, 5.0),
(3, 18.0, 9.0, 4.0),
(4, 12.0, 5.0, 2.0),
(5, 20.0, 10.0, 5.0);

-- Sample leave requests
INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, status, reason) VALUES
(3, date('now', '+10 days'), date('now', '+12 days'), 'annual', 'pending', 'Family vacation'),
(4, date('now', '+5 days'), date('now', '+6 days'), 'sick', 'pending', 'Doctor appointment');
