import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, MapPin, Plus, Edit, Trash2, Search, Filter, CheckCircle, User, Phone, Info, UserPlus, Briefcase, School, Activity, Heart, BookOpen, Shield, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { User as AuthUser } from '../types/auth';
import { Patient } from '../types/medical';
import { getUsers } from '../utils/userManagement';
import { getPatients, savePatient } from '../utils/medicalStorage';
import { saveShift, getShifts, deleteShift } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

// Define staff categories
const STAFF_CATEGORIES = {
  HEALTHCARE: 'Sanitaria',
  EDUCATIONAL: 'Scolastica/Assistenziale'
};

// Define staff roles by category
const STAFF_ROLES = {
  [STAFF_CATEGORIES.HEALTHCARE]: [
    'Infermiere',
    'Fisioterapista',
    'OSS',
    'Terapista occupazionale',
    'Psicologo'
  ],
  [STAFF_CATEGORIES.EDUCATIONAL]: [
    'Educatore',
    'Logopedista',
    'Assistente alla comunicazione',
    'Tutor BES/DSA',
    'Tecnico ABA'
  ]
};

export const StaffAssignment: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [staff, setStaff] = useState<AuthUser[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<AuthUser | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [staffFilter, setStaffFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week'>('week');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load staff members based on user role
      const allUsers = getUsers();
      let staffMembers;
      
      if (user?.role === 'admin') {
        // Admin can see all staff and coordinators
        staffMembers = allUsers.filter(u => u.role === 'staff' || u.role === 'coordinator');
      } else if (user?.role === 'coordinator') {
        // Coordinator can only see staff in their department
        staffMembers = allUsers.filter(u => 
          (u.role === 'staff' && u.department === user.department) || 
          (u.id === user.id)
        );
      } else {
        // Staff can only see themselves
        staffMembers = allUsers.filter(u => u.id === user.id);
      }
      
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

  const handleSelectStaff = (staffMember: AuthUser) => {
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

  const handleEditAssignment = (assignment: any) => {
    setShowAssignmentForm(true);
    // Pre-fill form with assignment data
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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  // Filter staff based on user role and filters
  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(staffFilter.toLowerCase()) ||
                         staffMember.position.toLowerCase().includes(staffFilter.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || 
                           (categoryFilter === STAFF_CATEGORIES.HEALTHCARE && 
                            STAFF_ROLES[STAFF_CATEGORIES.HEALTHCARE].includes(staffMember.position)) ||
                           (categoryFilter === STAFF_CATEGORIES.EDUCATIONAL && 
                            STAFF_ROLES[STAFF_CATEGORIES.EDUCATIONAL].includes(staffMember.position));
    
    // Role filter
    const matchesRole = roleFilter === 'all' || staffMember.position === roleFilter;
    
    return matchesSearch && matchesCategory && matchesRole;
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

  const getAssignmentsForDate = (date: string, staffId?: string) => {
    let filtered = assignments.filter(a => a.date === date);
    if (staffId) {
      filtered = filtered.filter(a => a.userId === staffId);
    }
    return filtered;
  };

  // Get all unique staff positions for filtering
  const staffPositions = [...new Set(staff.map(s => s.position))];

  // Get staff category based on position
  const getStaffCategory = (position: string): string => {
    if (STAFF_ROLES[STAFF_CATEGORIES.HEALTHCARE].includes(position)) {
      return STAFF_CATEGORIES.HEALTHCARE;
    } else if (STAFF_ROLES[STAFF_CATEGORIES.EDUCATIONAL].includes(position)) {
      return STAFF_CATEGORIES.EDUCATIONAL;
    }
    return 'Altro';
  };

  // Get color for staff category
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case STAFF_CATEGORIES.HEALTHCARE:
        return 'bg-blue-100 text-blue-800';
      case STAFF_CATEGORIES.EDUCATIONAL:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render calendar view
  const renderCalendar = () => {
    if (calendarView === 'day') {
      return renderDayView();
    } else {
      return renderWeekView();
    }
  };

  // Render day view
  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayAssignments = getAssignmentsForDate(dateStr);
    
    const timeSlots = [];
    for (let hour = 7; hour <= 19; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('it-IT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={handleCreateAssignment}
              className="flex items-center px-3 py-1 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nuova Assegnazione
            </button>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map((timeSlot) => {
            const slotAssignments = dayAssignments.filter(apt => 
              apt.startTime <= timeSlot && apt.endTime > timeSlot
            );

            return (
              <div key={timeSlot} className="flex border-b border-gray-50 hover:bg-gray-25">
                <div className="w-20 p-3 text-sm text-gray-500 border-r border-gray-100 bg-gray-50">
                  {timeSlot}
                </div>
                <div className="flex-1 p-3 min-h-[60px]">
                  {slotAssignments.map((assignment) => {
                    const staffMember = staff.find(s => s.id === assignment.userId);
                    const patient = assignment.patientId ? patients.find(p => p.id === assignment.patientId) : null;
                    const category = staffMember ? getStaffCategory(staffMember.position) : 'Altro';
                    
                    return (
                      <div
                        key={assignment.id}
                        className={`p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all mb-1 ${getCategoryColor(category)}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{staffMember?.name}</span>
                          <span className="text-xs">
                            {assignment.startTime}-{assignment.endTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {assignment.type === 'domiciliare' ? 'Domicilio' : 
                             assignment.type === 'ambulatorio' ? 'Ambulatorio' : 'Formazione'}
                          </span>
                          {patient && (
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {patient.personalInfo.name} {patient.personalInfo.surname}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    startOfWeek.setDate(currentDate.getDate() - day + (day === 0 ? -6 : 1)); // Start from Monday
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Settimana dal {startOfWeek.toLocaleDateString('it-IT')} al {weekDays[6].toLocaleDateString('it-IT')}
            </h3>
            <button
              onClick={handleCreateAssignment}
              className="flex items-center px-3 py-1 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nuova Assegnazione
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 text-sm font-medium text-gray-500 border-r border-gray-200">
                Orario
              </div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                  <div className="text-sm font-medium text-gray-900">
                    {day.toLocaleDateString('it-IT', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {day.getDate()} {day.toLocaleDateString('it-IT', { month: 'short' })}
                  </div>
                </div>
              ))}
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {Array.from({ length: 13 }, (_, i) => i + 7).map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-50">
                  <div className="p-3 text-sm text-gray-500 border-r border-gray-100 bg-gray-50">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
                    const hourAssignments = getAssignmentsForDate(dateStr).filter(a => 
                      a.startTime <= hourStr && a.endTime > hourStr
                    );

                    return (
                      <div key={dayIndex} className="p-1 border-r border-gray-100 last:border-r-0 min-h-[60px]">
                        {hourAssignments.map((assignment) => {
                          const staffMember = staff.find(s => s.id === assignment.userId);
                          const category = staffMember ? getStaffCategory(staffMember.position) : 'Altro';
                          
                          return (
                            <div
                              key={assignment.id}
                              className={`p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-all mb-1 ${getCategoryColor(category)}`}
                              onClick={() => handleEditAssignment(assignment)}
                            >
                              <div className="font-medium truncate">{staffMember?.name}</div>
                              <div className="text-xs opacity-75">{assignment.startTime}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Determine page title based on user role
  const getPageTitle = () => {
    if (user?.role === 'staff') {
      return "Le Mie Assegnazioni";
    } else if (user?.role === 'coordinator') {
      return `Assegnazione ${user.department}`;
    } else {
      return "Assegnazione Operatori";
    }
  };

  // Determine page description based on user role
  const getPageDescription = () => {
    if (user?.role === 'staff') {
      return "Visualizza le tue assegnazioni e il tuo calendario";
    } else if (user?.role === 'coordinator') {
      return `Gestisci le assegnazioni degli operatori del reparto ${user.department}`;
    } else {
      return "Gestisci le assegnazioni di tutti gli operatori per categoria";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-1">{getPageDescription()}</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'coordinator') && (
          <button
            onClick={handleCreateAssignment}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuova Assegnazione
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{STAFF_CATEGORIES.HEALTHCARE}</p>
              <p className="text-2xl font-bold text-blue-600">
                {staff.filter(s => STAFF_ROLES[STAFF_CATEGORIES.HEALTHCARE].includes(s.position)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <School className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{STAFF_CATEGORIES.EDUCATIONAL}</p>
              <p className="text-2xl font-bold text-green-600">
                {staff.filter(s => STAFF_ROLES[STAFF_CATEGORIES.EDUCATIONAL].includes(s.position)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pazienti</p>
              <p className="text-2xl font-bold text-purple-600">{patients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assegnazioni</p>
              <p className="text-2xl font-bold text-orange-600">{assignments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendario
            </button>
          </div>

          {viewMode === 'calendar' && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
              >
                Oggi
              </button>
              
              <button
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCalendarView('day')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    calendarView === 'day'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Giorno
                </button>
                <button
                  onClick={() => setCalendarView('week')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    calendarView === 'week'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Settimana
                </button>
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="flex flex-wrap gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
              >
                <option value="all">Tutte le categorie</option>
                <option value={STAFF_CATEGORIES.HEALTHCARE}>{STAFF_CATEGORIES.HEALTHCARE}</option>
                <option value={STAFF_CATEGORIES.EDUCATIONAL}>{STAFF_CATEGORIES.EDUCATIONAL}</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
              >
                <option value="all">Tutti i ruoli</option>
                {staffPositions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staff List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Operatori</h3>
              
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
            
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {filteredStaff.map((staffMember) => {
                const category = getStaffCategory(staffMember.position);
                return (
                  <div
                    key={staffMember.id}
                    onClick={() => handleSelectStaff(staffMember)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedStaff?.id === staffMember.id ? 'bg-sky-50 border-r-4 border-sky-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        category === STAFF_CATEGORIES.HEALTHCARE ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <span className={`font-semibold ${
                          category === STAFF_CATEGORIES.HEALTHCARE ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {staffMember.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{staffMember.name}</h4>
                        <div className="flex items-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                            category === STAFF_CATEGORIES.HEALTHCARE ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {category}
                          </span>
                          <span className="text-sm text-gray-600">{staffMember.position}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="inline-flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {getStaffAssignments(staffMember.id).length} assegnazioni
                      </span>
                    </div>
                  </div>
                );
              })}
              
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Utenti</h3>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cerca utente..."
                  value={patientFilter}
                  onChange={(e) => setPatientFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
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
                  <p>Nessun utente trovato</p>
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
                  <div className={`rounded-lg p-4 border ${
                    getStaffCategory(selectedStaff.position) === STAFF_CATEGORIES.HEALTHCARE 
                      ? 'bg-blue-50 border-blue-100' 
                      : 'bg-green-50 border-green-100'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      getStaffCategory(selectedStaff.position) === STAFF_CATEGORIES.HEALTHCARE 
                        ? 'text-blue-900' 
                        : 'text-green-900'
                    }`}>Operatore Selezionato</h4>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        getStaffCategory(selectedStaff.position) === STAFF_CATEGORIES.HEALTHCARE 
                          ? 'bg-blue-100' 
                          : 'bg-green-100'
                      }`}>
                        <span className={`font-semibold ${
                          getStaffCategory(selectedStaff.position) === STAFF_CATEGORIES.HEALTHCARE 
                            ? 'text-blue-600' 
                            : 'text-green-600'
                        }`}>
                          {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedStaff.name}</p>
                        <div className="flex items-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                            getStaffCategory(selectedStaff.position) === STAFF_CATEGORIES.HEALTHCARE 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getStaffCategory(selectedStaff.position)}
                          </span>
                          <span className="text-sm text-gray-600">{selectedStaff.position}</span>
                        </div>
                        <p className="text-xs text-gray-500">{selectedStaff.department}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Assegnazioni Programmate</h4>
                    
                    {getStaffAssignments(selectedStaff.id).length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {getStaffAssignments(selectedStaff.id)
                          .sort((a, b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime())
                          .map((assignment) => {
                            const patient = assignment.patientId ? patients.find(p => p.id === assignment.patientId) : null;
                            
                            return (
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
                                    
                                    {patient && (
                                      <div className="flex items-center mt-1">
                                        <User className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-sm text-gray-600">
                                          {patient.personalInfo.name} {patient.personalInfo.surname}
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
                                  
                                  {(user?.role === 'admin' || user?.role === 'coordinator') && (
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
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Nessuna assegnazione</p>
                        {(user?.role === 'admin' || user?.role === 'coordinator') && (
                          <button
                            onClick={handleCreateAssignment}
                            className="mt-2 text-sky-600 hover:text-sky-700 font-medium"
                          >
                            Crea nuova assegnazione
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {selectedPatient && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <h4 className="font-medium text-green-900 mb-2">Utente Selezionato</h4>
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
                      
                      {(user?.role === 'admin' || user?.role === 'coordinator') && (
                        <button
                          onClick={handleCreateAssignment}
                          className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Assegna Operatore
                        </button>
                      )}
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
      ) : (
        <div className="space-y-6">
          {/* Calendar Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Legenda</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">{STAFF_CATEGORIES.HEALTHCARE}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">{STAFF_CATEGORIES.EDUCATIONAL}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Altro</span>
              </div>
            </div>
          </div>
          
          {/* Calendar View */}
          {renderCalendar()}
        </div>
      )}

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <AssignmentFormModal
          staff={selectedStaff}
          patient={selectedPatient}
          staffList={staff}
          patientList={patients}
          onSave={handleSaveAssignment}
          onClose={() => setShowAssignmentForm(false)}
          userRole={user?.role}
          userDepartment={user?.department}
        />
      )}
    </div>
  );
};

// Assignment Form Modal Component
interface AssignmentFormModalProps {
  staff: AuthUser | null;
  patient: Patient | null;
  staffList: AuthUser[];
  patientList: Patient[];
  onSave: (assignment: any) => void;
  onClose: () => void;
  userRole?: string;
  userDepartment?: string;
}

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  staff,
  patient,
  staffList,
  patientList,
  onSave,
  onClose,
  userRole,
  userDepartment
}) => {
  const [formData, setFormData] = useState({
    userId: staff?.id || '',
    patientId: patient?.id || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'domiciliare',
    notes: '',
    recurring: false,
    recurrencePattern: 'weekly',
    recurrenceEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
    
    if (formData.recurring) {
      // Create recurring assignments
      const assignments = generateRecurringAssignments();
      assignments.forEach(assignment => {
        onSave(assignment);
      });
    } else {
      // Create single assignment
      const assignmentData = {
        id: crypto.randomUUID(),
        ...formData
      };
      
      onSave(assignmentData);
    }
  };

  const generateRecurringAssignments = () => {
    const assignments = [];
    const startDate = new Date(formData.date);
    const endDate = new Date(formData.recurrenceEndDate);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      assignments.push({
        id: crypto.randomUUID(),
        userId: formData.userId,
        patientId: formData.patientId,
        date: currentDate.toISOString().split('T')[0],
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        notes: formData.notes
      });
      
      // Increment date based on recurrence pattern
      if (formData.recurrencePattern === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (formData.recurrencePattern === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (formData.recurrencePattern === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (formData.recurrencePattern === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    return assignments;
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

  // Filter staff based on user role and department
  const filteredStaffList = staffList.filter(s => {
    if (userRole === 'admin') {
      return true; // Admin can see all staff
    } else if (userRole === 'coordinator') {
      return s.department === userDepartment; // Coordinator can only see staff in their department
    } else {
      return s.id === staff?.id; // Staff can only see themselves
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
              disabled={userRole === 'staff'}
            >
              <option value="">Seleziona operatore</option>
              {filteredStaffList.map(staffMember => {
                const category = getStaffCategory(staffMember.position);
                return (
                  <option key={staffMember.id} value={staffMember.id}>
                    {staffMember.name} - {staffMember.position} ({category})
                  </option>
                );
              })}
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
              <option value="scolastico">Supporto Scolastico</option>
              <option value="specialistico">Intervento Specialistico</option>
            </select>
          </div>

          {(formData.type === 'domiciliare' || formData.type === 'scolastico' || formData.type === 'specialistico') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utente *
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required={formData.type === 'domiciliare' || formData.type === 'scolastico' || formData.type === 'specialistico'}
              >
                <option value="">Seleziona utente</option>
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

          <div className="pt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                Assegnazione ricorrente
              </label>
            </div>
          </div>

          {formData.recurring && (
            <div className="space-y-4 pt-2 pl-6 border-l-2 border-sky-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequenza
                </label>
                <select
                  value={formData.recurrencePattern}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurrencePattern: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="daily">Giornaliera</option>
                  <option value="weekly">Settimanale</option>
                  <option value="biweekly">Bisettimanale</option>
                  <option value="monthly">Mensile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fino a
                </label>
                <input
                  type="date"
                  value={formData.recurrenceEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  min={formData.date}
                  required={formData.recurring}
                />
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