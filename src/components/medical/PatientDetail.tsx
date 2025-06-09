import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Mail, MapPin, Calendar, AlertTriangle, 
  Pill, Activity, FileText, Clock, Plus, Edit, Save, X,
  Heart, Thermometer, Droplets, Weight
} from 'lucide-react';
import { Patient, MedicalRecord, VitalSigns } from '../../types/medical';
import { getMedicalRecords, saveMedicalRecord, generateRecordId } from '../../utils/medicalStorage';
import { useAuth } from '../../contexts/AuthContext';

interface PatientDetailProps {
  patient: Patient;
  onEdit: () => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onEdit }) => {
  const { user } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'vitals' | 'medications'>('overview');

  useEffect(() => {
    loadMedicalRecords();
  }, [patient.id]);

  const loadMedicalRecords = () => {
    const records = getMedicalRecords(patient.id);
    setMedicalRecords(records.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()));
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'visit': return <User className="w-4 h-4" />;
      case 'therapy': return <Activity className="w-4 h-4" />;
      case 'measurement': return <Heart className="w-4 h-4" />;
      case 'medication': return <Pill className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'visit': return 'bg-blue-100 text-blue-800';
      case 'therapy': return 'bg-green-100 text-green-800';
      case 'measurement': return 'bg-purple-100 text-purple-800';
      case 'medication': return 'bg-orange-100 text-orange-800';
      case 'note': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLatestVitals = (): VitalSigns | null => {
    const recordsWithVitals = medicalRecords.filter(r => r.vitals);
    if (recordsWithVitals.length === 0) return null;
    return recordsWithVitals[0].vitals || null;
  };

  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: User },
    { id: 'records', label: 'Diario Clinico', icon: FileText },
    { id: 'vitals', label: 'Parametri Vitali', icon: Heart },
    { id: 'medications', label: 'Terapie', icon: Pill }
  ];

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-sky-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {patient.personalInfo.name} {patient.personalInfo.surname}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>{calculateAge(patient.personalInfo.dateOfBirth)} anni</span>
                <span>•</span>
                <span>{patient.personalInfo.fiscalCode}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  patient.status === 'active' ? 'bg-green-100 text-green-800' :
                  patient.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {patient.status === 'active' ? 'Attivo' : 
                   patient.status === 'inactive' ? 'Inattivo' : 'Dimesso'}
                </span>
              </div>
            </div>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'coordinator') && (
            <button
              onClick={onEdit}
              className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifica
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni di Contatto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Telefono</p>
                      <p className="text-sm text-gray-600">{patient.personalInfo.phone}</p>
                    </div>
                  </div>
                  
                  {patient.personalInfo.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{patient.personalInfo.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Indirizzo</p>
                      <p className="text-sm text-gray-600">
                        {patient.personalInfo.address}, {patient.personalInfo.city} {patient.personalInfo.postalCode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Data di Nascita</p>
                      <p className="text-sm text-gray-600">
                        {new Date(patient.personalInfo.dateOfBirth).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contatto di Emergenza</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        {patient.personalInfo.emergencyContact.name}
                      </p>
                      <p className="text-sm text-red-700">
                        {patient.personalInfo.emergencyContact.relationship} • {patient.personalInfo.emergencyContact.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allergies */}
                {patient.medicalInfo.allergies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergie</h3>
                    <div className="space-y-2">
                      {patient.medicalInfo.allergies.map((allergy, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-900">{allergy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chronic Conditions */}
                {patient.medicalInfo.chronicConditions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Condizioni Croniche</h3>
                    <div className="space-y-2">
                      {patient.medicalInfo.chronicConditions.map((condition, index) => (
                        <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <span className="text-sm font-medium text-orange-900">{condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Diario Clinico</h3>
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Annotazione
                </button>
              </div>

              <div className="space-y-4">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getRecordTypeColor(record.type)}`}>
                          {getRecordTypeIcon(record.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{record.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{new Date(record.date).toLocaleDateString('it-IT')}</span>
                            <span>{record.time}</span>
                            <span>•</span>
                            <span>{record.staffName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{record.description}</p>
                    
                    {record.vitals && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium text-gray-900 mb-2">Parametri Vitali</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {record.vitals.bloodPressure && (
                            <div>
                              <span className="text-gray-600">Pressione:</span>
                              <span className="ml-1 font-medium">
                                {record.vitals.bloodPressure.systolic}/{record.vitals.bloodPressure.diastolic}
                              </span>
                            </div>
                          )}
                          {record.vitals.heartRate && (
                            <div>
                              <span className="text-gray-600">Battiti:</span>
                              <span className="ml-1 font-medium">{record.vitals.heartRate} bpm</span>
                            </div>
                          )}
                          {record.vitals.temperature && (
                            <div>
                              <span className="text-gray-600">Temperatura:</span>
                              <span className="ml-1 font-medium">{record.vitals.temperature}°C</span>
                            </div>
                          )}
                          {record.vitals.weight && (
                            <div>
                              <span className="text-gray-600">Peso:</span>
                              <span className="ml-1 font-medium">{record.vitals.weight} kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {medicalRecords.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessuna annotazione clinica</p>
                    <p className="text-sm">Aggiungi la prima annotazione per iniziare</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vitals Tab */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Parametri Vitali</h3>
              
              {(() => {
                const latestVitals = getLatestVitals();
                if (!latestVitals) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nessun parametro vitale registrato</p>
                      <p className="text-sm">Aggiungi una misurazione per visualizzare i dati</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {latestVitals.bloodPressure && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Heart className="w-8 h-8 text-red-600" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Pressione</p>
                            <p className="text-lg font-bold text-red-800">
                              {latestVitals.bloodPressure.systolic}/{latestVitals.bloodPressure.diastolic}
                            </p>
                            <p className="text-xs text-red-600">mmHg</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {latestVitals.heartRate && (
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Activity className="w-8 h-8 text-pink-600" />
                          <div>
                            <p className="text-sm font-medium text-pink-900">Battiti</p>
                            <p className="text-lg font-bold text-pink-800">{latestVitals.heartRate}</p>
                            <p className="text-xs text-pink-600">bpm</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {latestVitals.temperature && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Thermometer className="w-8 h-8 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium text-orange-900">Temperatura</p>
                            <p className="text-lg font-bold text-orange-800">{latestVitals.temperature}</p>
                            <p className="text-xs text-orange-600">°C</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {latestVitals.weight && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Weight className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Peso</p>
                            <p className="text-lg font-bold text-blue-800">{latestVitals.weight}</p>
                            <p className="text-xs text-blue-600">kg</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Terapie Attuali</h3>
              
              <div className="space-y-3">
                {patient.medicalInfo.currentMedications.map((medication) => (
                  <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Pill className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{medication.name}</h4>
                          <p className="text-sm text-gray-600">
                            {medication.dosage} • {medication.frequency}
                          </p>
                          <p className="text-xs text-gray-500">
                            Prescritto da: {medication.prescribedBy}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>Dal: {new Date(medication.startDate).toLocaleDateString('it-IT')}</p>
                        {medication.endDate && (
                          <p>Al: {new Date(medication.endDate).toLocaleDateString('it-IT')}</p>
                        )}
                      </div>
                    </div>
                    {medication.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{medication.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {patient.medicalInfo.currentMedications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessuna terapia attiva</p>
                    <p className="text-sm">Le terapie verranno visualizzate qui quando prescritte</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Medical Record Modal */}
      {showAddRecord && (
        <AddMedicalRecordModal
          patientId={patient.id}
          onSave={(record) => {
            saveMedicalRecord(record);
            loadMedicalRecords();
            setShowAddRecord(false);
          }}
          onClose={() => setShowAddRecord(false)}
        />
      )}
    </div>
  );
};

// Add Medical Record Modal Component
const AddMedicalRecordModal: React.FC<{
  patientId: string;
  onSave: (record: MedicalRecord) => void;
  onClose: () => void;
}> = ({ patientId, onSave, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'note' as MedicalRecord['type'],
    title: '',
    description: '',
    vitals: {
      bloodPressure: { systolic: '', diastolic: '' },
      heartRate: '',
      temperature: '',
      weight: '',
      bloodSugar: '',
      notes: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const record: MedicalRecord = {
      id: generateRecordId(),
      patientId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      type: formData.type,
      title: formData.title,
      description: formData.description,
      staffId: user?.id || '',
      staffName: user?.name || '',
      vitals: formData.type === 'measurement' ? {
        bloodPressure: formData.vitals.bloodPressure.systolic && formData.vitals.bloodPressure.diastolic ? {
          systolic: Number(formData.vitals.bloodPressure.systolic),
          diastolic: Number(formData.vitals.bloodPressure.diastolic)
        } : undefined,
        heartRate: formData.vitals.heartRate ? Number(formData.vitals.heartRate) : undefined,
        temperature: formData.vitals.temperature ? Number(formData.vitals.temperature) : undefined,
        weight: formData.vitals.weight ? Number(formData.vitals.weight) : undefined,
        bloodSugar: formData.vitals.bloodSugar ? Number(formData.vitals.bloodSugar) : undefined,
        notes: formData.vitals.notes || undefined
      } : undefined
    };

    onSave(record);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Nuova Annotazione Clinica</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Annotazione
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              >
                <option value="note">Nota Generale</option>
                <option value="visit">Visita</option>
                <option value="therapy">Terapia</option>
                <option value="measurement">Misurazione</option>
                <option value="medication">Somministrazione Farmaco</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          {formData.type === 'measurement' && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Parametri Vitali</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pressione Sistolica
                  </label>
                  <input
                    type="number"
                    value={formData.vitals.bloodPressure.systolic}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vitals: {
                        ...prev.vitals,
                        bloodPressure: { ...prev.vitals.bloodPressure, systolic: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pressione Diastolica
                  </label>
                  <input
                    type="number"
                    value={formData.vitals.bloodPressure.diastolic}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vitals: {
                        ...prev.vitals,
                        bloodPressure: { ...prev.vitals.bloodPressure, diastolic: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Battiti (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.vitals.heartRate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vitals: { ...prev.vitals, heartRate: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="72"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitals.temperature}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vitals: { ...prev.vitals, temperature: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="36.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitals.weight}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vitals: { ...prev.vitals, weight: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="70.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Glicemia (mg/dl)
                  </label>
                  <input
                    type="number"
                    value={formData.vitals.bloodSugar}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vitals: { ...prev.vitals, bloodSugar: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
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
              Salva Annotazione
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};