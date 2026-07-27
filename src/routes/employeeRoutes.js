const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET /api/employees - List all employees
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const employees = await Employee.findAll(includeInactive);
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/employees/:id - Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/employees/:id/team - Get team members
router.get('/:id/team', async (req, res) => {
  try {
    const team = await Employee.getTeam(req.params.id);
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/employees/:id/reports - Get direct reports
router.get('/:id/reports', async (req, res) => {
  try {
    const reports = await Employee.getDirectReports(req.params.id);
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/employees/:id/balance - Get leave balance
router.get('/:id/balance', async (req, res) => {
  try {
    const employee = await Employee.findWithBalance(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({
      success: true,
      data: {
        annual: employee.annual_balance || 0,
        sick: employee.sick_balance || 0,
        personal: employee.personal_balance || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/employees - Create new employee
router.post('/', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.update(req.params.id, req.body);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/employees/:id - Deactivate employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.deactivate(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: employee, message: 'Employee deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/employees/:id/reactivate - Reactivate employee
router.patch('/:id/reactivate', async (req, res) => {
  try {
    const employee = await Employee.reactivate(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: employee, message: 'Employee reactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;