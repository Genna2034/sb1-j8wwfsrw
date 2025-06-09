import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, TrendingUp, Plus, Filter, Search, Bell, AlertTriangle } from 'lucide-react';
import { Appointment } from '../types/appointments';
import { getAppointments, saveAppointment, deleteAppointment, getAppointmentStats } from '../utils/appointmentStorage';
import { AppointmentCalendar } from './appointments/AppointmentCalendar';
import { AppointmentForm } from './appointments/AppointmentForm';
import { AppointmentDetail } from './appointments/AppointmentDetail';
import { useAuth } from '../hooks/useAuth';

export const AppointmentSystem: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [initialTime, setInitialTime] = useState<string>('');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadAppointments();
    loadStats();
  }, [user]);

  const loadAppointments = () => {
    const filters: any = {};
    
    // Filter by user role
    if (user?.role === 'staff') {
      filters.staffId = user.id;
    }
    
    const allAppointments = getAppointments(filters);
    setAppointments(allAppointments);
  };

  const loadStats = () => {
    const dateRange = {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    };
    
    const appointmentStats = getAppointmentStats(
      user?.role === 'staff' ? user.id : undefined,
      dateRange
    );
    setStats(appointmentStats);
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetail(true);
  };

  const handleAddAppointment = (date: string, time?: string) => {
    setSelectedDate(date);
    setInitialTime(time || '');
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = () => {
    if (selectedAppointment) {
      setEditingAppointment(selectedAppointment);
      setShowAppointmentForm(true);
      setShowAppointmentDetail(false);
    }
  };

  const handleSaveAppointment = (appointment: Appointment) => {
    saveAppointment(appointment);
    loadAppointments();
    loadStats();
    setShowAppointmentForm(false);
    setEditingAppointment(null);
    setSelectedDate('');
    setInitialTime('');
  };

  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      deleteAppointment(selectedAppointment.id);
      loadAppointments();
      loadStats();
      setShowAppointmentDetail(false);
      setSelectedAppointment(null);
    }
  };

  const handleStatusChange = (status: Appointment['status']) => {
    if (selectedAppointment) {
      const updatedAppointment = { ...selectedAppointment, status };
      saveAppointment(updatedAppointment);
      setSelectedAppointment(updatedAppointment);
      loadAppointments();
      loadStats();
    }
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today);
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed')
      .slice(0, 5);
  };

  const getOverdueAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    
    return appointments.filter(apt => {
      if (apt.date < today) return apt.status === 'scheduled' || apt.status === 'confirmed';
      if (apt.date === today) return apt.endTime < now && (apt.status === 'scheduled' || apt.status === 'confirmed');
      return false;
    });
  };

  const todayAppointments = getTodayAppointments();
  const upcomingAppointments = getUpcomingAppointments();
  const overdueAppointments = getOverdueAppointments();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema Appuntamenti</h1>
          <p className="text-gray-600 mt-1">
            Gestione completa degli appuntamenti e calendario sanitario
          </p>
        </div>
        <button
          onClick={() => handleAddAppointment(new Date().toISOString().split('T')[0])}
          className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Appuntamento
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Oggi</p>
              <p className="text-2xl font-bold text-blue-600">{todayAppointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completati</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Attesa</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.scheduled || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Ritardo</p>
              <p className="text-2xl font-bold text-red-600">{overdueAppointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totale Mese</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {overdueAppointments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="font-medium text-red-900">
              Appuntamenti in Ritardo ({overdueAppointments.length})
            </h3>
          </div>
          <div className="space-y-2">
            {overdueAppointments.slice(0, 3).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between text-sm">
                <span className="text-red-800">
                  {apt.patientName} - {apt.date} {apt.startTime}
                </span>
                <button
                  onClick={() => handleSelectAppointment(apt)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Gestisci
                </button>
              </div>
            ))}
            {overdueAppointments.length > 3 && (
              <p className="text-red-700 text-sm">
                +{overdueAppointments.length - 3} altri appuntamenti in ritardo
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <AppointmentCalendar
            onSelectAppointment={handleSelectAppointment}
            onAddAppointment={handleAddAppointment}
            selectedDate={selectedDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Riepilogo Rapido</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Visite:</span>
                <span className="font-medium">{stats.byType?.visit || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Terapie:</span>
                <span className="font-medium">{stats.byType?.therapy || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Controlli:</span>
                <span className="font-medium">{stats.byType?.['follow-up'] || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Consulenze:</span>
                <span className="font-medium">{stats.byType?.consultation || 0}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Prossimi Appuntamenti</h3>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => handleSelectAppointment(apt)}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">{apt.patientName}</div>
                  <div className="text-xs text-gray-600">
                    {new Date(apt.date).toLocaleDateString('it-IT')} - {apt.startTime}
                  </div>
                  <div className="text-xs text-gray-500">{apt.staffName}</div>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nessun appuntamento in programma
                </p>
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Programma di Oggi</h3>
            <div className="space-y-2">
              {todayAppointments
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => handleSelectAppointment(apt)}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{apt.startTime}</div>
                      <div className="text-xs text-gray-600">{apt.patientName}</div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${
                      apt.status === 'completed' ? 'bg-green-500' :
                      apt.status === 'in-progress' ? 'bg-yellow-500' :
                      apt.status === 'confirmed' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`}></span>
                  </div>
                ))}
              {todayAppointments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nessun appuntamento oggi
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          initialDate={selectedDate}
          initialTime={initialTime}
          onSave={handleSaveAppointment}
          onClose={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(null);
            setSelectedDate('');
            setInitialTime('');
          }}
        />
      )}

      {showAppointmentDetail && selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
          onStatusChange={handleStatusChange}
          onClose={() => {
            setShowAppointmentDetail(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};