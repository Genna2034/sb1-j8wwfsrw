import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, Calendar, AlertCircle, Edit, Eye, Filter, Users } from 'lucide-react';
import { Patient } from '../../types/medical';
import { getPatients } from '../../utils/medicalStorage';
import { useAuth } from '../../contexts/AuthContext';

interface PatientListProps {
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: () => void;
  selectedPatientId?: string;
}

export const PatientList: React.FC<PatientListProps> = ({ 
  onSelectPatient, 
  onAddPatient, 
  selectedPatientId 
}) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'discharged'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [user]);

  const loadPatients = () => {
    setLoading(true);
    try {
      const allPatients = getPatients();
      
      // Filtra pazienti in base al ruolo
      let filteredPatients = allPatients;
      if (user?.role === 'staff') {
        // Staff vede solo i pazienti assegnati
        filteredPatients = allPatients.filter(patient => 
          patient.assignedStaff.includes(user.id)
        );
      }
      
      setPatients(filteredPatients);
    } catch (error) {
      console.error('Errore nel caricamento pazienti:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.personalInfo.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.personalInfo.fiscalCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'discharged': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'discharged': return 'Dimesso';
      default: return status;
    }
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento pazienti...</p>
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
            <h3 className="text-lg font-semibold text-gray-900">Pazienti</h3>
            <p className="text-sm text-gray-600">
              {filteredPatients.length} di {patients.length} pazienti
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'coordinator') && (
            <button
              onClick={onAddPatient}
              className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Paziente
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca per nome, cognome o codice fiscale..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
            <option value="discharged">Dimessi</option>
          </select>
        </div>
      </div>

      {/* Patient List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => onSelectPatient(patient)}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedPatientId === patient.id ? 'bg-sky-50 border-r-4 border-sky-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-sky-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {patient.personalInfo.name} {patient.personalInfo.surname}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{calculateAge(patient.personalInfo.dateOfBirth)} anni</span>
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {patient.personalInfo.phone}
                    </span>
                  </div>
                  {patient.medicalInfo.chronicConditions.length > 0 && (
                    <div className="flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 text-orange-500 mr-1" />
                      <span className="text-xs text-orange-600">
                        {patient.medicalInfo.chronicConditions.slice(0, 2).join(', ')}
                        {patient.medicalInfo.chronicConditions.length > 2 && '...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                  {getStatusText(patient.status)}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  ID: {patient.id}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nessun paziente trovato</p>
            <p className="text-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Prova a modificare i filtri di ricerca'
                : 'Aggiungi il primo paziente per iniziare'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};