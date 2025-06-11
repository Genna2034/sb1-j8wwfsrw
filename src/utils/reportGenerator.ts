/**
 * Generates a PDF report for staff attendance
 * @param attendanceData Array of staff attendance data
 * @param options Options for the report
 * @returns Promise that resolves when the PDF is generated and downloaded
 */
export const generateAttendancePdf = async (
  attendanceData: any[],
  options: {
    month: number;
    year: number;
    showHourlyRate: boolean;
  }
): Promise<void> => {
  try {
    // Dynamically import jsPDF and jspdf-autotable
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Report Presenze ${getMonthName(options.month)} ${options.year}`,
      subject: 'Report Presenze Operatori',
      author: 'Cooperativa Emmanuel',
      creator: 'Emmanuel Reporting System'
    });
    
    // Add header
    addHeader(doc, `Report Presenze - ${getMonthName(options.month)} ${options.year}`);
    
    // If it's a single staff report
    if (attendanceData.length === 1) {
      generateSingleStaffReport(doc, attendanceData[0], options, autoTable);
    } else {
      // Generate summary table for all staff
      generateSummaryTable(doc, attendanceData, options, autoTable);
      
      // Add page break
      doc.addPage();
      
      // Generate individual reports for each staff member
      attendanceData.forEach((staffData, index) => {
        if (index > 0) {
          doc.addPage();
        }
        
        generateSingleStaffReport(doc, staffData, options, autoTable);
      });
    }
    
    // Save the PDF
    const filename = attendanceData.length === 1
      ? `Presenze_${attendanceData[0].staffName.replace(/\s+/g, '_')}_${getMonthName(options.month)}_${options.year}.pdf`
      : `Report_Presenze_${getMonthName(options.month)}_${options.year}.pdf`;
    
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
};

/**
 * Generates an Excel report for staff attendance
 * @param attendanceData Array of staff attendance data
 * @param options Options for the report
 * @returns Promise that resolves when the Excel file is generated and downloaded
 */
export const generateAttendanceExcel = async (
  attendanceData: any[],
  options: {
    month: number;
    year: number;
    showHourlyRate: boolean;
  }
): Promise<void> => {
  try {
    // In a real implementation, we would use a library like xlsx or exceljs
    // For this demo, we'll create a CSV file which can be opened in Excel
    
    // Create CSV content
    let csvContent = "sep=,\n"; // Excel separator hint
    
    // Add header row
    csvContent += "Operatore,Categoria,Ore Totali,Giorni Lavorati,Media Ore/Giorno,Rimborsi,Utenti Seguiti";
    
    if (options.showHourlyRate) {
      csvContent += ",Tariffa Oraria,Compenso Teorico";
    }
    
    csvContent += "\n";
    
    // Add data rows
    attendanceData.forEach(data => {
      csvContent += `"${data.staffName}",`;
      csvContent += `"${data.category}",`;
      csvContent += `${data.totalHours.toFixed(1)},`;
      csvContent += `${data.daysWorked},`;
      csvContent += `${data.avgHoursPerDay.toFixed(1)},`;
      csvContent += `${data.totalReimbursement.toFixed(2)},`;
      csvContent += `${data.clientsCount}`;
      
      if (options.showHourlyRate) {
        csvContent += `,${data.hourlyRate.toFixed(2)},${data.theoreticalCompensation.toFixed(2)}`;
      }
      
      csvContent += "\n";
    });
    
    // Add a blank row
    csvContent += "\n";
    
    // Add detailed section for each staff member
    attendanceData.forEach(data => {
      // Staff header
      csvContent += `"${data.staffName} - ${data.category}"\n`;
      csvContent += "Data,Ora Inizio,Ora Fine,Ore Totali,Note\n";
      
      // Get all dates in the month
      const daysInMonth = new Date(options.year, options.month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(options.year, options.month, day);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = data.calendarData[dateStr];
        
        if (dayData && dayData.entries.length > 0) {
          dayData.entries.forEach((entry: any) => {
            csvContent += `${formatDate(dateStr)},`;
            csvContent += `${entry.clockIn},`;
            csvContent += `${entry.clockOut || ''},`;
            csvContent += `${entry.totalHours ? entry.totalHours.toFixed(1) : ''},`;
            csvContent += `"${entry.notes || ''}"\n`;
          });
        }
      }
      
      // Add reimbursement details
      csvContent += "\nDettaglio Rimborsi\n";
      csvContent += "Tipo,Quantità,Tariffa,Totale\n";
      csvContent += `"Rimborso Chilometrico",${data.reimbursements.mileage},${data.reimbursements.mileageRate.toFixed(2)},${(data.reimbursements.mileage * data.reimbursements.mileageRate).toFixed(2)}\n`;
      csvContent += `"Buoni Pasto",${data.reimbursements.meals},${data.reimbursements.mealRate.toFixed(2)},${(data.reimbursements.meals * data.reimbursements.mealRate).toFixed(2)}\n`;
      csvContent += `"Altri Rimborsi",,,${data.reimbursements.other.toFixed(2)}\n`;
      csvContent += `"Totale Rimborsi",,,${data.totalReimbursement.toFixed(2)}\n`;
      
      // Add blank rows between staff members
      csvContent += "\n\n";
    });
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attendanceData.length === 1
      ? `Presenze_${attendanceData[0].staffName.replace(/\s+/g, '_')}_${getMonthName(options.month)}_${options.year}.csv`
      : `Report_Presenze_${getMonthName(options.month)}_${options.year}.csv`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw error;
  }
};

/**
 * Adds a header to the PDF document
 * @param doc PDF document
 * @param title Title to display in the header
 */
const addHeader = (doc: any, title: string) => {
  // Add company name as logo
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('Cooperativa Sociale Emmanuel', 20, 20);
  
  // Add title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 20, 30);
  
  // Add a line under the header
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 35, 190, 35);
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 20, 40);
};

/**
 * Generates a summary table for all staff
 * @param doc PDF document
 * @param attendanceData Array of staff attendance data
 * @param options Options for the report
 * @param autoTable Function to create tables
 */
const generateSummaryTable = (doc: any, attendanceData: any[], options: any, autoTable: any) => {
  // Add title
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Riepilogo Presenze Operatori', 20, 50);
  
  // Define table headers
  const headers = [
    { header: 'Operatore', dataKey: 'staffName' },
    { header: 'Categoria', dataKey: 'category' },
    { header: 'Ore Totali', dataKey: 'totalHours' },
    { header: 'Giorni', dataKey: 'daysWorked' },
    { header: 'Rimborsi', dataKey: 'totalReimbursement' },
    { header: 'Utenti', dataKey: 'clientsCount' }
  ];
  
  // Add hourly rate and compensation if enabled
  if (options.showHourlyRate) {
    headers.push(
      { header: 'Tariffa', dataKey: 'hourlyRate' },
      { header: 'Compenso', dataKey: 'theoreticalCompensation' }
    );
  }
  
  // Prepare table data
  const tableData = attendanceData.map(data => {
    const row: any = {
      staffName: data.staffName,
      category: data.category,
      totalHours: `${data.totalHours.toFixed(1)}h`,
      daysWorked: data.daysWorked,
      totalReimbursement: `€${data.totalReimbursement.toFixed(2)}`,
      clientsCount: data.clientsCount
    };
    
    if (options.showHourlyRate) {
      row.hourlyRate = `€${data.hourlyRate.toFixed(2)}/h`;
      row.theoreticalCompensation = `€${data.theoreticalCompensation.toFixed(2)}`;
    }
    
    return row;
  });
  
  // Add table
  autoTable(doc, {
    startY: 55,
    head: [headers.map(h => h.header)],
    body: tableData.map(row => headers.map(h => row[h.dataKey])),
    theme: 'striped',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontStyle: 'bold'
    },
    margin: { top: 55, right: 20, bottom: 20, left: 20 }
  });
  
  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Totali:', 20, finalY);
  
  const totalHours = attendanceData.reduce((sum, data) => sum + data.totalHours, 0);
  const totalReimbursements = attendanceData.reduce((sum, data) => sum + data.totalReimbursement, 0);
  
  doc.setFont(undefined, 'normal');
  doc.text(`Ore Totali: ${totalHours.toFixed(1)}h`, 20, finalY + 7);
  doc.text(`Rimborsi Totali: €${totalReimbursements.toFixed(2)}`, 20, finalY + 14);
  
  if (options.showHourlyRate) {
    const totalCompensation = attendanceData.reduce((sum, data) => sum + data.theoreticalCompensation, 0);
    doc.text(`Compenso Teorico Totale: €${totalCompensation.toFixed(2)}`, 20, finalY + 21);
  }
};

/**
 * Generates a detailed report for a single staff member
 * @param doc PDF document
 * @param staffData Staff attendance data
 * @param options Options for the report
 * @param autoTable Function to create tables
 */
const generateSingleStaffReport = (doc: any, staffData: any, options: any, autoTable: any) => {
  // Add staff info
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Foglio Presenza: ${staffData.staffName}`, 20, 50);
  
  doc.setFontSize(11);
  doc.text(`Categoria: ${staffData.category}`, 20, 57);
  doc.text(`Posizione: ${staffData.position}`, 20, 63);
  doc.text(`Periodo: ${getMonthName(options.month)} ${options.year}`, 20, 69);
  
  // Add summary
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Riepilogo:', 20, 80);
  doc.setFont(undefined, 'normal');
  
  doc.text(`Ore Totali: ${staffData.totalHours.toFixed(1)}h`, 20, 87);
  doc.text(`Giorni Lavorati: ${staffData.daysWorked}`, 20, 94);
  doc.text(`Media Ore/Giorno: ${staffData.avgHoursPerDay.toFixed(1)}h`, 20, 101);
  doc.text(`Rimborsi Totali: €${staffData.totalReimbursement.toFixed(2)}`, 20, 108);
  
  if (options.showHourlyRate) {
    doc.text(`Tariffa Oraria: €${staffData.hourlyRate.toFixed(2)}/h`, 20, 115);
    doc.text(`Compenso Teorico: €${staffData.theoreticalCompensation.toFixed(2)}`, 20, 122);
  }
  
  // Add attendance details table
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Dettaglio Presenze:', 20, 135);
  
  // Prepare table data
  const tableData: any[] = [];
  
  // Get all dates in the month
  const daysInMonth = new Date(options.year, options.month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(options.year, options.month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayData = staffData.calendarData[dateStr];
    
    if (dayData && dayData.entries.length > 0) {
      dayData.entries.forEach((entry: any) => {
        tableData.push({
          date: formatDate(dateStr),
          dayOfWeek: getDayOfWeek(date.getDay()),
          clockIn: entry.clockIn,
          clockOut: entry.clockOut || '-',
          totalHours: entry.totalHours ? `${entry.totalHours.toFixed(1)}h` : '-',
          notes: entry.notes || '-'
        });
      });
    }
  }
  
  // Add table
  autoTable(doc, {
    startY: 140,
    head: [['Data', 'Giorno', 'Entrata', 'Uscita', 'Ore', 'Note']],
    body: tableData.map(row => [
      row.date,
      row.dayOfWeek,
      row.clockIn,
      row.clockOut,
      row.totalHours,
      row.notes
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 15 },
      5: { cellWidth: 'auto' }
    },
    margin: { top: 140, right: 20, bottom: 20, left: 20 }
  });
  
  // Add reimbursement details
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  if (finalY > 250) {
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Dettaglio Rimborsi:', 20, 20);
  } else {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Dettaglio Rimborsi:', 20, finalY);
  }
  
  const reimbursementY = finalY > 250 ? 25 : finalY + 5;
  
  // Add reimbursement table
  autoTable(doc, {
    startY: reimbursementY,
    head: [['Tipo', 'Quantità', 'Tariffa', 'Totale']],
    body: [
      [
        'Rimborso Chilometrico',
        `${staffData.reimbursements.mileage} km`,
        `€${staffData.reimbursements.mileageRate.toFixed(2)}/km`,
        `€${(staffData.reimbursements.mileage * staffData.reimbursements.mileageRate).toFixed(2)}`
      ],
      [
        'Buoni Pasto',
        `${staffData.reimbursements.meals}`,
        `€${staffData.reimbursements.mealRate.toFixed(2)}/pasto`,
        `€${(staffData.reimbursements.meals * staffData.reimbursements.mealRate).toFixed(2)}`
      ],
      [
        'Altri Rimborsi',
        '-',
        '-',
        `€${staffData.reimbursements.other.toFixed(2)}`
      ],
      [
        'Totale Rimborsi',
        '',
        '',
        `€${staffData.totalReimbursement.toFixed(2)}`
      ]
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 }
    },
    margin: { top: reimbursementY, right: 20, bottom: 20, left: 20 }
  });
  
  // Add signature area
  const signatureY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Firma Operatore:', 30, signatureY);
  doc.text('Firma Coordinatore:', 120, signatureY);
  
  // Add signature lines
  doc.setDrawColor(0, 0, 0);
  doc.line(30, signatureY + 15, 90, signatureY + 15);
  doc.line(120, signatureY + 15, 180, signatureY + 15);
  
  // Add date
  doc.setFontSize(10);
  doc.text('Data: ____/____/________', 30, signatureY + 25);
  doc.text('Data: ____/____/________', 120, signatureY + 25);
  
  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Cooperativa Sociale Emmanuel - Napoli', 105, pageHeight - 15, { align: 'center' });
  doc.text(`Foglio Presenza - ${staffData.staffName} - ${getMonthName(options.month)} ${options.year}`, 105, pageHeight - 10, { align: 'center' });
};

/**
 * Utility function to get month name
 * @param month Month number (0-11)
 * @returns Month name in Italian
 */
const getMonthName = (month: number): string => {
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return months[month];
};

/**
 * Utility function to format date
 * @param dateStr Date string in ISO format (YYYY-MM-DD)
 * @returns Formatted date (DD/MM/YYYY)
 */
const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Utility function to get day of week name
 * @param dayIndex Day of week index (0-6, where 0 is Sunday)
 * @returns Day name in Italian
 */
const getDayOfWeek = (dayIndex: number): string => {
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  return days[dayIndex];
};