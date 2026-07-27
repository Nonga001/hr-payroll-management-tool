const { query, get, run } = require('../config/database');
const LeaveRules = require('../services/leaveRules');

class LeaveRequest {
  // Get all leave requests
  static async findAll(filters = {}) {
    let sql = `
      SELECT l.*, e.name as employee_name, e.email, e.team,
             m.name as reviewer_name
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN employees m ON l.reviewed_by = m.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.status) {
      sql += ' AND l.status = ?';
      params.push(filters.status);
    }
    
    if (filters.employee_id) {
      sql += ' AND l.employee_id = ?';
      params.push(filters.employee_id);
    }
    
    sql += ' ORDER BY l.requested_at DESC';
    
    return await query(sql, params);
  }

  // Get pending requests (with escalation info)
  static async getPendingWithEscalation() {
    const requests = await query(`
      SELECT l.*, e.name as employee_name, e.team,
             julianday('now') - julianday(l.requested_at) as days_pending
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.status = 'pending'
      ORDER BY l.requested_at ASC
    `);
    
    return requests.map(req => ({
      ...req,
      needs_escalation: req.days_pending >= 3,
      escalation_message: req.days_pending >= 3 
        ? `Pending for ${Math.floor(req.days_pending)} days - needs attention!`
        : null
    }));
  }

  // Get leave request by ID
  static async findById(id) {
    return await get(`
      SELECT l.*, e.name as employee_name, e.email, e.team
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.id = ?
    `, [id]);
  }

  // Create leave request (with validation)
  static async create(data) {
    const { employee_id, start_date, end_date, leave_type, reason } = data;
    
    // Validate the request
    const validation = await LeaveRules.validateRequest(
      { employee_id, start_date, end_date, leave_type },
      employee_id // For creation, no approver yet
    );
    
    if (!validation.valid) {
      throw new Error(validation.violations.join(' '));
    }
    
    // Create the request
    const result = await run(`
      INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason)
      VALUES (?, ?, ?, ?, ?)
    `, [employee_id, start_date, end_date, leave_type, reason]);
    
    return await this.findById(result.id);
  }

  // Approve leave request
  static async approve(id, reviewerId) {
    // Get the request
    const request = await this.findById(id);
    if (!request) {
      throw new Error('Leave request not found');
    }
    
    if (request.status !== 'pending') {
      throw new Error(`Request is already ${request.status}`);
    }
    
    // Validate approval (rules check with reviewer)
    const validation = await LeaveRules.validateRequest(
      request,
      reviewerId
    );
    
    if (!validation.valid) {
      throw new Error(validation.violations.join(' '));
    }
    
    // Update status
    await run(`
      UPDATE leave_requests 
      SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [reviewerId, id]);
    
    // Deduct from leave balance
    const workDays = LeaveRules.calculateWorkDays(request.start_date, request.end_date);
    await run(`
      UPDATE leave_balances 
      SET ${request.leave_type}_balance = ${request.leave_type}_balance - ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = ?
    `, [workDays, request.employee_id]);
    
    return await this.findById(id);
  }

  // Reject leave request
  static async reject(id, reviewerId) {
    const request = await this.findById(id);
    if (!request) {
      throw new Error('Leave request not found');
    }
    
    if (request.status !== 'pending') {
      throw new Error(`Request is already ${request.status}`);
    }
    
    await run(`
      UPDATE leave_requests 
      SET status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [reviewerId, id]);
    
    return await this.findById(id);
  }

  // Get employee's leave balance
  static async getBalance(employeeId) {
    return await get(`
      SELECT annual_balance, sick_balance, personal_balance 
      FROM leave_balances 
      WHERE employee_id = ?
    `, [employeeId]);
  }

  // Get leave history for employee
  static async getHistory(employeeId) {
    return await query(`
      SELECT * FROM leave_requests 
      WHERE employee_id = ? 
      ORDER BY requested_at DESC
    `, [employeeId]);
  }

  // Get pending requests for dashboard
  static async getPendingCount() {
    const result = await get('SELECT COUNT(*) as count FROM leave_requests WHERE status = "pending"');
    return result ? result.count : 0;
  }

  // Get pending requests older than X days (for escalation)
  static async getPendingOlderThan(days = 3) {
    return await query(`
      SELECT l.*, e.name as employee_name, e.email, e.team
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.status = 'pending' 
        AND julianday('now') - julianday(l.requested_at) > ?
    `, [days]);
  }
}

module.exports = LeaveRequest;