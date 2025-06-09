import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, Plus, Edit3, Trash2, UserPlus } from 'lucide-react';
import { Shift, Patient } from '../types/auth';
import { getShifts, saveShift, deleteShift, getPatients, savePatient } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';

export const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddShift, setShowAddShift] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  useEffect(() => {
    // Admin e coordinatori vedono tutti i turni, staff solo i propri
    const allShifts = getShifts();
    const userShifts = user?.role === 'staff' 
      ? allShifts.filter(shift => shift.userId === user?.id)
      : allShifts;
    setShifts(userShifts);
    
    // Solo admin e coordinatori possono vedere i pazienti
    if (user?.role === 'admin' || user?.role === 'coordinator') {
      setPatients(getPatients());
    }
  }, [user?.id, user?.role]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getShiftsForDate = (date: string) => {
    return shifts.filter(shift => shift.date === date);
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleAddShift = (shiftData: Partial<Shift>) => {
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      userId: shiftData.userId || user?.id || '',
      date: selectedDate || '',
      startTime: shiftData.startTime || '08:00',
      endTime: shiftData.endTime || '16:00',
      type: shiftData.type || 'domiciliare',
      patientId: shiftData.patientId,
      notes: shiftData.notes
    };

    saveShift(newShift);
    setShifts(prev => [...prev, newShift]);
    setShowAddShift(false);
  };

  const handleAddPatient = (patientData: Partial<Patient>) => {
    const newPatient: Patient = {
      id: `patient-${Date.now()}`,
      name: patientData.name || '',
      address: patientData.address || '',
      phone: patientData.phone || '',
      medicalNotes: patientData.medicalNotes || '',
      assignedStaff: patientData.assignedStaff || []
    };

    savePatient(newPatient);
    setPatients(prev => [...prev, newPatient]);
    setShowAddPatient(false);
  };

  const handleEditShift = (updatedShift: Shift) => {
    saveShift(updatedShift);
    setShifts(prev => prev.map(shift => shift.id === updatedShift.id ? updatedShift : shift));
    setEditingShift(null);
  };

  const handleDeleteShift = (shiftId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo turno?')) {
      deleteShift(shiftId);
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    }
  };

  const getPatientName = (patientId?: string) => {
    if (!patientId) return 'Non assegnato';
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Paziente non trovato';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayShifts = getShiftsForDate(dateString);
      const isToday = new Date().toDateString() === new Date(dateString).toDateString();
      const isSelected = selectedDate === dateString;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateString)}
          className={`h-24 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-sky-50 border-sky-200' : ''
          } ${isSelected ? 'ring-2 ring-sky-500' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-sky-600' : 'text-gray-900'}`}>
            {day}
          </div>
          {dayShifts.slice(0, 2).map((shift, index) => (
            <div
              key={index}
              className={`text-xs px-2 py-1 rounded mb-1 truncate ${
                shift.type === 'domiciliare' 
                  ? 'bg-blue-100 text-blue-800'
                  : shift.type === 'ambulatorio'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {shift.startTime} - {shift.endTime}
            </div>
          ))}
          {dayShifts.length > 2 && (
            <div className="text-xs text-gray-500">+{dayShifts.length - 2} altri</div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateShifts = selectedDate ? getShiftsForDate(selectedDate) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'staff' ? 'Diario Sanitario' : 'Gestione Diario Sanitario'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'staff' 
              ? 'I tuoi turni e pazienti assegnati'
              : 'Gestisci turni e assegnazioni pazienti'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {(user?.role === 'admin' || user?.role === 'coordinator') && (
            <button
              onClick={() => setShowAddPatient(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Nuovo Paziente
            </button>
          )}
          {selectedDate && (
            <button
              onClick={() => setShowAddShift(true)}
              className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Turno
            </button>
          )}
        </div>
      </div>

      {/* Patients List - Solo per admin e coordinatori */}
      {(user?.role === 'admin' || user?.role === 'coordinator') && patients.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Pazienti Registrati</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((patient) => (
                <div key={patient.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{patient.address}</p>
                  <p className="text-sm text-gray-600">{patient.phone}</p>
                  {patient.medicalNotes && (
                    <p className="text-xs text-gray-500 mt-2 italic">{patient.medicalNotes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 mb-px">
            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {renderCalendar()}
          </div>
        </div>

        {/* Legend */}
        <div className="p-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Legenda</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Assistenza Domiciliare</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Ambulatorio</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Formazione</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Turni del {new Date(selectedDate).toLocaleDateString('it-IT')}
            </h3>
          </div>
          <div className="p-6">
            {selectedDateShifts.length > 0 ? (
              <div className="space-y-4">
                {selectedDateShifts.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="font-medium text-gray-900">
                          {shift.startTime} - {shift.endTime}
                        </span>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                          shift.type === 'domiciliare' 
                            ? 'bg-blue-100 text-blue-800'
                            : shift.type === 'ambulatorio'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {shift.type.charAt(0).toUpperCase() + shift.type.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center mb-1">
                        <User className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">{getPatientName(shift.patientId)}</span>
                      </div>
                      {shift.notes && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">{shift.notes}</span>
                        </div>
                      )}
                    </div>
                    {(user?.role === 'admin' || user?.role === 'coordinator') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingShift(shift)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nessun turno programmato per questo giorno</p>
                {(user?.role === 'admin' || user?.role === 'coordinator') && (
                  <button
                    onClick={() => setShowAddShift(true)}
                    className="mt-4 text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Aggiungi il primo turno
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Shift Modal */}
      {(showAddShift || editingShift) && (
        <ShiftModal
          shift={editingShift}
          selectedDate={selectedDate}
          patients={patients}
          userRole={user?.role}
          onSave={editingShift ? handleEditShift : handleAddShift}
          onClose={() => {
            setShowAddShift(false);
            setEditingShift(null);
          }}
        />
      )}

      {/* Add Patient Modal */}
      {showAddPatient && (
        <PatientModal
          onSave={handleAddPatient}
          onClose={() => setShowAddPatient(false)}
        />
      )}
    </div>
  );
};

// Shift Modal Component
const ShiftModal: React.FC<{
  shift?: Shift | null;
  selectedDate: string | null;
  patients: Patient[];
  userRole?: string;
  onSave: (shift: any) => void;
  onClose: () => void;
}> = ({ shift, selectedDate, patients, userRole, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    userId: shift?.userId || '',
    startTime: shift?.startTime || '08:00',
    endTime: shift?.endTime || '16:00',
    type: shift?.type || 'domiciliare',
    patientId: shift?.patientId || '',
    notes: shift?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shift) {
      onSave({ ...shift, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {shift ? 'Modifica Turno' : 'Nuovo Turno'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedDate && new Date(selectedDate).toLocaleDateString('it-IT')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora Inizio
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
                Ora Fine
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
              Tipo Servizio
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            >
              <option value="domiciliare">Assistenza Domiciliare</option>
              <option value="ambulatorio">Ambulatorio</option>
              <option value="formazione">Formazione</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paziente
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Seleziona paziente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
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
              placeholder="Note aggiuntive..."
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
              {shift ? 'Salva' : 'Crea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Patient Modal Component
const PatientModal: React.FC<{
  onSave: (patient: any) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    medicalNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Nuovo Paziente</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Indirizzo
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Mediche
            </label>
            <textarea
              value={formData.medicalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, medicalNotes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Condizioni mediche, allergie, note importanti..."
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Crea Paziente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};