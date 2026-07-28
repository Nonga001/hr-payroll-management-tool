// ============================================
// HR & Payroll Management Tool - Main App
// ============================================

console.log('HR & Payroll Management Tool v1.0.0');

// ============================================
// MAIN FUNCTIONS
// ============================================

window.loadDashboard = function() {
  console.log('Loading dashboard...');
  updateActiveNav('dashboard');
  showLoading('Loading dashboard...');
  
  fetch('/api/dashboard')
    .then(res => res.json())
    .then(result => {
      if (!result.success) throw new Error(result.error || 'Failed to load dashboard');
      renderDashboard(result.data);
    })
    .catch(error => {
      showError('Dashboard', error.message, 'window.loadDashboard()');
    });
};

window.loadEmployees = function() {
  console.log('Loading employees...');
  updateActiveNav('employees');
  showLoading('Loading employees...');
  
  fetch('/api/employees')
    .then(res => res.json())
    .then(result => {
      if (!result.success) throw new Error(result.error || 'Failed to load employees');
      renderEmployees(result.data);
    })
    .catch(error => {
      showError('Employees', error.message, 'window.loadEmployees()');
    });
};

window.loadLeave = function() {
  console.log('Loading leave requests...');
  updateActiveNav('leave');
  showLoading('Loading leave requests...');
  
  fetch('/api/leave')
    .then(res => res.json())
    .then(result => {
      if (!result.success) throw new Error(result.error || 'Failed to load leave');
      renderLeave(result.data);
    })
    .catch(error => {
      showError('Leave', error.message, 'window.loadLeave()');
    });
};

window.loadPayroll = function() {
  console.log('Loading payroll...');
  updateActiveNav('payroll');
  showLoading('Loading payroll...');
  
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  fetch(`/api/payroll/period/${month}/${year}`)
    .then(res => res.json())
    .then(result => {
      if (!result.success) throw new Error(result.error || 'Failed to load payroll');
      renderPayroll(result.data, result.summary, month, year);
    })
    .catch(error => {
      showError('Payroll', error.message, 'window.loadPayroll()');
    });
};

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderDashboard(data) {
  const { stats, on_leave_today, pending_requests, leave_balances } = data;
  
  const html = `
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Employees</h3>
        <div class="number">${stats.total_employees || 0}</div>
      </div>
      <div class="stat-card pending">
        <h3>Pending Leave</h3>
        <div class="number">${stats.pending_leave || 0}</div>
        ${stats.pending_leave > 0 ? '<div class="label">Needs attention</div>' : ''}
      </div>
      <div class="stat-card approved">
        <h3>Approved Leave</h3>
        <div class="number">${stats.approved_leave || 0}</div>
      </div>
      <div class="stat-card payroll">
        <h3>Payroll Status</h3>
        <div class="number">${stats.payroll_generated ? 'Generated' : 'Not Generated'}</div>
        <div class="label">${stats.current_period || 'Not generated'}</div>
      </div>
    </div>

    <div class="card">
      <h3>Pending Leave Requests</h3>
      ${!pending_requests || pending_requests.length === 0 ? '<p class="text-muted">No pending requests</p>' : ''}
      ${pending_requests ? pending_requests.map(req => `
        <div class="alert ${req.needs_escalation ? 'alert-warning' : ''}">
          <strong>${req.employee_name}</strong> (${req.team}) - ${req.leave_type} leave
          <br>
          <small>${req.start_date} to ${req.end_date}</small>
          ${req.needs_escalation ? `<br><strong>${req.escalation_message || 'Pending over 3 days!'}</strong>` : ''}
          <br><br>
          <button class="btn btn-success btn-sm approve-btn" data-id="${req.id}">Approve</button>
          <button class="btn btn-danger btn-sm reject-btn" data-id="${req.id}">Reject</button>
        </div>
      `).join('') : ''}
    </div>

    <div class="card">
      <h3>On Leave Today</h3>
      ${!on_leave_today || on_leave_today.length === 0 ? '<p class="text-muted">No one on leave today</p>' : ''}
      ${on_leave_today ? on_leave_today.map(emp => `
        <div style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
          <strong>${emp.name}</strong> (${emp.team}) - ${emp.leave_type} leave
          <br>
          <small>Until: ${emp.end_date}</small>
        </div>
      `).join('') : ''}
    </div>

    <div class="card">
      <h3>Leave Balances</h3>
      <table>
        <thead>
          <tr><th>Name</th><th>Annual</th><th>Sick</th><th>Personal</th></tr>
        </thead>
        <tbody>
          ${leave_balances && leave_balances.length > 0 ? leave_balances.map(emp => `
            <tr>
              <td>${emp.name}</td>
              <td>${emp.annual_balance || emp.annual || 0}</td>
              <td>${emp.sick_balance || emp.sick || 0}</td>
              <td>${emp.personal_balance || emp.personal || 0}</td>
            </tr>
          `).join('') : '<tr><td colspan="4">No data</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="card text-center" style="text-align: center;">
      <h3>Generate Payroll</h3>
      <p class="text-muted">Generate payroll for the current month</p>
      <button id="generate-payroll-btn" class="btn" style="font-size: 1.1rem; padding: 0.75rem 2rem;">
        Generate Payroll for ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}
      </button>
      <div id="payroll-result" style="margin-top: 1rem;"></div>
    </div>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', () => window.approveLeave(btn.dataset.id));
  });
  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', () => window.rejectLeave(btn.dataset.id));
  });
  
  const generateBtn = document.getElementById('generate-payroll-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', window.generatePayroll);
  }
}

function renderEmployees(employees) {
  const html = `
    <div class="card">
      <h3>Employees (${employees.length})</h3>
      <table>
        <thead>
          <tr><th>Name</th><th>Role</th><th>Team</th><th>Salary</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${employees.map(emp => `
            <tr>
              <td><strong>${emp.name}</strong></td>
              <td>${emp.role}</td>
              <td>${emp.team}</td>
              <td>$${Number(emp.salary).toLocaleString()}</td>
              <td><span class="badge ${emp.is_active ? 'approved' : 'rejected'}">${emp.is_active ? 'Active' : 'Inactive'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <br>
      <button id="back-dashboard" class="btn">Back to Dashboard</button>
    </div>
  `;
  document.getElementById('content').innerHTML = html;
  document.getElementById('back-dashboard').addEventListener('click', window.loadDashboard);
}

function renderLeave(leaves) {
  const html = `
    <div class="card">
      <h3>Leave Requests (${leaves.length})</h3>
      <table>
        <thead>
          <tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${leaves.map(leave => `
            <tr>
              <td><strong>${leave.employee_name}</strong></td>
              <td><span class="badge">${leave.leave_type}</span></td>
              <td>${leave.start_date}</td>
              <td>${leave.end_date}</td>
              <td><span class="badge ${leave.status}">${leave.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <br>
      <button id="back-dashboard" class="btn">Back to Dashboard</button>
    </div>
  `;
  document.getElementById('content').innerHTML = html;
  document.getElementById('back-dashboard').addEventListener('click', window.loadDashboard);
}

function renderPayroll(data, summary, month, year) {
  const html = `
    <div class="card">
      <h3>Payroll for ${month}/${year}</h3>
      
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Gross</h3>
          <div class="number">$${Number(summary?.total_gross || 0).toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <h3>Total Tax</h3>
          <div class="number">$${Number(summary?.total_tax || 0).toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <h3>Total Net</h3>
          <div class="number">$${Number(summary?.total_net || 0).toLocaleString()}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr><th>Employee</th><th>Gross</th><th>Tax</th><th>Social Security</th><th>Net</th></tr>
        </thead>
        <tbody>
          ${data && data.length > 0 ? data.map(p => `
            <tr>
              <td><strong>${p.employee_name}</strong></td>
              <td>$${Number(p.gross_pay || 0).toLocaleString()}</td>
              <td>$${Number(p.tax || 0).toLocaleString()}</td>
              <td>$${Number(p.social_security || 0).toLocaleString()}</td>
              <td><strong>$${Number(p.net_pay || 0).toLocaleString()}</strong></td>
            </tr>
          `).join('') : '<tr><td colspan="5" class="text-center">No payroll data for this period</td></tr>'}
        </tbody>
      </table>
      <br>
      <button id="back-dashboard" class="btn">Back to Dashboard</button>
    </div>
  `;
  document.getElementById('content').innerHTML = html;
  document.getElementById('back-dashboard').addEventListener('click', window.loadDashboard);
}

// ============================================
// ACTIONS
// ============================================

window.approveLeave = async function(id) {
  if (!confirm('Approve this leave request?')) return;
  
  try {
    const response = await fetch(`/api/leave/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId: 2 })
    });
    const result = await response.json();
    
    if (result.success) {
      alert('Leave approved!');
      window.loadDashboard();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

window.rejectLeave = async function(id) {
  if (!confirm('Reject this leave request?')) return;
  
  try {
    const response = await fetch(`/api/leave/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId: 2 })
    });
    const result = await response.json();
    
    if (result.success) {
      alert('Leave rejected!');
      window.loadDashboard();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

window.generatePayroll = async function() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const resultDiv = document.getElementById('payroll-result');
  if (resultDiv) resultDiv.innerHTML = 'Generating payroll...';
  
  try {
    const response = await fetch('/api/payroll/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year })
    });
    const result = await response.json();
    
    if (resultDiv) {
      if (result.success) {
        resultDiv.innerHTML = `
          <div class="alert alert-success">
            Payroll generated successfully for ${result.data?.length || 0} employees!
          </div>
        `;
        setTimeout(() => window.loadDashboard(), 2000);
      } else {
        resultDiv.innerHTML = `
          <div class="alert alert-danger">
            Error: ${result.error}
          </div>
        `;
      }
    }
  } catch (error) {
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="alert alert-danger">
          Error: ${error.message}
        </div>
      `;
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showLoading(message) {
  document.getElementById('content').innerHTML = `
    <div class="text-center" style="padding: 3rem;">
      <h2>${message}</h2>
      <p class="text-muted">Please wait...</p>
    </div>
  `;
}

function showError(section, message, retryFn) {
  document.getElementById('content').innerHTML = `
    <div class="alert alert-danger">
      <h3>Error loading ${section}</h3>
      <p>${message}</p>
      <br>
      <button id="retry-btn" class="btn">Retry</button>
      <button id="back-btn" class="btn">Back to Dashboard</button>
    </div>
  `;
  document.getElementById('retry-btn').addEventListener('click', () => eval(retryFn));
  document.getElementById('back-btn').addEventListener('click', window.loadDashboard);
}

function updateActiveNav(page) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.page === page) {
      btn.classList.add('active');
    }
  });
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('App initialized, setting up navigation...');
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const page = this.dataset.page;
      if (page === 'dashboard') window.loadDashboard();
      else if (page === 'employees') window.loadEmployees();
      else if (page === 'leave') window.loadLeave();
      else if (page === 'payroll') window.loadPayroll();
    });
  });
  
  window.loadDashboard();
});
