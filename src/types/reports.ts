/**
 * Types for the reporting system
 */

export interface AttendanceReport {
  staffId: string;
  staffName: string;
  department: string;
  position: string;
  category: string;
  period: {
    month: number;
    year: number;
  };
  summary: {
    totalHours: number;
    daysWorked: number;
    avgHoursPerDay: number;
    clientsCount: number;
  };
  reimbursements: {
    mileage: number;
    mileageRate: number;
    meals: number;
    mealRate: number;
    other: number;
    total: number;
  };
  financialData?: {
    hourlyRate: number;
    theoreticalCompensation: number;
  };
  dailyEntries: DailyEntry[];
}

export interface DailyEntry {
  date: string;
  entries: TimeEntry[];
  totalHours: number;
  notes?: string;
}

export interface TimeEntry {
  id: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  notes?: string;
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  showFinancialData: boolean;
  includeSignatureArea: boolean;
  includeLogo: boolean;
}

export interface StaffAttendanceSummary {
  staffId: string;
  staffName: string;
  category: string;
  totalHours: number;
  daysWorked: number;
  totalReimbursement: number;
  clientsCount: number;
  hourlyRate?: number;
  theoreticalCompensation?: number;
}