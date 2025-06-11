import { Invoice, InvoiceItem } from '../types/billing';
import { getBillingSettings } from './billingStorage';

/**
 * Generates a PDF invoice using client-side PDF generation
 * @param invoice The invoice data to generate PDF from
 * @returns A Blob containing the PDF data
 */
export const generateInvoicePdf = async (invoice: Invoice): Promise<Blob> => {
  // Dynamically import jspdf and jspdf-autotable only when needed
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  
  // Create a new PDF document
  const doc = new jsPDF();
  const settings = getBillingSettings();
  
  // Set document properties
  doc.setProperties({
    title: `Fattura ${invoice.number}`,
    subject: `Fattura ${invoice.number} per ${invoice.patientName}`,
    author: settings.companyInfo.name,
    creator: 'Emmanuel Billing System'
  });
  
  // Add company logo and header
  addHeader(doc, settings.companyInfo.name);
  
  // Add invoice information
  addInvoiceInfo(doc, invoice);
  
  // Add client information
  addClientInfo(doc, invoice);
  
  // Add invoice items table
  addItemsTable(doc, invoice, autoTable);
  
  // Add totals
  addTotals(doc, invoice);
  
  // Add footer
  addFooter(doc, settings);
  
  // Return the PDF as a blob
  return doc.output('blob');
};

/**
 * Add header with company logo and information
 */
const addHeader = (doc: any, companyName: string) => {
  // Add company name as logo (in a real implementation, you would add an actual logo)
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text(companyName, 20, 20);
  
  // Add a line under the header
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 25, 190, 25);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
};

/**
 * Add invoice information (number, date, etc.)
 */
const addInvoiceInfo = (doc: any, invoice: Invoice) => {
  doc.setFontSize(16);
  doc.text(`${getTypeDisplayName(invoice.type)} ${invoice.number}`, 20, 35);
  
  doc.setFontSize(10);
  doc.text(`Stato: ${getStatusDisplayName(invoice.status)}`, 20, 42);
  doc.text(`Data emissione: ${formatDate(invoice.issueDate)}`, 20, 48);
  doc.text(`Data scadenza: ${formatDate(invoice.dueDate)}`, 20, 54);
  
  // Add a colored status indicator
  const statusColors: Record<string, number[]> = {
    'draft': [150, 150, 150],
    'sent': [0, 102, 204],
    'paid': [0, 153, 0],
    'overdue': [204, 0, 0],
    'cancelled': [150, 150, 150]
  };
  
  const color = statusColors[invoice.status] || [0, 0, 0];
  doc.setFillColor(color[0], color[1], color[2]);
  doc.circle(15, 42, 2, 'F');
};

/**
 * Add client information
 */
const addClientInfo = (doc: any, invoice: Invoice) => {
  doc.setFontSize(12);
  doc.text('Cliente:', 140, 35);
  
  doc.setFontSize(10);
  doc.text(invoice.patientName, 140, 42);
  doc.text(invoice.patientFiscalCode, 140, 48);
  
  // Split address into multiple lines if needed
  const addressLines = splitTextToLines(invoice.patientAddress, 50);
  addressLines.forEach((line, index) => {
    doc.text(line, 140, 54 + (index * 6));
  });
};

/**
 * Add invoice items table
 */
const addItemsTable = (doc: any, invoice: Invoice, autoTable: any) => {
  const tableHeaders = [
    { header: 'Descrizione', dataKey: 'description' },
    { header: 'Data', dataKey: 'date' },
    { header: 'Quantità', dataKey: 'quantity' },
    { header: 'Prezzo', dataKey: 'price' },
    { header: 'Totale', dataKey: 'total' }
  ];
  
  const tableData = invoice.items.map((item: InvoiceItem) => {
    return {
      description: item.description,
      date: formatDate(item.date),
      quantity: item.quantity.toString(),
      price: formatCurrency(item.unitPrice),
      total: formatCurrency(item.total)
    };
  });
  
  autoTable(doc, {
    startY: 70,
    head: [tableHeaders.map(h => h.header)],
    body: tableData.map(row => [
      row.description,
      row.date,
      row.quantity,
      row.price,
      row.total
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    margin: { top: 70, right: 20, bottom: 20, left: 20 }
  });
};

/**
 * Add invoice totals
 */
const addTotals = (doc: any, invoice: Invoice) => {
  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Add totals on the right side
  doc.setFontSize(10);
  doc.text('Subtotale:', 140, finalY);
  doc.text(formatCurrency(invoice.subtotal), 190, finalY, { align: 'right' });
  
  doc.text(`IVA (${invoice.taxRate}%):`, 140, finalY + 6);
  doc.text(formatCurrency(invoice.taxAmount), 190, finalY + 6, { align: 'right' });
  
  // Add a line before the total
  doc.setDrawColor(220, 220, 220);
  doc.line(140, finalY + 9, 190, finalY + 9);
  
  // Add total with bold font
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Totale:', 140, finalY + 15);
  doc.text(formatCurrency(invoice.total), 190, finalY + 15, { align: 'right' });
  
  // Add payment information if applicable
  if (invoice.paidAmount > 0) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Pagato:', 140, finalY + 21);
    doc.text(formatCurrency(invoice.paidAmount), 190, finalY + 21, { align: 'right' });
    
    if (invoice.remainingAmount > 0) {
      doc.text('Da pagare:', 140, finalY + 27);
      doc.text(formatCurrency(invoice.remainingAmount), 190, finalY + 27, { align: 'right' });
    }
  }
  
  // Add payment method if available
  if (invoice.paymentMethod) {
    doc.setFontSize(10);
    doc.text(`Metodo di pagamento: ${getPaymentMethodName(invoice.paymentMethod)}`, 20, finalY);
  }
  
  // Add payment date if available
  if (invoice.paymentDate) {
    doc.text(`Data pagamento: ${formatDate(invoice.paymentDate)}`, 20, finalY + 6);
  }
  
  // Add notes if available
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.text('Note:', 20, finalY + 15);
    
    const noteLines = splitTextToLines(invoice.notes, 70);
    noteLines.forEach((line, index) => {
      doc.text(line, 20, finalY + 21 + (index * 6));
    });
  }
};

/**
 * Add footer with company information
 */
const addFooter = (doc: any, settings: any) => {
  const pageHeight = doc.internal.pageSize.height;
  
  // Add a line above the footer
  doc.setDrawColor(220, 220, 220);
  doc.line(20, pageHeight - 25, 190, pageHeight - 25);
  
  // Add footer text
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  
  const companyInfo = settings.companyInfo;
  const footerText = `${companyInfo.name} - ${companyInfo.address}, ${companyInfo.city} ${companyInfo.postalCode} - P.IVA: ${companyInfo.vatNumber}`;
  doc.text(footerText, 105, pageHeight - 15, { align: 'center' });
  
  const contactInfo = `Tel: ${companyInfo.phone} - Email: ${companyInfo.email}`;
  doc.text(contactInfo, 105, pageHeight - 10, { align: 'center' });
  
  // Add page number
  doc.text(`Pagina 1 di 1`, 190, pageHeight - 10, { align: 'right' });
};

/**
 * Utility function to format currency
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

/**
 * Utility function to format dates
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('it-IT');
};

/**
 * Utility function to split text into multiple lines
 */
const splitTextToLines = (text: string, maxCharsPerLine: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

/**
 * Get display name for invoice type
 */
const getTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'invoice': return 'Fattura';
    case 'receipt': return 'Ricevuta';
    case 'credit_note': return 'Nota di Credito';
    case 'advance': return 'Acconto';
    case 'deposit': return 'Deposito';
    default: return type;
  }
};

/**
 * Get display name for invoice status
 */
const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case 'draft': return 'Bozza';
    case 'sent': return 'Inviata';
    case 'paid': return 'Pagata';
    case 'overdue': return 'Scaduta';
    case 'cancelled': return 'Annullata';
    case 'refunded': return 'Rimborsata';
    default: return status;
  }
};

/**
 * Get display name for payment method
 */
const getPaymentMethodName = (method: string): string => {
  switch (method) {
    case 'cash': return 'Contanti';
    case 'card': return 'Carta';
    case 'bank_transfer': return 'Bonifico Bancario';
    case 'check': return 'Assegno';
    case 'insurance': return 'Assicurazione';
    default: return method;
  }
};