import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Calculator, User, Calendar, Euro } from 'lucide-react';
import { Invoice, InvoiceItem } from '../../types/billing';
import { Patient } from '../../types/medical';
import { Appointment } from '../../types/appointments';
import { getPatients } from '../../utils/medicalStorage';
import { getAppointments } from '../../utils/appointmentStorage';
import { generateInvoiceId, getBillingSettings } from '../../utils/billingStorage';
import { useAuth } from '../../contexts/AuthContext';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSave: (invoice: Invoice) => void;
  onClose: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onSave,
  onClose
}) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patientId: invoice?.patientId || '',
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || '',
    type: invoice?.type || 'invoice' as Invoice['type'],
    status: invoice?.status || 'draft' as Invoice['status'],
    notes: invoice?.notes || '',
    paymentMethod: invoice?.paymentMethod || undefined,
    items: invoice?.items || [] as InvoiceItem[]
  });

  useEffect(() => {
    loadData();
    if (!invoice) {
      calculateDueDate();
    }
  }, []);

  useEffect(() => {
    if (formData.patientId) {
      loadPatientAppointments();
    }
  }, [formData.patientId]);

  const loadData = () => {
    const allPatients = getPatients();
    setPatients(allPatients);
  };

  const loadPatientAppointments = () => {
    const patientAppointments = getAppointments({ 
      patientId: formData.patientId,
      status: 'completed'
    }).filter(apt => apt.cost && apt.cost > 0);
    setAppointments(patientAppointments);
  };

  const calculateDueDate = () => {
    const settings = getBillingSettings();
    const dueDate = new Date(formData.issueDate);
    dueDate.setDate(dueDate.getDate() + settings.invoiceSettings.defaultPaymentTerms);
    setFormData(prev => ({ ...prev, dueDate: dueDate.toISOString().split('T')[0] }));
  };

  const addItemFromAppointment = (appointment: Appointment) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: `${getServiceTypeDisplayName(appointment.type)} - ${appointment.patientName}`,
      serviceType: mapAppointmentTypeToService(appointment.type),
      appointmentId: appointment.id,
      quantity: 1,
      unitPrice: appointment.cost || 50,
      discount: 0,
      discountType: 'percentage',
      taxRate: 22,
      total: appointment.cost || 50,
      date: appointment.date,
      staffId: appointment.staffId,
      staffName: appointment.staffName
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const addCustomItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      serviceType: 'other',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      discountType: 'percentage',
      taxRate: 22,
      total: 0,
      date: formData.issueDate
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (itemId: string, updates: Partial<InvoiceItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, ...updates };
          
          // Recalculate total
          let total = updatedItem.quantity * updatedItem.unitPrice;
          if (updatedItem.discount > 0) {
            if (updatedItem.discountType === 'percentage') {
              total = total * (1 - updatedItem.discount / 100);
            } else {
              total = total - updatedItem.discount;
            }
          }
          updatedItem.total = Math.max(0, total);
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * 0.22; // Default 22% VAT
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      if (!selectedPatient) {
        alert('Seleziona un paziente');
        return;
      }

      if (formData.items.length === 0) {
        alert('Aggiungi almeno un elemento alla fattura');
        return;
      }

      const { subtotal, taxAmount, total } = calculateTotals();
      const settings = getBillingSettings();

      const invoiceData: Invoice = {
        id: invoice?.id || generateInvoiceId(),
        number: invoice?.number || `${settings.invoiceSettings.prefix}${settings.invoiceSettings.nextInvoiceNumber.toString().padStart(4, '0')}`,
        patientId: formData.patientId,
        patientName: `${selectedPatient.personalInfo.name} ${selectedPatient.personalInfo.surname}`,
        patientFiscalCode: selectedPatient.personalInfo.fiscalCode,
        patientAddress: `${selectedPatient.personalInfo.address}, ${selectedPatient.personalInfo.city} ${selectedPatient.personalInfo.postalCode}`,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        status: formData.status,
        type: formData.type,
        items: formData.items,
        subtotal,
        taxRate: 22,
        taxAmount,
        total,
        paidAmount: invoice?.paidAmount || 0,
        remainingAmount: total - (invoice?.paidAmount || 0),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        createdAt: invoice?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.id || '',
        isElectronic: settings.invoiceSettings.enableElectronicInvoicing
      };

      onSave(invoiceData);
    } catch (error) {
      console.error('Errore nel salvataggio fattura:', error);
      alert('Errore nel salvataggio della fattura');
    } finally {
      setLoading(false);
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

  const mapAppointmentTypeToService = (type: string): InvoiceItem['serviceType'] => {
    switch (type) {
      case 'visit': return 'visit';
      case 'therapy': return 'therapy';
      case 'consultation': return 'consultation';
      default: return 'other';
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {invoice ? 'Modifica Fattura' : 'Nuova Fattura'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paziente *
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              >
                <option value="">Seleziona paziente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.personalInfo.name} {patient.personalInfo.surname} - {patient.personalInfo.fiscalCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Documento
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="invoice">Fattura</option>
                <option value="receipt">Ricevuta</option>
                <option value="credit_note">Nota di Credito</option>
                <option value="advance">Acconto</option>
                <option value="deposit">Deposito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Emissione *
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, issueDate: e.target.value }));
                  calculateDueDate();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Scadenza *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Elementi Fattura</h4>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Elemento Personalizzato
                </button>
              </div>
            </div>

            {/* Available Appointments */}
            {appointments.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Appuntamenti Disponibili per Fatturazione</h5>
                <div className="space-y-2">
                  {appointments.filter(apt => !formData.items.some(item => item.appointmentId === apt.id)).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{getServiceTypeDisplayName(apt.type)}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {new Date(apt.date).toLocaleDateString('it-IT')} - €{apt.cost?.toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addItemFromAppointment(apt)}
                        className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Aggiungi
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrizione
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Descrizione servizio"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantità
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prezzo Unitario
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sconto
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, { discount: Number(e.target.value) })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                        <select
                          value={item.discountType}
                          onChange={(e) => updateItem(item.id, { discountType: e.target.value as any })}
                          className="px-2 py-2 border-l-0 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        >
                          <option value="percentage">%</option>
                          <option value="fixed">€</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Totale
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium">
                          €{item.total.toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nessun elemento aggiunto</p>
                  <p className="text-sm">Aggiungi elementi dalla lista appuntamenti o crea elementi personalizzati</p>
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          {formData.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Riepilogo Importi</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotale:</span>
                  <span className="font-medium">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (22%):</span>
                  <span className="font-medium">€{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Totale:</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={3}
              placeholder="Note aggiuntive per la fattura..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              disabled={loading || formData.items.length === 0}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {invoice ? 'Salva Modifiche' : 'Crea Fattura'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};