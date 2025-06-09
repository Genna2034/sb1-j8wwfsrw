import React, { useState } from 'react';
import { Save, X, User, Phone, Mail, MapPin, AlertTriangle, Pill, Heart } from 'lucide-react';
import { Patient } from '../../types/medical';
import { generatePatientId } from '../../utils/medicalStorage';

interface PatientFormProps {
  patient?: Patient;
  onSave: (patient: Patient) => void;
  onClose: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ patient, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    personalInfo: {
      name: patient?.personalInfo.name || '',
      surname: patient?.personalInfo.surname || '',
      dateOfBirth: patient?.personalInfo.dateOfBirth || '',
      fiscalCode: patient?.personalInfo.fiscalCode || '',
      address: patient?.personalInfo.address || '',
      city: patient?.personalInfo.city || '',
      postalCode: patient?.personalInfo.postalCode || '',
      phone: patient?.personalInfo.phone || '',
      email: patient?.personalInfo.email || '',
      emergencyContact: {
        name: patient?.personalInfo.emergencyContact.name || '',
        relationship: patient?.personalInfo.emergencyContact.relationship || '',
        phone: patient?.personalInfo.emergencyContact.phone || ''
      }
    },
    medicalInfo: {
      allergies: patient?.medicalInfo.allergies || [],
      chronicConditions: patient?.medicalInfo.chronicConditions || [],
      bloodType: patient?.medicalInfo.bloodType || '',
      height: patient?.medicalInfo.height || '',
      weight: patient?.medicalInfo.weight || '',
      notes: patient?.medicalInfo.notes || ''
    },
    status: patient?.status || 'active' as const
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const patientData: Patient = {
      id: patient?.id || generatePatientId(),
      personalInfo: formData.personalInfo,
      medicalInfo: {
        ...formData.medicalInfo,
        currentMedications: patient?.medicalInfo.currentMedications || [],
        height: formData.medicalInfo.height ? Number(formData.medicalInfo.height) : undefined,
        weight: formData.medicalInfo.weight ? Number(formData.medicalInfo.weight) : undefined
      },
      assignedStaff: patient?.assignedStaff || [],
      createdAt: patient?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: formData.status
    };

    onSave(patientData);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          allergies: [...prev.medicalInfo.allergies, newAllergy.trim()]
        }
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: prev.medicalInfo.allergies.filter((_, i) => i !== index)
      }
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          chronicConditions: [...prev.medicalInfo.chronicConditions, newCondition.trim()]
        }
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        chronicConditions: prev.medicalInfo.chronicConditions.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {patient ? 'Modifica Paziente' : 'Nuovo Paziente'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Personal Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-sky-600" />
              <h4 className="text-lg font-medium text-gray-900">Informazioni Personali</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, name: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.surname}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, surname: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data di Nascita *
                </label>
                <input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codice Fiscale *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.fiscalCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, fiscalCode: e.target.value.toUpperCase() }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  maxLength={16}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono *
                </label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indirizzo *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, address: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Città *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, city: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CAP *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.postalCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, postalCode: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  maxLength={5}
                  required
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="w-5 h-5 text-red-600" />
              <h4 className="text-lg font-medium text-gray-900">Contatto di Emergenza</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.emergencyContact.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      emergencyContact: { ...prev.personalInfo.emergencyContact, name: e.target.value }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parentela *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.emergencyContact.relationship}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      emergencyContact: { ...prev.personalInfo.emergencyContact, relationship: e.target.value }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="es. Figlio, Moglie, Fratello"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono *
                </label>
                <input
                  type="tel"
                  value={formData.personalInfo.emergencyContact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      emergencyContact: { ...prev.personalInfo.emergencyContact, phone: e.target.value }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-medium text-gray-900">Informazioni Mediche</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Medical Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gruppo Sanguigno
                  </label>
                  <select
                    value={formData.medicalInfo.bloodType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      medicalInfo: { ...prev.medicalInfo, bloodType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Seleziona</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="0+">0+</option>
                    <option value="0-">0-</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Altezza (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.medicalInfo.height}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, height: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="175"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.medicalInfo.weight}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, weight: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="70.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stato
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="active">Attivo</option>
                    <option value="inactive">Inattivo</option>
                    <option value="discharged">Dimesso</option>
                  </select>
                </div>
              </div>

              {/* Allergies and Conditions */}
              <div className="space-y-4">
                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergie
                  </label>
                  <div className="space-y-2">
                    {formData.medicalInfo.allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-2">
                        <span className="text-sm text-red-800">{allergy}</span>
                        <button
                          type="button"
                          onClick={() => removeAllergy(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Aggiungi allergia"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                      />
                      <button
                        type="button"
                        onClick={addAllergy}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condizioni Croniche
                  </label>
                  <div className="space-y-2">
                    {formData.medicalInfo.chronicConditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-2">
                        <span className="text-sm text-orange-800">{condition}</span>
                        <button
                          type="button"
                          onClick={() => removeCondition(index)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Aggiungi condizione"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                      />
                      <button
                        type="button"
                        onClick={addCondition}
                        className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note Mediche
              </label>
              <textarea
                value={formData.medicalInfo.notes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  medicalInfo: { ...prev.medicalInfo, notes: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                rows={3}
                placeholder="Note aggiuntive, osservazioni, istruzioni speciali..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              {patient ? 'Salva Modifiche' : 'Crea Paziente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};