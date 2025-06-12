import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Plus, Edit, Trash2, Eye, 
  Download, Send, CheckCircle, XCircle, AlertTriangle,
  Clock, CreditCard, Calendar, Euro, FileSpreadsheet
} from 'lucide-react';
import { AdvancedInvoice } from '../../../types/billing/advanced';
import { AdvancedInvoiceForm } from './AdvancedInvoiceForm';
import { AdvancedInvoiceDetail } from './AdvancedInvoiceDetail';
import { useToast } from '../../../contexts/ToastContext';

export const InvoiceManagement: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<AdvancedInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<AdvancedInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<AdvancedInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingEntities, setBillingEntities] = useState<any[]>([]);

  useEffect(() => {
    loadInvoices();
    loadBillingEntities();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter, entityFilter, dateFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockInvoices: AdvancedInvoice[] = [
          {
            id: '1',
            number: 'FT-2025/0042',
            year: 2025,
            billingEntityId: '1',
            contractId: 'contract-1',
            issueDate: '2025-06-15',
            dueDate: '2025-07-15',
            status: 'sent',
            type: 'invoice',
            items: [
              {
                id: 'item-1',
                lineNumber: 1,
                serviceType: 'nursing',
                description: 'Assistenza Infermieristica - Giugno 2025',
                quantity: 20,
                unit: 'ore',
                unitPrice: 25,
                discount: 0,
                discountType: 'percentage',
                vatRate: 22,
                vatIncluded: false,
                taxableAmount: 500,
                vatAmount: 110,
                total: 610,
                period: {
                  startDate: '2025-06-01',
                  endDate: '2025-06-30'
                }
              }
            ],
            subtotal: 500,
            vatBreakdown: [
              {
                rate: 22,
                taxable: 500,
                tax: 110
              }
            ],
            totalVat: 110,
            total: 610,
            payments: [],
            paidAmount: 0,
            remainingAmount: 610,
            paymentTerms: '30 giorni data fattura',
            isElectronic: true,
            transmissionFormat: 'FPA12',
            transmissionStatus: 'delivered',
            transmissionDate: '2025-06-15T10:30:00Z',
            sdiIdentifier: 'UFGKZE',
            createdAt: '2025-06-15T10:00:00Z',
            updatedAt: '2025-06-15T10:30:00Z',
            createdBy: 'admin',
            sentAt: '2025-06-15T10:30:00Z',
            sentBy: 'admin'
          },
          {
            id: '2',
            number: 'FT-2025/0041',
            year: 2025,
            billingEntityId: '2',
            contractId: 'contract-2',
            issueDate: '2025-06-10',
            dueDate: '2025-08-10',
            status: 'paid',
            type: 'invoice',
            items: [
              {
                id: 'item-2',
                lineNumber: 1,
                serviceType: 'school_assistance',
                description: 'Assistenza Scolastica - Maggio 2025',
                quantity: 80,
                unit: 'ore',
                unitPrice: 22,
                discount: 0,
                discountType: 'percentage',
                vatRate: 22,
                vatIncluded: false,
                taxableAmount: 1760,
                vatAmount: 387.2,
                total: 2147.2,
                period: {
                  startDate: '2025-05-01',
                  endDate: '2025-05-31'
                }
              }
            ],
            subtotal: 1760,
            vatBreakdown: [
              {
                rate: 22,
                taxable: 1760,
                tax: 387.2
              }
            ],
            totalVat: 387.2,
            total: 2147.2,
            payments: [
              {
                id: 'payment-1',
                date: '2025-06-20',
                amount: 2147.2,
                method: 'bank_transfer',
                reference: 'BONIFICO123456'
              }
            ],
            paidAmount: 2147.2,
            remainingAmount: 0,
            paymentTerms: '60 giorni data fattura',
            isElectronic: true,
            transmissionFormat: 'FPA12',
            transmissionStatus: 'accepted',
            transmissionDate: '2025-06-10T11:15:00Z',
            sdiIdentifier: 'UFTY8T',
            createdAt: '2025-06-10T11:00:00Z',
            updatedAt: '2025-06-20T14:30:00Z',
            createdBy: 'admin',
            sentAt: '2025-06-10T11:15:00Z',
            sentBy: 'admin'
          },
          {
            id: '3',
            number: 'FT-2025/0040',
            year: 2025,
            billingEntityId: '3',
            contractId: 'contract-3',
            issueDate: '2025-06-05',
            dueDate: '2025-07-05',
            status: 'overdue',
            type: 'invoice',
            items: [
              {
                id: 'item-3',
                lineNumber: 1,
                serviceType: 'physiotherapy',
                description: 'Fisioterapia - Maggio 2025',
                quantity: 12,
                unit: 'sedute',
                unitPrice: 40,
                discount: 0,
                discountType: 'percentage',
                vatRate: 22,
                vatIncluded: false,
                taxableAmount: 480,
                vatAmount: 105.6,
                total: 585.6,
                period: {
                  startDate: '2025-05-01',
                  endDate: '2025-05-31'
                }
              }
            ],
            subtotal: 480,
            vatBreakdown: [
              {
                rate: 22,
                taxable: 480,
                tax: 105.6
              }
            ],
            totalVat: 105.6,
            total: 585.6,
            payments: [],
            paidAmount: 0,
            remainingAmount: 585.6,
            paymentTerms: '30 giorni data fattura',
            isElectronic: true,
            transmissionFormat: 'FPA12',
            transmissionStatus: 'accepted',
            transmissionDate: '2025-06-05T09:45:00Z',
            sdiIdentifier: 'UF6Z7I',
            createdAt: '2025-06-05T09:30:00Z',
            updatedAt: '2025-06-05T09:45:00Z',
            createdBy: 'admin',
            sentAt: '2025-06-05T09:45:00Z',
            sentBy: 'admin'
          },
          {
            id: '4',
            number: 'FT-2025/0039',
            year: 2025,
            billingEntityId: '4',
            issueDate: '2025-06-01',
            dueDate: '2025-06-16',
            status: 'draft',
            type: 'invoice',
            items: [
              {
                id: 'item-4',
                lineNumber: 1,
                serviceType: 'home_education',
                description: 'Educativa Domiciliare - Maggio 2025',
                quantity: 8,
                unit: 'ore',
                unitPrice: 30,
                discount: 0,
                discountType: 'percentage',
                vatRate: 22,
                vatIncluded: false,
                taxableAmount: 240,
                vatAmount: 52.8,
                total: 292.8,
                period: {
                  startDate: '2025-05-01',
                  endDate: '2025-05-31'
                }
              }
            ],
            subtotal: 240,
            vatBreakdown: [
              {
                rate: 22,
                taxable: 240,
                tax: 52.8
              }
            ],
            totalVat: 52.8,
            total: 292.8,
            payments: [],
            paidAmount: 0,
            remainingAmount: 292.8,
            paymentTerms: '15 giorni data fattura',
            isElectronic: false,
            createdAt: '2025-06-01T14:00:00Z',
            updatedAt: '2025-06-01T14:00:00Z',
            createdBy: 'admin'
          }
        ];
        
        setInvoices(mockInvoices);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setLoading(false);
    }
  };

  const loadBillingEntities = async () => {
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockEntities = [
          { id: '1', name: 'Comune di Napoli' },
          { id: '2', name: 'ASL Napoli 1 Centro' },
          { id: '3', name: 'Istituto Comprensivo Statale "Virgilio 4"' },
          { id: '4', name: 'Famiglia Esposito' }
        ];
        
        setBillingEntities(mockEntities);
      }, 500);
    } catch (error) {
      console.error('Error loading billing entities:', error);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    if (entityFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.billingEntityId === entityFilter);
    }
    
    if (dateFilter) {
      filtered = filtered.filter(invoice => invoice.issueDate === dateFilter);
    }
    
    setFilteredInvoices(filtered);
  };

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setShowForm(true);
  };

  const handleEditInvoice = (invoice: AdvancedInvoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleViewInvoice = (invoice: AdvancedInvoice) => {
    setSelectedInvoice(invoice);
    setShowDetail(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa fattura? Questa azione non può essere annullata.')) {
      // In a real implementation, this would call an API
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      showToast('success', 'Fattura eliminata', 'La fattura è stata eliminata con successo');
    }
  };

  const handleSaveInvoice = (invoice: AdvancedInvoice) => {
    if (selectedInvoice) {
      // Update existing invoice
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
      showToast('success', 'Fattura aggiornata', 'Le informazioni della fattura sono state aggiornate');
    } else {
      // Add new invoice
      const newInvoice = {
        ...invoice,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
      };
      setInvoices(prev => [...prev, newInvoice]);
      showToast('success', 'Fattura aggiunta', 'La nuova fattura è stata aggiunta con successo');
    }
    setShowForm(false);
  };

  const handleSendInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          status: 'sent',
          transmissionStatus: 'pending',
          sentAt: new Date().toISOString(),
          sentBy: 'admin',
          updatedAt: new Date().toISOString()
        };
      }
      return invoice;
    }));
    showToast('success', 'Fattura inviata', 'La fattura è stata inviata con successo');
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          status: 'paid',
          payments: [
            ...invoice.payments,
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString().split('T')[0],
              amount: invoice.remainingAmount,
              method: 'bank_transfer',
              reference: `Pagamento ${invoice.number}`
            }
          ],
          paidAmount: invoice.total,
          remainingAmount: 0,
          updatedAt: new Date().toISOString()
        };
      }
      return invoice;
    }));
    showToast('success', 'Fattura pagata', 'La fattura è stata registrata come pagata');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'delivered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'draft': return 'Bozza';
      case 'sent': return 'Inviata';
      case 'delivered': return 'Consegnata';
      case 'paid': return 'Pagata';
      case 'partially_paid': return 'Parzialmente Pagata';
      case 'overdue': return 'Scaduta';
      case 'cancelled': return 'Annullata';
      case 'rejected': return 'Rifiutata';
      default: return status;
    }
  };

  const getTransmissionStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'delivered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTransmissionStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return 'In attesa';
      case 'sent': return 'Inviata';
      case 'delivered': return 'Consegnata';
      case 'accepted': return 'Accettata';
      case 'rejected': return 'Rifiutata';
      default: return status;
    }
  };

  const getEntityName = (entityId: string): string => {
    const entity = billingEntities.find(e => e.id === entityId);
    return entity ? entity.name : 'Cliente sconosciuto';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bozze</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {loading ? '...' : invoices.filter(i => i.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inviate</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : invoices.filter(i => i.status === 'sent' || i.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : invoices.filter(i => i.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scadute</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {loading ? '...' : invoices.filter(i => i.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca per numero fattura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutti gli stati</option>
            <option value="draft">Bozze</option>
            <option value="sent">Inviate</option>
            <option value="delivered">Consegnate</option>
            <option value="paid">Pagate</option>
            <option value="partially_paid">Parzialmente Pagate</option>
            <option value="overdue">Scadute</option>
            <option value="cancelled">Annullate</option>
            <option value="rejected">Rifiutate</option>
          </select>
          
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutti i clienti</option>
            {billingEntities.map(entity => (
              <option key={entity.id} value={entity.id}>{entity.name}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          
          <button
            onClick={handleAddInvoice}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuova Fattura
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Fatture ({filteredInvoices.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento fatture...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fattura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Importo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fatturazione Elettronica
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.number}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {invoice.type === 'invoice' ? 'Fattura' : 
                             invoice.type === 'credit_note' ? 'Nota di Credito' : 'Proforma'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getEntityName(invoice.billingEntityId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(invoice.issueDate).toLocaleDateString('it-IT')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Scadenza: {new Date(invoice.dueDate).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Euro className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(invoice.total)}
                          </div>
                          {invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Pagato: {formatCurrency(invoice.paidAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.isElectronic ? (
                        <div className="flex flex-col">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransmissionStatusColor(invoice.transmissionStatus || 'pending')}`}>
                            {getTransmissionStatusText(invoice.transmissionStatus || 'pending')}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {invoice.transmissionFormat} - {invoice.sdiIdentifier}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Non elettronica
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Visualizza"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {invoice.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Modifica"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleSendInvoice(invoice.id)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Invia"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {(invoice.status === 'sent' || invoice.status === 'delivered' || invoice.status === 'overdue') && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Segna come pagata"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {/* Download action */}}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Scarica PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nessuna fattura trovata</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchTerm || statusFilter !== 'all' || entityFilter !== 'all' || dateFilter
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Aggiungi la tua prima fattura per iniziare'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && entityFilter === 'all' && !dateFilter && (
              <button
                onClick={handleAddInvoice}
                className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Aggiungi Fattura
              </button>
            )}
          </div>
        )}
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <AdvancedInvoiceForm
          invoice={selectedInvoice}
          onSave={handleSaveInvoice}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Invoice Detail Modal */}
      {showDetail && selectedInvoice && (
        <AdvancedInvoiceDetail
          invoice={selectedInvoice}
          onEdit={() => {
            setShowDetail(false);
            setShowForm(true);
          }}
          onSend={() => {
            handleSendInvoice(selectedInvoice.id);
            setShowDetail(false);
          }}
          onMarkAsPaid={() => {
            handleMarkAsPaid(selectedInvoice.id);
            setShowDetail(false);
          }}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};