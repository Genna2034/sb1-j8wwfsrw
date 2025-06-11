import React, { useState } from 'react';
import { FileText, Download, Send, Edit, Trash2, CheckCircle, XCircle, DollarSign, Calendar, User, Clock, Shield, Bell } from 'lucide-react';
import { Invoice } from '../../types/billing';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { createInvoiceNotification } from '../../utils/notificationUtils';
import { saveInvoice, savePayment, generatePaymentId } from '../../utils/billingStorage';
import { generateInvoicePdf } from '../../utils/pdfGenerator';

interface InvoiceDetailProps {
  invoice: Invoice;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onStatusChange: (status: Invoice['status']) => void;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
  invoice,
  onEdit,
  onDelete,
  onClose,
  onStatusChange
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleStatusChange = async (newStatus: Invoice['status']) => {
    if (window.confirm(`Sei sicuro di voler cambiare lo stato a "${getStatusDisplayName(newStatus)}"?`)) {
      onStatusChange(newStatus);
      
      // Invia notifica di cambio stato
      if (newStatus === 'sent') {
        await createInvoiceNotification(user?.id || '', invoice, 'new');
        showNotification(
          'Fattura inviata',
          `La fattura ${invoice.number} è stata inviata a ${invoice.patientName}`
        );
      } else if (newStatus === 'paid') {
        // Registra un pagamento completo
        const payment = {
          id: generatePaymentId(),
          invoiceId: invoice.id,
          amount: invoice.remainingAmount,
          method: 'bank_transfer',
          date: new Date().toISOString().split('T')[0],
          reference: `Pagamento fattura ${invoice.number}`,
          createdAt: new Date().toISOString(),
          createdBy: user?.id || ''
        };
        
        savePayment(payment);
        
        // Aggiorna lo stato della fattura
        const updatedInvoice = {
          ...invoice,
          status: 'paid',
          paidAmount: invoice.total,
          remainingAmount: 0,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'bank_transfer'
        };
        
        saveInvoice(updatedInvoice);
        
        await createInvoiceNotification(user?.id || '', invoice, 'paid');
        showNotification(
          'Fattura pagata',
          `La fattura ${invoice.number} è stata registrata come pagata`
        );
      } else if (newStatus === 'overdue') {
        await createInvoiceNotification(user?.id || '', invoice, 'overdue');
        showNotification(
          'Fattura scaduta',
          `La fattura ${invoice.number} è stata contrassegnata come scaduta`
        );
      }
    }
  };

  const handleSendReminder = async () => {
    try {
      await createInvoiceNotification(user?.id || '', invoice, 'reminder');
      showNotification(
        'Promemoria inviato',
        `Promemoria di pagamento inviato per la fattura ${invoice.number}`
      );
    } catch (error) {
      console.error('Errore nell\'invio del promemoria:', error);
      alert('Errore nell\'invio del promemoria');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Sei sicuro di voler eliminare questa fattura? Questa azione non può essere annullata.')) {
      onDelete();
    }
  };
  
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      
      // Importa dinamicamente jspdf e jspdf-autotable
      await import('jspdf');
      await import('jspdf-autotable');
      
      // Genera il PDF
      const pdfBlob = await generateInvoicePdf(invoice);
      
      // Crea un URL per il blob e avvia il download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Fattura_${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Pulisci
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      showNotification(
        'PDF Generato',
        `Il PDF della fattura ${invoice.number} è stato scaricato`
      );
    } catch (error) {
      console.error('Errore nella generazione del PDF:', error);
      alert('Errore nella generazione del PDF. Controlla la console per i dettagli.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {getTypeDisplayName(invoice.type)} {invoice.number}
              </h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                  {getStatusDisplayName(invoice.status)}
                </span>
                {invoice.isElectronic && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Elettronica
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Emessa: {new Date(invoice.issueDate).toLocaleDateString('it-IT')}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {invoice.status === 'draft' && (
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifica"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Client and Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Cliente
              </h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-900">{invoice.patientName}</h5>
                <p className="text-sm text-blue-800 mt-1">{invoice.patientFiscalCode}</p>
                <p className="text-sm text-blue-800 mt-1">{invoice.patientAddress}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Dettagli Fattura
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Numero:</span>
                  <span className="font-medium">{invoice.number}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Data Emissione:</span>
                  <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString('it-IT')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Data Scadenza:</span>
                  <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('it-IT')}</span>
                </div>
                {invoice.paymentMethod && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Metodo Pagamento:</span>
                    <span className="font-medium">{getPaymentMethodName(invoice.paymentMethod)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Elementi Fattura
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrizione
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantità
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prezzo Unitario
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sconto
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Totale
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.description}</div>
                        {item.date && (
                          <div className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {item.discount > 0 ? (
                          item.discountType === 'percentage' ? 
                            `${item.discount}%` : 
                            formatCurrency(item.discount)
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-end space-y-2">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotale:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">IVA ({invoice.taxRate}%):</span>
                  <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300">
                  <span className="font-semibold">Totale:</span>
                  <span className="font-bold text-lg">{formatCurrency(invoice.total)}</span>
                </div>
                {invoice.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Pagato:</span>
                      <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Da pagare:</span>
                      <span className="font-medium text-red-600">{formatCurrency(invoice.remainingAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Note:</h5>
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generazione...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Scarica PDF
                </>
              )}
            </button>
            
            {invoice.status === 'draft' && (
              <button
                onClick={() => handleStatusChange('sent')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Invia Fattura
              </button>
            )}
            
            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
              <button
                onClick={() => handleStatusChange('paid')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Segna come Pagata
              </button>
            )}
            
            {invoice.status === 'sent' && new Date(invoice.dueDate) < new Date() && (
              <button
                onClick={() => handleStatusChange('overdue')}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Clock className="w-4 h-4 mr-2" />
                Segna come Scaduta
              </button>
            )}
            
            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
              <button
                onClick={handleSendReminder}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Bell className="w-4 h-4 mr-2" />
                Invia Promemoria
              </button>
            )}
            
            {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Annulla
              </button>
            )}
            
            {invoice.status === 'draft' && (
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Elimina
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};