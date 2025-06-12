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
  const [isVercelDeployment, setIsVercelDeployment] = useState(false);

  // Check if running on Vercel
  useEffect(() => {
    const isVercel = window.location.hostname.includes('vercel.app');
    setIsVercelDeployment(isVercel);
    
    // Log environment info for debugging
    console.log('Environment info:', {
      hostname: window.location.hostname,
      isVercel,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent
    });
    
    // Force localStorage check on Vercel
    if (isVercel) {
      try {
        const testKey = 'vercel_test';
        localStorage.setItem(testKey, 'test');
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        console.log('LocalStorage test on Vercel:', {
          success: testValue === 'test',
          value: testValue
        });
      } catch (error) {
        console.error('LocalStorage test failed on Vercel:', error);
      }
    }
  }, []);

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

  // Se non autenticato, mostra il form di login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Debug info for Vercel deployment
  if (isVercelDeployment) {
    console.log('User info on Vercel:', {
      name: user?.name,
      role: user?.role,
      id: user?.id
    });
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