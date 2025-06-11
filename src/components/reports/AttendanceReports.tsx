import React, { useState, useEffect } from 'react';
import { Calendar, Download, FileText, Filter, Users, Clock, DollarSign, Car, Utensils, FileSpreadsheet, Printer, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUsers } from '../../utils/userManagement';
import { getTimeEntries } from '../../utils/storage';
import { useToast } from '../../contexts/ToastContext';
import { generateAttendancePdf, generateAttendanceExcel } from '../../utils/reportGenerator';

export const AttendanceReports: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [showHourlyRate, setShowHourlyRate] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStaff, setPreviewStaff] = useState<any>(null);

  useEffect(() => {
    loadStaffList();
  }, [user]);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth, selectedYear, selectedStaff, selectedCategory]);

  const loadStaffList = () => {
    try {
      let allStaff = getUsers().filter(u => u.role === 'staff');
      
      // Filter based on user role
      if (user?.role === 'coordinator') {
        // Coordinators can only see staff in their department
        allStaff = allStaff.filter(s => s.department === user.department);
      } else if (user?.role === 'staff') {
        // Staff can only see themselves
        allStaff = allStaff.filter(s => s.id === user.id);
      }
      
      setStaffList(allStaff);
      
      // If staff user, automatically select themselves
      if (user?.role === 'staff') {
        setSelectedStaff(user.id);
      }
    } catch (error) {
      console.error('Error loading staff list:', error);
      showToast('error', 'Errore', 'Impossibile caricare la lista del personale');
    }
  };

  const loadAttendanceData = () => {
    try {
      const allTimeEntries = getTimeEntries();
      
      // Filter entries by month and year
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      
      // Format dates for comparison
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Filter entries
      let filteredEntries = allTimeEntries.filter(entry => 
        entry.date >= startDateStr && entry.date <= endDateStr
      );
      
      // Filter by staff if selected
      if (selectedStaff !== 'all') {
        filteredEntries = filteredEntries.filter(entry => entry.userId === selectedStaff);
      }
      
      // Filter by category if selected
      if (selectedCategory !== 'all') {
        // Get staff IDs in the selected category
        const staffInCategory = staffList.filter(s => getStaffCategory(s.department) === selectedCategory)
          .map(s => s.id);
        
        filteredEntries = filteredEntries.filter(entry => staffInCategory.includes(entry.userId));
      }
      
      // Group entries by staff
      const entriesByStaff: Record<string, any[]> = {};
      
      filteredEntries.forEach(entry => {
        if (!entriesByStaff[entry.userId]) {
          entriesByStaff[entry.userId] = [];
        }
        entriesByStaff[entry.userId].push(entry);
      });
      
      // Calculate summary for each staff
      const attendanceSummary = Object.keys(entriesByStaff).map(staffId => {
        const staffEntries = entriesByStaff[staffId];
        const staffMember = staffList.find(s => s.id === staffId) || {
          id: staffId,
          name: 'Utente sconosciuto',
          department: '',
          position: ''
        };
        
        // Calculate total hours
        const totalHours = staffEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
        
        // Calculate days worked
        const daysWorked = new Set(staffEntries.map(entry => entry.date)).size;
        
        // Calculate average hours per day
        const avgHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;
        
        // Generate calendar data (entries by day)
        const calendarData: Record<string, any> = {};
        
        // Initialize all days of the month
        const daysInMonth = endDate.getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(selectedYear, selectedMonth, day);
          const dateStr = date.toISOString().split('T')[0];
          calendarData[dateStr] = { entries: [] };
        }
        
        // Add entries to calendar
        staffEntries.forEach(entry => {
          if (calendarData[entry.date]) {
            calendarData[entry.date].entries.push(entry);
          }
        });
        
        // Mock reimbursement data (in a real app, this would come from the database)
        const reimbursements = {
          mileage: Math.round(Math.random() * 200), // km
          mileageRate: 0.35, // € per km
          meals: Math.floor(Math.random() * 10), // number of meals
          mealRate: 7.5, // € per meal
          other: Math.round(Math.random() * 50) // €
        };
        
        const totalReimbursement = 
          (reimbursements.mileage * reimbursements.mileageRate) + 
          (reimbursements.meals * reimbursements.mealRate) + 
          reimbursements.other;
        
        // Calculate theoretical compensation (hourly rate * total hours)
        const hourlyRate = 15 + Math.floor(Math.random() * 10); // € per hour (mock data)
        const theoreticalCompensation = totalHours * hourlyRate;
        
        return {
          staffId,
          staffName: staffMember.name,
          department: staffMember.department,
          position: staffMember.position,
          category: getStaffCategory(staffMember.department),
          totalHours,
          daysWorked,
          avgHoursPerDay,
          calendarData,
          reimbursements,
          totalReimbursement,
          hourlyRate,
          theoreticalCompensation,
          clientsCount: Math.floor(Math.random() * 10) + 1 // Mock data
        };
      });
      
      setAttendanceData(attendanceSummary);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      showToast('error', 'Errore', 'Impossibile caricare i dati di presenza');
    }
  };

  const getStaffCategory = (department: string): string => {
    if (department.toLowerCase().includes('domiciliare')) {
      return 'Assistenza domiciliare';
    } else if (department.toLowerCase().includes('scolastica') || 
               department.toLowerCase().includes('educativa')) {
      return 'Assistenza scolastica';
    } else {
      return 'Altro';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Assistenza domiciliare':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'Assistenza scolastica':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        newMonth = 11;
        newYear = selectedYear - 1;
      } else {
        newMonth = selectedMonth - 1;
      }
    } else {
      if (selectedMonth === 11) {
        newMonth = 0;
        newYear = selectedYear + 1;
      } else {
        newMonth = selectedMonth + 1;
      }
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleExportPdf = async (staffId?: string) => {
    try {
      setIsGeneratingPdf(true);
      
      // If staffId is provided, export for a single staff member
      // Otherwise, export for all filtered staff
      const dataToExport = staffId 
        ? attendanceData.filter(data => data.staffId === staffId)
        : attendanceData;
      
      if (dataToExport.length === 0) {
        showToast('warning', 'Nessun dato', 'Non ci sono dati da esportare per il periodo selezionato');
        return;
      }
      
      // Generate PDF
      await generateAttendancePdf(
        dataToExport,
        {
          month: selectedMonth,
          year: selectedYear,
          showHourlyRate
        }
      );
      
      showToast('success', 'PDF Generato', 'Il report è stato scaricato con successo');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('error', 'Errore', 'Impossibile generare il PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportExcel = async (staffId?: string) => {
    try {
      setIsGeneratingExcel(true);
      
      // If staffId is provided, export for a single staff member
      // Otherwise, export for all filtered staff
      const dataToExport = staffId 
        ? attendanceData.filter(data => data.staffId === staffId)
        : attendanceData;
      
      if (dataToExport.length === 0) {
        showToast('warning', 'Nessun dato', 'Non ci sono dati da esportare per il periodo selezionato');
        return;
      }
      
      // Generate Excel
      await generateAttendanceExcel(
        dataToExport,
        {
          month: selectedMonth,
          year: selectedYear,
          showHourlyRate
        }
      );
      
      showToast('success', 'Excel Generato', 'Il report è stato scaricato con successo');
    } catch (error) {
      console.error('Error generating Excel:', error);
      showToast('error', 'Errore', 'Impossibile generare il file Excel');
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const handleShowPreview = (staffData: any) => {
    setPreviewStaff(staffData);
    setShowPreview(true);
  };

  const getMonthName = (month: number): string => {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[month];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Check if user has permission to see hourly rates and compensation
  const canSeeFinancialData = user?.role === 'admin' || user?.role === 'coordinator';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Presenze</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Esportazione fogli presenza e reportistica
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Month/Year Selector */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {getMonthName(selectedMonth)} {selectedYear}
            </div>
            
            <button
              onClick={() => handleMonthChange('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Staff Filter - Only for admin and coordinator */}
            {(user?.role === 'admin' || user?.role === 'coordinator') && (
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tutti gli operatori</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
            )}
            
            {/* Category Filter - Only for admin */}
            {user?.role === 'admin' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tutte le categorie</option>
                <option value="Assistenza domiciliare">Assistenza Domiciliare</option>
                <option value="Assistenza scolastica">Assistenza Scolastica</option>
              </select>
            )}
            
            {/* Show Hourly Rate Toggle - Only for admin and coordinator */}
            {canSeeFinancialData && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHourlyRate}
                  onChange={() => setShowHourlyRate(!showHourlyRate)}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Mostra tariffe e compensi</span>
              </label>
            )}
          </div>
          
          {/* Export Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => handleExportPdf()}
              disabled={isGeneratingPdf || attendanceData.length === 0}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Esporta PDF
            </button>
            
            <button
              onClick={() => handleExportExcel()}
              disabled={isGeneratingExcel || attendanceData.length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isGeneratingExcel ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Esporta Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Riepilogo Presenze {getMonthName(selectedMonth)} {selectedYear}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Operatore
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ore Totali
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Giorni Lavorati
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rimborsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Utenti Seguiti
                </th>
                {canSeeFinancialData && showHourlyRate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Compenso Teorico
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {attendanceData.length > 0 ? (
                attendanceData.map((data) => (
                  <tr key={data.staffId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{data.staffName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{data.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(data.category)}`}>
                        {data.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{data.totalHours.toFixed(1)}h</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Media: {data.avgHoursPerDay.toFixed(1)}h/giorno</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {data.daysWorked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(data.totalReimbursement)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {data.reimbursements.mileage} km, {data.reimbursements.meals} pasti
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {data.clientsCount}
                    </td>
                    {canSeeFinancialData && showHourlyRate && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(data.theoreticalCompensation)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(data.hourlyRate)}/h</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleShowPreview(data)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Anteprima"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportPdf(data.staffId)}
                          disabled={isGeneratingPdf}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          title="Esporta PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportExcel(data.staffId)}
                          disabled={isGeneratingExcel}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                          title="Esporta Excel"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canSeeFinancialData && showHourlyRate ? 8 : 7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Nessun dato di presenza trovato per il periodo selezionato
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewStaff && (
        <StaffAttendancePreview
          staffData={previewStaff}
          month={selectedMonth}
          year={selectedYear}
          showFinancialData={canSeeFinancialData && showHourlyRate}
          onClose={() => setShowPreview(false)}
          onExportPdf={() => handleExportPdf(previewStaff.staffId)}
          onExportExcel={() => handleExportExcel(previewStaff.staffId)}
        />
      )}
    </div>
  );
};

// Staff Attendance Preview Modal
const StaffAttendancePreview: React.FC<{
  staffData: any;
  month: number;
  year: number;
  showFinancialData: boolean;
  onClose: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}> = ({ staffData, month, year, showFinancialData, onClose, onExportPdf, onExportExcel }) => {
  const getMonthName = (month: number): string => {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[month];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Generate calendar days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayData = staffData.calendarData[dateStr];
    
    const dayEntries = dayData?.entries || [];
    const totalHours = dayEntries.reduce((sum: number, entry: any) => sum + (entry.totalHours || 0), 0);
    
    calendarDays.push({
      day,
      date: dateStr,
      dayOfWeek: date.getDay(),
      entries: dayEntries,
      totalHours
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Foglio Presenza: {staffData.staffName}
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={onExportPdf}
                className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </button>
              <button
                onClick={onExportExcel}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Excel
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Staff Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Operatore</p>
                <p className="font-medium text-gray-900 dark:text-white">{staffData.staffName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{staffData.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Categoria</p>
                <p className="font-medium text-gray-900 dark:text-white">{staffData.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Periodo</p>
                <p className="font-medium text-gray-900 dark:text-white">{getMonthName(month)} {year}</p>
              </div>
            </div>
          </div>
          
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h4 className="font-medium text-blue-900 dark:text-blue-300">Ore Lavorate</h4>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{staffData.totalHours.toFixed(1)}h</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {staffData.daysWorked} giorni • Media: {staffData.avgHoursPerDay.toFixed(1)}h/giorno
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Car className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <h4 className="font-medium text-green-900 dark:text-green-300">Rimborsi</h4>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(staffData.totalReimbursement)}</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {staffData.reimbursements.mileage} km • {staffData.reimbursements.meals} pasti
              </p>
            </div>
            
            {showFinancialData ? (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <h4 className="font-medium text-purple-900 dark:text-purple-300">Compenso Teorico</h4>
                </div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{formatCurrency(staffData.theoreticalCompensation)}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Tariffa: {formatCurrency(staffData.hourlyRate)}/h
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                  <h4 className="font-medium text-orange-900 dark:text-orange-300">Utenti Seguiti</h4>
                </div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{staffData.clientsCount}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Nel mese di {getMonthName(month)}
                </p>
              </div>
            )}
          </div>
          
          {/* Calendar */}
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Calendario Presenze</h4>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day, index) => (
                <div key={index} className="p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before the 1st of the month */}
              {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, index) => (
                <div key={`empty-start-${index}`} className="p-2 h-24 bg-gray-50 dark:bg-gray-700"></div>
              ))}
              
              {/* Days of the month */}
              {calendarDays.map((day) => (
                <div 
                  key={day.date} 
                  className={`p-2 h-24 border border-gray-100 dark:border-gray-700 ${
                    day.dayOfWeek === 0 || day.dayOfWeek === 6 
                      ? 'bg-gray-50 dark:bg-gray-700' 
                      : 'bg-white dark:bg-gray-800'
                  } overflow-hidden`}
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                    {day.day}
                  </div>
                  
                  {day.entries.length > 0 ? (
                    <>
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {day.totalHours.toFixed(1)}h
                      </div>
                      {day.entries.map((entry: any, index: number) => (
                        <div key={index} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {entry.clockIn} - {entry.clockOut || 'In corso'}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-xs text-gray-400 dark:text-gray-500">-</div>
                  )}
                </div>
              ))}
              
              {/* Empty cells for days after the end of the month */}
              {Array.from({ length: (7 - ((new Date(year, month, 1).getDay() + daysInMonth) % 7)) % 7 }).map((_, index) => (
                <div key={`empty-end-${index}`} className="p-2 h-24 bg-gray-50 dark:bg-gray-700"></div>
              ))}
            </div>
          </div>
          
          {/* Reimbursements */}
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Dettaglio Rimborsi</h4>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantità
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tariffa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Totale
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Rimborso Chilometrico
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {staffData.reimbursements.mileage} km
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(staffData.reimbursements.mileageRate)}/km
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(staffData.reimbursements.mileage * staffData.reimbursements.mileageRate)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Buoni Pasto
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {staffData.reimbursements.meals}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(staffData.reimbursements.mealRate)}/pasto
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(staffData.reimbursements.meals * staffData.reimbursements.mealRate)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Altri Rimborsi
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    -
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    -
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(staffData.reimbursements.other)}
                  </td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td colSpan={3} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                    Totale Rimborsi:
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(staffData.totalReimbursement)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Signature Area */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Firma Operatore</p>
                <div className="mt-2 h-12 w-48 border-b-2 border-gray-300 dark:border-gray-600"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Firma Coordinatore</p>
                <div className="mt-2 h-12 w-48 border-b-2 border-gray-300 dark:border-gray-600"></div>
              </div>
            </div>
          </div>
          
          {/* Print Button */}
          <div className="flex justify-center">
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors no-print"
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

export default AttendanceReports;