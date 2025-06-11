import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, MapPin, Plus, Edit, Trash2, Search, Filter, CheckCircle, User, Phone, Info } from 'lucide-react';
import { User } from '../types/auth';
import { Patient } from '../types/medical';
import { getUsers } from '../utils/userManagement';
import { getPatients, savePatient } from '../utils/medicalStorage';
import { saveShift, getShifts, deleteShift } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export const StaffAssignment: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [staff, setStaff] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [staffFilter, setStaffFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load staff members (only staff and coordinators)
      const allUsers = getUsers();
      const staffMembers = allUsers.filter(u => u.role === 'staff' || u.role === 'coordinator');
      setStaff(staffMembers);

      // Load patients
      const allPatients = getPatients();
      setPatients(allPatients);

      // Load existing assignments (shifts)
      const shifts = getShifts();
      setAssignments(shifts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaff = (staffMember: User) => {
    setSelectedStaff(staffMember);
    setSelectedPatient(null);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleCreateAssignment = () => {
    setShowAssignmentForm(true);
  };

  const handleSaveAssignment = (assignmentData: any) => {
    try {
      // Save the shift
      saveShift(assignmentData);

      // If this is a new patient assignment, update the patient's assigned staff
      if (assignmentData.patientId && assignmentData.type === 'domiciliare') {
        const patient = patients.find(p => p.id === assignmentData.patientId);
        if (patient && !patient.assignedStaff.includes(assignmentData.userId)) {
          const updatedPatient = {
            ...patient,
            assignedStaff: [...patient.assignedStaff, assignmentData.userId]
          };
          savePatient(updatedPatient);
        }
      }

      // Refresh data
      loadData();
      setShowAssignmentForm(false);

      // Show notification
      showNotification(
        'Assegnazione creata',
        `Operatore assegnato con successo per il ${new Date(assignmentData.date).toLocaleDateString('it-IT')}`
      );
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Errore nel salvataggio dell\'assegnazione');
    }
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa assegnazione?')) {
      deleteShift(assignmentId);
      loadData();
      
      showNotification(
        'Assegnazione eliminata',
        'L\'assegnazione è stata eliminata con successo'
      );
    }
  };

  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(staffFilter.toLowerCase()) ||
                         staffMember.position.toLowerCase().includes(staffFilter.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || staffMember.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const filteredPatients = patients.filter(patient => {
    return (
      patient.personalInfo.name.toLowerCase().includes(patientFilter.toLowerCase()) ||
      patient.personalInfo.surname.toLowerCase().includes(patientFilter.toLowerCase()) ||
      patient.personalInfo.fiscalCode?.toLowerCase().includes(patientFilter.toLowerCase())
    );
  });

  const getStaffAssignments = (staffId: string) => {
    return assignments.filter(a => a.userId === staffId);
  };

  const getPatientAssignments = (patientId: string) => {
    return assignments.filter(a => a.patientId === patientId);
  };

  const departments = [...new Set(staff.map(s => s.department))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assegnazione Operatori</h1>
          <p className="text-gray-600 mt-1">
            Gestisci le assegnazioni degli operatori ai pazienti
          </p>
        </div>
        <button
          onClick={handleCreateAssignment}
          className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuova Assegnazione
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Operatori</p>
              <p className="text-2xl font-bold text-blue-600">{staff.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pazienti</p>
              <p className="text-2xl font-bold text-green-600">{patients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assegnazioni</p>
              <p className="text-2xl font-bold text-purple-600">{assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completate</p>
              <p className="text-2xl font-bold text-orange-600">
                {assignments.filter(a => a.completed).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staff List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operatori</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cerca operatore..."
                    value={staffFilter}
                    onChange={(e) => setStaffFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Tutti i reparti</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {filteredStaff.map((staffMember) => (
              <div
                key={staffMember.id}
                onClick={() => handleSelectStaff(staffMember)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedStaff?.id === staffMember.id ? 'bg-sky-50 border-r-4 border-sky-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-sky-600">
                      {staffMember.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{staffMember.name}</h4>
                    <p className="text-sm text-gray-600">{staffMember.position}</p>
                    <p className="text-xs text-gray-500">{staffMember.department}</p>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  <span className="inline-flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {getStaffAssignments(staffMember.id).length} assegnazioni
                  </span>
                </div>
              </div>
            ))}
            
            {filteredStaff.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nessun operatore trovato</p>
                <p className="text-sm">Prova a modificare i filtri di ricerca</p>
              </div>
            )}
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pazienti</h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca paziente..."
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-green-50 border-r-4 border-green-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {patient.personalInfo.name} {patient.personalInfo.surname}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-3 h-3 mr-1" />
                      {patient.personalInfo.phone}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {patient.personalInfo.address}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    patient.status === 'active' ? 'bg-green-100 text-green-800' :
                    patient.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.status === 'active' ? 'Attivo' : 
                     patient.status === 'inactive' ? 'Inattivo' : 'Dimesso'}
                  </span>
                  
                  <span className="text-xs text-gray-500">
                    {patient.assignedStaff.length} operatori
                  </span>
                </div>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nessun paziente trovato</p>
                <p className="text-sm">Prova a modificare i filtri di ricerca</p>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Dettagli Assegnazione</h3>
          </div>
          
          <div className="p-6">
            {selectedStaff ? (
              <div className="space-y-6">
                <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
                  <h4 className="font-medium text-sky-900 mb-2">Operatore Selezionato</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-sky-600">
                        {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedStaff.name}</p>
                      <p className="text-sm text-gray-600">{selectedStaff.position}</p>
                      <p className="text-xs text-gray-500">{selectedStaff.department}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Assegnazioni Programmate</h4>
                  
                  {getStaffAssignments(selectedStaff.id).length > 0 ? (
                    <div className="space-y-3">
                      {getStaffAssignments(selectedStaff.id).map((assignment) => (
                        <div key={assignment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                <span className="font-medium text-gray-900">
                                  {new Date(assignment.date).toLocaleDateString('it-IT')}
                                </span>
                              </div>
                              
                              <div className="flex items-center mt-1">
                                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {assignment.startTime} - {assignment.endTime}
                                </span>
                              </div>
                              
                              {assignment.patientId && (
                                <div className="flex items-center mt-1">
                                  <User className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-600">
                                    {patients.find(p => p.id === assignment.patientId)?.personalInfo.name || 'Paziente'} {patients.find(p => p.id === assignment.patientId)?.personalInfo.surname || ''}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex items-center mt-1">
                                <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {assignment.type === 'domiciliare' ? 'Domiciliare' : 
                                   assignment.type === 'ambulatorio' ? 'Ambulatorio' : 'Formazione'}
                                </span>
                              </div>
                              
                              {assignment.notes && (
                                <div className="mt-2 text-xs text-gray-500 italic">
                                  {assignment.notes}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAssignment(assignment.id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Elimina"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Nessuna assegnazione</p>
                      <button
                        onClick={handleCreateAssignment}
                        className="mt-2 text-sky-600 hover:text-sky-700 font-medium"
                      >
                        Crea nuova assegnazione
                      </button>
                    </div>
                  )}
                </div>
                
                {selectedPatient && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <h4 className="font-medium text-green-900 mb-2">Paziente Selezionato</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedPatient.personalInfo.name} {selectedPatient.personalInfo.surname}
                        </p>
                        <p className="text-sm text-gray-600">{selectedPatient.personalInfo.phone}</p>
                        <p className="text-xs text-gray-500">{selectedPatient.personalInfo.address}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleCreateAssignment}
                      className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Assegna Operatore
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Seleziona un Operatore</p>
                <p className="text-sm mt-2">
                  Seleziona un operatore dalla lista per visualizzare e gestire le sue assegnazioni
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <AssignmentFormModal
          staff={selectedStaff}
          patient={selectedPatient}
          staffList={staff}
          patientList={patients}
          onSave={handleSaveAssignment}
          onClose={() => setShowAssignmentForm(false)}
        />
      )}
    </div>
  );
};

// Assignment Form Modal Component
interface AssignmentFormModalProps {
  staff: User | null;
  patient: Patient | null;
  staffList: User[];
  patientList: Patient[];
  onSave: (assignment: any) => void;
  onClose: () => void;
}

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  staff,
  patient,
  staffList,
  patientList,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    userId: staff?.id || '',
    patientId: patient?.id || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'domiciliare',
    notes: ''
  });

  useEffect(() => {
    if (staff) {
      setFormData(prev => ({ ...prev, userId: staff.id }));
    }
    if (patient) {
      setFormData(prev => ({ ...prev, patientId: patient.id }));
    }
  }, [staff, patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assignmentData = {
      id: `shift-${Date.now()}`,
      ...formData
    };
    
    onSave(assignmentData);
  };

  const calculateEndTime = () => {
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    // Add 1 hour by default
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    
    return `${endHours}:${endMinutes}`;
  };

  useEffect(() => {
    // Auto-calculate end time when start time changes
    if (formData.startTime) {
      setFormData(prev => ({ ...prev, endTime: calculateEndTime() }));
    }
  }, [formData.startTime]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Nuova Assegnazione
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operatore *
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona operatore</option>
              {staffList.map(staffMember => (
                <option key={staffMember.id} value={staffMember.id}>
                  {staffMember.name} - {staffMember.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Servizio *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            >
              <option value="domiciliare">Assistenza Domiciliare</option>
              <option value="ambulatorio">Ambulatorio</option>
              <option value="formazione">Formazione</option>
            </select>
          </div>

          {formData.type === 'domiciliare' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paziente *
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required={formData.type === 'domiciliare'}
              >
                <option value="">Seleziona paziente</option>
                {patientList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.personalInfo.name} {p.personalInfo.surname} - {p.personalInfo.address}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora Inizio *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora Fine *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex items-end">
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm w-full">
                Durata: {calculateDuration(formData.startTime, formData.endTime)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={3}
              placeholder="Dettagli aggiuntivi sull'assegnazione..."
            />
          </div>

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
              Salva Assegnazione
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Utility function to calculate duration between two time strings
const calculateDuration = (startTime: string, endTime: string): string => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  
  // Handle negative duration (crossing midnight)
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};