import React, { useEffect } from 'react';
import { User, LogOut, Clock, Users, Calendar, FileText, Home, Bell, Settings, UserPlus, BookOpen, Heart, CalendarDays, Euro } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  // Listen for tab change events from dashboard quick actions
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      onTabChange(event.detail);
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleTabChange as EventListener);
  }, [onTabChange]);

  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseTabs,
          { id: 'timetracker', label: 'Presenze', icon: Clock },
          { id: 'staff', label: 'Team', icon: Users },
          { id: 'medical', label: 'Cartelle Cliniche', icon: Heart },
          { id: 'appointments', label: 'Appuntamenti', icon: CalendarDays },
          { id: 'billing', label: 'Fatturazione', icon: Euro },
          { id: 'calendar', label: 'Diario Sanitario', icon: BookOpen },
          { id: 'reports', label: 'Report', icon: FileText },
          { id: 'management', label: 'Gestione', icon: Settings }
        ];
      case 'coordinator':
        return [
          ...baseTabs,
          { id: 'timetracker', label: 'Presenze', icon: Clock },
          { id: 'staff', label: 'Equipe', icon: Users },
          { id: 'medical', label: 'Cartelle Cliniche', icon: Heart },
          { id: 'appointments', label: 'Appuntamenti', icon: CalendarDays },
          { id: 'billing', label: 'Fatturazione', icon: Euro },
          { id: 'calendar', label: 'Diario Sanitario', icon: BookOpen },
          { id: 'reports', label: 'Report', icon: FileText }
        ];
      case 'staff':
        return [
          ...baseTabs,
          { id: 'timetracker', label: 'Timbratura', icon: Clock },
          { id: 'medical', label: 'Pazienti', icon: Heart },
          { id: 'appointments', label: 'Appuntamenti', icon: CalendarDays },
          { id: 'calendar', label: 'Diario Sanitario', icon: BookOpen }
        ];
      default:
        return baseTabs;
    }
  };

  const tabs = getTabsForRole();

  const handleLogout = () => {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      console.log('🚪 Utente ha confermato il logout');
      logout();
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Amministratore';
      case 'coordinator': return 'Coordinatore';
      case 'staff': return 'Equipe Sanitaria';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Emmanuel</h1>
                <p className="text-xs text-gray-500">Cooperativa Sociale</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  user?.role === 'admin' ? 'bg-purple-100' :
                  user?.role === 'coordinator' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  <User className={`w-4 h-4 ${
                    user?.role === 'admin' ? 'text-purple-600' :
                    user?.role === 'coordinator' ? 'text-blue-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 Cooperativa Sociale Emmanuel - Napoli
            </div>
            <div className="text-sm text-gray-500 mt-2 sm:mt-0">
              Versione 4.0.0 - Sistema Fatturazione - {getRoleDisplayName(user?.role || '')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};