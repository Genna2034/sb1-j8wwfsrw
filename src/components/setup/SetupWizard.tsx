import React, { useState } from 'react';
import { CheckCircle, Circle, Database, Bell, Settings, Users, Shield } from 'lucide-react';
import { DatabaseSetup } from './DatabaseSetup';
import { NotificationSetup } from './NotificationSetup';

export const SetupWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState<'database' | 'notifications' | 'security' | 'users' | 'complete'>('database');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps = [
    {
      id: 'database',
      title: 'Database',
      description: 'Configurazione database e migrazioni',
      icon: Database,
      component: DatabaseSetup
    },
    {
      id: 'notifications',
      title: 'Notifiche',
      description: 'Sistema di notifiche e promemoria',
      icon: Bell,
      component: NotificationSetup
    },
    {
      id: 'security',
      title: 'Sicurezza',
      description: 'Configurazioni di sicurezza',
      icon: Shield,
      component: SecuritySetup
    },
    {
      id: 'users',
      title: 'Utenti',
      description: 'Gestione utenti e permessi',
      icon: Users,
      component: UserSetup
    },
    {
      id: 'complete',
      title: 'Completato',
      description: 'Setup completato',
      icon: CheckCircle,
      component: CompletionStep
    }
  ];

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === activeStep);
  };

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      markStepCompleted(activeStep);
      setActiveStep(steps[currentIndex + 1].id as any);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id as any);
    }
  };

  const ActiveComponent = steps.find(step => step.id === activeStep)?.component || DatabaseSetup;

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Setup Sistema Emmanuel</h3>
        
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === activeStep;
            const isCompleted = completedSteps.includes(step.id);
            const isAccessible = index === 0 || completedSteps.includes(steps[index - 1].id);

            return (
              <div key={step.id} className="flex flex-col items-center">
                <button
                  onClick={() => isAccessible && setActiveStep(step.id as any)}
                  disabled={!isAccessible}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white'
                      : isAccessible
                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </button>
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 max-w-20">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <ActiveComponent />
        
        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={goToPreviousStep}
            disabled={getCurrentStepIndex() === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Precedente
          </button>
          
          <button
            onClick={goToNextStep}
            disabled={getCurrentStepIndex() === steps.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getCurrentStepIndex() === steps.length - 2 ? 'Completa Setup' : 'Successivo'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Security Setup Component
const SecuritySetup: React.FC = () => {
  const [settings, setSettings] = useState({
    sessionTimeout: 24,
    passwordMinLength: 8,
    requireSpecialChars: true,
    enableTwoFactor: false,
    logFailedAttempts: true,
    maxFailedAttempts: 5
  });

  const handleSaveSettings = () => {
    localStorage.setItem('emmanuel_security_settings', JSON.stringify(settings));
    alert('✅ Impostazioni di sicurezza salvate!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="w-6 h-6 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configurazione Sicurezza</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout Sessione (ore)
          </label>
          <input
            type="number"
            min="1"
            max="168"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lunghezza Minima Password
          </label>
          <input
            type="number"
            min="6"
            max="32"
            value={settings.passwordMinLength}
            onChange={(e) => setSettings(prev => ({ ...prev, passwordMinLength: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tentativi Falliti Massimi
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings.maxFailedAttempts}
            onChange={(e) => setSettings(prev => ({ ...prev, maxFailedAttempts: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.requireSpecialChars}
            onChange={(e) => setSettings(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="ml-2 text-sm text-gray-700">Richiedi caratteri speciali nelle password</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.enableTwoFactor}
            onChange={(e) => setSettings(prev => ({ ...prev, enableTwoFactor: e.target.checked }))}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="ml-2 text-sm text-gray-700">Abilita autenticazione a due fattori (futuro)</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.logFailedAttempts}
            onChange={(e) => setSettings(prev => ({ ...prev, logFailedAttempts: e.target.checked }))}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="ml-2 text-sm text-gray-700">Registra tentativi di accesso falliti</span>
        </label>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Salva Impostazioni Sicurezza
      </button>
    </div>
  );
};

// User Setup Component
const UserSetup: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Users className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configurazione Utenti</h3>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Utenti Predefiniti Creati</h4>
        <div className="space-y-2 text-sm text-green-800">
          <div>• <strong>Amministratore:</strong> admin.emmanuel / Emmanuel2024!</div>
          <div>• <strong>Coordinatore:</strong> gennaro.borriello / Coord2024!</div>
          <div>• <strong>Staff:</strong> infermiere.01 / Staff2024!</div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Prossimi Passi</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Cambia le password predefinite</li>
          <li>2. Crea utenti aggiuntivi se necessario</li>
          <li>3. Assegna i pazienti agli operatori</li>
          <li>4. Configura i permessi specifici</li>
        </ul>
      </div>

      <div className="text-center">
        <p className="text-gray-600">
          Gli utenti sono già configurati e pronti all'uso. Puoi gestirli dalla sezione "Gestione Utenti".
        </p>
      </div>
    </div>
  );
};

// Completion Step Component
const CompletionStep: React.FC = () => {
  return (
    <div className="text-center space-y-6">
      <div className="flex items-center justify-center">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Setup Completato!</h3>
        <p className="text-gray-600">
          Il sistema Emmanuel è stato configurato con successo e è pronto per l'uso.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-medium text-green-900 mb-4">Sistema Pronto</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>✅ Database configurato</div>
          <div>✅ Notifiche attive</div>
          <div>✅ Sicurezza configurata</div>
          <div>✅ Utenti creati</div>
          <div>✅ Dati di esempio caricati</div>
          <div>✅ Sistema operativo</div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-2">Cosa Fare Ora</h4>
        <ul className="text-sm text-blue-800 space-y-1 text-left">
          <li>• Accedi con le credenziali fornite</li>
          <li>• Esplora le diverse sezioni del sistema</li>
          <li>• Aggiungi i tuoi pazienti reali</li>
          <li>• Configura gli appuntamenti</li>
          <li>• Personalizza le impostazioni</li>
        </ul>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Inizia ad Usare Emmanuel
      </button>
    </div>
  );
};