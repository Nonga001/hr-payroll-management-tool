const { query, get } = require('../config/database');
const LeaveRequest = require('../models/LeaveRequest');
const Payroll = require('../models/Payroll');

class DashboardService {
  static async getStats() {
    const totalEmployees = await get('SELECT COUNT(*) as count FROM employees WHERE is_active = 1');
    const pendingLeave = await get('SELECT COUNT(*) as count FROM leave_requests WHERE status = "pending"');
    const approvedLeave = await get('SELECT COUNT(*) as count FROM leave_requests WHERE status = "approved"');
    
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const payrollExists = await Payroll.existsForPeriod(month, year);
    
    return {
      total_employees: totalEmployees?.count || 0,
      pending_leave: pendingLeave?.count || 0,
      approved_leave: approvedLeave?.count || 0,
      payroll_generated: payrollExists,
      current_period: `${month}/${year}`
    };
  }

  static async getOnLeaveToday() {
    const today = new Date().toISOString().split('T')[0];
    return await query(`
      SELECT e.name, e.team, l.leave_type, l.end_date
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.status = 'approved'
        AND l.start_date <= ?
        AND l.end_date >= ?
    `, [today, today]);
  }

  static async getUpcomingLeave() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    return await query(`
      SELECT e.name, e.team, l.start_date, l.end_date, l.leave_type, l.status
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.start_date >= ? AND l.start_date <= ?
      ORDER BY l.start_date ASC
    `, [todayStr, nextWeekStr]);
  }

  static async getPendingWithEscalation() {
    return await LeaveRequest.getPendingWithEscalation();
  }

  static async getAllLeaveBalances() {
    return await query(`
      SELECT e.name, e.team,
             l.annual_balance, l.sick_balance, l.personal_balance
      FROM employees e
      JOIN leave_balances l ON e.id = l.employee_id
      WHERE e.is_active = 1
    `);
  }

  static async getDashboardData() {
    const [stats, onLeave, upcoming, pending, balances] = await Promise.all([
      this.getStats(),
      this.getOnLeaveToday(),
      this.getUpcomingLeave(),
      this.getPendingWithEscalation(),
      this.getAllLeaveBalances()
    ]);

    return {
      stats,
      on_leave_today: onLeave,
      upcoming_leave: upcoming,
      pending_requests: pending,
      leave_balances: balances
    };
  }
}

module.exports = DashboardService;
