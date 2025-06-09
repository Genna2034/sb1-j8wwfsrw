import { useState, useEffect } from 'react';
import { TimeEntry } from '../types/auth';
import { getTimeEntries, saveTimeEntry, updateStaffPresence } from '../utils/storage';

export const useTimeTracker = (userId: string) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);

  useEffect(() => {
    const entries = getTimeEntries().filter(entry => entry.userId === userId);
    setTimeEntries(entries);
    
    // Check if there's an active entry (clocked in but not out)
    const activeEntry = entries.find(entry => 
      entry.date === new Date().toISOString().split('T')[0] && !entry.clockOut
    );
    setCurrentEntry(activeEntry || null);
  }, [userId]);

  const clockIn = () => {
    const now = new Date();
    const entry: TimeEntry = {
      id: `${userId}-${now.getTime()}`,
      userId,
      date: now.toISOString().split('T')[0],
      clockIn: now.toTimeString().slice(0, 5)
    };
    
    saveTimeEntry(entry);
    updateStaffPresence(userId, true, entry.clockIn);
    setCurrentEntry(entry);
    setTimeEntries(prev => [...prev, entry]);
  };

  const clockOut = () => {
    if (currentEntry) {
      const now = new Date();
      const updatedEntry = {
        ...currentEntry,
        clockOut: now.toTimeString().slice(0, 5),
        totalHours: calculateHours(currentEntry.clockIn, now.toTimeString().slice(0, 5))
      };
      
      saveTimeEntry(updatedEntry);
      updateStaffPresence(userId, false);
      setCurrentEntry(null);
      setTimeEntries(prev => 
        prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
      );
    }
  };

  const updateTimeEntry = (entryId: string, updates: Partial<TimeEntry>) => {
    const updatedEntries = timeEntries.map(entry => 
      entry.id === entryId ? { ...entry, ...updates } : entry
    );
    setTimeEntries(updatedEntries);
    
    const updatedEntry = updatedEntries.find(entry => entry.id === entryId);
    if (updatedEntry) {
      saveTimeEntry(updatedEntry);
    }
  };

  const calculateHours = (clockIn: string, clockOut: string): number => {
    const [inHour, inMin] = clockIn.split(':').map(Number);
    const [outHour, outMin] = clockOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    return Math.round((outMinutes - inMinutes) / 60 * 100) / 100;
  };

  const getTodayHours = (): number => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = timeEntries.filter(entry => entry.date === today);
    return todayEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0);
  };

  const getWeekHours = (): number => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= today;
    });
    
    return weekEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0);
  };

  const getMonthHours = (): number => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= today;
    });
    
    return monthEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0);
  };

  return {
    timeEntries,
    currentEntry,
    clockIn,
    clockOut,
    updateTimeEntry,
    getTodayHours,
    getWeekHours,
    getMonthHours,
    isWorking: !!currentEntry
  };
};