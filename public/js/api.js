const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    return response.json();
  },

  // Employees
  getEmployees() { return this.request('/employees'); },
  getEmployee(id) { return this.request(`/employees/${id}`); },
  createEmployee(data) { return this.request('/employees', { method: 'POST', body: JSON.stringify(data) }); },
  updateEmployee(id, data) { return this.request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
  deleteEmployee(id) { return this.request(`/employees/${id}`, { method: 'DELETE' }); },

  // Leave
  getLeave() { return this.request('/leave'); },
  getPendingLeave() { return this.request('/leave/pending'); },
  createLeave(data) { return this.request('/leave', { method: 'POST', body: JSON.stringify(data) }); },
  approveLeave(id, reviewerId) { return this.request(`/leave/${id}/approve`, { method: 'PUT', body: JSON.stringify({ reviewerId }) }); },
  rejectLeave(id, reviewerId) { return this.request(`/leave/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reviewerId }) }); },
  getLeaveBalance(employeeId) { return this.request(`/leave/balance/${employeeId}`); },

  // Payroll
  generatePayroll(month, year) { return this.request('/payroll/generate', { method: 'POST', body: JSON.stringify({ month, year }) }); },
  getPayrollPeriod(month, year) { return this.request(`/payroll/period/${month}/${year}`); },
  getPayrollSummary(month, year) { return this.request(`/payroll/period/${month}/${year}/summary`); },
  getEmployeePayroll(id) { return this.request(`/payroll/employee/${id}`); },

  // Dashboard
  getDashboard() { return this.request('/dashboard'); },
};
