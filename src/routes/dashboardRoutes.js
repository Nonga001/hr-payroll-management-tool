const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Dashboard routes working' });
});

router.get('/', (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: {
        stats: {
          total_employees: 5,
          pending_leave: 2,
          approved_leave: 0
        },
        on_leave_today: [],
        pending_requests: [
          {
            id: 1,
            employee_name: 'Bob Johnson',
            team: 'Engineering',
            leave_type: 'annual',
            start_date: '2026-08-06',
            end_date: '2026-08-08',
            needs_escalation: false
          }
        ],
        leave_balances: [
          { name: 'John Doe', annual: 15, sick: 8, personal: 3 },
          { name: 'Jane Smith', annual: 20, sick: 10, personal: 5 }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
