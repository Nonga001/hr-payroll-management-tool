const { query, get, run } = require('../config/database');

class Employee {
  // Get all employees (active only by default)
  static async findAll(includeInactive = false) {
    const sql = includeInactive
      ? 'SELECT * FROM employees ORDER BY name'
      : 'SELECT * FROM employees WHERE is_active = 1 ORDER BY name';
    return await query(sql);
  }

  // Get employee by ID
  static async findById(id) {
    return await get('SELECT * FROM employees WHERE id = ?', [id]);
  }

  // Get employee with their manager info
  static async findWithManager(id) {
    return await get(`
      SELECT e.*, m.name as manager_name 
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ?
    `, [id]);
  }

  // Get team members (same team)
  static async getTeam(employeeId) {
    const employee = await this.findById(employeeId);
    if (!employee) return [];
    return await query(
      'SELECT * FROM employees WHERE team = ? AND is_active = 1',
      [employee.team]
    );
  }

  // Get direct reports (employees who report to this manager)
  static async getDirectReports(managerId) {
    return await query(
      'SELECT * FROM employees WHERE manager_id = ? AND is_active = 1',
      [managerId]
    );
  }

  // Create new employee
  static async create(data) {
    const { name, email, role, team, manager_id, start_date, salary, employment_type } = data;
    
    // Check if email exists
    const existing = await get('SELECT id FROM employees WHERE email = ?', [email]);
    if (existing) {
      throw new Error('Email already exists');
    }

    const result = await run(`
      INSERT INTO employees (name, email, role, team, manager_id, start_date, salary, employment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, email, role, team, manager_id || null, start_date, salary, employment_type]);

    // Create leave balance for new employee
    await run(`
      INSERT INTO leave_balances (employee_id, annual_balance, sick_balance, personal_balance)
      VALUES (?, 20.0, 10.0, 5.0)
    `, [result.id]);

    return await this.findById(result.id);
  }

  // Update employee
  static async update(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'email', 'role', 'team', 'manager_id', 'salary', 'employment_type'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    await run(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values);
    return await this.findById(id);
  }

  // Deactivate employee (soft delete)
  static async deactivate(id) {
    await run('UPDATE employees SET is_active = 0 WHERE id = ?', [id]);
    return await this.findById(id);
  }

  // Reactivate employee
  static async reactivate(id) {
    await run('UPDATE employees SET is_active = 1 WHERE id = ?', [id]);
    return await this.findById(id);
  }

  // Get employee with leave balance
  static async findWithBalance(id) {
    return await get(`
      SELECT e.*, 
             l.annual_balance, 
             l.sick_balance, 
             l.personal_balance
      FROM employees e
      LEFT JOIN leave_balances l ON e.id = l.employee_id
      WHERE e.id = ?
    `, [id]);
  }
}

module.exports = Employee;