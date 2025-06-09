export interface Invoice {
  id: string;
  number: string; // Numero fattura progressivo
  patientId: string;
  patientName: string;
  patientFiscalCode: string;
  patientAddress: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  type: 'invoice' | 'receipt' | 'credit_note' | 'advance' | 'deposit';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'check' | 'insurance';
  paymentDate?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isElectronic: boolean;
  electronicInvoiceId?: string;
  insuranceInfo?: InsuranceInfo;
}

export interface InvoiceItem {
  id: string;
  description: string;
  serviceType: 'visit' | 'therapy' | 'consultation' | 'medication' | 'equipment' | 'other';
  appointmentId?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  total: number;
  date: string;
  staffId?: string;
  staffName?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  coveragePercentage: number;
  coveredAmount: number;
  patientResponsibility: number;
  preAuthorizationNumber?: string;
  claimNumber?: string;
  status: 'pending' | 'approved' | 'denied' | 'partial';
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'insurance';
  date: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface Expense {
  id: string;
  category: 'medical_supplies' | 'equipment' | 'utilities' | 'rent' | 'salaries' | 'insurance' | 'maintenance' | 'other';
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  invoiceNumber?: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check';
  isDeductible: boolean;
  attachments?: string[];
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface TaxReport {
  id: string;
  period: {
    start: string;
    end: string;
    type: 'monthly' | 'quarterly' | 'yearly';
  };
  revenue: {
    total: number;
    taxable: number;
    exempt: number;
    byCategory: Record<string, number>;
  };
  expenses: {
    total: number;
    deductible: number;
    byCategory: Record<string, number>;
  };
  taxes: {
    vat: number;
    income: number;
    other: number;
  };
  netIncome: number;
  generatedAt: string;
  generatedBy: string;
}

export interface BillingSettings {
  companyInfo: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    vatNumber: string;
    fiscalCode: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
  };
  invoiceSettings: {
    nextInvoiceNumber: number;
    prefix: string;
    defaultTaxRate: number;
    defaultPaymentTerms: number; // days
    defaultNotes: string;
    enableElectronicInvoicing: boolean;
  };
  paymentSettings: {
    acceptedMethods: string[];
    bankDetails: {
      bankName: string;
      iban: string;
      swift?: string;
    };
  };
}

export interface FinancialSummary {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    total: number;
    invoiced: number;
    collected: number;
    outstanding: number;
    overdue: number;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
  };
  profitLoss: {
    grossRevenue: number;
    totalExpenses: number;
    netIncome: number;
    margin: number;
  };
  cashFlow: {
    inflow: number;
    outflow: number;
    net: number;
  };
  metrics: {
    averageInvoiceValue: number;
    collectionRate: number;
    daysToPayment: number;
    outstandingRatio: number;
  };
}