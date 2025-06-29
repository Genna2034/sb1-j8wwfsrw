import React, { useState, useEffect } from 'react';
import { FileText, Users, Plus, Search, Filter, Calendar, Activity } from 'lucide-react';
import { Patient } from '../types/medical';
import { getPatients, savePatient, deletePatient } from '../utils/medicalStorage';
import { PatientList } from './medical/PatientList';
import { PatientDetail } from './medical/PatientDetail';
import { PatientForm } from './medical/PatientForm';
import { useAuth } from '../contexts/AuthContext';

export const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    const allPatients = getPatients();
    setPatients(allPatients);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleAddPatient = () => {
    setEditingPatient(undefined);
    setShowPatientForm(true);
  };

  const handleEditPatient = () => {
    if (selectedPatient) {
      setEditingPatient(selectedPatient);
      setShowPatientForm(true);
    }
  };

  const handleSavePatient = (patient: Patient) => {
    savePatient(patient);
    loadPatients();
    setShowPatientForm(false);
    setEditingPatient(undefined);
    
    // Update selected patient if it was edited
    if (selectedPatient && patient.id === selectedPatient.id) {
      setSelectedPatient(patient);
    }
  };

  const activePatients = patients.filter(p => p.status === 'active');
  const totalRecords = patients.reduce((sum, p) => {
    // This would be calculated from actual medical records
    return sum + Math.floor(Math.random() * 10) + 1;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cartella Clinica Elettronica</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestione completa dei pazienti e delle loro cartelle cliniche
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pazienti Totali</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{patients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pazienti Attivi</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activePatients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Record Clinici</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Visite Oggi</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.floor(Math.random() * 8) + 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <PatientList
            onSelectPatient={handleSelectPatient}
            onAddPatient={handleAddPatient}
            selectedPatientId={selectedPatient?.id}
          />
        </div>

        {/* Patient Detail */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <PatientDetail
              patient={selectedPatient}
              onEdit={handleEditPatient}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Seleziona un paziente
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Scegli un paziente dalla lista per visualizzare la sua cartella clinica
                </p>
                {(user?.role === 'admin' || user?.role === 'coordinator') && (
                  <button
                    onClick={handleAddPatient}
                    className="mt-4 flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Primo Paziente
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Form Modal */}
      {showPatientForm && (
        <PatientForm
          patient={editingPatient}
          onSave={handleSavePatient}
          onClose={() => {
            setShowPatientForm(false);
            setEditingPatient(undefined);
          }}
        />
      )}
    </div>
  );
};

export default MedicalRecords;