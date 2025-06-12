import React, { useState, useEffect } from 'react';
import { 
  Save, X, FileText, Calendar, Building, Euro, 
  Clock, AlertTriangle, Plus, Trash2
} from 'lucide-react';
import { ServiceContract, ServiceCategory } from '../../../types/billing/advanced';
import { useToast } from '../../../contexts/ToastContext';

interface ServiceContractFormProps {
  contract?: ServiceContract | null;
  onSave: (contract: ServiceContract) => void;
  onClose: () => void;
}

export const ServiceContractForm: React.FC<ServiceContractFormProps> = ({
  contract,
  onSave,
  onClose
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<ServiceContract>>(
    contract || {
      billingEntityId: '',
      title: '',
      description: '',
      category: 'healthcare',
      serviceTypes: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      billingType: 'hourly',
      billingFrequency: 'monthly',
      autoRenew: false,
      referenceNumber: '',
      notes: ''
    }
  );
  
  const [billingEntities, setBillingEntities] = useState<any[]>([]);
  const [newServiceType, setNewServiceType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBillingEntities();
  }, []);

  const loadBillingEntities = async () => {
    // Mock data
    setBillingEntities([
      { id: '1', name: 'Comune di Napoli' },
      { id: '2', name: 'ASL Napoli 1 Centro' },
      { id: '3', name: 'Istituto Comprensivo Statale "Virgilio 4"' },
      { id: '4', name: 'Famiglia Esposito' }
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.billingEntityId || !formData.title || !formData.startDate || !formData.endDate) {
      showToast('error', 'Errore', 'Compila tutti i campi obbligatori');
      return;
    }
    
    // Validate dates
    if (new Date(formData.startDate!) > new Date(formData.endDate!)) {
      showToast('error', 'Errore', 'La data di fine deve essere successiva alla data di inizio');
      return;
    }
    
    // Save the contract
    onSave(formData as ServiceContract);
  };

  const handleAddServiceType = () => {
    if (newServiceType.trim() && !formData.serviceTypes?.includes(newServiceType.trim())) {
      setFormData(prev => ({
        ...prev,
        serviceTypes: [...(prev.serviceTypes || []), newServiceType.trim()]
      }));
      setNewServiceType('');
    }
  };

  const handleRemoveServiceType = (serviceType: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes?.filter(type => type !== serviceType) || []
    }));
  };

  const getCategoryLabel = (category: ServiceCategory): string => {
    switch (category) {
      case 'healthcare': return 'Socio-sanitario';
      case 'educational': return 'Educativo-assistenziale';
      case 'support': return 'Sostegno';
      default: return category;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {contract ? 'Modifica Contratto' : 'Nuovo Contratto'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Informazioni Base</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente *
                </label>
                <select
                  value={formData.billingEntityId || ''}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numero di Riferimento
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="es. Determina, Protocollo, ecc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titolo Contratto *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Dettagli Servizio</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.category || 'healthcare'}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="healthcare">Socio-sanitario</option>
                  <option value="educational">Educativo-assistenziale</option>
                  <option value="support">Sostegno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stato
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Attivo</option>
                  <option value="pending">In attesa</option>
                  <option value="expired">Scaduto</option>
                  <option value="terminated">Terminato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo Fatturazione
                </label>
                <select
                  value={formData.billingType || 'hourly'}
                  onChange={(e) => setFormData(prev => ({ ...prev, billingType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="hourly">Oraria</option>
                  <option value="daily">Giornaliera</option>
                  <option value="monthly">Mensile</option>
                  <option value="fixed">Importo Fisso</option>
                  <option value="per_service">Per Servizio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequenza Fatturazione
                </label>
                <select
                  value={formData.billingFrequency || 'monthly'}
                  onChange={(e) => setFormData(prev => ({ ...prev, billingFrequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="monthly">Mensile</option>
                  <option value="quarterly">Trimestrale</option>
                  <option value="biweekly">Quindicinale</option>
                  <option value="weekly">Settimanale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Inizio *
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Fine *
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Service Types */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Euro className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Tipi di Servizio</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Aggiungi tipo di servizio"
                />
                <button
                  type="button"
                  onClick={handleAddServiceType}
                  className="px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.serviceTypes?.map((serviceType) => (
                  <div 
                    key={serviceType} 
                    className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{serviceType}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveServiceType(serviceType)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {(!formData.serviceTypes || formData.serviceTypes.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nessun tipo di servizio aggiunto. Aggiungi almeno un tipo di servizio.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Informazioni Aggiuntive</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={formData.autoRenew || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                />
                <label htmlFor="autoRenew" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Rinnovo Automatico
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Note aggiuntive sul contratto..."
                />
              </div>
            </div>
          </div>

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
              {contract ? 'Salva Modifiche' : 'Crea Contratto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};