import React, { useState } from 'react';
import { Clock, Play, Square, Calendar, TrendingUp, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTimeTracker } from '../hooks/useTimeTracker';

export const TimeTracker: React.FC = () => {
  const { user } = useAuth();
  const { 
    timeEntries, 
    currentEntry, 
    clockIn, 
    clockOut, 
    getTodayHours, 
    getWeekHours, 
    isWorking,
    updateTimeEntry
  } = useTimeTracker(user?.id || '');

  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const handleClockAction = () => {
    if (isWorking) {
      clockOut();
    } else {
      clockIn();
    }
  };

  const handleEditNotes = (entryId: string, currentNotes: string = '') => {
    setEditingEntry(entryId);
    setEditNotes(currentNotes);
  };

  const handleSaveNotes = (entryId: string) => {
    updateTimeEntry(entryId, { notes: editNotes });
    setEditingEntry(null);
    setEditNotes('');
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditNotes('');
  };

  const getRecentEntries = () => {
    return timeEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const getStatusColor = (entry: any) => {
    if (!entry.clockOut) return 'bg-yellow-100 text-yellow-800';
    if (entry.totalHours && entry.totalHours >= 8) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (entry: any) => {
    if (!entry.clockOut) return 'In corso';
    if (entry.totalHours && entry.totalHours >= 8) return 'Completato';
    return 'Parziale';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestione Presenze</h1>
        <p className="text-gray-600 mt-1">Timbra entrata e uscita, monitora le tue ore</p>
      </div>

      {/* Clock In/Out Card */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="text-center">
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              isWorking ? 'bg-green-100 animate-pulse' : 'bg-gray-100'
            }`}>
              <Clock className={`w-10 h-10 ${isWorking ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isWorking ? 'Sei in servizio' : 'Fuori servizio'}
            </h2>
            {currentEntry && (
              <p className="text-gray-600">
                Ingresso: {currentEntry.clockIn} - {new Date(currentEntry.date).toLocaleDateString('it-IT')}
              </p>
            )}
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <button
            onClick={handleClockAction}
            className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
              isWorking
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
            }`}
          >
            {isWorking ? (
              <>
                <Square className="w-6 h-6 mr-3" />
                Timbra Uscita
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-3" />
                Timbra Entrata
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Ore Oggi</h3>
              <p className="text-3xl font-bold text-blue-600">{getTodayHours().toFixed(1)}h</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {isWorking ? 'Timer attivo' : 'Servizio completato'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Ore Settimana</h3>
              <p className="text-3xl font-bold text-green-600">{getWeekHours().toFixed(1)}h</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {getWeekHours() >= 40 ? 'Obiettivo raggiunto' : `Mancano ${(40 - getWeekHours()).toFixed(1)}h`}
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Ultime Presenze</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {getRecentEntries().map((entry) => (
            <div key={entry.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString('it-IT')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.clockIn} - {entry.clockOut || 'In corso'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {entry.totalHours ? `${entry.totalHours.toFixed(1)}h` : 'In corso'}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry)}`}>
                      {getStatusText(entry)}
                    </span>
                  </div>
                  {entry.clockOut && (
                    <button
                      onClick={() => handleEditNotes(entry.id, entry.notes)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Notes Section */}
              {editingEntry === entry.id ? (
                <div className="mt-3 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Aggiungi note..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleSaveNotes(entry.id)}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : entry.notes ? (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{entry.notes}</p>
                </div>
              ) : null}
            </div>
          ))}
          
          {getRecentEntries().length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nessuna presenza registrata</p>
              <p className="text-sm">Inizia timbrando la tua prima entrata</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};