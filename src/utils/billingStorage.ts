import { Invoice, InvoiceItem, Payment, Expense, TaxReport, BillingSettings, FinancialSummary } from '../types/billing';
import { Appointment } from '../types/appointments';
import { getAppointments } from './appointmentStorage';
import { getPatients } from './medicalStorage';

const STORAGE_KEYS = {
  INVOICES: 'emmanuel_invoices',
  PAYMENTS: 'emmanuel_payments',
  EXPENSES: 'emmanuel_expenses',
  TAX_REPORTS: 'emmanuel_tax_reports',
  BILLING_SETTINGS: 'emmanuel_billing_settings'
};

// INVOICES
export const getInvoices = (filters?: {
  patientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
}): Invoice[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
  let invoices = data ? JSON.parse(data) : generateMockInvoices();
  
  if (filters) {
    if (filters.patientId) {
      invoices = invoices.filter((inv: Invoice) => inv.patientId === filters.patientId);
    }
    if (filters.status) {
      invoices = invoices.filter((inv: Invoice) => inv.status === filters.status);
    }
    if (filters.dateFrom) {
      invoices = invoices.filter((inv: Invoice) => inv.issueDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      invoices = invoices.filter((inv: Invoice) => inv.issueDate <= filters.dateTo!);
    }
    if (filters.type) {
      invoices = invoices.filter((inv: Invoice) => inv.type === filters.type);
    }
  }
  
  return invoices.sort((a: Invoice, b: Invoice) => 
    new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );
};

export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    invoices.push({ 
      ...invoice, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const deleteInvoice = (invoiceId: string): void => {
  const invoices = getInvoices();
  const filteredInvoices = invoices.filter(inv => inv.id !== invoiceId);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filteredInvoices));
};

// PAYMENTS
export const getPayments = (invoiceId?: string): Payment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  let payments = data ? JSON.parse(data) : [];
  
  if (invoiceId) {
    payments = payments.filter((payment: Payment) => payment.invoiceId === invoiceId);
  }
  
  return payments.sort((a: Payment, b: Payment) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const savePayment = (payment: Payment): void => {
  const payments = getPayments();
  const existingIndex = payments.findIndex(p => p.id === payment.id);
  
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push({ ...payment, createdAt: new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  
  // Update invoice paid amount
  updateInvoicePaidAmount(payment.invoiceId);
};

const updateInvoicePaidAmount = (invoiceId: string): void => {
  const invoices = getInvoices();
  const invoice = invoices.find(inv => inv.id === invoiceId);
  
  if (invoice) {
    const invoicePayments = getPayments(invoiceId);
    const totalPaid = invoicePayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    invoice.paidAmount = totalPaid;
    invoice.remainingAmount = invoice.total - totalPaid;
    
    // Update status based on payment
    if (totalPaid >= invoice.total) {
      invoice.status = 'paid';
    } else if (totalPaid > 0) {
      invoice.status = 'sent'; // Partially paid
    }
    
    saveInvoice(invoice);
  }
};

// EXPENSES
export const getExpenses = (filters?: {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}): Expense[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  let expenses = data ? JSON.parse(data) : generateMockExpenses();
  
  if (filters) {
    if (filters.category) {
      expenses = expenses.filter((exp: Expense) => exp.category === filters.category);
    }
    if (filters.dateFrom) {
      expenses = expenses.filter((exp: Expense) => exp.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      expenses = expenses.filter((exp: Expense) => exp.date <= filters.dateTo!);
    }
  }
  
  return expenses.sort((a: Expense, b: Expense) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const saveExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  const existingIndex = expenses.findIndex(exp => exp.id === expense.id);
  
  if (existingIndex >= 0) {
    expenses[existingIndex] = expense;
  } else {
    expenses.push({ ...expense, createdAt: new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const deleteExpense = (expenseId: string): void => {
  const expenses = getExpenses();
  const filteredExpenses = expenses.filter(exp => exp.id !== expenseId);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filteredExpenses));
};

// BILLING SETTINGS
export const getBillingSettings = (): BillingSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.BILLING_SETTINGS);
  return data ? JSON.parse(data) : getDefaultBillingSettings();
};

export const saveBillingSettings = (settings: BillingSettings): void => {
  localStorage.setItem(STORAGE_KEYS.BILLING_SETTINGS, JSON.stringify(settings));
};

const getDefaultBillingSettings = (): BillingSettings => {
  return {
    companyInfo: {
      name: 'Cooperativa Sociale Emmanuel',
      address: 'Via Roma 123',
      city: 'Napoli',
      postalCode: '80100',
      vatNumber: 'IT12345678901',
      fiscalCode: 'CMPEMM24A01F839X',
      phone: '081-1234567',
      email: 'info@emmanuel.it',
      website: 'www.emmanuel.it'
    },
    invoiceSettings: {
      nextInvoiceNumber: 1,
      prefix: 'EMM',
      defaultTaxRate: 22,
      defaultPaymentTerms: 30,
      defaultNotes: 'Pagamento entro 30 giorni dalla data di emissione.',
      enableElectronicInvoicing: true
    },
    paymentSettings: {
      acceptedMethods: ['cash', 'card', 'bank_transfer'],
      bankDetails: {
        bankName: 'Banca Intesa Sanpaolo',
        iban: 'IT60 X054 2811 1010 0000 0123 456'
      }
    }
  };
};

// INVOICE GENERATION FROM APPOINTMENTS
export const generateInvoiceFromAppointments = (
  appointmentIds: string[], 
  patientId: string,
  userId: string
): Invoice => {
  const appointments = getAppointments().filter(apt => appointmentIds.includes(apt.id));
  const patients = getPatients();
  const patient = patients.find(p => p.id === patientId);
  const settings = getBillingSettings();
  
  if (!patient) throw new Error('Paziente non trovato');
  
  const items: InvoiceItem[] = appointments.map(apt => ({
    id: `item-${apt.id}`,
    description: `${getServiceTypeDisplayName(apt.type)} - ${apt.patientName}`,
    serviceType: mapAppointmentTypeToService(apt.type),
    appointmentId: apt.id,
    quantity: 1,
    unitPrice: apt.cost || 50, // Default price
    discount: 0,
    discountType: 'percentage' as const,
    taxRate: settings.invoiceSettings.defaultTaxRate,
    total: apt.cost || 50,
    date: apt.date,
    staffId: apt.staffId,
    staffName: apt.staffName
  }));
  
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (settings.invoiceSettings.defaultTaxRate / 100);
  const total = subtotal + taxAmount;
  
  const invoiceNumber = `${settings.invoiceSettings.prefix}${settings.invoiceSettings.nextInvoiceNumber.toString().padStart(4, '0')}`;
  
  const invoice: Invoice = {
    id: generateInvoiceId(),
    number: invoiceNumber,
    patientId: patient.id,
    patientName: `${patient.personalInfo.name} ${patient.personalInfo.surname}`,
    patientFiscalCode: patient.personalInfo.fiscalCode,
    patientAddress: `${patient.personalInfo.address}, ${patient.personalInfo.city} ${patient.personalInfo.postalCode}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + settings.invoiceSettings.defaultPaymentTerms * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    type: 'invoice',
    items,
    subtotal,
    taxRate: settings.invoiceSettings.defaultTaxRate,
    taxAmount,
    total,
    paidAmount: 0,
    remainingAmount: total,
    notes: settings.invoiceSettings.defaultNotes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId,
    isElectronic: settings.invoiceSettings.enableElectronicInvoicing
  };
  
  // Update next invoice number
  settings.invoiceSettings.nextInvoiceNumber++;
  saveBillingSettings(settings);
  
  return invoice;
};

// FINANCIAL REPORTS
export const generateFinancialSummary = (startDate: string, endDate: string): FinancialSummary => {
  const invoices = getInvoices({ dateFrom: startDate, dateTo: endDate });
  const expenses = getExpenses({ dateFrom: startDate, dateTo: endDate });
  const payments = getPayments();
  
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = payments
    .filter(p => p.date >= startDate && p.date <= endDate)
    .reduce((sum, p) => sum + p.amount, 0);
  
  const outstanding = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.remainingAmount, 0);
  
  const overdue = invoices
    .filter(inv => inv.dueDate < new Date().toISOString().split('T')[0] && inv.remainingAmount > 0)
    .reduce((sum, inv) => sum + inv.remainingAmount, 0);
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const netIncome = totalCollected - totalExpenses;
  const margin = totalCollected > 0 ? (netIncome / totalCollected) * 100 : 0;
  
  return {
    period: { start: startDate, end: endDate },
    revenue: {
      total: totalInvoiced,
      invoiced: totalInvoiced,
      collected: totalCollected,
      outstanding,
      overdue
    },
    expenses: {
      total: totalExpenses,
      byCategory: expensesByCategory
    },
    profitLoss: {
      grossRevenue: totalCollected,
      totalExpenses,
      netIncome,
      margin
    },
    cashFlow: {
      inflow: totalCollected,
      outflow: totalExpenses,
      net: totalCollected - totalExpenses
    },
    metrics: {
      averageInvoiceValue: invoices.length > 0 ? totalInvoiced / invoices.length : 0,
      collectionRate: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0,
      daysToPayment: calculateAverageDaysToPayment(invoices, payments),
      outstandingRatio: totalInvoiced > 0 ? (outstanding / totalInvoiced) * 100 : 0
    }
  };
};

// UTILITY FUNCTIONS
export const generateInvoiceId = (): string => {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const generatePaymentId = (): string => {
  return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const generateExpenseId = (): string => {
  return `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

const mapAppointmentTypeToService = (type: string): InvoiceItem['serviceType'] => {
  switch (type) {
    case 'visit': return 'visit';
    case 'therapy': return 'therapy';
    case 'consultation': return 'consultation';
    default: return 'other';
  }
};

const getServiceTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'visit': return 'Visita Medica';
    case 'therapy': return 'Terapia';
    case 'consultation': return 'Consulenza';
    case 'follow-up': return 'Controllo';
    case 'emergency': return 'Emergenza';
    case 'routine': return 'Visita di Routine';
    default: return 'Servizio Sanitario';
  }
};

const calculateAverageDaysToPayment = (invoices: Invoice[], payments: Payment[]): number => {
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  if (paidInvoices.length === 0) return 0;
  
  const totalDays = paidInvoices.reduce((sum, inv) => {
    const payment = payments.find(p => p.invoiceId === inv.id);
    if (payment) {
      const issueDate = new Date(inv.issueDate);
      const paymentDate = new Date(payment.date);
      const days = Math.floor((paymentDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }
    return sum;
  }, 0);
  
  return Math.round(totalDays / paidInvoices.length);
};

// MOCK DATA GENERATORS
const generateMockInvoices = (): Invoice[] => {
  const patients = getPatients();
  const invoices: Invoice[] = [];
  
  const statuses: Invoice['status'][] = ['paid', 'sent', 'overdue', 'draft'];
  const types: Invoice['type'][] = ['invoice', 'receipt'];
  
  for (let i = 0; i < 15; i++) {
    const patient = patients[i % patients.length];
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - (i * 5));
    
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    const subtotal = 50 + (i * 25);
    const taxAmount = subtotal * 0.22;
    const total = subtotal + taxAmount;
    const paidAmount = statuses[i % statuses.length] === 'paid' ? total : 0;
    
    invoices.push({
      id: `INV-${i + 1}`,
      number: `EMM${(i + 1).toString().padStart(4, '0')}`,
      patientId: patient.id,
      patientName: `${patient.personalInfo.name} ${patient.personalInfo.surname}`,
      patientFiscalCode: patient.personalInfo.fiscalCode,
      patientAddress: `${patient.personalInfo.address}, ${patient.personalInfo.city}`,
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: statuses[i % statuses.length],
      type: types[i % types.length],
      items: [
        {
          id: `item-${i + 1}`,
          description: 'Visita Medica Domiciliare',
          serviceType: 'visit',
          quantity: 1,
          unitPrice: subtotal,
          discount: 0,
          discountType: 'percentage',
          taxRate: 22,
          total: subtotal,
          date: issueDate.toISOString().split('T')[0]
        }
      ],
      subtotal,
      taxRate: 22,
      taxAmount,
      total,
      paidAmount,
      remainingAmount: total - paidAmount,
      paymentMethod: paidAmount > 0 ? 'bank_transfer' : undefined,
      paymentDate: paidAmount > 0 ? issueDate.toISOString().split('T')[0] : undefined,
      createdAt: issueDate.toISOString(),
      updatedAt: issueDate.toISOString(),
      createdBy: '1',
      isElectronic: true
    });
  }
  
  return invoices;
};

const generateMockExpenses = (): Expense[] => {
  const categories: Expense['category'][] = [
    'medical_supplies', 'equipment', 'utilities', 'rent', 'salaries', 'insurance'
  ];
  
  const expenses: Expense[] = [];
  
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 3));
    
    expenses.push({
      id: `EXP-${i + 1}`,
      category: categories[i % categories.length],
      description: `Spesa ${categories[i % categories.length]}`,
      amount: 100 + (i * 50),
      date: date.toISOString().split('T')[0],
      vendor: `Fornitore ${i + 1}`,
      paymentMethod: 'bank_transfer',
      isDeductible: true,
      createdAt: date.toISOString(),
      createdBy: '1'
    });
  }
  
  return expenses;
};