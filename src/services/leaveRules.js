const { query } = require('../config/database');

class LeaveRules {
  // Rule 1: 7-day advance notice
  static async checkAdvanceNotice(startDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      valid: diffDays >= 7,
      message: diffDays < 7 
        ? `Leave must be requested at least 7 days in advance. You gave ${diffDays} days notice.`
        : null
    };
  }

  // Rule 2: No self-approval
  static async checkNoSelfApproval(employeeId, approverId) {
    return {
      valid: parseInt(employeeId) !== parseInt(approverId),
      message: parseInt(employeeId) === parseInt(approverId) 
        ? 'Managers cannot approve their own leave requests.'
        : null
    };
  }

  // Rule 3: Team coverage (only 1 person per team on leave at a time)
  static async checkTeamCoverage(employeeId, startDate, endDate) {
    // Get employee's team
    const employee = await query(
      'SELECT team FROM employees WHERE id = ? AND is_active = 1',
      [employeeId]
    );
    
    if (!employee || employee.length === 0) {
      return { valid: true };
    }
    
    const team = employee[0].team;
    
    // Check for overlapping approved leaves in same team
    const overlapping = await query(`
      SELECT e.name, l.start_date, l.end_date
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE e.team = ? 
        AND e.id != ?
        AND l.status = 'approved'
        AND l.start_date <= ?
        AND l.end_date >= ?
    `, [team, employeeId, endDate, startDate]);
    
    return {
      valid: overlapping.length === 0,
      message: overlapping.length > 0
        ? `Team member ${overlapping[0].name} is already on leave during this period (${overlapping[0].start_date} to ${overlapping[0].end_date}).`
        : null
    };
  }

  // Rule 4: Leave balance check
  static async checkBalance(employeeId, daysRequested, leaveType) {
    const balance = await query(
      `SELECT ${leaveType}_balance as balance 
       FROM leave_balances 
       WHERE employee_id = ?`,
      [employeeId]
    );
    
    const available = balance[0]?.balance || 0;
    
    return {
      valid: available >= daysRequested,
      message: available < daysRequested
        ? `Insufficient ${leaveType} leave balance. Available: ${available} days, Requested: ${daysRequested} days.`
        : null
    };
  }

  // Rule 5: Check if leave request overlaps with existing
  static async checkOverlap(employeeId, startDate, endDate) {
    const overlaps = await query(`
      SELECT * FROM leave_requests 
      WHERE employee_id = ? 
        AND status IN ('pending', 'approved')
        AND start_date <= ?
        AND end_date >= ?
    `, [employeeId, endDate, startDate]);
    
    return {
      valid: overlaps.length === 0,
      message: overlaps.length > 0
        ? 'You already have a leave request for this period.'
        : null
    };
  }

  // Calculate working days (Monday-Friday)
  static calculateWorkDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Not Sunday or Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  // Check all rules
  static async validateRequest(request, approverId) {
    const { employee_id, start_date, end_date, leave_type } = request;
    
    const workDays = this.calculateWorkDays(start_date, end_date);
    
    const rules = [
      await this.checkAdvanceNotice(start_date),
      await this.checkNoSelfApproval(employee_id, approverId),
      await this.checkTeamCoverage(employee_id, start_date, end_date),
      await this.checkBalance(employee_id, workDays, leave_type),
      await this.checkOverlap(employee_id, start_date, end_date)
    ];
    
    const violations = rules.filter(r => !r.valid);
    
    return {
      valid: violations.length === 0,
      violations: violations.map(v => v.message),
      workDays: workDays
    };
  }
}

module.exports = LeaveRules;