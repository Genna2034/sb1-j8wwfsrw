import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, Download, Calendar, Filter, 
  FileText, FileSpreadsheet, Printer, TrendingUp, 
  Building, User, Euro, Clock
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

export const BillingReports: React.FC = () => {
  const { showToast } = useToast();
  const [activeReport, setActiveReport] = useState<string>('revenue');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [entities, setEntities] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadEntities();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [activeReport, period, year, month, entityFilter, categoryFilter]);

  const loadEntities = async () => {
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockEntities = [
          { id: '1', name: 'Comune di Napoli' },
          { id: '2', name: 'ASL Napoli 1 Centro' },
          { id: '3', name: 'Istituto Comprensivo Statale "Virgilio 4"' },
          { id: '4', name: 'Famiglia Esposito' }
        ];
        
        setEntities(mockEntities);
      }, 500);
    } catch (error) {
      console.error('Error loading entities:', error);
    }
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        let mockData;
        
        switch (activeReport) {
          case 'revenue':
            mockData = generateRevenueReportData();
            break;
          case 'activity':
            mockData = generateActivityReportData();
            break;
          case 'entity':
            mockData = generateEntityReportData();
            break;
          case 'staff':
            mockData = generateStaffReportData();
            break;
          default:
            mockData = generateRevenueReportData();
        }
        
        setReportData(mockData);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading report data:', error);
      setLoading(false);
    }
  };

  const generateRevenueReportData = () => {
    // Generate mock revenue report data
    return {
      title: 'Report Fatturato',
      summary: {
        total: 45680.50,
        invoiced: 45680.50,
        collected: 32450.75,
        outstanding: 13229.75,
        overdue: 5680.25
      },
      byMonth: [
        { month: 'Gen', value: 3250.50 },
        { month: 'Feb', value: 3680.25 },
        { month: 'Mar', value: 4120.75 },
        { month: 'Apr', value: 3950.00 },
        { month: 'Mag', value: 4580.50 },
        { month: 'Giu', value: 4250.75 }
      ],
      byCategory: [
        { category: 'Socio-sanitario', value: 28750.25 },
        { category: 'Educativo-assistenziale', value: 12680.50 },
        { category: 'Sostegno', value: 4250.75 }
      ],
      byEntity: [
        { entity: 'Comune di Napoli', value: 18250.50 },
        { entity: 'ASL Napoli 1 Centro', value: 15680.25 },
        { entity: 'Istituto Comprensivo Statale "Virgilio 4"', value: 9450.75 },
        { entity: 'Famiglia Esposito', value: 2300.00 }
      ]
    };
  };

  const generateActivityReportData = () => {
    // Generate mock activity report data
    return {
      title: 'Report Attività',
      summary: {
        totalActivities: 256,
        totalHours: 1250.5,
        approvedActivities: 230,
        pendingActivities: 15,
        rejectedActivities: 11
      },
      byCategory: [
        { category: 'Socio-sanitario', value: 145 },
        { category: 'Educativo-assistenziale', value: 85 },
        { category: 'Sostegno', value: 26 }
      ],
      byServiceType: [
        { type: 'Assistenza Infermieristica', value: 85 },
        { type: 'Fisioterapia', value: 45 },
        { type: 'Assistenza Domiciliare', value: 15 },
        { type: 'Assistenza Scolastica', value: 65 },
        { type: 'Educativa Domiciliare', value: 20 },
        { type: 'Sostegno Disabilità', value: 26 }
      ],
      byStaff: [
        { staff: 'Anna Verdi', value: 120.5 },
        { staff: 'Marco Bianchi', value: 95.0 },
        { staff: 'Laura Neri', value: 85.5 }
      ]
    };
  };

  const generateEntityReportData = () => {
    // Generate mock entity report data
    return {
      title: 'Report Clienti',
      summary: {
        totalEntities: 4,
        activeContracts: 8,
        totalInvoiced: 45680.50,
        totalCollected: 32450.75
      },
      entities: [
        {
          name: 'Comune di Napoli',
          invoiced: 18250.50,
          collected: 12450.25,
          outstanding: 5800.25,
          contracts: 3,
          lastInvoice: '2025-06-15'
        },
        {
          name: 'ASL Napoli 1 Centro',
          invoiced: 15680.25,
          collected: 15680.25,
          outstanding: 0,
          contracts: 2,
          lastInvoice: '2025-06-10'
        },
        {
          name: 'Istituto Comprensivo Statale "Virgilio 4"',
          invoiced: 9450.75,
          collected: 2450.25,
          outstanding: 7000.50,
          contracts: 2,
          lastInvoice: '2025-06-05'
        },
        {
          name: 'Famiglia Esposito',
          invoiced: 2300.00,
          collected: 1870.00,
          outstanding: 430.00,
          contracts: 1,
          lastInvoice: '2025-06-01'
        }
      ]
    };
  };

  const generateStaffReportData = () => {
    // Generate mock staff report data
    return {
      title: 'Report Operatori',
      summary: {
        totalStaff: 3,
        totalHours: 1250.5,
        totalActivities: 256,
        averageHoursPerStaff: 416.8
      },
      staff: [
        {
          name: 'Anna Verdi',
          position: 'Infermiere',
          hours: 450.5,
          activities: 95,
          revenue: 11250.00,
          clients: 12
        },
        {
          name: 'Marco Bianchi',
          position: 'Educatore',
          hours: 420.0,
          activities: 85,
          revenue: 9240.00,
          clients: 8
        },
        {
          name: 'Laura Neri',
          position: 'Fisioterapista',
          hours: 380.0,
          activities: 76,
          revenue: 15200.00,
          clients: 10
        }
      ]
    };
  };

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    setGenerating(true);
    try {
      // In a real implementation, this would generate and download a report
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reportName = `${activeReport}_report_${period}_${year}${period === 'month' ? `_${month + 1}` : ''}`;
      showToast('success', 'Report generato', `Il report è stato generato in formato ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error generating report:', error);
      showToast('error', 'Errore', 'Si è verificato un errore durante la generazione del report');
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getMonthName = (monthIndex: number): string => {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[monthIndex];
  };

  const getPeriodLabel = (): string => {
    switch (period) {
      case 'month':
        return `${getMonthName(month)} ${year}`;
      case 'quarter':
        const quarterNumber = Math.floor(month / 3) + 1;
        return `${quarterNumber}° Trimestre ${year}`;
      case 'year':
        return `Anno ${year}`;
      default:
        return '';
    }
  };

  const reports = [
    { id: 'revenue', label: 'Fatturato', icon: Euro },
    { id: 'activity', label: 'Attività', icon: Clock },
    { id: 'entity', label: 'Clienti', icon: Building },
    { id: 'staff', label: 'Operatori', icon: User }
  ];

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => setActiveReport(report.id)}
                    className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                      activeReport === report.id
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{report.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleGenerateReport('pdf')}
              disabled={generating}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              PDF
            </button>
            
            <button
              onClick={() => handleGenerateReport('excel')}
              disabled={generating}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Periodo:</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['month', 'quarter', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {p === 'month' ? 'Mese' : p === 'quarter' ? 'Trimestre' : 'Anno'}
                </button>
              ))}
            </div>
          </div>
          
          {period === 'month' && (
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{getMonthName(i)}</option>
              ))}
            </select>
          )}
          
          {period === 'quarter' && (
            <select
              value={Math.floor(month / 3)}
              onChange={(e) => setMonth(parseInt(e.target.value) * 3)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>1° Trimestre</option>
              <option value={1}>2° Trimestre</option>
              <option value={2}>3° Trimestre</option>
              <option value={3}>4° Trimestre</option>
            </select>
          )}
          
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            {[2025, 2024, 2023].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutti i clienti</option>
            {entities.map(entity => (
              <option key={entity.id} value={entity.id}>{entity.name}</option>
            ))}
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
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {reportData?.title || 'Report'} - {getPeriodLabel()}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleGenerateReport('pdf')}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Scarica PDF"
              >
                <FileText className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleGenerateReport('excel')}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Scarica Excel"
              >
                <FileSpreadsheet className="w-5 h-5" />
              </button>
              <button
                onClick={() => {/* Print action */}}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Stampa"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento report...</p>
          </div>
        ) : reportData ? (
          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {activeReport === 'revenue' && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Fatturato Totale</span>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                        {formatCurrency(reportData.summary.total)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Incassato</span>
                      <span className="text-lg font-bold text-green-900 dark:text-green-200">
                        {formatCurrency(reportData.summary.collected)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Da Incassare</span>
                      <span className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                        {formatCurrency(reportData.summary.outstanding)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">Scaduto</span>
                      <span className="text-lg font-bold text-red-900 dark:text-red-200">
                        {formatCurrency(reportData.summary.overdue)}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {activeReport === 'activity' && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Attività Totali</span>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                        {reportData.summary.totalActivities}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Ore Totali</span>
                      <span className="text-lg font-bold text-green-900 dark:text-green-200">
                        {reportData.summary.totalHours.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Approvate</span>
                      <span className="text-lg font-bold text-purple-900 dark:text-purple-200">
                        {reportData.summary.approvedActivities}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">In Attesa</span>
                      <span className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                        {reportData.summary.pendingActivities}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {activeReport === 'entity' && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Clienti Totali</span>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                        {reportData.summary.totalEntities}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Contratti Attivi</span>
                      <span className="text-lg font-bold text-purple-900 dark:text-purple-200">
                        {reportData.summary.activeContracts}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Fatturato</span>
                      <span className="text-lg font-bold text-green-900 dark:text-green-200">
                        {formatCurrency(reportData.summary.totalInvoiced)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Incassato</span>
                      <span className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                        {formatCurrency(reportData.summary.totalCollected)}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {activeReport === 'staff' && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Operatori</span>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                        {reportData.summary.totalStaff}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Ore Totali</span>
                      <span className="text-lg font-bold text-green-900 dark:text-green-200">
                        {reportData.summary.totalHours.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Attività</span>
                      <span className="text-lg font-bold text-purple-900 dark:text-purple-200">
                        {reportData.summary.totalActivities}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Media Ore</span>
                      <span className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                        {reportData.summary.averageHoursPerStaff.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  {activeReport === 'revenue' ? 'Fatturato per Mese' :
                   activeReport === 'activity' ? 'Attività per Categoria' :
                   activeReport === 'entity' ? 'Fatturato per Cliente' :
                   'Ore per Operatore'}
                </h4>
                <div className="h-64 flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
              
              {/* Right Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  {activeReport === 'revenue' ? 'Distribuzione per Categoria' :
                   activeReport === 'activity' ? 'Distribuzione per Tipo Servizio' :
                   activeReport === 'entity' ? 'Stato Pagamenti' :
                   'Distribuzione Attività'}
                </h4>
                <div className="h-64 flex items-center justify-center">
                  <PieChart className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            </div>

            {/* Detailed Data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                {activeReport === 'revenue' ? 'Dettaglio Fatturato' :
                 activeReport === 'activity' ? 'Dettaglio Attività' :
                 activeReport === 'entity' ? 'Dettaglio Clienti' :
                 'Dettaglio Operatori'}
              </h4>
              
              {activeReport === 'revenue' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Importo
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.byCategory.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.category}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {formatCurrency(item.value)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {((item.value / reportData.summary.total) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeReport === 'entity' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fatturato
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Incassato
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Da Incassare
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Contratti
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Ultima Fattura
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.entities.map((entity: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {entity.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {formatCurrency(entity.invoiced)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                            {formatCurrency(entity.collected)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                            {formatCurrency(entity.outstanding)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                            {entity.contracts}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(entity.lastInvoice).toLocaleDateString('it-IT')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeReport === 'staff' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Operatore
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Posizione
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Ore
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Attività
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fatturato
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Utenti
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.staff.map((staff: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {staff.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {staff.position}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {staff.hours.toFixed(1)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {staff.activities}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {formatCurrency(staff.revenue)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                            {staff.clients}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeReport === 'activity' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Tipo Servizio
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Attività
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.byServiceType.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.type}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {item.value}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {((item.value / reportData.summary.totalActivities) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nessun dato disponibile</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Seleziona un periodo diverso o modifica i filtri
            </p>
          </div>
        )}
      </div>
    </div>
  );
};