import React, { useEffect } from 'react';
import { Clock, Users, Calendar, TrendingUp, CheckCircle, AlertCircle, Play, Square, Settings, UserPlus, BookOpen, Shield, Bell, FileText, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { useNotifications } from '../contexts/NotificationContext';
import { useNotificationScheduler } from '../hooks/useNotificationScheduler';
import { SystemStatus } from './SystemStatus';
import { SupabaseStatus } from './system/SupabaseStatus';
import { useToast } from '../contexts/ToastContext';
import { useMediaQuery, breakpoints } from '../hooks/useMediaQuery';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getTodayHours, getWeekHours, isWorking, currentEntry, clockIn, clockOut } = useTimeTracker(user?.id || '');
  const { showNotification, isPermissionGranted, requestPermission } = useNotifications();
  const { runNow: runNotificationScheduler, lastRun } = useNotificationScheduler();
  const { showToast } = useToast();
  const isMobile = !useMediaQuery(breakpoints.md);

  useEffect(() => {
    // Richiedi permesso notifiche all'avvio
    if (!isPermissionGranted) {
      requestPermission();
    }
    
    // Mostra notifica di benvenuto
    if (isPermissionGranted) {
      showNotification(
        `Benvenuto ${user?.name}`,
        `Accesso effettuato come ${user?.role}. Buon lavoro!`
      );
    }
    
    // Esegui scheduler notifiche
    runNotificationScheduler();
    
    // Mostra toast di benvenuto
    showToast(
      'success',
      `Benvenuto ${user?.name}`,
      `Hai effettuato l'accesso come ${getRoleDisplayName(user?.role || '')}`
    );
  }, [isPermissionGranted]);

  const handleQuickClockAction = () => {
    if (isWorking) {
      clockOut();
      showToast('info', 'Uscita registrata', `Hai timbrato l'uscita alle ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`);
    } else {
      clockIn();
      showToast('success', 'Entrata registrata', `Hai timbrato l'entrata alle ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Amministratore Sistema';
      case 'coordinator': return 'Coordinatore Sanitario';
      case 'staff': return 'Equipe Sanitaria';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-purple-600 to-indigo-700';
      case 'coordinator': return 'from-blue-600 to-cyan-700';
      case 'staff': return 'from-green-600 to-emerald-700';
      default: return 'from-sky-600 to-blue-700';
    }
  };

  const getQuickActions = () => {
    const baseActions = [
      { label: 'Timbratura', icon: Clock, color: 'bg-blue-500', action: 'timetracker' },
      { label: 'Diario Sanitario', icon: BookOpen, color: 'bg-green-500', action: 'calendar' }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseActions,
          { label: 'Gestione Team', icon: Users, color: 'bg-purple-500', action: 'staff' },
          { label: 'Report Completi', icon: TrendingUp, color: 'bg-orange-500', action: 'reports' },
          { label: 'Amministrazione', icon: Settings, color: 'bg-red-500', action: 'management' },
          { label: 'Assegna Utenti', icon: UserPlus, color: 'bg-indigo-500', action: 'assignments' }
        ];
      case 'coordinator':
        return [
          ...baseActions,
          { label: 'Equipe', icon: Users, color: 'bg-cyan-500', action: 'staff' },
          { label: 'Report', icon: TrendingUp, color: 'bg-orange-500', action: 'reports' },
          { label: 'Assegna Utenti', icon: UserPlus, color: 'bg-indigo-500', action: 'assignments' }
        ];
      case 'staff':
        return [
          ...baseActions,
          { label: 'Pazienti', icon: Heart, color: 'bg-pink-500', action: 'medical' },
          { label: 'Messaggi', icon: MessageSquare, color: 'bg-yellow-500', action: 'communications' }
        ];
      default:
        return baseActions;
    }
  };

  const stats = [
    {
      label: 'Ore Oggi',
      value: getTodayHours().toFixed(1),
      icon: Clock,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Ore Settimana',
      value: getWeekHours().toFixed(1),
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Stato',
      value: isWorking ? 'In Servizio' : 'Fuori Servizio',
      icon: isWorking ? CheckCircle : AlertCircle,
      color: isWorking ? 'bg-green-500' : 'bg-gray-500',
      bgColor: isWorking ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`bg-gradient-to-r ${getRoleColor(user?.role || '')} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Benvenuto/a, {user?.name}
            </h1>
            <p className="text-white/90">
              {getRoleDisplayName(user?.role || '')} - {user?.department}
            </p>
            <div className="mt-4 text-sm text-white/80">
              {new Date().toLocaleDateString('it-IT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div className={`p-4 rounded-full ${
            user?.role === 'admin' ? 'bg-purple-500/20' :
            user?.role === 'coordinator' ? 'bg-blue-500/20' : 'bg-green-500/20'
          }`}>
            {user?.role === 'admin' ? <Shield className="w-8 h-8" /> :
             user?.role === 'coordinator' ? <Users className="w-8 h-8" /> :
             <Clock className="w-8 h-8" />}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Status */}
      {!isPermissionGranted && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">Abilita Notifiche</h3>
          </div>
          <p className="text-yellow-700 dark:text-yellow-400 mb-4">
            Attiva le notifiche per ricevere promemoria di appuntamenti, messaggi e aggiornamenti importanti anche quando non stai utilizzando l'applicazione.
          </p>
          <button
            onClick={() => requestPermission()}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors dark:bg-yellow-700 dark:hover:bg-yellow-600"
          >
            Attiva Notifiche
          </button>
        </div>
      )}

      {/* Quick Clock Action - Solo per staff e coordinatori */}
      {(user?.role === 'staff' || user?.role === 'coordinator') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timbra Presenza</h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button
            onClick={handleQuickClockAction}
            className={`w-full flex items-center justify-center py-4 px-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
              isWorking
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 dark:shadow-red-900/25'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 dark:shadow-green-900/25'
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
      )}

      {/* Current Status */}
      {isWorking && currentEntry && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Attualmente in servizio</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-600 dark:text-green-400 font-medium">Ingresso:</span>
              <span className="ml-2 text-green-800 dark:text-green-300">{currentEntry.clockIn}</span>
            </div>
            <div>
              <span className="text-green-600 dark:text-green-400 font-medium">Data:</span>
              <span className="ml-2 text-green-800 dark:text-green-300">
                {new Date(currentEntry.date).toLocaleDateString('it-IT')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Azioni Rapide</h3>
        <div className={`grid grid-cols-2 ${isMobile ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-6'} gap-4`}>
          {getQuickActions().map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  // Trigger tab change event
                  const event = new CustomEvent('changeTab', { detail: action.action });
                  window.dispatchEvent(event);
                }}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all transform hover:scale-105 bg-white dark:bg-gray-800"
              >
                <div className={`p-3 rounded-lg ${action.color} mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Supabase Status - Solo per admin */}
      {user?.role === 'admin' && <SupabaseStatus />}

      {/* System Status - Solo per admin */}
      {user?.role === 'admin' && <SystemStatus />}

      {/* Role-specific information */}
      {user?.role === 'admin' && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Pannello Amministratore</h3>
          </div>
          <p className="text-purple-700 dark:text-purple-400 mb-4">
            Hai accesso completo a tutte le funzionalità del sistema. Puoi gestire utenti, assegnare pazienti e monitorare l'intera attività della cooperativa.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <span className="text-purple-600 dark:text-purple-400 font-medium">Gestione:</span>
              <span className="ml-2 text-purple-800 dark:text-purple-300">Utenti e Credenziali</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <span className="text-purple-600 dark:text-purple-400 font-medium">Assegnazioni:</span>
              <span className="ml-2 text-purple-800 dark:text-purple-300">Pazienti e Turni</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <span className="text-purple-600 dark:text-purple-400 font-medium">Monitoraggio:</span>
              <span className="ml-2 text-purple-800 dark:text-purple-300">Attività Completa</span>
            </div>
          </div>
        </div>
      )}
      
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
                Sistema aggiornato alla versione 5.1.0
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Oggi alle {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Miglioramenti interfaccia utente
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ieri
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Aggiornamenti sicurezza
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                2 giorni fa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;