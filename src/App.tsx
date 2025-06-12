import React, { useState, Suspense, lazy, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const TimeTracker = lazy(() => import('./components/TimeTracker').then(module => ({ default: module.TimeTracker })));
const StaffList = lazy(() => import('./components/StaffList').then(module => ({ default: module.StaffList })));
const Calendar = lazy(() => import('./components/Calendar').then(module => ({ default: module.Calendar })));
const Reports = lazy(() => import('./components/Reports').then(module => ({ default: module.Reports })));
const Management = lazy(() => import('./components/Management').then(module => ({ default: module.Management })));
const MedicalRecords = lazy(() => import('./components/MedicalRecords').then(module => ({ default: module.MedicalRecords })));
const StaffAssignment = lazy(() => import('./components/StaffAssignment').then(module => ({ default: module.StaffAssignment })));
const BillingSystem = lazy(() => import('./components/BillingSystem').then(module => ({ default: module.BillingSystem })));
const AdvancedBillingSystem = lazy(() => import('./components/billing/AdvancedBillingSystem').then(module => ({ default: module.default })));
const CommunicationSystem = lazy(() => import('./components/CommunicationSystem').then(module => ({ default: module.CommunicationSystem })));
const AppointmentSystem = lazy(() => import('./components/AppointmentSystem').then(module => ({ default: module.AppointmentSystem })));

// Loading component for suspense fallback
const LoadingComponent = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-sky-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
        <span className="text-white font-bold text-2xl">E</span>
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto"></div>
      <p className="text-gray-600 dark:text-gray-400 mt-4">Caricamento componente...</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, isLoading, user, isInitialized } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Debug mode for troubleshooting deployment issues
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      setIsDebugMode(true);
      console.log('🔍 Debug mode enabled');
      console.log('Auth state:', { isAuthenticated, isLoading, isInitialized });
      console.log('User:', user);
    }
  }, [isAuthenticated, isLoading, user, isInitialized]);

  // Show loading spinner during initialization
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-sky-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            {isLoading ? 'Caricamento sistema...' : 'Inizializzazione...'}
          </p>
        </div>
      </div>
    );
  }

  // Debug panel for troubleshooting
  if (isDebugMode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Debug Mode</h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Authentication State</h2>
              <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify({ isAuthenticated, isLoading, isInitialized }, null, 2)}
              </pre>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">User Data</h2>
              <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">Available Tabs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button onClick={() => setActiveTab('dashboard')} className="p-2 bg-white dark:bg-gray-700 rounded border">Dashboard</button>
                <button onClick={() => setActiveTab('timetracker')} className="p-2 bg-white dark:bg-gray-700 rounded border">Time Tracker</button>
                <button onClick={() => setActiveTab('staff')} className="p-2 bg-white dark:bg-gray-700 rounded border">Staff</button>
                <button onClick={() => setActiveTab('medical')} className="p-2 bg-white dark:bg-gray-700 rounded border">Medical Records</button>
                <button onClick={() => setActiveTab('assignments')} className="p-2 bg-white dark:bg-gray-700 rounded border">Staff Assignment</button>
                <button onClick={() => setActiveTab('billing')} className="p-2 bg-white dark:bg-gray-700 rounded border">Billing</button>
                <button onClick={() => setActiveTab('advanced-billing')} className="p-2 bg-white dark:bg-gray-700 rounded border">Advanced Billing</button>
                <button onClick={() => setActiveTab('communications')} className="p-2 bg-white dark:bg-gray-700 rounded border">Communications</button>
                <button onClick={() => setActiveTab('calendar')} className="p-2 bg-white dark:bg-gray-700 rounded border">Calendar</button>
                <button onClick={() => setActiveTab('appointments')} className="p-2 bg-white dark:bg-gray-700 rounded border">Appointments</button>
                <button onClick={() => setActiveTab('reports')} className="p-2 bg-white dark:bg-gray-700 rounded border">Reports</button>
                <button onClick={() => setActiveTab('management')} className="p-2 bg-white dark:bg-gray-700 rounded border">Management</button>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => window.location.href = window.location.pathname} 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg"
              >
                Exit Debug Mode
              </button>
              
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Clear Storage & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se non autenticato, mostra il form di login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingComponent />}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'timetracker' && <TimeTracker />}
          {activeTab === 'staff' && <StaffList />}
          {activeTab === 'medical' && <MedicalRecords />}
          {activeTab === 'assignments' && <StaffAssignment />}
          {activeTab === 'billing' && <BillingSystem />}
          {activeTab === 'advanced-billing' && <AdvancedBillingSystem />}
          {activeTab === 'communications' && <CommunicationSystem />}
          {activeTab === 'calendar' && <Calendar />}
          {activeTab === 'appointments' && <AppointmentSystem />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'management' && (user?.role === 'admin' ? <Management /> : <Dashboard />)}
        </Suspense>
      </ErrorBoundary>
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;