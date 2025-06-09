import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TimeTracker } from './components/TimeTracker';
import { StaffList } from './components/StaffList';
import { Calendar } from './components/Calendar';
import { Reports } from './components/Reports';
import { Management } from './components/Management';
import { MedicalRecords } from './components/MedicalRecords';
import { AppointmentSystem } from './components/AppointmentSystem';
import { BillingSystem } from './components/BillingSystem';
import { CommunicationSystem } from './components/CommunicationSystem';

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
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'timetracker':
        return <TimeTracker />;
      case 'staff':
        return <StaffList />;
      case 'medical':
        return <MedicalRecords />;
      case 'appointments':
        return <AppointmentSystem />;
      case 'billing':
        return <BillingSystem />;
      case 'communications':
        return <CommunicationSystem />;
      case 'calendar':
        return <Calendar />;
      case 'reports':
        return <Reports />;
      case 'management':
        // Only admin can access
        return user?.role === 'admin' ? <Management /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;