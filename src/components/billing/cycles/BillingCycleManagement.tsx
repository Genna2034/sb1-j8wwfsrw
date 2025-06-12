import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, Filter, Plus, Edit, Trash2, Eye, 
  Play, Pause, CheckCircle, Clock, AlertTriangle, FileText
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

interface BillingCycle {
  id: string;
  name: string;
  description: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  entities: string[];
  contracts: string[];
  totalActivities: number;
  approvedActivities: number;
  generatedInvoices: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  lastRunDate?: string;
  nextRunDate?: string;
}

export const BillingCycleManagement: React.FC = () => {
  const { showToast } = useToast();
  const [cycles, setCycles] = useState<BillingCycle[]>([]);
  const [filteredCycles, setFilteredCycles] = useState<BillingCycle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCycles();
  }, []);

  useEffect(() => {
    filterCycles();
  }, [cycles, searchTerm, statusFilter]);

  const loadCycles = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setTimeout(() => {
        const mockCycles: BillingCycle[] = [
          {
            id: '1',
            name: 'Fatturazione Giugno 2025',
            description: 'Ciclo di fatturazione mensile per il mese di giugno 2025',
            frequency: 'monthly',
            startDate: '2025-06-01',
            endDate: '2025-06-30',
            status: 'active',
            entities: ['1', '2', '3'],
            contracts: ['1', '2'],
            totalActivities: 156,
            approvedActivities: 142,
            generatedInvoices: 8,
            totalAmount: 28500,
            createdAt: '2025-06-01T00:00:00Z',
            updatedAt: '2025-06-15T10:30:00Z',
            lastRunDate: '2025-06-15T10:30:00Z',
            nextRunDate: '2025-07-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'Fatturazione Q2 2025',
            description: 'Ciclo di fatturazione trimestrale per il secondo trimestre 2025',
            frequency: 'quarterly',
            startDate: '2025-04-01',
            endDate: '2025-06-30',
            status: 'completed',
            entities: ['1', '4'],
            contracts: ['3'],
            totalActivities: 420,
            approvedActivities: 420,
            generatedInvoices: 12,
            totalAmount: 85000,
            createdAt: '2025-04-01T00:00:00Z',
            updatedAt: '2025-07-01T09:00:00Z',
            lastRunDate: '2025-07-01T09:00:00Z'
          },
          {
            id: '3',
            name: 'Fatturazione Luglio 2025',
            description: 'Ciclo di fatturazione mensile per il mese di luglio 2025',
            frequency: 'monthly',
            startDate: '2025-07-01',
            endDate: '2025-07-31',
            status: 'draft',
            entities: ['1', '2', '3', '4'],
            contracts: ['1', '2', '3'],
            totalActivities: 0,
            approvedActivities: 0,
            generatedInvoices: 0,
            totalAmount: 0,
            createdAt: '2025-06-20T00:00:00Z',
            updatedAt: '2025-06-20T00:00:00Z'
          }
        ];
        
        setCycles(mockCycles);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading billing cycles:', error);
      setLoading(false);
    }
  };

  const filterCycles = () => {
    let filtered = [...cycles];
    
    if (searchTerm) {
      filtered = filtered.filter(cycle => 
        cycle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cycle.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cycle => cycle.status === statusFilter);
    }
    
    setFilteredCycles(filtered);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'draft': return 'Bozza';
      case 'active': return 'Attivo';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Annullato';
      default: return status;
    }
  };

  const getFrequencyText = (frequency: string): string => {
    switch (frequency) {
      case 'monthly': return 'Mensile';
      case 'quarterly': return 'Trimestrale';
      case 'yearly': return 'Annuale';
      default: return frequency;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleStartCycle = (cycleId: string) => {
    setCycles(prev => prev.map(cycle => {
      if (cycle.id === cycleId) {
        return {
          ...cycle,
          status: 'active',
          updatedAt: new Date().toISOString()
        };
      }
      return cycle;
    }));
    showToast('success', 'Ciclo avviato', 'Il ciclo di fatturazione è stato avviato con successo');
  };

  const handlePauseCycle = (cycleId: string) => {
    setCycles(prev => prev.map(cycle => {
      if (cycle.id === cycleId) {
        return {
          ...cycle,
          status: 'draft',
          updatedAt: new Date().toISOString()
        };
      }
      return cycle;
    }));
    showToast('success', 'Ciclo sospeso', 'Il ciclo di fatturazione è stato sospeso');
  };

  const handleCompleteCycle = (cycleId: string) => {
    setCycles(prev => prev.map(cycle => {
      if (cycle.id === cycleId) {
        return {
          ...cycle,
          status: 'completed',
          updatedAt: new Date().toISOString()
        };
      }
      return cycle;
    }));
    showToast('success', 'Ciclo completato', 'Il ciclo di fatturazione è stato completato');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cicli Attivi</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : cycles.filter(c => c.status === 'active').length}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completati</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : cycles.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Bozza</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? '...' : cycles.filter(c => c.status === 'draft').length}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fatture Generate</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? '...' : cycles.reduce((sum, c) => sum + c.generatedInvoices, 0)}
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
                placeholder="Cerca cicli di fatturazione..."
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
            <option value="draft">Bozze</option>
            <option value="active">Attivi</option>
            <option value="completed">Completati</option>
            <option value="cancelled">Annullati</option>
          </select>
        </div>
      </div>

      {/* Cycles List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cicli di Fatturazione ({filteredCycles.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento cicli...</p>
          </div>
        ) : filteredCycles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ciclo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Attività
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fatture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Importo
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
                {filteredCycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{cycle.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{getFrequencyText(cycle.frequency)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(cycle.startDate).toLocaleDateString('it-IT')} - {new Date(cycle.endDate).toLocaleDateString('it-IT')}
                      </div>
                      {cycle.nextRunDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Prossima esecuzione: {new Date(cycle.nextRunDate).toLocaleDateString('it-IT')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {cycle.approvedActivities} / {cycle.totalActivities}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" 
                          style={{ width: `${cycle.totalActivities > 0 ? (cycle.approvedActivities / cycle.totalActivities) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {cycle.generatedInvoices}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        generate
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(cycle.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                        {getStatusText(cycle.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Visualizza"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {cycle.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleStartCycle(cycle.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Avvia"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                              title="Modifica"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {cycle.status === 'active' && (
                          <>
                            <button
                              onClick={() => handlePauseCycle(cycle.id)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                              title="Sospendi"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCompleteCycle(cycle.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Completa"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {cycle.status === 'draft' && (
                          <button
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
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nessun ciclo di fatturazione trovato</p>
          </div>
        )}
      </div>
    </div>
  );
};