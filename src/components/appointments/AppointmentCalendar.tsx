import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, Clock, User, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Appointment, StaffSchedule } from '../../types/appointments';
import { getAppointments, getStaffSchedules } from '../../utils/appointmentStorage';
import { useAuth } from '../../contexts/AuthContext';

interface AppointmentCalendarProps {
  onSelectAppointment: (appointment: Appointment) => void;
  onAddAppointment: (date: string, time?: string) => void;
  selectedDate?: string;
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onSelectAppointment,
  onAddAppointment,
  selectedDate,
  viewMode,
  onViewModeChange
}) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadAppointments();
    loadSchedules();
  }, [currentDate, filterStaff, filterStatus, user]);

  const loadAppointments = () => {
    const filters: any = {};
    
    if (viewMode === 'day') {
      filters.date = currentDate.toISOString().split('T')[0];
    } else if (viewMode === 'week') {
      // Load week's appointments
    }
    
    if (filterStaff !== 'all') {
      filters.staffId = filterStaff;
    }
    
    if (filterStatus !== 'all') {
      filters.status = filterStatus;
    }
    
    // Filter by user role
    if (user?.role === 'staff') {
      filters.staffId = user.id;
    }
    
    const allAppointments = getAppointments(filters);
    setAppointments(allAppointments);
  };

  const loadSchedules = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const staffSchedules = getStaffSchedules(dateStr);
    setSchedules(staffSchedules);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rescheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit': return <User className="w-3 h-3" />;
      case 'therapy': return <Activity className="w-3 h-3" />;
      case 'consultation': return <MessageCircle className="w-3 h-3" />;
      case 'follow-up': return <RotateCcw className="w-3 h-3" />;
      case 'emergency': return <AlertTriangle className="w-3 h-3" />;
      case 'routine': return <CheckCircle className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500';
      case 'high': return 'border-l-4 border-orange-500';
      case 'normal': return 'border-l-4 border-blue-500';
      case 'low': return 'border-l-4 border-gray-500';
      default: return 'border-l-4 border-gray-500';
    }
  };

  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayAppointments = appointments.filter(apt => apt.date === dateStr);
    const daySchedule = schedules.find(s => s.date === dateStr);
    
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
            <div className="flex items-center space-x-2">
              {daySchedule && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  daySchedule.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {daySchedule.isAvailable 
                    ? `Disponibile ${daySchedule.workingHours.start}-${daySchedule.workingHours.end}`
                    : 'Non disponibile'
                  }
                </span>
              )}
              <button
                onClick={() => onAddAppointment(dateStr)}
                className="flex items-center px-3 py-1 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nuovo
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {timeSlots.map((timeSlot) => {
            const slotAppointments = dayAppointments.filter(apt => 
              apt.startTime <= timeSlot && apt.endTime > timeSlot
            );

            return (
              <div key={timeSlot} className="flex border-b border-gray-50 hover:bg-gray-25">
                <div className="w-20 p-3 text-sm text-gray-500 border-r border-gray-100 bg-gray-50">
                  {timeSlot}
                </div>
                <div className="flex-1 p-3 min-h-[60px]">
                  {slotAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => onSelectAppointment(appointment)}
                      className={`p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all mb-1 ${getStatusColor(appointment.status)} ${getPriorityColor(appointment.priority)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(appointment.type)}
                          <span className="font-medium text-sm">{appointment.patientName}</span>
                        </div>
                        <span className="text-xs">
                          {appointment.startTime}-{appointment.endTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-600">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {appointment.staffName}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {appointment.location === 'home' ? 'Domicilio' : 'Ambulatorio'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {slotAppointments.length === 0 && daySchedule?.isAvailable && (
                    <button
                      onClick={() => onAddAppointment(dateStr, timeSlot)}
                      className="w-full h-full flex items-center justify-center text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="text-sm">Aggiungi appuntamento</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Settimana del {startOfWeek.toLocaleDateString('it-IT')}
          </h3>
        </div>

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
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {Array.from({ length: 13 }, (_, i) => i + 7).map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-50">
              <div className="p-3 text-sm text-gray-500 border-r border-gray-100 bg-gray-50">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((day, dayIndex) => {
                const dateStr = day.toISOString().split('T')[0];
                const hourStr = `${hour.toString().padStart(2, '0')}:00`;
                const hourAppointments = appointments.filter(apt => 
                  apt.date === dateStr && 
                  apt.startTime <= hourStr && 
                  apt.endTime > hourStr
                );

                return (
                  <div key={dayIndex} className="p-1 border-r border-gray-100 last:border-r-0 min-h-[50px]">
                    {hourAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        onClick={() => onSelectAppointment(appointment)}
                        className={`p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-all mb-1 ${getStatusColor(appointment.status)}`}
                      >
                        <div className="font-medium truncate">{appointment.patientName}</div>
                        <div className="text-xs opacity-75">{appointment.startTime}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayAppointments = appointments.filter(apt => apt.date === dateStr);
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={index}
                onClick={() => onAddAppointment(dateStr)}
                className={`min-h-[100px] p-2 border-r border-b border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-25 text-gray-400' : ''
                } ${isToday ? 'bg-sky-50' : ''} ${isSelected ? 'ring-2 ring-sky-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-sky-600' : ''}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment(appointment);
                      }}
                      className={`text-xs p-1 rounded truncate ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.startTime} {appointment.patientName}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 3} altri
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'day' ? 'Giorno' : mode === 'week' ? 'Settimana' : 'Mese'}
              </button>
            ))}
          </div>

          {/* Filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
          >
            <option value="all">Tutti gli stati</option>
            <option value="scheduled">Programmati</option>
            <option value="confirmed">Confermati</option>
            <option value="completed">Completati</option>
            <option value="cancelled">Cancellati</option>
          </select>
        </div>
      </div>

      {/* Calendar Content */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
    </div>
  );
};