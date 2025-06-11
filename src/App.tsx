import React, { useState, Suspense, lazy } from 'react';
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
const CommunicationSystem = lazy(() => import('./components/CommunicationSystem').then(module => ({ default: module.CommunicationSystem })));

// Loading component for suspense fallback
const LoadingComponent = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-sky-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
        <span className="text-white font-bold text-2xl">E</span>
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
      <p className="text-gray-600 mt-4">Caricamento componente...</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, isLoading, user, isInitialized } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Show loading spinner during initialization
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-sky-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">
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
          {activeTab === 'communications' && <CommunicationSystem />}
          {activeTab === 'calendar' && <Calendar />}
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