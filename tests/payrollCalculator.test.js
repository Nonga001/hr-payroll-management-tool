// ============================================
// Payroll Calculator Tests
// ============================================

const PayrollCalculator = require('../src/services/payrollCalculator');

describe('Payroll Calculator', () => {
  describe('Tax Calculation', () => {
    test('should calculate 10% tax for income up to 50,000', () => {
      const tax = PayrollCalculator.calculateTax(30000);
      expect(tax).toBe(3000);
    });

    test('should calculate 20% tax for income between 50,001 and 100,000', () => {
      const tax = PayrollCalculator.calculateTax(75000);
      expect(tax).toBe(10000);
    });

    test('should calculate 30% tax for income above 100,000', () => {
      const tax = PayrollCalculator.calculateTax(150000);
      expect(tax).toBeCloseTo(30000, 0);
    });

    test('should handle zero income', () => {
      const tax = PayrollCalculator.calculateTax(0);
      expect(tax).toBe(0);
    });

    test('should handle bracket boundary correctly', () => {
      const tax = PayrollCalculator.calculateTax(50000);
      expect(tax).toBe(5000);
    });
  });

  describe('Social Security Calculation', () => {
    test('should calculate 5% social security', () => {
      const ss = PayrollCalculator.calculateSocialSecurity(100000);
      expect(ss).toBe(5000);
    });

    test('should handle zero income', () => {
      const ss = PayrollCalculator.calculateSocialSecurity(0);
      expect(ss).toBe(0);
    });
  });

  describe('Net Pay Calculation', () => {
    test('should calculate correct net pay', () => {
      const net = PayrollCalculator.calculateNetPay(100000);
      expect(net).toBeCloseTo(80000, 0);
    });
  });

  describe('Pro-Rata Calculation', () => {
    test('should calculate correct pro-rata for mid-month joiner', () => {
      const proRata = PayrollCalculator.calculateProRata(21000, '2026-08-15');
      // August 2026 has 21 working days
      // Joining on 15th = 11 working days from 15th to 31st
      // 21,000 / 21 = 1,000 per day * 11 days = 11,000
      expect(proRata).toBe(11000);
    });
  });

  describe('Gross Pay Calculation', () => {
    test('should deduct unpaid leave correctly', () => {
      const gross = PayrollCalculator.calculateGrossPay(21000, 8, 2026, 2);
      // 21,000 / 21 = 1,000 per day * 2 days = 2,000 deduction
      // 21,000 - 2,000 = 19,000
      expect(gross).toBe(19000);
    });
  });

  describe('Full Payslip Generation', () => {
    test('should generate complete payslip', () => {
      const employee = {
        id: 1,
        name: 'John Doe',
        salary: 100000,
        start_date: '2020-01-01'
      };
      
      const payslip = PayrollCalculator.generatePayslip(employee, 8, 2026);
      
      expect(payslip).toHaveProperty('employee_id', 1);
      expect(payslip).toHaveProperty('employee_name', 'John Doe');
      expect(payslip.gross_pay).toBe(100000);
      expect(payslip.tax).toBeCloseTo(15000, 0);
      expect(payslip.social_security).toBe(5000);
      expect(payslip.net_pay).toBeCloseTo(80000, 0);
    });

    test('should handle mid-month joiner', () => {
      const employee = {
        id: 2,
        name: 'Jane Smith',
        salary: 21000,
        start_date: '2026-08-15'
      };
      
      const payslip = PayrollCalculator.generatePayslip(employee, 8, 2026);
      // August 2026 has 21 working days
      // Joining on 15th = 11 working days from 15th to 31st
      // 21,000 / 21 = 1,000 per day * 11 days = 11,000
      expect(payslip.gross_pay).toBe(11000);
    });

    test('should deduct unpaid leave', () => {
      const employee = {
        id: 3,
        name: 'Bob Johnson',
        salary: 21000,
        start_date: '2020-01-01'
      };
      
      const payslip = PayrollCalculator.generatePayslip(employee, 8, 2026, 2);
      // 2 days unpaid leave = 2,000 deduction
      // 21,000 - 2,000 = 19,000
      expect(payslip.gross_pay).toBe(19000);
      expect(payslip.unpaid_leave_days).toBe(2);
    });
  });

  describe('Work Days Calculation', () => {
    test('should count work days in month correctly', () => {
      const days = PayrollCalculator.getWorkDaysInMonth(2026, 8);
      expect(days).toBe(21);
    });
  });
});
