const { query, get, run } = require('../config/database');
const PayrollCalculator = require('../services/payrollCalculator');

class Payroll {
  // Generate payslip for one employee
  static async generatePayslip(employeeId, month, year) {
    // Get employee
    const employee = await get(`
      SELECT * FROM employees WHERE id = ? AND is_active = 1
    `, [employeeId]);
    
    if (!employee) {
      throw new Error('Employee not found or inactive');
    }

    // Get unpaid leave days
    const unpaidLeave = await query(`
      SELECT SUM(julianday(end_date) - julianday(start_date) + 1) as days
      FROM leave_requests
      WHERE employee_id = ?
        AND status = 'approved'
        AND leave_type = 'unpaid'
        AND strftime('%m', start_date) = ?
        AND strftime('%Y', start_date) = ?
    `, [employeeId, String(month).padStart(2, '0'), year]);

    const unpaidDays = Math.floor(unpaidLeave[0]?.days || 0);

    // Use calculator to generate payslip
    const payslip = PayrollCalculator.generatePayslip(
      employee,
      parseInt(month),
      parseInt(year),
      unpaidDays
    );

    // Save to database
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const periodEnd = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    const result = await run(`
      INSERT INTO payroll (
        employee_id, period_start, period_end, gross_pay, 
        tax, social_security, net_pay, unpaid_leave_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      employeeId, 
      periodStart, 
      periodEnd, 
      payslip.gross_pay, 
      payslip.tax, 
      payslip.social_security, 
      payslip.net_pay, 
      payslip.unpaid_leave_days
    ]);

    return {
      id: result.id,
      ...payslip
    };
  }

  // Generate payroll for all employees
  static async generatePayrollForAll(month, year) {
    const employees = await query(`
      SELECT id FROM employees WHERE is_active = 1
    `);
    
    const results = [];
    for (const emp of employees) {
      try {
        const payslip = await this.generatePayslip(emp.id, month, year);
        results.push(payslip);
      } catch (error) {
        results.push({
          employee_id: emp.id,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Get payslip by ID
  static async getPayslip(id) {
    return await get(`
      SELECT p.*, e.name as employee_name, e.email, e.role
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = ?
    `, [id]);
  }

  // Get payroll history for employee
  static async getEmployeeHistory(employeeId) {
    return await query(`
      SELECT * FROM payroll
      WHERE employee_id = ?
      ORDER BY period_start DESC
    `, [employeeId]);
  }

  // Get payroll for a specific period
  static async getByPeriod(month, year) {
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const periodEnd = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
    
    return await query(`
      SELECT p.*, e.name as employee_name, e.email, e.role
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.period_start = ? AND p.period_end = ?
      ORDER BY e.name
    `, [periodStart, periodEnd]);
  }

  // Get payroll summary
  static async getSummary(month, year) {
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const result = await get(`
      SELECT 
        COUNT(*) as total_employees,
        SUM(gross_pay) as total_gross,
        SUM(tax) as total_tax,
        SUM(social_security) as total_social_security,
        SUM(net_pay) as total_net
      FROM payroll
      WHERE period_start = ?
    `, [periodStart]);
    
    return result || {
      total_employees: 0,
      total_gross: 0,
      total_tax: 0,
      total_social_security: 0,
      total_net: 0
    };
  }

  // Check if payroll exists for period
  static async existsForPeriod(month, year) {
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const result = await get(`
      SELECT COUNT(*) as count FROM payroll
      WHERE period_start = ?
    `, [periodStart]);
    
    return result ? result.count > 0 : false;
  }
}

module.exports = Payroll;
