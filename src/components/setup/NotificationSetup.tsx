import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Volume2, VolumeX, CheckCircle, AlertTriangle } from 'lucide-react';
import { getNotificationSettings, saveNotificationSettings, requestNotificationPermission, createNotification } from '../../utils/notificationService';

export const NotificationSetup: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    reminderDays: [1, 3, 7]
  });
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [testingSounds, setTestingSounds] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissionStatus();
  }, []);

  const loadSettings = () => {
    const currentSettings = getNotificationSettings();
    setSettings(currentSettings);
  };

  const checkPermissionStatus = () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const handleSaveSettings = () => {
    saveNotificationSettings(settings);
    alert('✅ Impostazioni notifiche salvate!');
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    
    if (granted) {
      alert('✅ Permessi notifiche concessi!');
    } else {
      alert('❌ Permessi notifiche negati. Puoi abilitarli dalle impostazioni del browser.');
    }
  };

  const handleTestNotification = () => {
    createNotification(
      '1',
      'system',
      'Test Notifica',
      'Questa è una notifica di test per verificare il funzionamento del sistema.',
      'normal'
    );
  };

  const handleTestSound = () => {
    setTestingSounds(true);
    // Importa e usa la funzione playNotificationSound
    import('../../utils/notificationService').then(({ playNotificationSound }) => {
      playNotificationSound();
      setTimeout(() => setTestingSounds(false), 1000);
    });
  };

  const handleReminderDaysChange = (day: number, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      reminderDays: checked 
        ? [...prev.reminderDays, day].sort((a, b) => a - b)
        : prev.reminderDays.filter(d => d !== day)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Bell className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configurazione Notifiche</h3>
      </div>

      {/* Permission Status */}
      <div className={`border rounded-lg p-4 ${
        permissionStatus === 'granted' 
          ? 'bg-green-50 border-green-200' 
          : permissionStatus === 'denied'
          ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {permissionStatus === 'granted' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            )}
            <div>
              <h4 className={`font-medium ${
                permissionStatus === 'granted' ? 'text-green-900' : 'text-yellow-900'
              }`}>
                Permessi Browser
              </h4>
              <p className={`text-sm ${
                permissionStatus === 'granted' ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {permissionStatus === 'granted' 
                  ? 'Notifiche browser abilitate'
                  : permissionStatus === 'denied'
                  ? 'Notifiche browser negate'
                  : 'Notifiche browser non configurate'
                }
              </p>
            </div>
          </div>
          {permissionStatus !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Abilita Notifiche
            </button>
          )}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Tipi di Notifica</h4>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h5 className="font-medium text-gray-900">Email</h5>
                <p className="text-sm text-gray-600">Notifiche via email per eventi importanti</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h5 className="font-medium text-gray-900">SMS</h5>
                <p className="text-sm text-gray-600">Notifiche via SMS per emergenze</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <h5 className="font-medium text-gray-900">Push Browser</h5>
                <p className="text-sm text-gray-600">Notifiche push nel browser</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-orange-600 mr-3" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <div>
                <h5 className="font-medium text-gray-900">Suoni</h5>
                <p className="text-sm text-gray-600">Riproduci suoni per le notifiche</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTestSound}
                disabled={testingSounds}
                className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
              >
                {testingSounds ? 'Test...' : 'Test'}
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Promemoria Appuntamenti</h4>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Seleziona quando ricevere promemoria prima degli appuntamenti:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 7, 14].map(day => (
              <label key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.reminderDays.includes(day)}
                  onChange={(e) => handleReminderDaysChange(day, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {day === 1 ? '1 giorno' : `${day} giorni`}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Test Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Test Notifiche</h4>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Testa il sistema di notifiche per verificare che funzioni correttamente:
          </p>
          <button
            onClick={handleTestNotification}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Invia Notifica di Test
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Salva Impostazioni
        </button>
      </div>
    </div>
  );
};