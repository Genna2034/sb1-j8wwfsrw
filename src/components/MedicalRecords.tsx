import React, { useState, useEffect } from 'react';
import { FileText, Users, Plus, Search, Filter, Calendar, Activity } from 'lucide-react';
import { Patient } from '../types/medical';
import { getPatients, savePatient } from '../utils/medicalStorage';
import { PatientList } from './medical/PatientList';
import { PatientDetail } from './medical/PatientDetail';
import { PatientForm } from './medical/PatientForm';
import { useAuth } from '../contexts/AuthContext';

export const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
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
    setEditingPatient(null);
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
    setEditingPatient(null);
    
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
          <h1 className="text-2xl font-bold text-gray-900">Cartella Clinica Elettronica</h1>
          <p className="text-gray-600 mt-1">
            Gestione completa dei pazienti e delle loro cartelle cliniche
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pazienti Totali</p>
              <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pazienti Attivi</p>
              <p className="text-2xl font-bold text-green-600">{activePatients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Record Clinici</p>
              <p className="text-2xl font-bold text-purple-600">{totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Visite Oggi</p>
              <p className="text-2xl font-bold text-orange-600">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Seleziona un paziente
                </h3>
                <p className="text-gray-600">
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
            setEditingPatient(null);
          }}
        />
      )}
    </div>
  );
};