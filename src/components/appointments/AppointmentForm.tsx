import React, { useState, useEffect } from 'react';
import { Save, X, User, Clock, MapPin, AlertTriangle, Calendar, Phone } from 'lucide-react';
import { Appointment, AppointmentConflict } from '../../types/appointments';
import { Patient } from '../../types/medical';
import { User as StaffUser } from '../../types/auth';
import { getPatients } from '../../utils/medicalStorage';
import { getUsers } from '../../utils/userManagement';
import { generateAppointmentId, calculateEndTime, checkAppointmentConflicts, getAvailableSlots } from '../../utils/appointmentStorage';
import { useAuth } from '../../hooks/useAuth';

interface AppointmentFormProps {
  appointment?: Appointment;
  initialDate?: string;
  initialTime?: string;
  onSave: (appointment: Appointment) => void;
  onClose: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  initialDate,
  initialTime,
  onSave,
  onClose
}) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [conflicts, setConflicts] = useState<AppointmentConflict[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || '',
    staffId: appointment?.staffId || (user?.role === 'staff' ? user.id : ''),
    date: appointment?.date || initialDate || new Date().toISOString().split('T')[0],
    startTime: appointment?.startTime || initialTime || '09:00',
    duration: appointment?.duration || 30,
    type: appointment?.type || 'visit' as Appointment['type'],
    priority: appointment?.priority || 'normal' as Appointment['priority'],
    location: appointment?.location || 'home' as Appointment['location'],
    status: appointment?.status || 'scheduled' as Appointment['status'],
    notes: appointment?.notes || '',
    symptoms: appointment?.symptoms || '',
    followUpRequired: appointment?.followUpRequired || false,
    cost: appointment?.cost || 0,
    insuranceCovered: appointment?.insuranceCovered || false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.staffId && formData.date) {
      loadAvailableSlots();
    }
  }, [formData.staffId, formData.date, formData.duration]);

  useEffect(() => {
    if (formData.patientId && formData.staffId && formData.date && formData.startTime) {
      checkConflicts();
    }
  }, [formData.patientId, formData.staffId, formData.date, formData.startTime, formData.duration]);

  const loadData = () => {
    const allPatients = getPatients();
    const allStaff = getUsers().filter(u => u.role === 'staff' || u.role === 'coordinator');
    
    // Filter patients based on user role
    if (user?.role === 'staff') {
      const userPatients = allPatients.filter(p => p.assignedStaff.includes(user.id));
      setPatients(userPatients);
    } else {
      setPatients(allPatients);
    }
    
    setStaff(allStaff);
  };

  const loadAvailableSlots = () => {
    const slots = getAvailableSlots(formData.staffId, formData.date, formData.duration);
    setAvailableSlots(slots);
  };

  const checkConflicts = () => {
    const tempAppointment: Appointment = {
      id: appointment?.id || generateAppointmentId(),
      patientId: formData.patientId,
      patientName: patients.find(p => p.id === formData.patientId)?.personalInfo.name || '',
      staffId: formData.staffId,
      staffName: staff.find(s => s.id === formData.staffId)?.name || '',
      date: formData.date,
      startTime: formData.startTime,
      endTime: calculateEndTime(formData.startTime, formData.duration),
      type: formData.type,
      status: formData.status,
      priority: formData.priority,
      location: formData.location,
      duration: formData.duration,
      notes: formData.notes,
      symptoms: formData.symptoms,
      followUpRequired: formData.followUpRequired,
      cost: formData.cost,
      insuranceCovered: formData.insuranceCovered,
      createdAt: appointment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.id || ''
    };

    const appointmentConflicts = checkAppointmentConflicts(tempAppointment);
    setConflicts(appointmentConflicts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      const selectedStaff = staff.find(s => s.id === formData.staffId);

      if (!selectedPatient || !selectedStaff) {
        alert('Seleziona paziente e operatore');
        return;
      }

      const appointmentData: Appointment = {
        id: appointment?.id || generateAppointmentId(),
        patientId: formData.patientId,
        patientName: `${selectedPatient.personalInfo.name} ${selectedPatient.personalInfo.surname}`,
        staffId: formData.staffId,
        staffName: selectedStaff.name,
        date: formData.date,
        startTime: formData.startTime,
        endTime: calculateEndTime(formData.startTime, formData.duration),
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        location: formData.location,
        duration: formData.duration,
        notes: formData.notes,
        symptoms: formData.symptoms,
        followUpRequired: formData.followUpRequired,
        cost: formData.cost,
        insuranceCovered: formData.insuranceCovered,
        createdAt: appointment?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.id || ''
      };

      // Check for critical conflicts
      const criticalConflicts = conflicts.filter(c => c.type === 'overlap' || c.type === 'staff_unavailable');
      if (criticalConflicts.length > 0 && !window.confirm('Ci sono conflitti. Vuoi procedere comunque?')) {
        return;
      }

      onSave(appointmentData);
    } catch (error) {
      console.error('Errore nel salvataggio appuntamento:', error);
      alert('Errore nel salvataggio dell\'appuntamento');
    } finally {
      setLoading(false);
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'visit': return 'Visita';
      case 'therapy': return 'Terapia';
      case 'consultation': return 'Consulenza';
      case 'follow-up': return 'Controllo';
      case 'emergency': return 'Emergenza';
      case 'routine': return 'Routine';
      default: return type;
    }
  };

  const getPriorityDisplayName = (priority: string) => {
    switch (priority) {
      case 'low': return 'Bassa';
      case 'normal': return 'Normale';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  const getLocationDisplayName = (location: string) => {
    switch (location) {
      case 'home': return 'Domicilio';
      case 'clinic': return 'Ambulatorio';
      case 'hospital': return 'Ospedale';
      case 'remote': return 'Remoto';
      default: return location;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programmato';
      case 'confirmed': return 'Confermato';
      case 'in-progress': return 'In corso';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Cancellato';
      case 'no-show': return 'Assente';
      case 'rescheduled': return 'Riprogrammato';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {appointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </h3>
          {initialDate && (
            <p className="text-sm text-gray-600 mt-1">
              {new Date(initialDate).toLocaleDateString('it-IT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {initialTime && ` alle ${initialTime}`}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Conflicts Warning */}
          {conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="font-medium text-red-900">Conflitti Rilevati</h4>
              </div>
              <div className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="text-sm text-red-800">
                    <p className="font-medium">{conflict.message}</p>
                    {conflict.suggestions && (
                      <ul className="list-disc list-inside mt-1 text-red-700">
                        {conflict.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paziente *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleziona paziente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.personalInfo.name} {patient.personalInfo.surname} - {patient.personalInfo.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operatore *
                </label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                  disabled={user?.role === 'staff'}
                >
                  <option value="">Seleziona operatore</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.position}
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
                    Orario *
                  </label>
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona orario</option>
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durata (minuti) *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  >
                    <option value={15}>15 minuti</option>
                    <option value={30}>30 minuti</option>
                    <option value={45}>45 minuti</option>
                    <option value={60}>1 ora</option>
                    <option value={90}>1.5 ore</option>
                    <option value={120}>2 ore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  >
                    <option value="visit">Visita</option>
                    <option value="therapy">Terapia</option>
                    <option value="consultation">Consulenza</option>
                    <option value="follow-up">Controllo</option>
                    <option value="emergency">Emergenza</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorità
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="low">Bassa</option>
                    <option value="normal">Normale</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Luogo
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="home">Domicilio</option>
                    <option value="clinic">Ambulatorio</option>
                    <option value="hospital">Ospedale</option>
                    <option value="remote">Remoto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stato
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="scheduled">Programmato</option>
                  <option value="confirmed">Confermato</option>
                  <option value="in-progress">In corso</option>
                  <option value="completed">Completato</option>
                  <option value="cancelled">Cancellato</option>
                  <option value="no-show">Assente</option>
                  <option value="rescheduled">Riprogrammato</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sintomi/Motivo
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  rows={3}
                  placeholder="Sintomi o motivo della visita..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.followUpRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Follow-up richiesto</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.insuranceCovered}
                    onChange={(e) => setFormData(prev => ({ ...prev, insuranceCovered: e.target.checked }))}
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Coperto da assicurazione</span>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Riepilogo Appuntamento</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Orario:</span>
                <span className="ml-2 font-medium">
                  {formData.startTime} - {calculateEndTime(formData.startTime, formData.duration)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Durata:</span>
                <span className="ml-2 font-medium">{formData.duration} min</span>
              </div>
              <div>
                <span className="text-gray-600">Tipo:</span>
                <span className="ml-2 font-medium">{getTypeDisplayName(formData.type)}</span>
              </div>
              <div>
                <span className="text-gray-600">Luogo:</span>
                <span className="ml-2 font-medium">{getLocationDisplayName(formData.location)}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {appointment ? 'Salva Modifiche' : 'Crea Appuntamento'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};