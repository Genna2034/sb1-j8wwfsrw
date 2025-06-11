import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Calendar, Filter, Search, Edit, Trash2, Clock, MapPin, CheckCircle, XCircle, Save, X } from 'lucide-react';
import { User } from '../types/auth';
import { getUsers } from '../utils/userManagement';
import { useAuth } from '../contexts/AuthContext';

// Utility functions moved outside component to be accessible by all components
const getStaffCategory = (department: string): string => {
  if (department.toLowerCase().includes('domiciliare')) {
    return 'Assistenza domiciliare';
  } else if (department.toLowerCase().includes('scolastica') || 
             department.toLowerCase().includes('educativa')) {
    return 'Assistenza scolastica';
  } else {
    return 'Altro';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Assistenza domiciliare':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Assistenza scolastica':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return endMinutes - startMinutes;
};

export const StaffAssignment: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
    loadAssignments();
  }, [user]);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, categoryFilter]);

  const loadStaff = () => {
    setLoading(true);
    try {
      let allStaff = getUsers().filter(u => u.role === 'staff');
      
      // Filter based on user role
      if (user?.role === 'coordinator') {
        // Coordinators can only see staff in their department/category
        const coordinatorCategory = getStaffCategory(user.department);
        allStaff = allStaff.filter(s => getStaffCategory(s.department) === coordinatorCategory);
      }
      
      setStaff(allStaff);
    } catch (error) {
      console.error('Errore nel caricamento staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = () => {
    // In a real implementation, this would load from API/database
    // For now, we'll use mock data
    const mockAssignments = [
      {
        id: 'assign-1',
        staffId: '3',
        userId: 'user-1',
        userName: 'Giuseppe Marino',
        category: 'Assistenza domiciliare',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '10:30',
        location: 'Via Roma 123, Napoli',
        status: 'active',
        notes: 'Assistenza quotidiana'
      },
      {
        id: 'assign-2',
        staffId: '4',
        userId: 'user-2',
        userName: 'Maria Rossi',
        category: 'Assistenza scolastica',
        date: '2025-06-15',
        startTime: '11:00',
        endTime: '13:00',
        location: 'Scuola Elementare G. Pascoli',
        status: 'active',
        notes: 'Supporto didattico'
      },
      {
        id: 'assign-3',
        staffId: '5',
        userId: 'user-3',
        userName: 'Antonio Bianchi',
        category: 'Assistenza domiciliare',
        date: '2025-06-16',
        startTime: '15:00',
        endTime: '16:00',
        location: 'Via Napoli 45',
        status: 'pending',
        notes: 'Assistenza domiciliare'
      }
    ];
    
    setAssignments(mockAssignments);
  };

  const filterStaff = () => {
    let filtered = [...staff];
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => getStaffCategory(s.department) === categoryFilter);
    }
    
    setFilteredStaff(filtered);
  };

  const handleAddAssignment = (staffMember: User) => {
    setSelectedStaff(staffMember);
    setShowAssignmentForm(true);
  };

  const handleSaveAssignment = (assignmentData: any) => {
    // In a real implementation, this would save to API/database
    const newAssignment = {
      id: `assign-${Date.now()}`,
      ...assignmentData
    };
    
    setAssignments(prev => [...prev, newAssignment]);
    setShowAssignmentForm(false);
    setSelectedStaff(null);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa assegnazione?')) {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    }
  };

  // Group staff by category
  const staffByCategory: Record<string, User[]> = {};
  filteredStaff.forEach(staffMember => {
    const category = getStaffCategory(staffMember.department);
    if (!staffByCategory[category]) {
      staffByCategory[category] = [];
    }
    staffByCategory[category].push(staffMember);
  });

  // Get all unique categories
  const categories = Object.keys(staffByCategory).sort();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assegnazione Utenti</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.role === 'admin' 
              ? 'Gestione completa delle assegnazioni per tutte le categorie'
              : user?.role === 'coordinator'
              ? `Gestione assegnazioni per ${getStaffCategory(user.department)}`
              : 'Le tue assegnazioni'
            }
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Calendario
            </button>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assistenza Domiciliare</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {staffByCategory['Assistenza domiciliare']?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assistenza Scolastica</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {staffByCategory['Assistenza scolastica']?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <UserPlus className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assegnazioni Attive</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {assignments.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca per nome o ruolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutte le categorie</option>
            <option value="Assistenza domiciliare">Assistenza Domiciliare</option>
            <option value="Assistenza scolastica">Assistenza Scolastica</option>
          </select>
        </div>
      </div>

      {/* Staff List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Professionisti ({filteredStaff.length})
            </h3>
          </div>
          
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Nessun professionista trovato</p>
              <p className="text-sm">Prova a modificare i filtri di ricerca</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {categories.map(category => (
                <div key={category} className="p-6">
                  <h4 className={`text-lg font-semibold mb-4 ${
                    category === 'Assistenza domiciliare' ? 'text-blue-700 dark:text-blue-400' :
                    category === 'Assistenza scolastica' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {category}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffByCategory[category].map(staffMember => (
                      <div key={staffMember.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-gray-800">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              category === 'Assistenza domiciliare' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              category === 'Assistenza scolastica' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <span className={`font-semibold ${
                                category === 'Assistenza domiciliare' ? 'text-blue-600 dark:text-blue-400' :
                                category === 'Assistenza scolastica' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {staffMember.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-3">
                              <h5 className="font-medium text-gray-900 dark:text-white">{staffMember.name}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{staffMember.position}</p>
                            </div>
                          </div>
                          
                          {(user?.role === 'admin' || user?.role === 'coordinator') && (
                            <button
                              onClick={() => handleAddAssignment(staffMember)}
                              className={`p-2 rounded-lg transition-colors ${
                                category === 'Assistenza domiciliare' ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' :
                                category === 'Assistenza scolastica' ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                              title="Assegna utente"
                            >
                              <UserPlus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        
                        {/* Staff Assignments */}
                        <div className="mt-4">
                          <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Assegnazioni Attive</h6>
                          <div className="space-y-2">
                            {assignments
                              .filter(a => a.staffId === staffMember.id && a.status === 'active')
                              .slice(0, 2)
                              .map(assignment => (
                                <div key={assignment.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="font-medium text-gray-900 dark:text-white">{assignment.userName}</span>
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400 mr-1" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{assignment.startTime}</span>
                                  </div>
                                </div>
                              ))}
                            
                            {assignments.filter(a => a.staffId === staffMember.id && a.status === 'active').length === 0 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                                Nessuna assegnazione attiva
                              </div>
                            )}
                            
                            {assignments.filter(a => a.staffId === staffMember.id && a.status === 'active').length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                +{assignments.filter(a => a.staffId === staffMember.id && a.status === 'active').length - 2} altre
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calendario Assegnazioni
            </h3>
          </div>
          
          <div className="p-6">
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">Vista calendario in sviluppo</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Sarà disponibile nella prossima versione</p>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Assegnazioni Recenti
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Professionista
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data e Ora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {assignments.map((assignment) => {
                const staffMember = staff.find(s => s.id === assignment.staffId);
                
                return (
                  <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{staffMember?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{staffMember?.position || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(assignment.category)}`}>
                        {assignment.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(assignment.date).toLocaleDateString('it-IT')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {assignment.startTime} - {assignment.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {assignment.status === 'active' ? 'Attivo' : 'In attesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {/* Edit functionality */}}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifica"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {assignments.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Nessuna assegnazione trovata</p>
              <p className="text-sm">Assegna utenti ai professionisti per iniziare</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Form Modal */}
      {showAssignmentForm && selectedStaff && (
        <AssignmentFormModal
          staff={selectedStaff}
          onSave={handleSaveAssignment}
          onClose={() => {
            setShowAssignmentForm(false);
            setSelectedStaff(null);
          }}
        />
      )}
    </div>
  );
};

// Assignment Form Modal Component
const AssignmentFormModal: React.FC<{
  staff: User;
  onSave: (assignment: any) => void;
  onClose: () => void;
}> = ({ staff, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    staffId: staff.id,
    userId: '',
    userName: '',
    category: getStaffCategory(staff.department),
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    status: 'active',
    notes: ''
  });

  const [users, setUsers] = useState<any[]>([
    { id: 'user-1', name: 'Giuseppe Marino' },
    { id: 'user-2', name: 'Maria Rossi' },
    { id: 'user-3', name: 'Antonio Bianchi' },
    { id: 'user-4', name: 'Francesca Verde' },
    { id: 'user-5', name: 'Luigi Esposito' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate duration
    const duration = calculateDuration(formData.startTime, formData.endTime);
    if (duration <= 0) {
      alert('L\'ora di fine deve essere successiva all\'ora di inizio');
      return;
    }
    
    onSave(formData);
  };

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    setFormData(prev => ({
      ...prev,
      userId,
      userName: selectedUser ? selectedUser.name : ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nuova Assegnazione
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Assegna un utente a {staff.name}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Professionista
            </label>
            <input
              type="text"
              value={staff.name}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {staff.position} - {staff.department}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <input
              type="text"
              value={formData.category}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Utente *
            </label>
            <select
              value={formData.userId}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Seleziona utente</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stato
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Attivo</option>
                <option value="pending">In attesa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ora Inizio *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
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
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Luogo *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Indirizzo o nome struttura"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Note aggiuntive..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Salva Assegnazione
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffAssignment;