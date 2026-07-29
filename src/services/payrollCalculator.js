// ============================================
// Payroll Calculator Service
// ============================================

class PayrollCalculator {
  // Tax brackets (progressive)
  static TAX_BRACKETS = [
    { min: 0, max: 50000, rate: 0.10 },
    { min: 50001, max: 100000, rate: 0.20 },
    { min: 100001, max: Infinity, rate: 0.30 }
  ];

  static SOCIAL_SECURITY_RATE = 0.05;

  // Calculate tax based on income
  static calculateTax(income) {
    let tax = 0;
    let remaining = income;

    for (const bracket of this.TAX_BRACKETS) {
      if (remaining <= 0) break;
      
      const taxableInBracket = Math.min(
        remaining,
        bracket.max - bracket.min + 1
      );
      
      if (taxableInBracket > 0) {
        tax += taxableInBracket * bracket.rate;
        remaining -= taxableInBracket;
      }
    }

    return Math.round(tax * 100) / 100;
  }

  // Calculate social security deduction
  static calculateSocialSecurity(grossPay) {
    return Math.round((grossPay * this.SOCIAL_SECURITY_RATE) * 100) / 100;
  }

  // Calculate net pay
  static calculateNetPay(grossPay) {
    const tax = this.calculateTax(grossPay);
    const socialSecurity = this.calculateSocialSecurity(grossPay);
    return Math.round((grossPay - tax - socialSecurity) * 100) / 100;
  }

  // Get working days in a month
  static getWorkDaysInMonth(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    
    return workDays;
  }

  // Calculate pro-rata salary for mid-month joiners
  static calculateProRata(salary, startDate) {
    const start = new Date(startDate);
    const year = start.getFullYear();
    const month = start.getMonth() + 1;
    const joinDay = start.getDate();
    
    const totalWorkDays = this.getWorkDaysInMonth(year, month);
    const remainingDays = totalWorkDays - joinDay + 1;
    const dailyRate = salary / totalWorkDays;
    
    return Math.round((remainingDays * dailyRate) * 100) / 100;
  }

  // Calculate gross pay with unpaid leave deduction
  static calculateGrossPay(salary, month, year, unpaidDays) {
    const totalWorkDays = this.getWorkDaysInMonth(year, month);
    const dailyRate = salary / totalWorkDays;
    const deduction = unpaidDays * dailyRate;
    
    return Math.round((salary - deduction) * 100) / 100;
  }

  // Generate complete payslip
  static generatePayslip(employee, month, year, unpaidDays = 0) {
    let grossPay = employee.salary;
    
    // Check if employee joined mid-month
    const startDate = new Date(employee.start_date);
    if (startDate.getMonth() + 1 === month && startDate.getFullYear() === year) {
      grossPay = this.calculateProRata(employee.salary, employee.start_date);
    }
    
    // Deduct unpaid leave
    if (unpaidDays > 0) {
      grossPay = this.calculateGrossPay(
        grossPay, 
        month, 
        year, 
        unpaidDays
      );
    }
    
    const tax = this.calculateTax(grossPay);
    const socialSecurity = this.calculateSocialSecurity(grossPay);
    const netPay = Math.round((grossPay - tax - socialSecurity) * 100) / 100;
    
    return {
      employee_id: employee.id,
      employee_name: employee.name,
      period: `${month}/${year}`,
      gross_pay: grossPay,
      tax: tax,
      social_security: socialSecurity,
      net_pay: netPay,
      unpaid_leave_days: unpaidDays,
      details: {
        monthly_salary: employee.salary,
        is_mid_month_joiner: startDate.getMonth() + 1 === month && startDate.getFullYear() === year
      }
    };
  }
}

module.exports = PayrollCalculator;
EOFcat > src/services/payrollCalculator.js << 'EOF'
// ============================================
// Payroll Calculator Service
// ============================================

class PayrollCalculator {
  // Tax brackets (progressive)
  static TAX_BRACKETS = [
    { min: 0, max: 50000, rate: 0.10 },
    { min: 50001, max: 100000, rate: 0.20 },
    { min: 100001, max: Infinity, rate: 0.30 }
  ];

  static SOCIAL_SECURITY_RATE = 0.05;

  // Calculate tax based on income
  static calculateTax(income) {
    let tax = 0;
    let remaining = income;

    for (const bracket of this.TAX_BRACKETS) {
      if (remaining <= 0) break;
      
      const taxableInBracket = Math.min(
        remaining,
        bracket.max - bracket.min + 1
      );
      
      if (taxableInBracket > 0) {
        tax += taxableInBracket * bracket.rate;
        remaining -= taxableInBracket;
      }
    }

    return Math.round(tax * 100) / 100;
  }

  // Calculate social security deduction
  static calculateSocialSecurity(grossPay) {
    return Math.round((grossPay * this.SOCIAL_SECURITY_RATE) * 100) / 100;
  }

  // Calculate net pay
  static calculateNetPay(grossPay) {
    const tax = this.calculateTax(grossPay);
    const socialSecurity = this.calculateSocialSecurity(grossPay);
    return Math.round((grossPay - tax - socialSecurity) * 100) / 100;
  }

  // Get working days in a month
  static getWorkDaysInMonth(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    
    return workDays;
  }

  // Calculate pro-rata salary for mid-month joiners
  static calculateProRata(salary, startDate) {
    const start = new Date(startDate);
    const year = start.getFullYear();
    const month = start.getMonth() + 1;
    const joinDay = start.getDate();
    
    const totalWorkDays = this.getWorkDaysInMonth(year, month);
    const remainingDays = totalWorkDays - joinDay + 1;
    const dailyRate = salary / totalWorkDays;
    
    return Math.round((remainingDays * dailyRate) * 100) / 100;
  }

  // Calculate gross pay with unpaid leave deduction
  static calculateGrossPay(salary, month, year, unpaidDays) {
    const totalWorkDays = this.getWorkDaysInMonth(year, month);
    const dailyRate = salary / totalWorkDays;
    const deduction = unpaidDays * dailyRate;
    
    return Math.round((salary - deduction) * 100) / 100;
  }

  // Generate complete payslip
  static generatePayslip(employee, month, year, unpaidDays = 0) {
    let grossPay = employee.salary;
    
    // Check if employee joined mid-month
    const startDate = new Date(employee.start_date);
    if (startDate.getMonth() + 1 === month && startDate.getFullYear() === year) {
      grossPay = this.calculateProRata(employee.salary, employee.start_date);
    }
    
    // Deduct unpaid leave
    if (unpaidDays > 0) {
      grossPay = this.calculateGrossPay(
        grossPay, 
        month, 
        year, 
        unpaidDays
      );
    }
    
    const tax = this.calculateTax(grossPay);
    const socialSecurity = this.calculateSocialSecurity(grossPay);
    const netPay = Math.round((grossPay - tax - socialSecurity) * 100) / 100;
    
    return {
      employee_id: employee.id,
      employee_name: employee.name,
      period: `${month}/${year}`,
      gross_pay: grossPay,
      tax: tax,
      social_security: socialSecurity,
      net_pay: netPay,
      unpaid_leave_days: unpaidDays,
      details: {
        monthly_salary: employee.salary,
        is_mid_month_joiner: startDate.getMonth() + 1 === month && startDate.getFullYear() === year
      }
    };
  }
}

module.exports = PayrollCalculator;
