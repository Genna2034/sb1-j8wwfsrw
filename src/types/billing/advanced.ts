import { User } from '../auth';
import { Patient } from '../medical';

// Types for the advanced billing system

/**
 * Service categories for the organization
 */
export type ServiceCategory = 
  | 'healthcare' // RSA, SAD, CDI
  | 'educational' // Assistenza scolastica, educativa domiciliare
  | 'support'; // Sostegno disabilità

/**
 * Service types within each category
 */
export type ServiceType = {
  healthcare: 'nursing' | 'physiotherapy' | 'homecare' | 'daycare' | 'residential';
  educational: 'school_assistance' | 'home_education' | 'cultural_mediation';
  support: 'disability_support' | 'specialized_assistance' | 'rehabilitation';
};

/**
 * Billing entity types
 */
export type BillingEntityType = 
  | 'municipality' // Comune
  | 'school' // Scuola
  | 'health_authority' // ASL
  | 'public_entity' // Altro ente pubblico
  | 'private_family' // Famiglia privata
  | 'insurance' // Assicurazione
  | 'other'; // Altro

/**
 * Billing entity representing a payer
 */
export interface BillingEntity {
  id: string;
  name: string;
  type: BillingEntityType;
  fiscalCode: string;
  vatNumber?: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  email: string;
  phone: string;
  pec?: string; // Posta Elettronica Certificata
  sdiCode?: string; // Codice destinatario SDI
  paymentTerms: number; // Days
  isPublicAdministration: boolean;
  paCode?: string; // Codice IPA per PA
  contactPerson?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service contract with a billing entity
 */
export interface ServiceContract {
  id: string;
  billingEntityId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  serviceTypes: string[]; // Array of service types
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired' | 'terminated';
  billingType: 'hourly' | 'daily' | 'monthly' | 'fixed' | 'per_service';
  billingFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  autoRenew: boolean;
  documentUrl?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Rate configuration for a service
 */
export interface ServiceRate {
  id: string;
  contractId: string;
  serviceType: string;
  description: string;
  baseRate: number; // Base hourly/daily/monthly rate
  currency: string; // Default EUR
  timeUnit: 'hour' | 'day' | 'month' | 'service';
  minimumBillable?: number; // Minimum billable units
  roundingMethod: 'nearest' | 'up' | 'down';
  roundingInterval?: number; // e.g., 15 minutes
  modifiers: RateModifier[];
  vatRate: number; // VAT percentage
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Modifier for a service rate
 */
export interface RateModifier {
  id: string;
  type: 'time_of_day' | 'day_of_week' | 'holiday' | 'staff_level' | 'duration' | 'location';
  description: string;
  condition: {
    // For time_of_day
    startTime?: string;
    endTime?: string;
    
    // For day_of_week
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    
    // For holiday
    holidayIds?: string[];
    
    // For staff_level
    staffLevels?: string[];
    
    // For duration
    minDuration?: number;
    maxDuration?: number;
    
    // For location
    locations?: string[];
  };
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number; // Percentage or fixed amount
  priority: number; // For resolving conflicts between modifiers
  isActive: boolean;
}

/**
 * Service activity record
 */
export interface ServiceActivity {
  id: string;
  staffId: string;
  staffName: string;
  patientId?: string;
  patientName?: string;
  serviceType: string;
  category: ServiceCategory;
  contractId?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // In minutes
  location: string;
  locationDetails?: {
    type: 'facility' | 'school' | 'home' | 'other';
    name: string;
    address?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'billed';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  materials?: {
    name: string;
    quantity: number;
    unitCost?: number;
  }[];
  objectives?: string[];
  signature?: {
    signedBy: string;
    signatureType: 'digital' | 'physical';
    timestamp: string;
    verificationCode?: string;
  };
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Billing cycle
 */
export interface BillingCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'open' | 'processing' | 'closed' | 'invoiced';
  billingEntities: string[]; // IDs of entities to bill in this cycle
  contracts: string[]; // IDs of contracts to bill in this cycle
  notes?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedBy?: string;
}

/**
 * Invoice draft generated from activities
 */
export interface InvoiceDraft {
  id: string;
  billingCycleId: string;
  billingEntityId: string;
  contractId: string;
  referenceNumber: string;
  status: 'draft' | 'approved' | 'rejected' | 'invoiced';
  items: InvoiceDraftItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Invoice draft item
 */
export interface InvoiceDraftItem {
  id: string;
  serviceType: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  vatRate: number;
  total: number;
  activities: string[]; // IDs of related activities
  notes?: string;
}

/**
 * Advanced invoice with electronic invoicing support
 */
export interface AdvancedInvoice {
  id: string;
  number: string;
  year: number;
  billingEntityId: string;
  contractId?: string;
  draftId?: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'delivered' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'rejected';
  type: 'invoice' | 'credit_note' | 'proforma';
  items: AdvancedInvoiceItem[];
  subtotal: number;
  vatBreakdown: {
    rate: number;
    taxable: number;
    tax: number;
  }[];
  totalVat: number;
  total: number;
  payments: {
    id: string;
    date: string;
    amount: number;
    method: string;
    reference?: string;
  }[];
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  paymentTerms: string;
  paymentInstructions?: string;
  
  // Electronic invoicing fields
  isElectronic: boolean;
  transmissionFormat?: 'FPA12' | 'FPR12'; // FPA for PA, FPR for private
  transmissionReference?: string;
  transmissionDate?: string;
  transmissionStatus?: 'pending' | 'sent' | 'delivered' | 'accepted' | 'rejected';
  transmissionErrorMessage?: string;
  sdiIdentifier?: string; // Codice SDI o PEC
  
  // Tracking
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  sentAt?: string;
  sentBy?: string;
}

/**
 * Advanced invoice item
 */
export interface AdvancedInvoiceItem {
  id: string;
  lineNumber: number;
  serviceType: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  vatRate: number;
  vatIncluded: boolean;
  taxableAmount: number;
  vatAmount: number;
  total: number;
  period?: {
    startDate: string;
    endDate: string;
  };
  relatedDocuments?: {
    type: 'contract' | 'order' | 'ddt' | 'other';
    number: string;
    date: string;
    lineNumber?: number;
  }[];
  notes?: string;
}

/**
 * Payment record
 */
export interface AdvancedPayment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: 'bank_transfer' | 'cash' | 'check' | 'credit_card' | 'direct_debit' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  transactionId?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Credit note
 */
export interface CreditNote {
  id: string;
  number: string;
  year: number;
  relatedInvoiceId: string;
  relatedInvoiceNumber: string;
  billingEntityId: string;
  issueDate: string;
  reason: string;
  items: AdvancedInvoiceItem[];
  subtotal: number;
  vatBreakdown: {
    rate: number;
    taxable: number;
    tax: number;
  }[];
  totalVat: number;
  total: number;
  notes?: string;
  
  // Electronic invoicing fields
  isElectronic: boolean;
  transmissionFormat?: 'FPA12' | 'FPR12';
  transmissionReference?: string;
  transmissionDate?: string;
  transmissionStatus?: 'pending' | 'sent' | 'delivered' | 'accepted' | 'rejected';
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Holiday definition for rate calculations
 */
export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  repeatsYearly: boolean;
  applicableRegions?: string[]; // Empty means national
  rateModifierId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Advanced billing settings
 */
export interface AdvancedBillingSettings {
  companyInfo: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
    vatNumber: string;
    fiscalCode: string;
    phone: string;
    email: string;
    pec: string;
    website?: string;
    logo?: string;
    legalForm: string;
    shareCapital?: string;
    registryNumber?: string;
    reaNumber?: string;
  };
  
  invoiceSettings: {
    numberingPrefix: string;
    numberingSuffix?: string;
    numberingFormat: string; // e.g., "{PREFIX}{YEAR}/{NUMBER}{SUFFIX}"
    numberingReset: 'yearly' | 'monthly' | 'never';
    nextInvoiceNumber: number;
    defaultPaymentTerms: number; // days
    defaultVatRate: number;
    defaultNotes: string;
    defaultPaymentInstructions: string;
    roundingMethod: 'nearest' | 'up' | 'down';
    roundingPrecision: number; // decimal places
  };
  
  electronicInvoicing: {
    enabled: boolean;
    transmissionMode: 'sdi' | 'pec' | 'api';
    defaultTransmissionFormat: 'FPA12' | 'FPR12';
    sdiCode?: string;
    pecAddress?: string;
    apiCredentials?: {
      provider: string;
      apiKey: string;
      username?: string;
      password?: string;
    };
    testMode: boolean;
  };
  
  paymentSettings: {
    acceptedMethods: string[];
    bankDetails: {
      bankName: string;
      iban: string;
      swift?: string;
      accountHolder: string;
    }[];
    defaultMethod: string;
  };
  
  reminderSettings: {
    enableAutomaticReminders: boolean;
    firstReminderDays: number; // days after due date
    secondReminderDays: number;
    finalReminderDays: number;
    reminderTemplates: {
      first: string;
      second: string;
      final: string;
    };
  };
  
  approvalWorkflow: {
    requireApprovalForInvoices: boolean;
    approvalRoles: string[];
    autoApproveUnder?: number;
  };
  
  exportSettings: {
    defaultExportFormat: 'pdf' | 'xml' | 'csv' | 'excel';
    accountingExportFormat: string;
    accountingExportMapping: Record<string, string>;
  };
}

/**
 * Activity approval batch
 */
export interface ActivityApprovalBatch {
  id: string;
  name: string;
  period: {
    startDate: string;
    endDate: string;
  };
  status: 'pending' | 'partially_approved' | 'approved' | 'rejected';
  activities: {
    activityId: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
  }[];
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Electronic invoice transmission record
 */
export interface ElectronicInvoiceTransmission {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  transmissionId: string;
  transmissionDate: string;
  recipient: string;
  format: 'FPA12' | 'FPR12';
  status: 'pending' | 'sent' | 'delivered' | 'accepted' | 'rejected' | 'failed';
  statusDate: string;
  statusMessage?: string;
  xmlContent: string;
  notifications: {
    date: string;
    type: string;
    message: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Billing report
 */
export interface BillingReport {
  id: string;
  name: string;
  type: 'revenue' | 'activity' | 'contract' | 'entity' | 'staff' | 'custom';
  period: {
    startDate: string;
    endDate: string;
  };
  filters: Record<string, any>;
  data: any;
  format: 'pdf' | 'excel' | 'csv';
  createdAt: string;
  createdBy: string;
  url?: string;
}