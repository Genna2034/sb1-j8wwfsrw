import React, { useState, useEffect } from 'react';
import { 
  FileText, Euro, TrendingUp, CreditCard, Plus, Calculator, PieChart, 
  BarChart3, Calendar, Users, Settings, Building, FileSpreadsheet, 
  Clock, CheckSquare, AlertTriangle, Filter, Search, Download, Send
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BillingEntityList } from './entities/BillingEntityList';
import { ServiceContractList } from './contracts/ServiceContractList';
import { ServiceRateList } from './rates/ServiceRateList';
import { ActivityManagement } from './activities/ActivityManagement';
import { BillingCycleManagement } from './cycles/BillingCycleManagement';
import { InvoiceManagement } from './invoices/InvoiceManagement';
import { ElectronicInvoicing } from './electronic/ElectronicInvoicing';
import { BillingReports } from './reports/BillingReports';
import { BillingSettings } from './settings/BillingSettings';

export const AdvancedBillingSystem: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        setStats({
          entities: 12,
          contracts: 8,
          pendingActivities: 24,
          draftInvoices: 5,
          monthlyRevenue: 28500,
          outstandingAmount: 12350,
          overdueAmount: 3200
        });
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading billing stats:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'entities', label: 'Clienti', icon: Building },
    { id: 'contracts', label: 'Contratti', icon: FileText },
    { id: 'rates', label: 'Tariffe', icon: Euro },
    { id: 'activities', label: 'Attività', icon: CheckSquare },
    { id: 'cycles', label: 'Cicli Fatturazione', icon: Calendar },
    { id: 'invoices', label: 'Fatture', icon: FileSpreadsheet },
    { id: 'electronic', label: 'Fatturazione Elettronica', icon: Send },
    { id: 'reports', label: 'Report', icon: PieChart },
    { id: 'settings', label: 'Impostazioni', icon: Settings }
  ];

  // Only admin and coordinator can access billing
  if (user?.role !== 'admin' && user?.role !== 'coordinator') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Accesso non autorizzato
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Non hai i permessi necessari per accedere al sistema di fatturazione avanzato.
          Contatta l'amministratore per maggiori informazioni.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistema di Fatturazione Avanzato
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestione completa di clienti, contratti, attività e fatturazione elettronica
          </p>
        </div>
        
        {activeTab === 'entities' && (
          <button
            onClick={() => {/* Add entity action */}}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Cliente
          </button>
        )}
        
        {activeTab === 'contracts' && (
          <button
            onClick={() => {/* Add contract action */}}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Contratto
          </button>
        )}
        
        {activeTab === 'invoices' && (
          <button
            onClick={() => {/* Add invoice action */}}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuova Fattura
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clienti</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {loading ? '...' : stats.entities}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Euro className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fatturato Mensile</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {loading ? '...' : formatCurrency(stats.monthlyRevenue)}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attività da Approvare</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {loading ? '...' : stats.pendingActivities}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Importi Scaduti</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {loading ? '...' : formatCurrency(stats.overdueAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex space-x-4 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stato Fatturazione</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Bozze da emettere</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{loading ? '...' : stats.draftInvoices}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Da incassare</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{loading ? '...' : formatCurrency(stats.outstandingAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Scaduti</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{loading ? '...' : formatCurrency(stats.overdueAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Contratti attivi</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{loading ? '...' : stats.contracts}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Azioni Rapide</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="font-medium text-blue-900 dark:text-blue-300">Approva Attività</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {stats.pendingActivities} attività in attesa
                      </p>
                    </button>
                    
                    <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                        <span className="font-medium text-green-900 dark:text-green-300">Genera Fatture</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Per il ciclo corrente
                      </p>
                    </button>
                    
                    <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <Send className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                        <span className="font-medium text-purple-900 dark:text-purple-300">Invia Fatture</span>
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-400">
                        {stats.draftInvoices} fatture pronte
                      </p>
                    </button>
                    
                    <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <Download className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                        <span className="font-medium text-orange-900 dark:text-orange-300">Esporta Report</span>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        Fatturato e attività
                      </p>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Revenue Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Andamento Fatturato</h3>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Grafico andamento fatturato (in sviluppo)
                  </p>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attività Recenti</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Fattura FT-2025/0042 emessa
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Oggi alle {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        12 attività approvate per Comune di Napoli
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ieri
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Pagamento ricevuto per fattura FT-2025/0038
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        2 giorni fa
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Entities Tab */}
          {activeTab === 'entities' && <BillingEntityList />}
          
          {/* Contracts Tab */}
          {activeTab === 'contracts' && <ServiceContractList />}
          
          {/* Rates Tab */}
          {activeTab === 'rates' && <ServiceRateList />}
          
          {/* Activities Tab */}
          {activeTab === 'activities' && <ActivityManagement />}
          
          {/* Billing Cycles Tab */}
          {activeTab === 'cycles' && <BillingCycleManagement />}
          
          {/* Invoices Tab */}
          {activeTab === 'invoices' && <InvoiceManagement />}
          
          {/* Electronic Invoicing Tab */}
          {activeTab === 'electronic' && <ElectronicInvoicing />}
          
          {/* Reports Tab */}
          {activeTab === 'reports' && <BillingReports />}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && <BillingSettings />}
        </div>
      </div>
    </div>
  );
};

export default AdvancedBillingSystem;