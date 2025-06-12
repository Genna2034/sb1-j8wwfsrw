import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Plus, Edit, Trash2, Eye, 
  Calendar, Users, Euro, Building, CheckCircle, XCircle
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

interface ServiceContract {
  id: string;
  number: string;
  entityId: string;
  entityName: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'suspended' | 'draft';
  totalValue: number;
  services: string[];
  billingFrequency: 'monthly' | 'quarterly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export const ServiceContractList: React.FC = () => {
  const { showToast } = useToast();
  const [contracts, setContracts] = useState<ServiceContract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ServiceContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [contracts, searchTerm, statusFilter]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setTimeout(() => {
        const mockContracts: ServiceContract[] = [
          {
            id: '1',
            number: 'CONTR-2025/001',
            entityId: '1',
            entityName: 'Comune di Napoli',
            title: 'Servizi di Assistenza Domiciliare',
            description: 'Contratto per servizi di assistenza domiciliare per anziani',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'active',
            totalValue: 120000,
            services: ['nursing', 'home_care'],
            billingFrequency: 'monthly',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          },
          {
            id: '2',
            number: 'CONTR-2025/002',
            entityId: '2',
            entityName: 'ASL Napoli 1 Centro',
            title: 'Servizi di Fisioterapia',
            description: 'Contratto per servizi di fisioterapia ambulatoriale',
            startDate: '2025-02-01',
            endDate: '2026-01-31',
            status: 'active',
            totalValue: 80000,
            services: ['physiotherapy'],
            billingFrequency: 'quarterly',
            createdAt: '2025-02-01T00:00:00Z',
            updatedAt: '2025-02-01T00:00:00Z'
          }
        ];
        
        setContracts(mockContracts);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setLoading(false);
    }
  };

  const filterContracts = () => {
    let filtered = [...contracts];
    
    if (searchTerm) {
      filtered = filtered.filter(contract => 
        contract.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.entityName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }
    
    setFilteredContracts(filtered);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'expired': return 'Scaduto';
      case 'suspended': return 'Sospeso';
      case 'draft': return 'Bozza';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contratti Attivi</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : contracts.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Euro className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valore Totale</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : formatCurrency(contracts.reduce((sum, c) => sum + c.totalValue, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Scadenza</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? '...' : '2'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clienti</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? '...' : new Set(contracts.map(c => c.entityId)).size}
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
                placeholder="Cerca contratti..."
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
            <option value="active">Attivi</option>
            <option value="expired">Scaduti</option>
            <option value="suspended">Sospesi</option>
            <option value="draft">Bozze</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contratti di Servizio ({filteredContracts.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento contratti...</p>
          </div>
        ) : filteredContracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contratto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valore
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
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{contract.number}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{contract.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{contract.entityName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(contract.startDate).toLocaleDateString('it-IT')} - {new Date(contract.endDate).toLocaleDateString('it-IT')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(contract.totalValue)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {contract.billingFrequency === 'monthly' ? 'Mensile' : 
                         contract.billingFrequency === 'quarterly' ? 'Trimestrale' : 'Annuale'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
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
                        <button
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Modifica"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nessun contratto trovato</p>
          </div>
        )}
      </div>
    </div>
  );
};