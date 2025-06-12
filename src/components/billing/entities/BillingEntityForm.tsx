import React, { useState } from 'react';
import { Save, X, Building, Mail, Phone, MapPin, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { BillingEntity, BillingEntityType } from '../../../types/billing/advanced';

interface BillingEntityFormProps {
  entity?: BillingEntity | null;
  onSave: (entity: BillingEntity) => void;
  onClose: () => void;
}

export const BillingEntityForm: React.FC<BillingEntityFormProps> = ({
  entity,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<BillingEntity>>(
    entity || {
      name: '',
      type: 'municipality',
      fiscalCode: '',
      vatNumber: '',
      address: '',
      city: '',
      postalCode: '',
      province: '',
      country: 'Italia',
      email: '',
      phone: '',
      pec: '',
      sdiCode: '',
      paymentTerms: 30,
      isPublicAdministration: false,
      paCode: '',
      contactPerson: '',
      notes: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.fiscalCode || !formData.address || 
        !formData.city || !formData.postalCode || !formData.province || 
        !formData.country || !formData.email || !formData.phone) {
      alert('Compila tutti i campi obbligatori');
      return;
    }
    
    // Validate fiscal code format for Italian entities
    if (formData.country === 'Italia' && !isValidItalianFiscalCode(formData.fiscalCode)) {
      alert('Il codice fiscale inserito non è valido');
      return;
    }
    
    // Validate VAT number if provided
    if (formData.vatNumber && !isValidItalianVatNumber(formData.vatNumber)) {
      alert('La partita IVA inserita non è valida');
      return;
    }
    
    // Validate email format
    if (!isValidEmail(formData.email)) {
      alert('L\'indirizzo email inserito non è valido');
      return;
    }
    
    // Validate PEC if provided
    if (formData.pec && !isValidEmail(formData.pec)) {
      alert('L\'indirizzo PEC inserito non è valido');
      return;
    }
    
    // Validate SDI code if provided
    if (formData.sdiCode && !isValidSdiCode(formData.sdiCode)) {
      alert('Il codice SDI inserito non è valido');
      return;
    }
    
    // Validate PA code if entity is a public administration
    if (formData.isPublicAdministration && !formData.paCode) {
      alert('Il codice IPA è obbligatorio per le pubbliche amministrazioni');
      return;
    }
    
    // Save the entity
    onSave(formData as BillingEntity);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Special handling for type changes
    if (name === 'type') {
      const isPublic = ['municipality', 'school', 'health_authority', 'public_entity'].includes(value);
      setFormData(prev => ({ ...prev, isPublicAdministration: isPublic }));
    }
  };

  // Validation helpers
  const isValidItalianFiscalCode = (fiscalCode: string): boolean => {
    // Simple validation for Italian fiscal code (16 characters)
    return /^[A-Z0-9]{16}$/i.test(fiscalCode);
  };

  const isValidItalianVatNumber = (vatNumber: string): boolean => {
    // Simple validation for Italian VAT number (11 digits)
    return /^\d{11}$/.test(vatNumber);
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidSdiCode = (sdiCode: string): boolean => {
    // SDI code is 7 characters
    return /^[A-Z0-9]{7}$/i.test(sdiCode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {entity ? 'Modifica Cliente' : 'Nuovo Cliente'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Informazioni Generali</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome / Ragione Sociale *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo Cliente *
                </label>
                <select
                  name="type"
                  value={formData.type || 'municipality'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="municipality">Comune</option>
                  <option value="school">Scuola</option>
                  <option value="health_authority">ASL</option>
                  <option value="public_entity">Altro Ente Pubblico</option>
                  <option value="private_family">Famiglia Privata</option>
                  <option value="insurance">Assicurazione</option>
                  <option value="other">Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Codice Fiscale *
                </label>
                <input
                  type="text"
                  name="fiscalCode"
                  value={formData.fiscalCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Partita IVA
                </label>
                <input
                  type="text"
                  name="vatNumber"
                  value={formData.vatNumber || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="isPublicAdministration"
                  name="isPublicAdministration"
                  checked={formData.isPublicAdministration}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="isPublicAdministration" className="text-sm text-gray-700 dark:text-gray-300">
                  Pubblica Amministrazione
                </label>
              </div>
              
              {formData.isPublicAdministration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Codice IPA *
                  </label>
                  <input
                    type="text"
                    name="paCode"
                    value={formData.paCode || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required={formData.isPublicAdministration}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Indirizzo</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Indirizzo *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Città *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CAP *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Provincia *
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Paese *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country || 'Italia'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Contatti</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PEC
                </label>
                <input
                  type="email"
                  name="pec"
                  value={formData.pec || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Codice SDI
                </label>
                <input
                  type="text"
                  name="sdiCode"
                  value={formData.sdiCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Persona di Contatto
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Termini di Pagamento (giorni) *
                </label>
                <input
                  type="number"
                  name="paymentTerms"
                  value={formData.paymentTerms || 30}
                  onChange={handleChange}
                  min={0}
                  max={180}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Informazioni Aggiuntive</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Electronic Invoicing Warning */}
          {!formData.isPublicAdministration && !formData.sdiCode && !formData.pec && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Attenzione</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Non sono stati specificati i dati per la fatturazione elettronica (Codice SDI o PEC).
                    Questi dati sono necessari per l'invio delle fatture elettroniche.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2 inline" />
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              {entity ? 'Salva Modifiche' : 'Crea Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};