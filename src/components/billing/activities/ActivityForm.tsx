import React, { useState, useEffect } from 'react';
import { 
  Save, X, User, Clock, MapPin, FileText, Calendar, 
  CheckSquare, AlertTriangle, Plus, Trash2
} from 'lucide-react';
import { ServiceActivity } from '../../../types/billing/advanced';
import { useAuth } from '../../../contexts/AuthContext';

interface ActivityFormProps {
  activity?: ServiceActivity | null;
  onSave: (activity: ServiceActivity) => void;
  onClose: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  activity,
  onSave,
  onClose
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<ServiceActivity>>(
    activity || {
      staffId: '',
      staffName: '',
      patientId: '',
      patientName: '',
      serviceType: 'nursing',
      category: 'healthcare',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      duration: 60,
      location: '',
      locationDetails: {
        type: 'home',
        name: '',
        address: ''
      },
      status: 'pending',
      notes: '',
      objectives: []
    }
  );
  
  const [staff, setStaff] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [newObjective, setNewObjective] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calculate duration when start or end time changes
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      
      if (durationMinutes > 0) {
        setFormData(prev => ({ ...prev, duration: durationMinutes }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        // Mock staff data
        const mockStaff = [
          { id: '3', name: 'Anna Verdi', position: 'Infermiere' },
          { id: '4', name: 'Marco Bianchi', position: 'Educatore' },
          { id: '5', name: 'Laura Neri', position: 'Fisioterapista' }
        ];
        
        // Mock patients data
        const mockPatients = [
          { id: 'patient-1', name: 'Mario Rossi' },
          { id: 'patient-2', name: 'Giulia Verdi' },
          { id: 'patient-3', name: 'Antonio Esposito' },
          { id: 'patient-4', name: 'Sofia Romano' }
        ];
        
        // Mock contracts data
        const mockContracts = [
          { id: 'contract-1', title: 'Contratto ASL Napoli 1', entity: 'ASL Napoli 1 Centro' },
          { id: 'contract-2', title: 'Contratto Comune di Napoli', entity: 'Comune di Napoli' },
          { id: 'contract-3', title: 'Contratto Scuola Virgilio 4', entity: 'Istituto Comprensivo Virgilio 4' }
        ];
        
        setStaff(mockStaff);
        setPatients(mockPatients);
        setContracts(mockContracts);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading form data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.staffId || !formData.date || !formData.startTime || 
        !formData.endTime || !formData.location || !formData.serviceType) {
      alert('Compila tutti i campi obbligatori');
      return;
    }
    
    // Validate times
    if (formData.startTime >= formData.endTime) {
      alert('L\'ora di fine deve essere successiva all\'ora di inizio');
      return;
    }
    
    // Save the activity
    onSave(formData as ServiceActivity);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Special handling for staff selection
    if (name === 'staffId') {
      const selectedStaff = staff.find(s => s.id === value);
      if (selectedStaff) {
        setFormData(prev => ({ ...prev, staffName: selectedStaff.name }));
      }
    }
    
    // Special handling for patient selection
    if (name === 'patientId') {
      const selectedPatient = patients.find(p => p.id === value);
      if (selectedPatient) {
        setFormData(prev => ({ ...prev, patientName: selectedPatient.name }));
      }
    }
    
    // Special handling for service type
    if (name === 'serviceType') {
      // Set category based on service type
      let category = 'healthcare';
      if (['school_assistance', 'home_education', 'cultural_mediation'].includes(value)) {
        category = 'educational';
      } else if (['disability_support', 'specialized_assistance', 'rehabilitation'].includes(value)) {
        category = 'support';
      }
      
      setFormData(prev => ({ ...prev, category }));
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...(prev.objectives || []), newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activity ? 'Modifica Attività' : 'Nuova Attività'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Caricamento dati...</p>
            </div>
          ) : (
            <>
              {/* Basic Information */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Informazioni Base</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ora Inizio *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ora Fine *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Operatore *
                    </label>
                    <select
                      name="staffId"
                      value={formData.staffId || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Seleziona operatore</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.position}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Utente
                    </label>
                    <select
                      name="patientId"
                      value={formData.patientId || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Seleziona utente</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contratto
                    </label>
                    <select
                      name="contractId"
                      value={formData.contractId || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Seleziona contratto</option>
                      {contracts.map(c => (
                        <option key={c.id} value={c.id}>{c.title} - {c.entity}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <CheckSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Dettagli Servizio</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo Servizio *
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <optgroup label="Socio-sanitario">
                        <option value="nursing">Assistenza Infermieristica</option>
                        <option value="physiotherapy">Fisioterapia</option>
                        <option value="homecare">Assistenza Domiciliare</option>
                        <option value="daycare">Centro Diurno</option>
                        <option value="residential">Residenziale</option>
                      </optgroup>
                      <optgroup label="Educativo-assistenziale">
                        <option value="school_assistance">Assistenza Scolastica</option>
                        <option value="home_education">Educativa Domiciliare</option>
                        <option value="cultural_mediation">Mediazione Culturale</option>
                      </optgroup>
                      <optgroup label="Sostegno">
                        <option value="disability_support">Sostegno Disabilità</option>
                        <option value="specialized_assistance">Assistenza Specialistica</option>
                        <option value="rehabilitation">Riabilitazione</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={formData.category === 'healthcare' ? 'Socio-sanitario' : 
                             formData.category === 'educational' ? 'Educativo-assistenziale' : 
                             formData.category === 'support' ? 'Sostegno' : ''}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Luogo *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="es. Domicilio, Scuola, Centro"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo Luogo
                    </label>
                    <select
                      name="locationDetails.type"
                      value={formData.locationDetails?.type || 'home'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="home">Domicilio</option>
                      <option value="school">Scuola</option>
                      <option value="facility">Struttura</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dettagli Luogo
                    </label>
                    <input
                      type="text"
                      name="locationDetails.name"
                      value={formData.locationDetails?.name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-2"
                      placeholder="Nome del luogo"
                    />
                    <input
                      type="text"
                      name="locationDetails.address"
                      value={formData.locationDetails?.address || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Indirizzo completo"
                    />
                  </div>
                </div>
              </div>

              {/* Objectives and Notes */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Obiettivi e Note</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Obiettivi
                    </label>
                    <div className="space-y-2">
                      {formData.objectives?.map((objective, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{objective}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveObjective(index)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newObjective}
                          onChange={(e) => setNewObjective(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Aggiungi un obiettivo"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
                        />
                        <button
                          type="button"
                          onClick={handleAddObjective}
                          className="px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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
                      placeholder="Note aggiuntive sull'attività..."
                    />
                  </div>
                </div>
              </div>

              {/* Duration Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="font-medium text-blue-900 dark:text-blue-300">
                      Durata Attività
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {formData.duration ? (formData.duration / 60).toFixed(1) : 0} ore
                  </span>
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
                  {activity ? 'Salva Modifiche' : 'Crea Attività'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};