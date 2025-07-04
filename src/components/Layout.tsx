import React, { useEffect, useState } from 'react';
import { User, LogOut, Clock, Users, Calendar, FileText, Home, Bell, Settings, UserPlus, BookOpen, Heart, CalendarDays, Euro, MessageSquare, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBadge, NotificationPanel } from './communications/NotificationPanel';
import { ThemeToggle } from './ui/ThemeToggle';
import { useMediaQuery, breakpoints } from '../hooks/useMediaQuery';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = !useMediaQuery(breakpoints.lg);
  const [isVercelDeployment, setIsVercelDeployment] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Check if running on Vercel and if debug mode is enabled
  useEffect(() => {
    const isVercel = window.location.hostname.includes('vercel.app');
    setIsVercelDeployment(isVercel);
    
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug') === 'true';
    setIsDebugMode(debug);
    
    if (isVercel) {
      console.log('🌐 Layout: Running on Vercel deployment');
      console.log('🌐 User in Layout:', {
        name: user?.name,
        role: user?.role,
        department: user?.department
      });
    }
    
    if (debug) {
      console.log('🐛 Debug mode enabled');
      console.log('🐛 Available tabs:', getTabsForRole().map(t => t.id));
    }
  }, [user]);

  // Listen for tab change events from dashboard quick actions
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      onTabChange(event.detail);
      setMobileMenuOpen(false); // Close mobile menu when changing tabs
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleTabChange as EventListener);
  }, [onTabChange]);

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

  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ];

    // Log for debugging on Vercel
    if (isVercelDeployment) {
      console.log('🌐 Getting tabs for role:', user?.role);
    }

    switch (user?.role) {
      case 'admin':
        return [
          ...baseTabs,
          { id: 'timetracker', label: 'Presenze', icon: Clock },
          { id: 'staff', label: 'Team', icon: Users },
          { id: 'medical', label: 'Cartelle Cliniche', icon: Heart },
          { id: 'assignments', label: 'Assegna Utenti', icon: UserPlus },
          { id: 'appointments', label: 'Appuntamenti', icon: CalendarDays },
          { id: 'advanced-billing', label: 'Fatturazione Avanzata', icon: Building },
          { id: 'billing', label: 'Fatturazione', icon: Euro },
          { id: 'communications', label: 'Comunicazioni', icon: MessageSquare },
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
          { id: 'assignments', label: 'Assegna Utenti', icon: UserPlus },
          { id: 'appointments', label: 'Appuntamenti', icon: CalendarDays },
          { id: 'advanced-billing', label: 'Fatturazione Avanzata', icon: Building },
          { id: 'billing', label: 'Fatturazione', icon: Euro },
          { id: 'communications', label: 'Comunicazioni', icon: MessageSquare },
          { id: 'calendar', label: 'Diario Sanitario', icon: BookOpen },
          { id: 'reports', label: 'Report', icon: FileText }
        ];
      case 'staff':
        return [
          ...baseTabs,
          { id: 'timetracker', label: 'Timbratura', icon: Clock },
          { id: 'medical', label: 'Pazienti', icon: Heart },
          { id: 'assignments', label: 'Mie Assegnazioni', icon: UserPlus },
          { id: 'appointments', label: 'Appuntamenti', icon: CalendarDays },
          { id: 'communications', label: 'Messaggi', icon: MessageSquare },
          { id: 'calendar', label: 'Diario Sanitario', icon: BookOpen }
        ];
      default:
        return baseTabs;
    }
  };

  const tabs = getTabsForRole();

  // Debug info for Vercel
  if (isVercelDeployment) {
    console.log('🌐 Available tabs:', tabs.map(t => t.id));
    console.log('🌐 Active tab:', activeTab);
  }

  // Debug mode UI
  if (isDebugMode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Debug Header */}
        <header className="bg-yellow-500 text-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-yellow-500 font-bold text-sm">E</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Emmanuel DEBUG MODE</h1>
                  <p className="text-xs">Vercel Deployment Troubleshooting</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-3 py-1 bg-white text-yellow-600 rounded text-sm font-medium"
                >
                  Exit Debug Mode
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-white hover:text-red-200 hover:bg-yellow-600 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Debug Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Debug Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">User Information:</h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Available Tabs:</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`px-3 py-2 rounded text-sm ${
                        activeTab === tab.id
                          ? 'bg-sky-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Environment:</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <span className="font-medium">Hostname:</span> {window.location.hostname}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <span className="font-medium">Is Vercel:</span> {isVercelDeployment ? 'Yes' : 'No'}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <span className="font-medium">Protocol:</span> {window.location.protocol}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <span className="font-medium">Path:</span> {window.location.pathname}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">LocalStorage Test:</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={() => {
                      try {
                        const testKey = 'debug_test';
                        localStorage.setItem(testKey, 'test_value');
                        const retrieved = localStorage.getItem(testKey);
                        localStorage.removeItem(testKey);
                        alert(`LocalStorage test: ${retrieved === 'test_value' ? 'SUCCESS' : 'FAILED'}`);
                      } catch (error) {
                        alert(`LocalStorage error: ${error.message}`);
                      }
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded text-sm"
                  >
                    Test LocalStorage
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/debug-vercel.html';
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
                  >
                    Open Debug Tools
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Content: {activeTab}</h2>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Open menu</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Emmanuel</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cooperativa Sociale</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notifications */}
              <NotificationBadge onClick={() => setShowNotifications(true)} />

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  user?.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900' :
                  user?.role === 'coordinator' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
                }`}>
                  <User className={`w-4 h-4 ${
                    user?.role === 'admin' ? 'text-purple-600 dark:text-purple-300' :
                    user?.role === 'coordinator' ? 'text-blue-600 dark:text-blue-300' : 'text-green-600 dark:text-green-300'
                  }`} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleDisplayName(user?.role || '')}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className={`fixed inset-0 z-40 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative max-w-xs w-full bg-white dark:bg-gray-800 h-full shadow-xl flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">E</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Emmanuel</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cooperativa Sociale</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Close menu</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="px-2 py-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  user?.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900' :
                  user?.role === 'coordinator' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
                }`}>
                  <User className={`w-5 h-5 ${
                    user?.role === 'admin' ? 'text-purple-600 dark:text-purple-300' :
                    user?.role === 'coordinator' ? 'text-blue-600 dark:text-blue-300' : 'text-green-600 dark:text-green-300'
                  }`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleDisplayName(user?.role || '')}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      {!isMobile && (
        <nav className="bg-white dark:bg-gray-800 border-b sticky top-16 z-40">
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
                        ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
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
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 Cooperativa Sociale Emmanuel - Napoli
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
              Versione 5.1.0 - {getRoleDisplayName(user?.role || '')}
            </div>
          </div>
        </div>
      </footer>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
};