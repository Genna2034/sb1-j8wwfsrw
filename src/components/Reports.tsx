import React, { useState } from 'react';
import { FileText, Download, Calendar, Clock, TrendingUp, Filter, BarChart3, PieChart, FileSpreadsheet, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { AttendanceReports } from './reports/AttendanceReports';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const { timeEntries, getMonthHours } = useTimeTracker(user?.id || '');
  const [activeTab, setActiveTab] = useState<'attendance' | 'financial' | 'clients' | 'performance'>('attendance');
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

  const tabs = [
    { id: 'attendance', label: 'Presenze', icon: Clock },
    { id: 'financial', label: 'Finanziario', icon: TrendingUp },
    { id: 'clients', label: 'Utenti', icon: Users },
    { id: 'performance', label: 'Performance', icon: BarChart3 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportistica</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Analisi dati e generazione report</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
          {/* Tab Content */}
          {activeTab === 'attendance' && <AttendanceReports />}
          
          {activeTab === 'financial' && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Report Finanziari</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}
          
          {activeTab === 'clients' && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Report Utenti</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Report Performance</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;