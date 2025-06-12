import React, { useState } from 'react';
import { 
  FileText, Download, Send, Edit, X, CheckCircle, XCircle, 
  Calendar, User, Clock, Euro, CreditCard, Printer, FileSpreadsheet,
  AlertTriangle, Building, Mail, Phone
} from 'lucide-react';
import { AdvancedInvoice } from '../../../types/billing/advanced';

interface AdvancedInvoiceDetailProps {
  invoice: AdvancedInvoice;
  onEdit: () => void;
  onSend: () => void;
  onMarkAsPaid: () => void;
  onClose: () => void;
}

export const AdvancedInvoiceDetail: React.FC<AdvancedInvoiceDetailProps> = ({
  invoice,
  onEdit,
  onSend,
  onMarkAsPaid,
  onClose
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(invoice.remainingAmount.toString());
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');

  const handleAddPayment = () => {
    // In a real implementation, this would call an API
    // For now, we'll just close the form
    setShowPaymentForm(false);
    onMarkAsPaid();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getPaymentMethodText = (method: string): string => {
    switch (method) {
      case 'bank_transfer': return 'Bonifico Bancario';
      case 'cash': return 'Contanti';
      case 'check': return 'Assegno';
      case 'credit_card': return 'Carta di Credito';
      case 'direct_debit': return 'Addebito Diretto';
      case 'other': return 'Altro';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {invoice.type === 'invoice' ? 'Fattura' : 
                 invoice.type === 'credit_note' ? 'Nota di Credito' : 'Proforma'} {invoice.number}
              </h3>
              <div className="flex items-center mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                  {getStatusText(invoice.status)}
                </span>
                {invoice.isElectronic && (
                  <>
                    <span className="mx-2 text-gray-400 dark:text-gray-500">•</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransmissionStatusColor(invoice.transmissionStatus || 'pending')}`}>
                      {getTransmissionStatusText(invoice.transmissionStatus || 'pending')}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {invoice.status === 'draft' && (
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Modifica"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Cliente
              </h4>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {/* In a real implementation, this would fetch the entity name */}
                    {invoice.billingEntityId === '1' ? 'Comune di Napoli' :
                     invoice.billingEntityId === '2' ? 'ASL Napoli 1 Centro' :
                     invoice.billingEntityId === '3' ? 'Istituto Comprensivo Statale "Virgilio 4"' :
                     invoice.billingEntityId === '4' ? 'Famiglia Esposito' : 'Cliente'}
                  </div>
                  
                  <div className="text-xs text-blue-800 dark:text-blue-300">
                    {/* Mock address */}
                    {invoice.billingEntityId === '1' ? 'Piazza Municipio, 1, 80100 Napoli (NA)' :
                     invoice.billingEntityId === '2' ? 'Via Comunale del Principe, 13/A, 80145 Napoli (NA)' :
                     invoice.billingEntityId === '3' ? 'Via A. Labriola, 10/H, 80144 Napoli (NA)' :
                     invoice.billingEntityId === '4' ? 'Via Toledo, 45, 80134 Napoli (NA)' : 'Indirizzo cliente'}
                  </div>
                  
                  <div className="text-xs text-blue-800 dark:text-blue-300">
                    {/* Mock fiscal code */}
                    Cod. Fiscale: {invoice.billingEntityId === '1' ? '80014890638' :
                                  invoice.billingEntityId === '2' ? '06328131211' :
                                  invoice.billingEntityId === '3' ? '80103400635' :
                                  invoice.billingEntityId === '4' ? 'SPSRRT80A01F839W' : 'XXXXXXXXXXXXXXXX'}
                  </div>
                  
                  {invoice.isElectronic && (
                    <div className="text-xs text-blue-800 dark:text-blue-300">
                      {invoice.sdiIdentifier && `Codice SDI: ${invoice.sdiIdentifier}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Date
              </h4>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800 dark:text-green-300">Data Emissione:</span>
                    <span className="text-sm font-medium text-green-900 dark:text-green-200">
                      {new Date(invoice.issueDate).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800 dark:text-green-300">Data Scadenza:</span>
                    <span className="text-sm font-medium text-green-900 dark:text-green-200">
                      {new Date(invoice.dueDate).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  
                  {invoice.sentAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-green-800 dark:text-green-300">Data Invio:</span>
                      <span className="text-sm font-medium text-green-900 dark:text-green-200">
                        {new Date(invoice.sentAt).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                  
                  {invoice.transmissionDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-green-800 dark:text-green-300">Data Trasmissione:</span>
                      <span className="text-sm font-medium text-green-900 dark:text-green-200">
                        {new Date(invoice.transmissionDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Euro className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Importi
              </h4>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-800 dark:text-purple-300">Imponibile:</span>
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                      {formatCurrency(invoice.subtotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-800 dark:text-purple-300">IVA:</span>
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                      {formatCurrency(invoice.totalVat)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t border-purple-200 dark:border-purple-700">
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Totale:</span>
                    <span className="text-sm font-bold text-purple-900 dark:text-purple-200">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                  
                  {invoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-800 dark:text-purple-300">Pagato:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(invoice.paidAmount)}
                        </span>
                      </div>
                      
                      {invoice.remainingAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-purple-800 dark:text-purple-300">Da pagare:</span>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            {formatCurrency(invoice.remainingAmount)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              Dettaglio Voci
            </h4>
            
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descrizione
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Periodo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantità
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Prezzo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      IVA
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Totale
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.lineNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.period ? (
                          <>
                            {new Date(item.period.startDate).toLocaleDateString('it-IT')} - {new Date(item.period.endDate).toLocaleDateString('it-IT')}
                          </>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {item.vatRate}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm font-medium text-right text-gray-700 dark:text-gray-300">
                      Imponibile:
                    </td>
                    <td colSpan={2} className="px-4 py-3 text-sm font-medium text-right text-gray-900 dark:text-white">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                  </tr>
                  {invoice.vatBreakdown.map((vat, index) => (
                    <tr key={index}>
                      <td colSpan={5} className="px-4 py-3 text-sm font-medium text-right text-gray-700 dark:text-gray-300">
                        IVA {vat.rate}%:
                      </td>
                      <td colSpan={2} className="px-4 py-3 text-sm font-medium text-right text-gray-900 dark:text-white">
                        {formatCurrency(vat.tax)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm font-bold text-right text-gray-700 dark:text-gray-300">
                      Totale:
                    </td>
                    <td colSpan={2} className="px-4 py-3 text-sm font-bold text-right text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Information */}
          {invoice.payments.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                Pagamenti
              </h4>
              
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Metodo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Riferimento
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Importo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {invoice.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(payment.date).toLocaleDateString('it-IT')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {getPaymentMethodText(payment.method)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {payment.reference || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-green-600 dark:text-green-400">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right text-gray-700 dark:text-gray-300">
                        Totale Pagato:
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-right text-green-600 dark:text-green-400">
                        {formatCurrency(invoice.paidAmount)}
                      </td>
                    </tr>
                    {invoice.remainingAmount > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right text-gray-700 dark:text-gray-300">
                          Da Pagare:
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-right text-red-600 dark:text-red-400">
                          {formatCurrency(invoice.remainingAmount)}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Electronic Invoice Information */}
          {invoice.isElectronic && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Send className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                Fatturazione Elettronica
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Formato: {invoice.transmissionFormat}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Codice Destinatario: {invoice.sdiIdentifier}
                      </span>
                    </div>
                    
                    {invoice.transmissionReference && (
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Riferimento: {invoice.transmissionReference}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Stato: {getTransmissionStatusText(invoice.transmissionStatus || 'pending')}
                      </span>
                    </div>
                    
                    {invoice.transmissionDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Data Trasmissione: {new Date(invoice.transmissionDate).toLocaleString('it-IT')}
                        </span>
                      </div>
                    )}
                    
                    {invoice.transmissionErrorMessage && (
                      <div className="flex items-start">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                          Errore: {invoice.transmissionErrorMessage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {showPaymentForm && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Registra Pagamento</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    Importo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-green-900/30 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    Metodo di Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-green-900/30 dark:text-white"
                  >
                    <option value="bank_transfer">Bonifico Bancario</option>
                    <option value="cash">Contanti</option>
                    <option value="check">Assegno</option>
                    <option value="credit_card">Carta di Credito</option>
                    <option value="direct_debit">Addebito Diretto</option>
                    <option value="other">Altro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    Riferimento
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-green-900/30 dark:text-white"
                    placeholder="es. Numero bonifico, transazione..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleAddPayment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Registra Pagamento
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                Note
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {invoice.status === 'draft' && (
              <>
                <button
                  onClick={onEdit}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifica
                </button>
                
                <button
                  onClick={onSend}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Invia
                </button>
              </>
            )}
            
            {(invoice.status === 'sent' || invoice.status === 'delivered' || invoice.status === 'overdue') && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Registra Pagamento
              </button>
            )}
            
            <button
              onClick={() => {/* Download PDF action */}}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Scarica PDF
            </button>
            
            <button
              onClick={() => {/* Print action */}}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Stampa
            </button>
            
            {invoice.isElectronic && (
              <button
                onClick={() => {/* Download XML action */}}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Scarica XML
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};