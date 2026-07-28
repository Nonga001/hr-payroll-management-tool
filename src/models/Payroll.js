const { query, get, run } = require('../config/database');

class Payroll {
  // Simple tax calculation
  static calculateTax(income) {
    let tax = 0;
    
    if (income <= 50000) {
      tax = income * 0.10;
    } else if (income <= 100000) {
      tax = 50000 * 0.10 + (income - 50000) * 0.20;
    } else {
      tax = 50000 * 0.10 + 50000 * 0.20 + (income - 100000) * 0.30;
    }
    
    return Math.round(tax * 100) / 100;
  }

  static calculateSocialSecurity(grossPay) {
    return Math.round((grossPay * 0.05) * 100) / 100;
  }

  // Generate payslip for one employee
  static async generatePayslip(employeeId, month, year) {
    const employee = await get('SELECT * FROM employees WHERE id = ?', [employeeId]);
    
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Simple gross pay (no deductions for now)
    const grossPay = employee.salary;
    const tax = this.calculateTax(grossPay);
    const socialSecurity = this.calculateSocialSecurity(grossPay);
    const netPay = Math.round((grossPay - tax - socialSecurity) * 100) / 100;

    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const periodEnd = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    const result = await run(`
      INSERT INTO payroll (
        employee_id, period_start, period_end, gross_pay, 
        tax, social_security, net_pay, unpaid_leave_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, periodStart, periodEnd, grossPay, tax, socialSecurity, netPay, 0]);

    return {
      id: result.id,
      employee_id: employeeId,
      employee_name: employee.name,
      period: `${month}/${year}`,
      gross_pay: grossPay,
      tax: tax,
      social_security: socialSecurity,
      net_pay: netPay
    };
  }

  // Generate for all employees
  static async generatePayrollForAll(month, year) {
    const employees = await query('SELECT id FROM employees WHERE is_active = 1');
    
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

  // Check if payroll exists
  static async existsForPeriod(month, year) {
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const result = await get('SELECT COUNT(*) as count FROM payroll WHERE period_start = ?', [periodStart]);
    return result ? result.count > 0 : false;
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

  // Get payroll by period
  static async getByPeriod(month, year) {
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    return await query(`
      SELECT p.*, e.name as employee_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.period_start = ?
    `, [periodStart]);
  }

  // Get employee history
  static async getEmployeeHistory(employeeId) {
    return await query(`
      SELECT * FROM payroll
      WHERE employee_id = ?
      ORDER BY period_start DESC
    `, [employeeId]);
  }
}

module.exports = Payroll;
