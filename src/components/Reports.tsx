import React, { useState } from 'react';
import { FileText, Download, Calendar, Clock, TrendingUp, Filter, BarChart3, PieChart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTimeTracker } from '../hooks/useTimeTracker';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const { timeEntries, getMonthHours } = useTimeTracker(user?.id || '');
  const [dateRange, setDateRange] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportType, setReportType] = useState('summary');

  const generateReport = () => {
    const reportData = {
      user: {
        name: user?.name,
        position: user?.position,
        department: user?.department
      },
      period: {
        type: dateRange,
        month: selectedMonth,
        year: selectedYear
      },
      summary: {
        totalHours: getFilteredEntries().reduce((sum, entry) => sum + (entry.totalHours || 0), 0),
        workingDays: getFilteredEntries().filter(entry => entry.totalHours && entry.totalHours > 0).length,
        averageHours: getFilteredEntries().length > 0 ? 
          getFilteredEntries().reduce((sum, entry) => sum + (entry.totalHours || 0), 0) / 
          getFilteredEntries().filter(entry => entry.totalHours && entry.totalHours > 0).length : 0
      },
      entries: getFilteredEntries(),
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-presenze-${user?.name?.replace(/\s+/g, '-')}-${selectedMonth + 1}-${selectedYear}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const generateCSVReport = () => {
    const entries = getFilteredEntries();
    const csvHeader = 'Data,Entrata,Uscita,Ore Totali,Note\n';
    const csvData = entries.map(entry => 
      `${entry.date},${entry.clockIn},${entry.clockOut || ''},${entry.totalHours || ''},${entry.notes || ''}`
    ).join('\n');
    
    const csvContent = csvHeader + csvData;
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `presenze-${user?.name?.replace(/\s+/g, '-')}-${selectedMonth + 1}-${selectedYear}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getFilteredEntries = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0);
        break;
      case 'year':
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31);
        break;
      default:
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0);
    }

    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  const filteredEntries = getFilteredEntries();
  const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
  const workingDays = filteredEntries.filter(entry => entry.totalHours && entry.totalHours > 0).length;
  const averageHours = workingDays > 0 ? totalHours / workingDays : 0;

  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Calculate weekly distribution
  const weeklyData = filteredEntries.reduce((acc, entry) => {
    if (entry.totalHours) {
      const date = new Date(entry.date);
      const dayName = date.toLocaleDateString('it-IT', { weekday: 'long' });
      acc[dayName] = (acc[dayName] || 0) + entry.totalHours;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Presenze</h1>
          <p className="text-gray-600 mt-1">Analizza le tue ore lavorate e genera report dettagliati</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateCSVReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </button>
          <button
            onClick={generateReport}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filtri:</span>
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="week">Ultima Settimana</option>
            <option value="month">Mese Selezionato</option>
            <option value="year">Anno Selezionato</option>
          </select>

          {(dateRange === 'month' || dateRange === 'year') && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}

          {dateRange === 'month' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          )}

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="summary">Riepilogo</option>
            <option value="detailed">Dettagliato</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ore Totali</p>
              <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Giorni Lavorati</p>
              <p className="text-2xl font-bold text-green-600">{workingDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Media Giornaliera</p>
              <p className="text-2xl font-bold text-purple-600">{averageHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Efficienza</p>
              <p className="text-2xl font-bold text-orange-600">
                {workingDays > 0 ? Math.round((averageHours / 8) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {reportType === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione Settimanale</h3>
            <div className="space-y-3">
              {Object.entries(weeklyData).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{day}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-sky-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((hours / Math.max(...Object.values(weeklyData))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-12 text-right">{hours.toFixed(1)}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Mensile</h3>
            <div className="text-center py-8">
              <PieChart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Grafico trend disponibile nella versione completa</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Entries */}
      {(reportType === 'summary' || reportType === 'detailed') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {reportType === 'detailed' ? 'Dettaglio Completo Presenze' : 'Riepilogo Presenze'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrata
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uscita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ore Totali
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  {reportType === 'detailed' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.clockIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.clockOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.totalHours ? `${entry.totalHours.toFixed(1)}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.clockOut 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.clockOut ? 'Completato' : 'In corso'}
                      </span>
                    </td>
                    {reportType === 'detailed' && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.notes || '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEntries.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nessuna presenza nel periodo selezionato</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};