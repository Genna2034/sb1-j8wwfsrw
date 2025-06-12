import React, { useState, useEffect } from 'react';
import { 
  Euro, Search, Filter, Plus, Edit, Trash2, 
  Clock, Users, Activity, Calendar
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

interface ServiceRate {
  id: string;
  serviceType: string;
  serviceName: string;
  description: string;
  baseRate: number;
  unit: string;
  category: string;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  modifiers: {
    id: string;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    condition: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const ServiceRateList: React.FC = () => {
  const { showToast } = useToast();
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [filteredRates, setFilteredRates] = useState<ServiceRate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRates();
  }, []);

  useEffect(() => {
    filterRates();
  }, [rates, searchTerm, categoryFilter]);

  const loadRates = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setTimeout(() => {
        const mockRates: ServiceRate[] = [
          {
            id: '1',
            serviceType: 'nursing',
            serviceName: 'Assistenza Infermieristica',
            description: 'Servizi di assistenza infermieristica domiciliare',
            baseRate: 25,
            unit: 'ora',
            category: 'Sanitario',
            validFrom: '2025-01-01',
            isActive: true,
            modifiers: [
              {
                id: '1',
                name: 'Festivi',
                type: 'percentage',
                value: 50,
                condition: 'Giorni festivi e domeniche'
              },
              {
                id: '2',
                name: 'Notturno',
                type: 'percentage',
                value: 30,
                condition: 'Orario 22:00-06:00'
              }
            ],
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          },
          {
            id: '2',
            serviceType: 'physiotherapy',
            serviceName: 'Fisioterapia',
            description: 'Sedute di fisioterapia riabilitativa',
            baseRate: 40,
            unit: 'seduta',
            category: 'Riabilitativo',
            validFrom: '2025-01-01',
            isActive: true,
            modifiers: [
              {
                id: '3',
                name: 'Domiciliare',
                type: 'fixed',
                value: 10,
                condition: 'Servizio a domicilio'
              }
            ],
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          },
          {
            id: '3',
            serviceType: 'school_assistance',
            serviceName: 'Assistenza Scolastica',
            description: 'Supporto educativo e assistenza scolastica',
            baseRate: 22,
            unit: 'ora',
            category: 'Educativo',
            validFrom: '2025-01-01',
            isActive: true,
            modifiers: [],
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          },
          {
            id: '4',
            serviceType: 'home_education',
            serviceName: 'Educativa Domiciliare',
            description: 'Servizi educativi domiciliari per minori',
            baseRate: 30,
            unit: 'ora',
            category: 'Educativo',
            validFrom: '2025-01-01',
            isActive: true,
            modifiers: [
              {
                id: '4',
                name: 'Weekend',
                type: 'percentage',
                value: 25,
                condition: 'Sabato e domenica'
              }
            ],
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ];
        
        setRates(mockRates);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading rates:', error);
      setLoading(false);
    }
  };

  const filterRates = () => {
    let filtered = [...rates];
    
    if (searchTerm) {
      filtered = filtered.filter(rate => 
        rate.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(rate => rate.category === categoryFilter);
    }
    
    setFilteredRates(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getCategories = () => {
    return Array.from(new Set(rates.map(rate => rate.category)));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Euro className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tariffe Attive</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : rates.filter(r => r.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Servizi</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : rates.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorie</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? '...' : getCategories().length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tariffa Media</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {loading ? '...' : formatCurrency(rates.reduce((sum, r) => sum + r.baseRate, 0) / rates.length || 0)}
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
                placeholder="Cerca tariffe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutte le categorie</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rates List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tariffe Servizi ({filteredRates.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento tariffe...</p>
          </div>
        ) : filteredRates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Servizio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tariffa Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Modificatori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Validità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <Euro className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{rate.serviceName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{rate.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {rate.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(rate.baseRate)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        per {rate.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rate.modifiers.length > 0 ? (
                        <div className="space-y-1">
                          {rate.modifiers.slice(0, 2).map((modifier) => (
                            <div key={modifier.id} className="text-xs">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {modifier.name}:
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 ml-1">
                                {modifier.type === 'percentage' ? `+${modifier.value}%` : `+${formatCurrency(modifier.value)}`}
                              </span>
                            </div>
                          ))}
                          {rate.modifiers.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{rate.modifiers.length - 2} altri
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Nessuno</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        Dal {new Date(rate.validFrom).toLocaleDateString('it-IT')}
                      </div>
                      {rate.validTo && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Al {new Date(rate.validTo).toLocaleDateString('it-IT')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
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
            <Euro className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nessuna tariffa trovata</p>
          </div>
        )}
      </div>
    </div>
  );
};