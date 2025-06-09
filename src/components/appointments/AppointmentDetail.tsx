import React, { useState } from 'react';
import { 
  User, Clock, MapPin, Phone, Calendar, AlertCircle, 
  Edit, Trash2, CheckCircle, XCircle, RotateCcw, 
  FileText, DollarSign, Shield, Bell
} from 'lucide-react';
import { Appointment } from '../../types/appointments';
import { Patient } from '../../types/medical';
import { getPatients } from '../../utils/medicalStorage';
import { useAuth } from '../../hooks/useAuth';

interface AppointmentDetailProps {
  appointment: Appointment;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Appointment['status']) => void;
  onClose: () => void;
}

export const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
  onClose
}) => {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);

  React.useEffect(() => {
    const patients = getPatients();
    const foundPatient = patients.find(p => p.id === appointment.patientId);
    setPatient(foundPatient || null);
  }, [appointment.patientId]);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
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

  const canEdit = user?.role === 'admin' || user?.role === 'coordinator' || 
                 (user?.role === 'staff' && appointment.staffId === user.id);

  const canChangeStatus = canEdit && appointment.status !== 'completed' && appointment.status !== 'cancelled';

  const handleStatusChange = (newStatus: Appointment['status']) => {
    if (window.confirm(`Confermi il cambio di stato a "${getStatusDisplayName(newStatus)}"?`)) {
      onStatusChange(newStatus);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Sei sicuro di voler eliminare questo appuntamento? Questa azione non può essere annullata.')) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Dettagli Appuntamento
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                ID: {appointment.id}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <>
                  <button
                    onClick={onEdit}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifica"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                {getStatusDisplayName(appointment.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(appointment.priority)}`}>
                Priorità {getPriorityDisplayName(appointment.priority)}
              </span>
            </div>
            
            {canChangeStatus && (
              <div className="flex space-x-2">
                {appointment.status === 'scheduled' && (
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Conferma
                  </button>
                )}
                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                  <button
                    onClick={() => handleStatusChange('in-progress')}
                    className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Inizia
                  </button>
                )}
                {appointment.status === 'in-progress' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className="flex items-center px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completa
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Main Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Informazioni Paziente
              </h4>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-900">{appointment.patientName}</h5>
                {patient && (
                  <div className="mt-2 space-y-1 text-sm text-blue-800">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {patient.personalInfo.phone}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {patient.personalInfo.address}, {patient.personalInfo.city}
                    </div>
                    {patient.personalInfo.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {patient.personalInfo.email}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              {patient?.personalInfo.emergencyContact && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h5 className="font-medium text-red-900 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Contatto di Emergenza
                  </h5>
                  <div className="mt-2 text-sm text-red-800">
                    <p className="font-medium">{patient.personalInfo.emergencyContact.name}</p>
                    <p>{patient.personalInfo.emergencyContact.relationship}</p>
                    <p className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {patient.personalInfo.emergencyContact.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Dettagli Appuntamento
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">
                    {new Date(appointment.date).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Orario:</span>
                  <span className="font-medium">{appointment.startTime} - {appointment.endTime}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Durata:</span>
                  <span className="font-medium">{appointment.duration} minuti</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{getTypeDisplayName(appointment.type)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Luogo:</span>
                  <span className="font-medium">{getLocationDisplayName(appointment.location)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Operatore:</span>
                  <span className="font-medium">{appointment.staffName}</span>
                </div>
                
                {appointment.cost && appointment.cost > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Costo:</span>
                    <span className="font-medium flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      €{appointment.cost.toFixed(2)}
                      {appointment.insuranceCovered && (
                        <Shield className="w-4 h-4 ml-2 text-green-600" title="Coperto da assicurazione" />
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes and Symptoms */}
          {(appointment.notes || appointment.symptoms) && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Note e Sintomi
              </h4>
              
              {appointment.symptoms && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-900 mb-2">Sintomi/Motivo:</h5>
                  <p className="text-yellow-800">{appointment.symptoms}</p>
                </div>
              )}
              
              {appointment.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Note:</h5>
                  <p className="text-gray-700">{appointment.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Follow-up */}
          {appointment.followUpRequired && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <RotateCcw className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Follow-up richiesto</span>
              </div>
              {appointment.followUpDate && (
                <p className="text-blue-800 mt-1">
                  Data prevista: {new Date(appointment.followUpDate).toLocaleDateString('it-IT')}
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Informazioni Sistema</h5>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creato:</span>
                <span className="ml-2">
                  {new Date(appointment.createdAt).toLocaleDateString('it-IT')} alle{' '}
                  {new Date(appointment.createdAt).toLocaleTimeString('it-IT', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div>
                <span className="font-medium">Ultimo aggiornamento:</span>
                <span className="ml-2">
                  {new Date(appointment.updatedAt).toLocaleDateString('it-IT')} alle{' '}
                  {new Date(appointment.updatedAt).toLocaleTimeString('it-IT', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {canChangeStatus && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
              <h5 className="w-full font-medium text-gray-900 mb-2">Azioni Rapide:</h5>
              
              {appointment.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancella
                </button>
              )}
              
              {appointment.status !== 'rescheduled' && appointment.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('rescheduled')}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Riprogramma
                </button>
              )}
              
              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                <button
                  onClick={() => handleStatusChange('no-show')}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Paziente Assente
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};