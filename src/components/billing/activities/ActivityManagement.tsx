import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Search, Filter, Plus, Edit, Trash2, Eye, 
  Calendar, Clock, User, MapPin, CheckCircle, XCircle, 
  AlertTriangle, FileText, Download, BarChart3
} from 'lucide-react';
import { ServiceActivity } from '../../../types/billing/advanced';
import { ActivityForm } from './ActivityForm';
import { ActivityDetail } from './ActivityDetail';
import { ActivityApprovalBatch } from './ActivityApprovalBatch';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

export const ActivityManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activities, setActivities] = useState<ServiceActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ServiceActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showApprovalBatch, setShowApprovalBatch] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ServiceActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, statusFilter, categoryFilter, dateFilter]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockActivities: ServiceActivity[] = [
          {
            id: '1',
            staffId: '3',
            staffName: 'Anna Verdi',
            patientId: 'patient-1',
            patientName: 'Mario Rossi',
            serviceType: 'nursing',
            category: 'healthcare',
            contractId: 'contract-1',
            date: '2025-06-15',
            startTime: '09:00',
            endTime: '10:30',
            duration: 90,
            location: 'Domicilio',
            locationDetails: {
              type: 'home',
              name: 'Casa del paziente',
              address: 'Via Roma 123, Napoli'
            },
            status: 'pending',
            notes: 'Assistenza infermieristica di routine',
            objectives: ['Misurazione parametri vitali', 'Somministrazione farmaci'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            staffId: '4',
            staffName: 'Marco Bianchi',
            patientId: 'patient-2',
            patientName: 'Giulia Verdi',
            serviceType: 'school_assistance',
            category: 'educational',
            contractId: 'contract-2',
            date: '2025-06-15',
            startTime: '08:30',
            endTime: '12:30',
            duration: 240,
            location: 'Scuola',
            locationDetails: {
              type: 'school',
              name: 'Istituto Comprensivo Virgilio 4',
              address: 'Via Labriola 10, Napoli'
            },
            status: 'approved',
            approvedBy: 'Gennaro Borriello',
            approvedAt: new Date().toISOString(),
            notes: 'Assistenza scolastica per alunno con disabilità',
            objectives: ['Supporto didattico', 'Facilitazione relazioni con compagni'],
            signature: {
              signedBy: 'Dirigente Scolastico',
              signatureType: 'digital',
              timestamp: new Date().toISOString(),
              verificationCode: 'ABC123'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            staffId: '5',
            staffName: 'Laura Neri',
            patientId: 'patient-3',
            patientName: 'Antonio Esposito',
            serviceType: 'physiotherapy',
            category: 'healthcare',
            contractId: 'contract-3',
            date: '2025-06-14',
            startTime: '15:00',
            endTime: '16:00',
            duration: 60,
            location: 'Centro Diurno',
            locationDetails: {
              type: 'facility',
              name: 'Centro Diurno Emmanuel',
              address: 'Via Napoli 45, Napoli'
            },
            status: 'rejected',
            rejectionReason: 'Orario sovrapposto con altra attività',
            notes: 'Seduta di fisioterapia',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '4',
            staffId: '3',
            staffName: 'Anna Verdi',
            patientId: 'patient-4',
            patientName: 'Sofia Romano',
            serviceType: 'nursing',
            category: 'healthcare',
            contractId: 'contract-1',
            date: '2025-06-16',
            startTime: '11:00',
            endTime: '12:00',
            duration: 60,
            location: 'Domicilio',
            locationDetails: {
              type: 'home',
              name: 'Casa del paziente',
              address: 'Via Garibaldi 78, Napoli'
            },
            status: 'pending',
            notes: 'Prelievo ematico e controllo parametri',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setActivities(mockActivities);
        
        // Calculate stats
        const pendingCount = mockActivities.filter(a => a.status === 'pending').length;
        const approvedCount = mockActivities.filter(a => a.status === 'approved').length;
        const rejectedCount = mockActivities.filter(a => a.status === 'rejected').length;
        const billedCount = mockActivities.filter(a => a.status === 'billed').length;
        
        const healthcareCount = mockActivities.filter(a => a.category === 'healthcare').length;
        const educationalCount = mockActivities.filter(a => a.category === 'educational').length;
        const supportCount = mockActivities.filter(a => a.category === 'support').length;
        
        setStats({
          total: mockActivities.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          billed: billedCount,
          healthcare: healthcareCount,
          educational: educationalCount,
          support: supportCount,
          totalHours: mockActivities.reduce((sum, a) => sum + a.duration / 60, 0)
        });
        
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading activities:', error);
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];
    
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity => activity.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(activity => activity.category === categoryFilter);
    }
    
    if (dateFilter) {
      filtered = filtered.filter(activity => activity.date === dateFilter);
    }
    
    setFilteredActivities(filtered);
  };

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setShowForm(true);
  };

  const handleEditActivity = (activity: ServiceActivity) => {
    setSelectedActivity(activity);
    setShowForm(true);
  };

  const handleViewActivity = (activity: ServiceActivity) => {
    setSelectedActivity(activity);
    setShowDetail(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa attività? Questa azione non può essere annullata.')) {
      // In a real implementation, this would call an API
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      showToast('success', 'Attività eliminata', 'L\'attività è stata eliminata con successo');
    }
  };

  const handleSaveActivity = (activity: ServiceActivity) => {
    if (selectedActivity) {
      // Update existing activity
      setActivities(prev => prev.map(a => a.id === activity.id ? activity : a));
      showToast('success', 'Attività aggiornata', 'Le informazioni dell\'attività sono state aggiornate');
    } else {
      // Add new activity
      const newActivity = {
        ...activity,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setActivities(prev => [...prev, newActivity]);
      showToast('success', 'Attività aggiunta', 'La nuova attività è stata aggiunta con successo');
    }
    setShowForm(false);
  };

  const handleApproveActivity = (activityId: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          status: 'approved',
          approvedBy: user?.name || 'Admin',
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return activity;
    }));
    showToast('success', 'Attività approvata', 'L\'attività è stata approvata con successo');
  };

  const handleRejectActivity = (activityId: string, reason: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          status: 'rejected',
          rejectionReason: reason,
          updatedAt: new Date().toISOString()
        };
      }
      return activity;
    }));
    showToast('success', 'Attività rifiutata', 'L\'attività è stata rifiutata');
  };

  const handleCreateApprovalBatch = () => {
    setShowApprovalBatch(true);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'billed': return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
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

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'healthcare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'educational': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'support': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Attesa</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? '...' : stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approvate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : stats.approved}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ore Totali</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : stats.totalHours.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fatturate</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? '...' : stats.billed}
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
                placeholder="Cerca per operatore, utente o luogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In Attesa</option>
            <option value="approved">Approvate</option>
            <option value="rejected">Rifiutate</option>
            <option value="billed">Fatturate</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutte le categorie</option>
            <option value="healthcare">Socio-sanitario</option>
            <option value="educational">Educativo-assistenziale</option>
            <option value="support">Sostegno</option>
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddActivity}
              className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuova Attività
            </button>
            
            <button
              onClick={handleCreateApprovalBatch}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approva Selezionate
            </button>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Attività ({filteredActivities.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento attività...</p>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Operatore
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Servizio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Orario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Luogo
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
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(activity.date).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {activity.staffName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                          {getCategoryLabel(activity.category)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getServiceTypeLabel(activity.serviceType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {activity.startTime} - {activity.endTime}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(activity.duration / 60).toFixed(1)} ore
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {activity.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(activity.status)}
                        <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status === 'pending' ? 'In Attesa' :
                           activity.status === 'approved' ? 'Approvata' :
                           activity.status === 'rejected' ? 'Rifiutata' :
                           activity.status === 'billed' ? 'Fatturata' : activity.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewActivity(activity)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Visualizza"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {activity.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleEditActivity(activity)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Modifica"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleApproveActivity(activity.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Approva"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleRejectActivity(activity.id, 'Attività rifiutata')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Rifiuta"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {activity.status !== 'billed' && (
                          <button
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nessuna attività trovata</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || dateFilter
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Aggiungi la tua prima attività per iniziare'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && !dateFilter && (
              <button
                onClick={handleAddActivity}
                className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Aggiungi Attività
              </button>
            )}
          </div>
        )}
      </div>

      {/* Activity Form Modal */}
      {showForm && (
        <ActivityForm
          activity={selectedActivity}
          onSave={handleSaveActivity}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Activity Detail Modal */}
      {showDetail && selectedActivity && (
        <ActivityDetail
          activity={selectedActivity}
          onEdit={() => {
            setShowDetail(false);
            setShowForm(true);
          }}
          onApprove={() => {
            handleApproveActivity(selectedActivity.id);
            setShowDetail(false);
          }}
          onReject={(reason) => {
            handleRejectActivity(selectedActivity.id, reason);
            setShowDetail(false);
          }}
          onClose={() => setShowDetail(false)}
        />
      )}

      {/* Approval Batch Modal */}
      {showApprovalBatch && (
        <ActivityApprovalBatch
          activities={activities.filter(a => a.status === 'pending')}
          onApprove={(activityIds) => {
            activityIds.forEach(id => handleApproveActivity(id));
            setShowApprovalBatch(false);
          }}
          onClose={() => setShowApprovalBatch(false)}
        />
      )}
    </div>
  );
};