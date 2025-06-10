import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, Volume2, VolumeX, Clock, CheckCircle, XCircle, RefreshCw, Settings, AlertTriangle, Calendar, MessageSquare, FileText } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { getNotificationService, NotificationConfig } from '../../services/notificationService';

export const NotificationSettings: React.FC = () => {
  const { 
    isPermissionGranted, 
    isPushEnabled, 
    requestPermission, 
    enablePush, 
    disablePush 
  } = useNotifications();
  
  const [config, setConfig] = useState<NotificationConfig>(getNotificationService().getConfig());
  const [loading, setLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleToggleSound = () => {
    const newConfig = { ...config, notificationSound: !config.notificationSound };
    setConfig(newConfig);
    getNotificationService().updateConfig(newConfig);
  };

  const handleChangeTimeout = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeout = parseInt(e.target.value);
    const newConfig = { ...config, notificationTimeout: timeout };
    setConfig(newConfig);
    getNotificationService().updateConfig(newConfig);
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    await requestPermission();
    setLoading(false);
  };

  const handleTogglePush = async () => {
    setLoading(true);
    if (isPushEnabled) {
      await disablePush();
    } else {
      await enablePush();
    }
    setLoading(false);
  };

  const sendTestNotification = async () => {
    setLoading(true);
    
    try {
      const notificationService = getNotificationService();
      await notificationService.showNotification('Notifica di Test', {
        body: 'Questa è una notifica di test per verificare la configurazione.',
        icon: '/Screenshot 2025-06-09 alle 14.11.10.png',
        requireInteraction: false
      });
      
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (error) {
      console.error('Errore nell\'invio notifica di test:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Impostazioni Notifiche</h3>
          <p className="text-gray-600 mt-1">
            Configura come ricevere notifiche e promemoria
          </p>
        </div>
        <button
          onClick={sendTestNotification}
          disabled={loading || !isPermissionGranted}
          className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Bell className="w-4 h-4 mr-2" />
          )}
          Invia Notifica Test
        </button>
      </div>

      {testSent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">
              Notifica di test inviata con successo!
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Permessi e Configurazione</h4>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BellRing className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Notifiche Browser</p>
                <p className="text-sm text-gray-600">
                  Ricevi notifiche anche quando non stai usando l'app
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              disabled={loading || isPermissionGranted}
              className={`px-4 py-2 rounded-lg ${
                isPermissionGranted 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors disabled:opacity-50`}
            >
              {isPermissionGranted ? (
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Attive
                </span>
              ) : (
                <span className="flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Attiva
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Notifiche Push</p>
                <p className="text-sm text-gray-600">
                  Ricevi notifiche anche quando il browser è chiuso
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePush}
              disabled={loading || !isPermissionGranted}
              className={`px-4 py-2 rounded-lg ${
                isPushEnabled 
                  ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors disabled:opacity-50`}
            >
              {isPushEnabled ? (
                <span className="flex items-center">
                  <BellOff className="w-4 h-4 mr-2" />
                  Disattiva
                </span>
              ) : (
                <span className="flex items-center">
                  <BellRing className="w-4 h-4 mr-2" />
                  Attiva
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Volume2 className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Suono Notifiche</p>
                <p className="text-sm text-gray-600">
                  Riproduci un suono quando arriva una notifica
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-lg ${
                config.notificationSound 
                  ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-800'
              } transition-colors`}
            >
              {config.notificationSound ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Durata Notifiche</p>
                <p className="text-sm text-gray-600">
                  Tempo di visualizzazione delle notifiche
                </p>
              </div>
            </div>
            <div className="w-32">
              <input
                type="range"
                min="1000"
                max="10000"
                step="1000"
                value={config.notificationTimeout}
                onChange={handleChangeTimeout}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 text-center mt-1">
                {config.notificationTimeout / 1000}s
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Tipi di Notifiche</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-700">Promemoria Appuntamenti</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-gray-700">Nuovi Messaggi</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-gray-700">Promemoria Fatture</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-gray-700">Notifiche Urgenti</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Settings className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Configurazione Avanzata</h4>
            <p className="text-sm text-blue-800 mt-1">
              Per configurare le notifiche push con un server personalizzato, contatta l'amministratore di sistema per impostare le VAPID keys e il server di notifiche.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};