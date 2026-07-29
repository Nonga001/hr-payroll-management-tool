// ============================================
// Leave Rules Tests
// ============================================

// Mock the database module BEFORE importing anything else
jest.mock('../src/config/database', () => {
  const mockQuery = jest.fn();
  const mockGet = jest.fn();
  const mockRun = jest.fn();
  
  return {
    query: mockQuery,
    get: mockGet,
    run: mockRun,
    db: {}
  };
});

// Now import after mocking
const LeaveRules = require('../src/services/leaveRules');
const { query, get, run } = require('../src/config/database');

describe('Leave Rules Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('7-Day Advance Notice Rule', () => {
    test('should reject leave with less than 7 days notice', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 3);
      
      const result = await LeaveRules.checkAdvanceNotice(startDate.toISOString().split('T')[0]);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 7 days');
    });

    test('should accept leave with 7 or more days notice', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 10);
      
      const result = await LeaveRules.checkAdvanceNotice(startDate.toISOString().split('T')[0]);
      expect(result.valid).toBe(true);
      expect(result.message).toBeNull();
    });
  });

  describe('No Self-Approval Rule', () => {
    test('should reject self-approval', async () => {
      const result = await LeaveRules.checkNoSelfApproval(1, 1);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('cannot approve their own');
    });

    test('should accept approval by different person', async () => {
      const result = await LeaveRules.checkNoSelfApproval(1, 2);
      expect(result.valid).toBe(true);
      expect(result.message).toBeNull();
    });
  });

  describe('Team Coverage Rule', () => {
    test('should reject when team member is already on leave', async () => {
      // Mock the employee query to return a team
      query.mockResolvedValueOnce([{ team: 'Engineering' }]);
      // Mock the overlapping leave query to return a result
      query.mockResolvedValueOnce([
        { name: 'Alice', start_date: '2026-08-01', end_date: '2026-08-05' }
      ]);
      
      const result = await LeaveRules.checkTeamCoverage(2, '2026-08-03', '2026-08-07');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('already on leave');
    });

    test('should accept when no team member on leave', async () => {
      // Mock the employee query to return a team
      query.mockResolvedValueOnce([{ team: 'Engineering' }]);
      // Mock the overlapping leave query to return empty
      query.mockResolvedValueOnce([]);
      
      const result = await LeaveRules.checkTeamCoverage(2, '2026-09-01', '2026-09-05');
      expect(result.valid).toBe(true);
      expect(result.message).toBeNull();
    });
  });

  describe('Balance Enforcement', () => {
    test('should reject when balance is insufficient', async () => {
      query.mockResolvedValueOnce([{ balance: 5 }]);
      
      const result = await LeaveRules.checkBalance(1, 10, 'annual');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Insufficient');
    });

    test('should accept when balance is sufficient', async () => {
      query.mockResolvedValueOnce([{ balance: 15 }]);
      
      const result = await LeaveRules.checkBalance(1, 5, 'annual');
      expect(result.valid).toBe(true);
      expect(result.message).toBeNull();
    });
  });

  describe('Overlap Prevention', () => {
    test('should reject overlapping requests', async () => {
      query.mockResolvedValueOnce([
        { id: 1, start_date: '2026-08-01', end_date: '2026-08-05' }
      ]);
      
      const result = await LeaveRules.checkOverlap(1, '2026-08-03', '2026-08-07');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('already have a leave request');
    });

    test('should accept when no overlap', async () => {
      query.mockResolvedValueOnce([]);
      
      const result = await LeaveRules.checkOverlap(1, '2026-09-01', '2026-09-05');
      expect(result.valid).toBe(true);
      expect(result.message).toBeNull();
    });
  });

  describe('Work Days Calculation', () => {
    test('should calculate correct working days', () => {
      // Monday to Friday = 5 working days
      const result = LeaveRules.calculateWorkDays('2026-08-03', '2026-08-07');
      expect(result).toBe(5);
    });

    test('should exclude weekends', () => {
      // Friday to Monday = 2 working days (Fri, Mon)
      const result = LeaveRules.calculateWorkDays('2026-08-07', '2026-08-10');
      expect(result).toBe(2);
    });
  });
});
