import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, AlertTriangle, Info, Calendar, MessageSquare, Euro, Settings, Volume2, Volume1, VolumeX, BellOff, BellRing } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    refreshNotifications,
    isPermissionGranted,
    isPushEnabled,
    requestPermission,
    enablePush,
    disablePush
  } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    await markAllAsRead();
    setLoading(false);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'invoice': return <Euro className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'reminder': return <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default: return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20 dark:border-l-red-700';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-l-orange-700';
      case 'normal': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-700';
      case 'low': return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800 dark:border-l-gray-600';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800 dark:border-l-gray-600';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ora';
    if (diffInMinutes < 60) return `${diffInMinutes}m fa`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h fa`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}g fa`;
    
    return date.toLocaleDateString('it-IT');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col mt-16 animate-slideInRight">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifiche {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Elaborazione...
                    </span>
                  ) : (
                    'Segna tutte come lette'
                  )}
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Impostazioni notifiche"
              >
                <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Impostazioni Notifiche</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BellRing className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 dark:text-white">Notifiche browser</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ricevi notifiche anche quando non stai usando l'app
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRequestPermission}
                  disabled={loading || isPermissionGranted}
                  className={`px-3 py-1 rounded text-sm ${
                    isPermissionGranted 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
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
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 dark:text-white">Notifiche push</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ricevi notifiche anche quando il browser è chiuso
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleTogglePush}
                  disabled={loading || !isPermissionGranted}
                  className={`px-3 py-1 rounded text-sm ${
                    isPushEnabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
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
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Volume2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 dark:text-white">Suono Notifiche</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Riproduci un suono quando arriva una notifica
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Caricamento notifiche...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.is_read ? 'bg-opacity-100' : 'bg-opacity-50'
                  } hover:bg-opacity-75 transition-colors cursor-pointer`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium text-gray-900 dark:text-white ${
                          !notification.is_read ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      
                      {notification.action_url && notification.action_label && (
                        <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium mt-2">
                          {notification.action_label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Nessuna notifica</p>
              <p className="text-sm">Le tue notifiche appariranno qui</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Visualizza tutte le notifiche
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Notification Badge Component for Header
export const NotificationBadge: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  const { unreadCount, refreshNotifications } = useNotifications();

  useEffect(() => {
    // Poll for new notifications every 30 seconds
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};