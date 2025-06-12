import { Invoice, InvoiceItem, Payment, Expense, TaxReport, BillingSettings, FinancialSummary } from '../types/billing';
import { Appointment } from '../types/appointments';
import { getAppointments } from './appointmentStorage';
import { getPatients } from './medicalStorage';
import { BillingEntity, ServiceContract, ServiceRate, ServiceActivity, BillingCycle, InvoiceDraft, AdvancedInvoice, AdvancedPayment, CreditNote, AdvancedBillingSettings } from '../types/billing/advanced';

const STORAGE_KEYS = {
  INVOICES: 'emmanuel_invoices',
  PAYMENTS: 'emmanuel_payments',
  EXPENSES: 'emmanuel_expenses',
  TAX_REPORTS: 'emmanuel_tax_reports',
  BILLING_SETTINGS: 'emmanuel_billing_settings',
  
  // Advanced billing storage keys
  BILLING_ENTITIES: 'emmanuel_billing_entities',
  SERVICE_CONTRACTS: 'emmanuel_service_contracts',
  SERVICE_RATES: 'emmanuel_service_rates',
  SERVICE_ACTIVITIES: 'emmanuel_service_activities',
  BILLING_CYCLES: 'emmanuel_billing_cycles',
  INVOICE_DRAFTS: 'emmanuel_invoice_drafts',
  ADVANCED_INVOICES: 'emmanuel_advanced_invoices',
  ADVANCED_PAYMENTS: 'emmanuel_advanced_payments',
  CREDIT_NOTES: 'emmanuel_credit_notes',
  ADVANCED_BILLING_SETTINGS: 'emmanuel_advanced_billing_settings'
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
  let invoices = data ? JSON.parse(data) : [];
  
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
    // Aggiorna il numero fattura nelle impostazioni
    if (invoice.status !== 'draft') {
      const settings = getBillingSettings();
      settings.invoiceSettings.nextInvoiceNumber++;
      saveBillingSettings(settings);
    }
    
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
      invoice.paymentDate = new Date().toISOString().split('T')[0];
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
  let expenses = data ? JSON.parse(data) : [];
  
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
    id: `item-${crypto.randomUUID()}`,
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

// ADVANCED BILLING SYSTEM FUNCTIONS

// Billing Entities
export const getBillingEntities = (filters?: {
  type?: string;
  isPublicAdministration?: boolean;
}): BillingEntity[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BILLING_ENTITIES);
  let entities = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.type) {
      entities = entities.filter((entity: BillingEntity) => entity.type === filters.type);
    }
    if (filters.isPublicAdministration !== undefined) {
      entities = entities.filter((entity: BillingEntity) => entity.isPublicAdministration === filters.isPublicAdministration);
    }
  }
  
  return entities;
};

export const saveBillingEntity = (entity: BillingEntity): void => {
  const entities = getBillingEntities();
  const existingIndex = entities.findIndex(e => e.id === entity.id);
  
  if (existingIndex >= 0) {
    entities[existingIndex] = { ...entity, updatedAt: new Date().toISOString() };
  } else {
    entities.push({ 
      ...entity, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.BILLING_ENTITIES, JSON.stringify(entities));
};

export const deleteBillingEntity = (entityId: string): void => {
  const entities = getBillingEntities();
  const filteredEntities = entities.filter(e => e.id !== entityId);
  localStorage.setItem(STORAGE_KEYS.BILLING_ENTITIES, JSON.stringify(filteredEntities));
};

// Service Contracts
export const getServiceContracts = (filters?: {
  billingEntityId?: string;
  status?: string;
  category?: string;
}): ServiceContract[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SERVICE_CONTRACTS);
  let contracts = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.billingEntityId) {
      contracts = contracts.filter((contract: ServiceContract) => contract.billingEntityId === filters.billingEntityId);
    }
    if (filters.status) {
      contracts = contracts.filter((contract: ServiceContract) => contract.status === filters.status);
    }
    if (filters.category) {
      contracts = contracts.filter((contract: ServiceContract) => contract.category === filters.category);
    }
  }
  
  return contracts;
};

export const saveServiceContract = (contract: ServiceContract): void => {
  const contracts = getServiceContracts();
  const existingIndex = contracts.findIndex(c => c.id === contract.id);
  
  if (existingIndex >= 0) {
    contracts[existingIndex] = { ...contract, updatedAt: new Date().toISOString() };
  } else {
    contracts.push({ 
      ...contract, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.SERVICE_CONTRACTS, JSON.stringify(contracts));
};

export const deleteServiceContract = (contractId: string): void => {
  const contracts = getServiceContracts();
  const filteredContracts = contracts.filter(c => c.id !== contractId);
  localStorage.setItem(STORAGE_KEYS.SERVICE_CONTRACTS, JSON.stringify(filteredContracts));
};

// Service Rates
export const getServiceRates = (filters?: {
  contractId?: string;
  serviceType?: string;
  isActive?: boolean;
}): ServiceRate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SERVICE_RATES);
  let rates = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.contractId) {
      rates = rates.filter((rate: ServiceRate) => rate.contractId === filters.contractId);
    }
    if (filters.serviceType) {
      rates = rates.filter((rate: ServiceRate) => rate.serviceType === filters.serviceType);
    }
    if (filters.isActive !== undefined) {
      rates = rates.filter((rate: ServiceRate) => rate.isActive === filters.isActive);
    }
  }
  
  return rates;
};

export const saveServiceRate = (rate: ServiceRate): void => {
  const rates = getServiceRates();
  const existingIndex = rates.findIndex(r => r.id === rate.id);
  
  if (existingIndex >= 0) {
    rates[existingIndex] = { ...rate, updatedAt: new Date().toISOString() };
  } else {
    rates.push({ 
      ...rate, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.SERVICE_RATES, JSON.stringify(rates));
};

export const deleteServiceRate = (rateId: string): void => {
  const rates = getServiceRates();
  const filteredRates = rates.filter(r => r.id !== rateId);
  localStorage.setItem(STORAGE_KEYS.SERVICE_RATES, JSON.stringify(filteredRates));
};

// Service Activities
export const getServiceActivities = (filters?: {
  staffId?: string;
  patientId?: string;
  contractId?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}): ServiceActivity[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SERVICE_ACTIVITIES);
  let activities = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.staffId) {
      activities = activities.filter((activity: ServiceActivity) => activity.staffId === filters.staffId);
    }
    if (filters.patientId) {
      activities = activities.filter((activity: ServiceActivity) => activity.patientId === filters.patientId);
    }
    if (filters.contractId) {
      activities = activities.filter((activity: ServiceActivity) => activity.contractId === filters.contractId);
    }
    if (filters.status) {
      activities = activities.filter((activity: ServiceActivity) => activity.status === filters.status);
    }
    if (filters.category) {
      activities = activities.filter((activity: ServiceActivity) => activity.category === filters.category);
    }
    if (filters.dateFrom) {
      activities = activities.filter((activity: ServiceActivity) => activity.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      activities = activities.filter((activity: ServiceActivity) => activity.date <= filters.dateTo!);
    }
  }
  
  return activities.sort((a: ServiceActivity, b: ServiceActivity) => 
    new Date(`${b.date} ${b.startTime}`).getTime() - new Date(`${a.date} ${a.startTime}`).getTime()
  );
};

export const saveServiceActivity = (activity: ServiceActivity): void => {
  const activities = getServiceActivities();
  const existingIndex = activities.findIndex(a => a.id === activity.id);
  
  if (existingIndex >= 0) {
    activities[existingIndex] = { ...activity, updatedAt: new Date().toISOString() };
  } else {
    activities.push({ 
      ...activity, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.SERVICE_ACTIVITIES, JSON.stringify(activities));
};

export const deleteServiceActivity = (activityId: string): void => {
  const activities = getServiceActivities();
  const filteredActivities = activities.filter(a => a.id !== activityId);
  localStorage.setItem(STORAGE_KEYS.SERVICE_ACTIVITIES, JSON.stringify(filteredActivities));
};

// Billing Cycles
export const getBillingCycles = (filters?: {
  status?: string;
}): BillingCycle[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BILLING_CYCLES);
  let cycles = data ? JSON.parse(data) : [];
  
  if (filters && filters.status) {
    cycles = cycles.filter((cycle: BillingCycle) => cycle.status === filters.status);
  }
  
  return cycles.sort((a: BillingCycle, b: BillingCycle) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
};

export const saveBillingCycle = (cycle: BillingCycle): void => {
  const cycles = getBillingCycles();
  const existingIndex = cycles.findIndex(c => c.id === cycle.id);
  
  if (existingIndex >= 0) {
    cycles[existingIndex] = { ...cycle, updatedAt: new Date().toISOString() };
  } else {
    cycles.push({ 
      ...cycle, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.BILLING_CYCLES, JSON.stringify(cycles));
};

export const deleteBillingCycle = (cycleId: string): void => {
  const cycles = getBillingCycles();
  const filteredCycles = cycles.filter(c => c.id !== cycleId);
  localStorage.setItem(STORAGE_KEYS.BILLING_CYCLES, JSON.stringify(filteredCycles));
};

// Invoice Drafts
export const getInvoiceDrafts = (filters?: {
  billingCycleId?: string;
  billingEntityId?: string;
  status?: string;
}): InvoiceDraft[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INVOICE_DRAFTS);
  let drafts = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.billingCycleId) {
      drafts = drafts.filter((draft: InvoiceDraft) => draft.billingCycleId === filters.billingCycleId);
    }
    if (filters.billingEntityId) {
      drafts = drafts.filter((draft: InvoiceDraft) => draft.billingEntityId === filters.billingEntityId);
    }
    if (filters.status) {
      drafts = drafts.filter((draft: InvoiceDraft) => draft.status === filters.status);
    }
  }
  
  return drafts;
};

export const saveInvoiceDraft = (draft: InvoiceDraft): void => {
  const drafts = getInvoiceDrafts();
  const existingIndex = drafts.findIndex(d => d.id === draft.id);
  
  if (existingIndex >= 0) {
    drafts[existingIndex] = { ...draft, updatedAt: new Date().toISOString() };
  } else {
    drafts.push({ 
      ...draft, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.INVOICE_DRAFTS, JSON.stringify(drafts));
};

export const deleteInvoiceDraft = (draftId: string): void => {
  const drafts = getInvoiceDrafts();
  const filteredDrafts = drafts.filter(d => d.id !== draftId);
  localStorage.setItem(STORAGE_KEYS.INVOICE_DRAFTS, JSON.stringify(filteredDrafts));
};

// Advanced Invoices
export const getAdvancedInvoices = (filters?: {
  billingEntityId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  isElectronic?: boolean;
}): AdvancedInvoice[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ADVANCED_INVOICES);
  let invoices = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.billingEntityId) {
      invoices = invoices.filter((inv: AdvancedInvoice) => inv.billingEntityId === filters.billingEntityId);
    }
    if (filters.status) {
      invoices = invoices.filter((inv: AdvancedInvoice) => inv.status === filters.status);
    }
    if (filters.dateFrom) {
      invoices = invoices.filter((inv: AdvancedInvoice) => inv.issueDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      invoices = invoices.filter((inv: AdvancedInvoice) => inv.issueDate <= filters.dateTo!);
    }
    if (filters.type) {
      invoices = invoices.filter((inv: AdvancedInvoice) => inv.type === filters.type);
    }
    if (filters.isElectronic !== undefined) {
      invoices = invoices.filter((inv: AdvancedInvoice) => inv.isElectronic === filters.isElectronic);
    }
  }
  
  return invoices.sort((a: AdvancedInvoice, b: AdvancedInvoice) => 
    new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );
};

export const saveAdvancedInvoice = (invoice: AdvancedInvoice): void => {
  const invoices = getAdvancedInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    // Aggiorna il numero fattura nelle impostazioni
    if (invoice.status !== 'draft') {
      const settings = getAdvancedBillingSettings();
      settings.invoiceSettings.nextInvoiceNumber++;
      saveAdvancedBillingSettings(settings);
    }
    
    invoices.push({ 
      ...invoice, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.ADVANCED_INVOICES, JSON.stringify(invoices));
};

export const deleteAdvancedInvoice = (invoiceId: string): void => {
  const invoices = getAdvancedInvoices();
  const filteredInvoices = invoices.filter(inv => inv.id !== invoiceId);
  localStorage.setItem(STORAGE_KEYS.ADVANCED_INVOICES, JSON.stringify(filteredInvoices));
};

// Advanced Payments
export const getAdvancedPayments = (invoiceId?: string): AdvancedPayment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ADVANCED_PAYMENTS);
  let payments = data ? JSON.parse(data) : [];
  
  if (invoiceId) {
    payments = payments.filter((payment: AdvancedPayment) => payment.invoiceId === invoiceId);
  }
  
  return payments.sort((a: AdvancedPayment, b: AdvancedPayment) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const saveAdvancedPayment = (payment: AdvancedPayment): void => {
  const payments = getAdvancedPayments();
  const existingIndex = payments.findIndex(p => p.id === payment.id);
  
  if (existingIndex >= 0) {
    payments[existingIndex] = { ...payment, updatedAt: new Date().toISOString() };
  } else {
    payments.push({ 
      ...payment, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.ADVANCED_PAYMENTS, JSON.stringify(payments));
  
  // Update invoice paid amount
  updateAdvancedInvoicePaidAmount(payment.invoiceId);
};

const updateAdvancedInvoicePaidAmount = (invoiceId: string): void => {
  const invoices = getAdvancedInvoices();
  const invoice = invoices.find(inv => inv.id === invoiceId);
  
  if (invoice) {
    const invoicePayments = getAdvancedPayments(invoiceId);
    const totalPaid = invoicePayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    invoice.paidAmount = totalPaid;
    invoice.remainingAmount = invoice.total - totalPaid;
    
    // Update status based on payment
    if (totalPaid >= invoice.total) {
      invoice.status = 'paid';
    } else if (totalPaid > 0) {
      invoice.status = 'partially_paid';
    }
    
    saveAdvancedInvoice(invoice);
  }
};

// Credit Notes
export const getCreditNotes = (filters?: {
  relatedInvoiceId?: string;
  billingEntityId?: string;
  dateFrom?: string;
  dateTo?: string;
}): CreditNote[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CREDIT_NOTES);
  let creditNotes = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.relatedInvoiceId) {
      creditNotes = creditNotes.filter((note: CreditNote) => note.relatedInvoiceId === filters.relatedInvoiceId);
    }
    if (filters.billingEntityId) {
      creditNotes = creditNotes.filter((note: CreditNote) => note.billingEntityId === filters.billingEntityId);
    }
    if (filters.dateFrom) {
      creditNotes = creditNotes.filter((note: CreditNote) => note.issueDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      creditNotes = creditNotes.filter((note: CreditNote) => note.issueDate <= filters.dateTo!);
    }
  }
  
  return creditNotes.sort((a: CreditNote, b: CreditNote) => 
    new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );
};

export const saveCreditNote = (creditNote: CreditNote): void => {
  const creditNotes = getCreditNotes();
  const existingIndex = creditNotes.findIndex(note => note.id === creditNote.id);
  
  if (existingIndex >= 0) {
    creditNotes[existingIndex] = { ...creditNote, updatedAt: new Date().toISOString() };
  } else {
    creditNotes.push({ 
      ...creditNote, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.CREDIT_NOTES, JSON.stringify(creditNotes));
};

export const deleteCreditNote = (creditNoteId: string): void => {
  const creditNotes = getCreditNotes();
  const filteredCreditNotes = creditNotes.filter(note => note.id !== creditNoteId);
  localStorage.setItem(STORAGE_KEYS.CREDIT_NOTES, JSON.stringify(filteredCreditNotes));
};

// Advanced Billing Settings
export const getAdvancedBillingSettings = (): AdvancedBillingSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.ADVANCED_BILLING_SETTINGS);
  return data ? JSON.parse(data) : getDefaultAdvancedBillingSettings();
};

export const saveAdvancedBillingSettings = (settings: AdvancedBillingSettings): void => {
  localStorage.setItem(STORAGE_KEYS.ADVANCED_BILLING_SETTINGS, JSON.stringify(settings));
};

const getDefaultAdvancedBillingSettings = (): AdvancedBillingSettings => {
  return {
    companyInfo: {
      name: 'Cooperativa Sociale Emmanuel',
      address: 'Via Roma 123',
      city: 'Napoli',
      postalCode: '80100',
      province: 'NA',
      country: 'Italia',
      vatNumber: 'IT12345678901',
      fiscalCode: 'CMPEMM24A01F839X',
      phone: '081-1234567',
      email: 'info@emmanuel.it',
      pec: 'emmanuel@pec.it',
      website: 'www.emmanuel.it',
      legalForm: 'Cooperativa Sociale',
      shareCapital: '10.000,00',
      registryNumber: 'NA-123456',
      reaNumber: 'NA-654321'
    },
    invoiceSettings: {
      numberingPrefix: 'FT',
      numberingSuffix: '',
      numberingFormat: '{PREFIX}-{YEAR}/{NUMBER}{SUFFIX}',
      numberingReset: 'yearly',
      nextInvoiceNumber: 1,
      defaultPaymentTerms: 30,
      defaultVatRate: 22,
      defaultNotes: 'Pagamento entro 30 giorni dalla data di emissione.',
      defaultPaymentInstructions: 'Bonifico bancario su IBAN: IT60 X054 2811 1010 0000 0123 456',
      roundingMethod: 'nearest',
      roundingPrecision: 2
    },
    electronicInvoicing: {
      enabled: true,
      transmissionMode: 'sdi',
      defaultTransmissionFormat: 'FPA12',
      sdiCode: 'ABCDEF1',
      pecAddress: 'emmanuel@pec.it',
      testMode: false
    },
    paymentSettings: {
      acceptedMethods: ['bank_transfer', 'cash', 'check', 'credit_card', 'direct_debit'],
      bankDetails: [
        {
          bankName: 'Banca Intesa Sanpaolo',
          iban: 'IT60 X054 2811 1010 0000 0123 456',
          swift: 'BCITITMM',
          accountHolder: 'Cooperativa Sociale Emmanuel'
        }
      ],
      defaultMethod: 'bank_transfer'
    },
    reminderSettings: {
      enableAutomaticReminders: true,
      firstReminderDays: 3,
      secondReminderDays: 10,
      finalReminderDays: 20,
      reminderTemplates: {
        first: 'Gentile {cliente}, la fattura {numero} di {importo} è scaduta da {giorni} giorni.',
        second: 'Gentile {cliente}, la fattura {numero} di {importo} è scaduta da {giorni} giorni. La preghiamo di regolarizzare il pagamento.',
        final: 'Gentile {cliente}, la fattura {numero} di {importo} è scaduta da {giorni} giorni. In mancanza di pagamento entro 7 giorni, saremo costretti ad avviare le procedure di recupero crediti.'
      }
    },
    approvalWorkflow: {
      requireApprovalForInvoices: true,
      approvalRoles: ['admin', 'coordinator'],
      autoApproveUnder: 500
    },
    exportSettings: {
      defaultExportFormat: 'pdf',
      accountingExportFormat: 'excel',
      accountingExportMapping: {
        'invoice.number': 'Numero',
        'invoice.date': 'Data',
        'invoice.entity': 'Cliente',
        'invoice.total': 'Importo'
      }
    }
  };
};

// UTILITY FUNCTIONS
export const generateInvoiceId = (): string => {
  return crypto.randomUUID();
};

export const generatePaymentId = (): string => {
  return crypto.randomUUID();
};

export const generateExpenseId = (): string => {
  return crypto.randomUUID();
};

export const generateBillingEntityId = (): string => {
  return crypto.randomUUID();
};

export const generateServiceContractId = (): string => {
  return crypto.randomUUID();
};

export const generateServiceRateId = (): string => {
  return crypto.randomUUID();
};

export const generateServiceActivityId = (): string => {
  return crypto.randomUUID();
};

export const generateBillingCycleId = (): string => {
  return crypto.randomUUID();
};

export const generateInvoiceDraftId = (): string => {
  return crypto.randomUUID();
};

export const generateAdvancedInvoiceId = (): string => {
  return crypto.randomUUID();
};

export const generateAdvancedPaymentId = (): string => {
  return crypto.randomUUID();
};

export const generateCreditNoteId = (): string => {
  return crypto.randomUUID();
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

// Reset all billing storage data
export const resetBillingStorageData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.INVOICES);
  localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.TAX_REPORTS);
  localStorage.removeItem(STORAGE_KEYS.BILLING_ENTITIES);
  localStorage.removeItem(STORAGE_KEYS.SERVICE_CONTRACTS);
  localStorage.removeItem(STORAGE_KEYS.SERVICE_RATES);
  localStorage.removeItem(STORAGE_KEYS.SERVICE_ACTIVITIES);
  localStorage.removeItem(STORAGE_KEYS.BILLING_CYCLES);
  localStorage.removeItem(STORAGE_KEYS.INVOICE_DRAFTS);
  localStorage.removeItem(STORAGE_KEYS.ADVANCED_INVOICES);
  localStorage.removeItem(STORAGE_KEYS.ADVANCED_PAYMENTS);
  localStorage.removeItem(STORAGE_KEYS.CREDIT_NOTES);
  // Keep billing settings
};