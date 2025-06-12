import React, { useState } from 'react';
import { 
  CheckCircle, X, Calendar, Clock, User, MapPin, 
  FileText, CheckSquare, Save, AlertTriangle
} from 'lucide-react';
import { ServiceActivity } from '../../../types/billing/advanced';
import { useAuth } from '../../../contexts/AuthContext';

interface ActivityApprovalBatchProps {
  activities: ServiceActivity[];
  onApprove: (activityIds: string[]) => void;
  onClose: () => void;
}

export const ActivityApprovalBatch: React.FC<ActivityApprovalBatchProps> = ({
  activities,
  onApprove,
  onClose
}) => {
  const { user } = useAuth();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batchName, setBatchName] = useState(`Approvazione ${new Date().toLocaleDateString('it-IT')}`);
  const [notes, setNotes] = useState('');

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(activities.map(a => a.id));
    }
    setSelectAll(!selectAll);
  };

  const handleToggleActivity = (activityId: string) => {
    if (selectedActivities.includes(activityId)) {
      setSelectedActivities(prev => prev.filter(id => id !== activityId));
      setSelectAll(false);
    } else {
      setSelectedActivities(prev => [...prev, activityId]);
      if (selectedActivities.length + 1 === activities.length) {
        setSelectAll(true);
      }
    }
  };

  const handleApprove = () => {
    if (selectedActivities.length === 0) {
      alert('Seleziona almeno un\'attività da approvare');
      return;
    }
    
    onApprove(selectedActivities);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Approvazione Attività in Batch
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Seleziona le attività da approvare in un'unica operazione
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Batch Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Batch
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Approvatore
                </label>
                <input
                  type="text"
                  value={user?.name || 'Admin'}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  disabled
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={2}
                placeholder="Note opzionali per questo batch di approvazioni..."
              />
            </div>
          </div>

          {/* Activities List */}
          {activities.length > 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleToggleSelectAll}
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seleziona tutte ({activities.length})
                  </span>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                      selectedActivities.includes(activity.id) 
                        ? 'bg-sky-50 dark:bg-sky-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <input
                          type="checkbox"
                          checked={selectedActivities.includes(activity.id)}
                          onChange={() => handleToggleActivity(activity.id)}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getServiceTypeLabel(activity.serviceType)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {activity.id}
                          </div>
                        </div>
                        
                        <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(activity.date).toLocaleDateString('it-IT')}
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {activity.startTime} - {activity.endTime}
                          </div>
                          
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {activity.staffName}
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {activity.location}
                          </div>
                        </div>
                        
                        <div className="mt-1 flex items-center">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {getCategoryLabel(activity.category)}
                          </span>
                          
                          {activity.patientName && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              Utente: {activity.patientName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Nessuna attività da approvare</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Non ci sono attività in attesa di approvazione.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="font-medium text-blue-900 dark:text-blue-300">
                  Riepilogo
                </span>
              </div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {selectedActivities.length} di {activities.length} attività selezionate
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2 inline" />
              Annulla
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={selectedActivities.length === 0}
            >
              <CheckCircle className="w-4 h-4 mr-2 inline" />
              Approva Selezionate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};