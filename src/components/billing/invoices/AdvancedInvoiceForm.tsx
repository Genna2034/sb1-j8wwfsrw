import React, { useState, useEffect } from 'react';
import { 
  X, Save, Plus, Trash2, Calculator, 
  Building, FileText, Calendar, Euro
} from 'lucide-react';
import { AdvancedInvoice, AdvancedInvoiceItem } from '../../../types/billing/advanced';
import { useToast } from '../../../contexts/ToastContext';

interface AdvancedInvoiceFormProps {
  invoice?: AdvancedInvoice | null;
  onSave: (invoice: AdvancedInvoice) => void;
  onClose: () => void;
}

export const AdvancedInvoiceForm: React.FC<AdvancedInvoiceFormProps> = ({
  invoice,
  onSave,
  onClose
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<AdvancedInvoice>>({
    number: '',
    year: new Date().getFullYear(),
    billingEntityId: '',
    contractId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    type: 'invoice',
    items: [],
    subtotal: 0,
    vatBreakdown: [],
    totalVat: 0,
    total: 0,
    payments: [],
    paidAmount: 0,
    remainingAmount: 0,
    paymentTerms: '30 giorni data fattura',
    isElectronic: true,
    transmissionFormat: 'FPA12'
  });

  const [billingEntities, setBillingEntities] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    }
    loadBillingEntities();
    loadContracts();
  }, [invoice]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const loadBillingEntities = async () => {
    // Mock data
    setBillingEntities([
      { id: '1', name: 'Comune di Napoli' },
      { id: '2', name: 'ASL Napoli 1 Centro' },
      { id: '3', name: 'Istituto Comprensivo Statale "Virgilio 4"' },
      { id: '4', name: 'Famiglia Esposito' }
    ]);
  };

  const loadContracts = async () => {
    // Mock data
    setContracts([
      { id: 'contract-1', name: 'Servizi di Assistenza Domiciliare', entityId: '1' },
      { id: 'contract-2', name: 'Servizi di Fisioterapia', entityId: '2' },
      { id: 'contract-3', name: 'Assistenza Scolastica', entityId: '3' }
    ]);
  };

  const calculateTotals = () => {
    if (!formData.items || formData.items.length === 0) {
      setFormData(prev => ({
        ...prev,
        subtotal: 0,
        totalVat: 0,
        total: 0,
        remainingAmount: 0
      }));
      return;
    }

    const subtotal = formData.items.reduce((sum, item) => sum + item.taxableAmount, 0);
    const totalVat = formData.items.reduce((sum, item) => sum + item.vatAmount, 0);
    const total = subtotal + totalVat;

    // Calculate VAT breakdown
    const vatBreakdown: { rate: number; taxable: number; tax: number }[] = [];
    formData.items.forEach(item => {
      const existing = vatBreakdown.find(vat => vat.rate === item.vatRate);
      if (existing) {
        existing.taxable += item.taxableAmount;
        existing.tax += item.vatAmount;
      } else {
        vatBreakdown.push({
          rate: item.vatRate,
          taxable: item.taxableAmount,
          tax: item.vatAmount
        });
      }
    });

    setFormData(prev => ({
      ...prev,
      subtotal,
      totalVat,
      total,
      vatBreakdown,
      remainingAmount: total - (prev.paidAmount || 0)
    }));
  };

  const addItem = () => {
    const newItem: AdvancedInvoiceItem = {
      id: crypto.randomUUID(),
      lineNumber: (formData.items?.length || 0) + 1,
      serviceType: 'nursing',
      description: '',
      quantity: 1,
      unit: 'ora',
      unitPrice: 0,
      discount: 0,
      discountType: 'percentage',
      vatRate: 22,
      vatIncluded: false,
      taxableAmount: 0,
      vatAmount: 0,
      total: 0
    };

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const updateItem = (itemId: string, field: keyof AdvancedInvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate item totals
          const baseAmount = updatedItem.quantity * updatedItem.unitPrice;
          const discountAmount = updatedItem.discountType === 'percentage' 
            ? baseAmount * (updatedItem.discount / 100)
            : updatedItem.discount;
          const taxableAmount = baseAmount - discountAmount;
          const vatAmount = updatedItem.vatIncluded 
            ? taxableAmount * (updatedItem.vatRate / (100 + updatedItem.vatRate))
            : taxableAmount * (updatedItem.vatRate / 100);
          const total = updatedItem.vatIncluded ? taxableAmount : taxableAmount + vatAmount;

          return {
            ...updatedItem,
            taxableAmount: updatedItem.vatIncluded ? taxableAmount - vatAmount : taxableAmount,
            vatAmount,
            total
          };
        }
        return item;
      }) || []
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.billingEntityId) {
      showToast('error', 'Errore', 'Seleziona un cliente');
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      showToast('error', 'Errore', 'Aggiungi almeno un elemento alla fattura');
      return;
    }

    // Generate invoice number if not provided
    if (!formData.number) {
      const year = new Date(formData.issueDate!).getFullYear();
      const number = `FT-${year}/${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`;
      formData.number = number;
    }

    // Calculate due date if not provided
    if (!formData.dueDate) {
      const issueDate = new Date(formData.issueDate!);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30); // Default 30 days
      formData.dueDate = dueDate.toISOString().split('T')[0];
    }

    onSave(formData as AdvancedInvoice);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {invoice ? 'Modifica Fattura' : 'Nuova Fattura'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cliente *
              </label>
              <select
                value={formData.billingEntityId}
                onChange={(e) => setFormData(prev => ({ ...prev, billingEntityId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Seleziona cliente</option>
                {billingEntities.map(entity => (
                  <option key={entity.id} value={entity.id}>{entity.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contratto
              </label>
              <select
                value={formData.contractId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contractId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Nessun contratto</option>
                {contracts
                  .filter(contract => contract.entityId === formData.billingEntityId)
                  .map(contract => (
                    <option key={contract.id} value={contract.id}>{contract.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo Documento
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="invoice">Fattura</option>
                <option value="credit_note">Nota di Credito</option>
                <option value="proforma">Proforma</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Emissione *
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Scadenza
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Termini di Pagamento
              </label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="es. 30 giorni data fattura"
              />
            </div>
          </div>

          {/* Electronic Invoicing */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isElectronic"
                checked={formData.isElectronic}
                onChange={(e) => setFormData(prev => ({ ...prev, isElectronic: e.target.checked }))}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <label htmlFor="isElectronic" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Fatturazione Elettronica
              </label>
            </div>

            {formData.isElectronic && (
              <select
                value={formData.transmissionFormat}
                onChange={(e) => setFormData(prev => ({ ...prev, transmissionFormat: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="FPA12">FPA12 (PA)</option>
                <option value="FPR12">FPR12 (Privati)</option>
              </select>
            )}
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Elementi Fattura</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Elemento
              </button>
            </div>

            <div className="space-y-4">
              {formData.items?.map((item, index) => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descrizione
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                        placeholder="Descrizione servizio"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantità
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prezzo Unitario
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        IVA %
                      </label>
                      <input
                        type="number"
                        value={item.vatRate}
                        onChange={(e) => updateItem(item.id, 'vatRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Rimuovi elemento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Totale: {formatCurrency(item.total)}
                  </div>
                </div>
              ))}

              {(!formData.items || formData.items.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nessun elemento aggiunto. Clicca "Aggiungi Elemento" per iniziare.
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          {formData.items && formData.items.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Imponibile:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(formData.subtotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IVA:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(formData.totalVat || 0)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Totale:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(formData.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvataggio...' : 'Salva Fattura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};