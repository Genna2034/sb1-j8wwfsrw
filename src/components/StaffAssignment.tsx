import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Calendar, Search, Filter, CheckCircle, XCircle, Clock, MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUsers } from '../utils/userManagement';
import { getPatients } from '../utils/medicalStorage';
import { getShifts, saveShift, deleteShift } from '../utils/storage';

export const StaffAssignment: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load staff members based on user role
      let staffMembers = getUsers().filter(u => u.role === 'staff');
      
      // If user is coordinator, filter by their department
      if (user?.role === 'coordinator') {
        staffMembers = staffMembers.filter(s => s.department === user.department);
      }
      
      setStaff(staffMembers);
      
      // Load patients
      const allPatients = getPatients();
      setPatients(allPatients);
      
      // Load shifts/assignments
      const allShifts = getShifts();
      setShifts(allShifts);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = [...staff];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.department === categoryFilter);
    }
    
    setFilteredStaff(filtered);
  };

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaff(staffId === selectedStaff ? null : staffId);
  };

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setShowAssignmentForm(true);
  };

  const handleEditAssignment = (assignment: any) => {
    setEditingAssignment(assignment);
    setShowAssignmentForm(true);
  };

  const handleSaveAssignment = (assignmentData: any) => {
    // Generate a unique ID if it's a new assignment
    const assignment = editingAssignment 
      ? { ...editingAssignment, ...assignmentData }
      : { 
          id: `shift-${Date.now()}`, 
          ...assignmentData 
        };
    
    saveShift(assignment);
    loadData();
    setShowAssignmentForm(false);
    setEditingAssignment(null);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa assegnazione?')) {
      deleteShift(assignmentId);
      loadData();
    }
  };

  const getStaffAssignments = (staffId: string) => {
    return shifts.filter(s => s.userId === staffId);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.personalInfo?.name} ${patient.personalInfo?.surname}` : 'Paziente non trovato';
  };

  const getDepartments = () => {
    const departments = new Set(staff.map(s => s.department));
    return Array.from(departments);
  };

  // Determine if user can manage assignments
  const canManageAssignments = user?.role === 'admin' || user?.role === 'coordinator';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assegnazione Utenti</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin' 
              ? 'Gestione completa delle assegnazioni per tutte le categorie' 
              : user?.role === 'coordinator' 
                ? `Gestione assegnazioni per ${user.department}` 
                : 'Visualizzazione delle tue assegnazioni'}
          </p>
        </div>
        {canManageAssignments && (
          <button
            onClick={handleAddAssignment}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nuova Assegnazione
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Professionisti</p>
              <p className="text-2xl font-bold text-blue-600">{staff.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assegnazioni</p>
              <p className="text-2xl font-bold text-green-600">{shifts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utenti Assistiti</p>
              <p className="text-2xl font-bold text-purple-600">{patients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Copertura</p>
              <p className="text-2xl font-bold text-orange-600">
                {patients.length > 0 ? Math.round((patients.filter(p => p.assignedStaff.length > 0).length / patients.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staff List - Only visible for admin and coordinator */}
        {(user?.role === 'admin' || user?.role === 'coordinator') && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Professionisti</h3>
                
                {/* Filters */}
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cerca per nome o ruolo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="all">Tutte le categorie</option>
                    {getDepartments().map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Caricamento professionisti...</p>
                  </div>
                ) : filteredStaff.length > 0 ? (
                  filteredStaff.map((staffMember) => (
                    <div
                      key={staffMember.id}
                      onClick={() => handleSelectStaff(staffMember.id)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedStaff === staffMember.id ? 'bg-sky-50 border-r-4 border-sky-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-sky-600">
                            {staffMember.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{staffMember.name}</h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <span>{staffMember.position}</span>
                            <span className="mx-2">•</span>
                            <span>{staffMember.department}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span className="mr-2">Assegnazioni:</span>
                        <span className="font-medium">{getStaffAssignments(staffMember.id).length}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun professionista trovato</p>
                    <p className="text-sm">Prova a modificare i filtri di ricerca</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assignments */}
        <div className={`${(user?.role === 'admin' || user?.role === 'coordinator') ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedStaff 
                  ? `Assegnazioni: ${staff.find(s => s.id === selectedStaff)?.name}` 
                  : user?.role === 'staff' 
                    ? 'Le Mie Assegnazioni' 
                    : 'Tutte le Assegnazioni'}
              </h3>
              
              {canManageAssignments && !selectedStaff && (
                <p className="text-sm text-gray-600 mt-1">
                  Seleziona un professionista per visualizzare o modificare le sue assegnazioni
                </p>
              )}
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Caricamento assegnazioni...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(selectedStaff || user?.role === 'staff') && (
                    <>
                      {/* Current Assignments */}
                      <div className="space-y-4">
                        {getStaffAssignments(selectedStaff || user?.id || '').map((assignment) => (
                          <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    assignment.type === 'domiciliare' ? 'bg-blue-500' :
                                    assignment.type === 'ambulatorio' ? 'bg-green-500' : 'bg-purple-500'
                                  }`}></div>
                                  <h4 className="font-medium text-gray-900">
                                    {assignment.patientId ? getPatientName(assignment.patientId) : 'Servizio generico'}
                                  </h4>
                                </div>
                                
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                    <span>{new Date(assignment.date).toLocaleDateString('it-IT')}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                    <span>{assignment.startTime} - {assignment.endTime}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                    <span>{assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}</span>
                                  </div>
                                </div>
                                
                                {assignment.notes && (
                                  <div className="mt-2 text-sm text-gray-500 italic">
                                    "{assignment.notes}"
                                  </div>
                                )}
                              </div>
                              
                              {canManageAssignments && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditAssignment(assignment)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {getStaffAssignments(selectedStaff || user?.id || '').length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Nessuna assegnazione trovata</p>
                            {canManageAssignments && (
                              <button
                                onClick={handleAddAssignment}
                                className="mt-4 text-sky-600 hover:text-sky-700 font-medium"
                              >
                                Aggiungi la prima assegnazione
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {!selectedStaff && user?.role !== 'staff' && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Seleziona un professionista per visualizzare le assegnazioni</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <AssignmentFormModal
          assignment={editingAssignment}
          staff={staff}
          patients={patients}
          selectedStaffId={selectedStaff}
          onSave={handleSaveAssignment}
          onClose={() => {
            setShowAssignmentForm(false);
            setEditingAssignment(null);
          }}
        />
      )}
    </div>
  );
};

// Assignment Form Modal Component
interface AssignmentFormModalProps {
  assignment?: any;
  staff: any[];
  patients: any[];
  selectedStaffId?: string | null;
  onSave: (assignment: any) => void;
  onClose: () => void;
}

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  assignment,
  staff,
  patients,
  selectedStaffId,
  onSave,
  onClose
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    userId: assignment?.userId || selectedStaffId || '',
    date: assignment?.date || new Date().toISOString().split('T')[0],
    startTime: assignment?.startTime || '09:00',
    endTime: assignment?.endTime || '10:00',
    type: assignment?.type || 'domiciliare',
    patientId: assignment?.patientId || '',
    notes: assignment?.notes || ''
  });

  // Filter patients based on user role and department
  const getFilteredPatients = () => {
    if (user?.role === 'admin') {
      return patients;
    } else if (user?.role === 'coordinator') {
      // For coordinator, filter patients based on department
      const staffInDepartment = staff.filter(s => s.department === user.department).map(s => s.id);
      return patients.filter(p => 
        p.assignedStaff.some((staffId: string) => staffInDepartment.includes(staffId))
      );
    }
    return [];
  };

  // Filter staff based on user role and department
  const getFilteredStaff = () => {
    if (user?.role === 'admin') {
      return staff;
    } else if (user?.role === 'coordinator') {
      return staff.filter(s => s.department === user.department);
    }
    return [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.userId || !formData.date || !formData.startTime || !formData.endTime) {
      alert('Compila tutti i campi obbligatori');
      return;
    }
    
    // Get staff name
    const staffMember = staff.find(s => s.id === formData.userId);
    if (!staffMember) {
      alert('Professionista non trovato');
      return;
    }
    
    onSave({
      ...formData,
      staffName: staffMember.name
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {assignment ? 'Modifica Assegnazione' : 'Nuova Assegnazione'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professionista *
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
              disabled={!!selectedStaffId}
            >
              <option value="">Seleziona professionista</option>
              {getFilteredStaff().map(staffMember => (
                <option key={staffMember.id} value={staffMember.id}>
                  {staffMember.name} - {staffMember.position} ({staffMember.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utente *
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona utente</option>
              {getFilteredPatients().map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.personalInfo.name} {patient.personalInfo.surname}
                </option>
              ))}
            </select>
          </div>

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
                Tipo Servizio *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              >
                <option value="domiciliare">Domiciliare</option>
                <option value="ambulatorio">Ambulatorio</option>
                <option value="formazione">Formazione</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orario Inizio *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orario Fine *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
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
              placeholder="Inserisci eventuali note o istruzioni..."
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
              {assignment ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};