const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');

// GET /api/leave - List all leave requests
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.employee_id) filters.employee_id = req.query.employee_id;
    
    const requests = await LeaveRequest.findAll(filters);
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/leave/pending - Get pending requests with escalation info
router.get('/pending', async (req, res) => {
  try {
    const requests = await LeaveRequest.getPendingWithEscalation();
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/leave/employee/:id - Get employee's leave history
router.get('/employee/:id', async (req, res) => {
  try {
    const history = await LeaveRequest.getHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/leave/balance/:employeeId - Get leave balance
router.get('/balance/:employeeId', async (req, res) => {
  try {
    const balance = await LeaveRequest.getBalance(req.params.employeeId);
    if (!balance) {
      return res.status(404).json({ success: false, error: 'Balance not found' });
    }
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/leave - Create leave request
router.post('/', async (req, res) => {
  try {
    const request = await LeaveRequest.create(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/leave/:id/approve - Approve leave request
router.put('/:id/approve', async (req, res) => {
  try {
    const { reviewerId } = req.body;
    if (!reviewerId) {
      return res.status(400).json({ success: false, error: 'reviewerId is required' });
    }
    
    const request = await LeaveRequest.approve(req.params.id, reviewerId);
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/leave/:id/reject - Reject leave request
router.put('/:id/reject', async (req, res) => {
  try {
    const { reviewerId } = req.body;
    if (!reviewerId) {
      return res.status(400).json({ success: false, error: 'reviewerId is required' });
    }
    
    const request = await LeaveRequest.reject(req.params.id, reviewerId);
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/leave/pending/count - Get pending count for dashboard
router.get('/pending/count', async (req, res) => {
  try {
    const count = await LeaveRequest.getPendingCount();
    res.json({ success: true, data: { pending: count } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/leave/pending/escalation - Get requests needing escalation
router.get('/pending/escalation', async (req, res) => {
  try {
    const requests = await LeaveRequest.getPendingOlderThan(3);
    res.json({ 
      success: true, 
      data: requests,
      message: `Found ${requests.length} requests pending over 3 days`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;