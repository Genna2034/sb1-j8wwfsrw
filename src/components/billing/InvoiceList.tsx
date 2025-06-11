import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2, Download, Send, Euro, Calendar, User } from 'lucide-react';
import { Invoice } from '../../types/billing';
import { getInvoices, deleteInvoice } from '../../utils/billingStorage';
import { useAuth } from '../../contexts/AuthContext';

interface InvoiceListProps {
  onSelectInvoice: (invoice: Invoice) => void;
  onCreateInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  onSelectInvoice,
  onCreateInvoice,
  onEditInvoice
}) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter, typeFilter]);

  const loadInvoices = () => {
    setLoading(true);
    try {
      const allInvoices = getInvoices();
      setInvoices(allInvoices);
    } catch (error) {
      console.error('Errore nel caricamento fatture:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.patientFiscalCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.type === typeFilter);
    }

    setFilteredInvoices(filtered);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    if (invoice.status === 'paid') {
      alert('Non è possibile eliminare una fattura già pagata');
      return;
    }

    if (window.confirm(`Sei sicuro di voler eliminare la fattura ${invoice.number}?`)) {
      deleteInvoice(invoice.id);
      loadInvoices();
    }
  };
  
  const handleDownloadPdf = (invoice: Invoice) => {
    alert(`Funzionalità di download PDF per la fattura ${invoice.number} in fase di implementazione`);
    // In una implementazione reale, qui si genererebbe il PDF
  };
  
  const handleSendInvoice = (invoice: Invoice) => {
    if (invoice.status !== 'draft') {
      alert('Solo le fatture in bozza possono essere inviate');
      return;
    }
    
    if (window.confirm(`Sei sicuro di voler inviare la fattura ${invoice.number}?`)) {
      // Aggiorna lo stato della fattura a "sent"
      const updatedInvoice = { ...invoice, status: 'sent', updatedAt: new Date().toISOString() };
      try {
        const { saveInvoice } = require('../../utils/billingStorage');
        saveInvoice(updatedInvoice);
        loadInvoices();
        alert(`Fattura ${invoice.number} inviata con successo`);
      } catch (error) {
        console.error('Errore nell\'invio fattura:', error);
        alert('Errore nell\'invio della fattura');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'refunded': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
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

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'invoice': return 'Fattura';
      case 'receipt': return 'Ricevuta';
      case 'credit_note': return 'Nota di Credito';
      case 'advance': return 'Acconto';
      case 'deposit': return 'Deposito';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento fatture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Fatture e Documenti</h3>
            <p className="text-sm text-gray-600">
              {filteredInvoices.length} di {invoices.length} documenti
            </p>
          </div>
          <button
            onClick={onCreateInvoice}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuova Fattura
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca per numero, paziente o codice fiscale..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="draft">Bozze</option>
            <option value="sent">Inviate</option>
            <option value="paid">Pagate</option>
            <option value="overdue">Scadute</option>
            <option value="cancelled">Annullate</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">Tutti i tipi</option>
            <option value="invoice">Fatture</option>
            <option value="receipt">Ricevute</option>
            <option value="credit_note">Note di Credito</option>
            <option value="advance">Acconti</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paziente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Importo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="p-2 bg-sky-100 rounded-lg mr-3">
                      <FileText className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.number}</div>
                      <div className="text-sm text-gray-500">{getTypeDisplayName(invoice.type)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{invoice.patientName}</div>
                  <div className="text-sm text-gray-500">{invoice.patientFiscalCode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(invoice.issueDate).toLocaleDateString('it-IT')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Scad: {new Date(invoice.dueDate).toLocaleDateString('it-IT')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">€{invoice.total.toFixed(2)}</div>
                  {invoice.remainingAmount > 0 && (
                    <div className="text-sm text-red-600">
                      Residuo: €{invoice.remainingAmount.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {getStatusDisplayName(invoice.status)}
                  </span>
                  {invoice.isElectronic && (
                    <div className="text-xs text-blue-600 mt-1">Elettronica</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Visualizza"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {invoice.status === 'draft' && (
                      <button
                        onClick={() => onEditInvoice(invoice)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifica"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDownloadPdf(invoice)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Scarica PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    {invoice.status === 'draft' && (
                      <button
                        onClick={() => handleSendInvoice(invoice)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Invia"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={() => handleDeleteInvoice(invoice)}
                        className="text-red-600 hover:text-red-900"
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
        
        {filteredInvoices.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nessuna fattura trovata</p>
            <p className="text-sm">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca'
                : 'Crea la prima fattura per iniziare'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};