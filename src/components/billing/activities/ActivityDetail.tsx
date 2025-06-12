import React, { useState } from 'react';
import { 
  User, Clock, MapPin, Calendar, FileText, Edit, X, 
  CheckCircle, XCircle, Download, Printer, Send
} from 'lucide-react';
import { ServiceActivity } from '../../../types/billing/advanced';

interface ActivityDetailProps {
  activity: ServiceActivity;
  onEdit: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export const ActivityDetail: React.FC<ActivityDetailProps> = ({
  activity,
  onEdit,
  onApprove,
  onReject,
  onClose
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Inserisci un motivo per il rifiuto');
      return;
    }
    onReject(rejectionReason);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'billed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return 'In Attesa';
      case 'approved': return 'Approvata';
      case 'rejected': return 'Rifiutata';
      case 'billed': return 'Fatturata';
      default: return status;
    }
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'healthcare': return 'Socio-sanitario';
      case 'educational': return 'Educativo-assistenziale';
      case 'support': return 'Sostegno';
      default: return category;
    }
  };

  const getServiceTypeLabel = (serviceType: string): string => {
    switch (serviceType) {
      // Healthcare
      case 'nursing': return 'Assistenza Infermieristica';
      case 'physiotherapy': return 'Fisioterapia';
      case 'homecare': return 'Assistenza Domiciliare';
      case 'daycare': return 'Centro Diurno';
      case 'residential': return 'Residenziale';
      
      // Educational
      case 'school_assistance': return 'Assistenza Scolastica';
      case 'home_education': return 'Educativa Domiciliare';
      case 'cultural_mediation': return 'Mediazione Culturale';
      
      // Support
      case 'disability_support': return 'Sostegno Disabilità';
      case 'specialized_assistance': return 'Assistenza Specialistica';
      case 'rehabilitation': return 'Riabilitazione';
      
      default: return serviceType;
    }
  };

  const getLocationTypeLabel = (type: string): string => {
    switch (type) {
      case 'home': return 'Domicilio';
      case 'school': return 'Scuola';
      case 'facility': return 'Struttura';
      case 'other': return 'Altro';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dettaglio Attività
              </h3>
              <div className="flex items-center mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {getStatusText(activity.status)}
                </span>
                <span className="mx-2 text-gray-400 dark:text-gray-500">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {activity.id}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {activity.status === 'pending' && (
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Modifica"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Informazioni Base
              </h4>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm text-blue-800 dark:text-blue-300">
                      Data: {new Date(activity.date).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm text-blue-800 dark:text-blue-300">
                      Orario: {activity.startTime} - {activity.endTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm text-blue-800 dark:text-blue-300">
                      Durata: {(activity.duration / 60).toFixed(1)} ore
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Persone
              </h4>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm text-green-800 dark:text-green-300">
                      Operatore: {activity.staffName}
                    </span>
                  </div>
                  
                  {activity.patientName && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm text-green-800 dark:text-green-300">
                        Utente: {activity.patientName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Dettagli Servizio
              </h4>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-sm text-purple-800 dark:text-purple-300">
                      Categoria: {getCategoryLabel(activity.category)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-sm text-purple-800 dark:text-purple-300">
                      Tipo Servizio: {getServiceTypeLabel(activity.serviceType)}
                    </span>
                  </div>
                  
                  {activity.contractId && (
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                      <span className="text-sm text-purple-800 dark:text-purple-300">
                        Contratto: {activity.contractId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                Luogo
              </h4>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                    <span className="text-sm text-orange-800 dark:text-orange-300">
                      {activity.location}
                    </span>
                  </div>
                  
                  {activity.locationDetails && (
                    <>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                        <span className="text-sm text-orange-800 dark:text-orange-300">
                          Tipo: {getLocationTypeLabel(activity.locationDetails.type)}
                        </span>
                      </div>
                      
                      {activity.locationDetails.name && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                          <span className="text-sm text-orange-800 dark:text-orange-300">
                            Nome: {activity.locationDetails.name}
                          </span>
                        </div>
                      )}
                      
                      {activity.locationDetails.address && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                          <span className="text-sm text-orange-800 dark:text-orange-300">
                            Indirizzo: {activity.locationDetails.address}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Objectives and Notes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              Obiettivi e Note
            </h4>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
              {activity.objectives && activity.objectives.length > 0 ? (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Obiettivi:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {activity.objectives.map((objective, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Nessun obiettivo specificato</p>
              )}
              
              {activity.notes ? (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note:</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {activity.notes}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Nessuna nota</p>
              )}
            </div>
          </div>

          {/* Status Information */}
          {activity.status !== 'pending' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                Stato
              </h4>
              
              <div className={`rounded-lg p-4 border ${
                activity.status === 'approved' ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' :
                activity.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' :
                activity.status === 'billed' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' :
                'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600'
              }`}>
                {activity.status === 'approved' && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">
                        Approvata
                      </span>
                    </div>
                    
                    {activity.approvedBy && (
                      <div className="text-sm text-green-700 dark:text-green-400">
                        Approvata da: {activity.approvedBy}
                      </div>
                    )}
                    
                    {activity.approvedAt && (
                      <div className="text-sm text-green-700 dark:text-green-400">
                        Data approvazione: {new Date(activity.approvedAt).toLocaleString('it-IT')}
                      </div>
                    )}
                  </div>
                )}
                
                {activity.status === 'rejected' && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">
                        Rifiutata
                      </span>
                    </div>
                    
                    {activity.rejectionReason && (
                      <div className="text-sm text-red-700 dark:text-red-400">
                        Motivo: {activity.rejectionReason}
                      </div>
                    )}
                  </div>
                )}
                
                {activity.status === 'billed' && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Fatturata
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signature Information */}
          {activity.signature && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                Firma
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Firmato da: {activity.signature.signedBy}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Tipo firma: {activity.signature.signatureType === 'digital' ? 'Digitale' : 'Fisica'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Data: {new Date(activity.signature.timestamp).toLocaleString('it-IT')}
                    </span>
                  </div>
                  
                  {activity.signature.verificationCode && (
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Codice verifica: {activity.signature.verificationCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Motivo del rifiuto</h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-red-200 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-red-900/30 dark:text-white mb-3"
                rows={3}
                placeholder="Inserisci il motivo del rifiuto..."
                required
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Conferma Rifiuto
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {activity.status === 'pending' && (
              <>
                <button
                  onClick={onApprove}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approva
                </button>
                
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rifiuta
                </button>
              </>
            )}
            
            <button
              onClick={() => {/* Download action */}}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Scarica PDF
            </button>
            
            <button
              onClick={() => {/* Print action */}}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Stampa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};