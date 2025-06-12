import React, { useState, useEffect } from 'react';
import { MessageSquare, Bell, CheckSquare, Users, Send, Calendar, Settings, BarChart3 } from 'lucide-react';
import { getMessages, getNotifications, getTasks } from '../utils/communicationStorage';
import { MessageCenter } from './communications/MessageCenter';
import { TaskManager } from './communications/TaskManager';
import { NotificationSettings } from './system/NotificationSettings';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export const CommunicationSystem: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount: unreadNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState<'messages' | 'tasks' | 'notifications' | 'automation' | 'family'>('messages');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = () => {
    const messages = getMessages({ userId: user?.id });
    const tasks = getTasks({ assignedTo: user?.id });
    
    setStats({
      totalMessages: messages.length,
      unreadMessages: messages.filter(msg => 
        msg.toUserIds.includes(user?.id || '') && 
        !msg.readBy.some(read => read.userId === user?.id)
      ).length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      overdueTasks: tasks.filter(t => t.status === 'overdue').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length
    });
  };

  const tabs = [
    { id: 'messages', label: 'Messaggi', icon: MessageSquare },
    { id: 'tasks', label: 'Task', icon: CheckSquare },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
    { id: 'automation', label: 'Automazione', icon: Settings },
    { id: 'family', label: 'Familiari', icon: Users }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema Comunicazioni</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Centro messaggi, notifiche e gestione task integrata
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messaggi</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalMessages || 0}</p>
              {stats.unreadMessages > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400">{stats.unreadMessages} non letti</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <CheckSquare className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Task</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.totalTasks || 0}</p>
              {stats.pendingTasks > 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">{stats.pendingTasks} in attesa</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notifiche</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{unreadNotifications || 0}</p>
              {unreadNotifications > 0 && (
                <p className="text-xs text-purple-600 dark:text-purple-400">{unreadNotifications} nuove</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completati</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedTasks || 0}</p>
              {stats.overdueTasks > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400">{stats.overdueTasks} in ritardo</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {/* Badge for unread items */}
                  {tab.id === 'messages' && stats.unreadMessages > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {stats.unreadMessages}
                    </span>
                  )}
                  {tab.id === 'tasks' && stats.pendingTasks > 0 && (
                    <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {stats.pendingTasks}
                    </span>
                  )}
                  {tab.id === 'notifications' && unreadNotifications > 0 && (
                    <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'messages' && <MessageCenter />}
          
          {activeTab === 'tasks' && <TaskManager />}
          
          {activeTab === 'notifications' && <NotificationSettings />}
          
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>Centro Automazione</p>
                <p className="text-sm">Gestione avanzata automazioni in sviluppo</p>
              </div>
              
              {/* Automation Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Promemoria Appuntamenti</h3>
                  <p className="text-blue-800 dark:text-blue-400 text-sm mb-4">
                    Invio automatico promemoria 24h prima degli appuntamenti
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">Stato: Attivo</span>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                      Configura
                    </button>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 dark:text-green-300 mb-3">Promemoria Fatture</h3>
                  <p className="text-green-800 dark:text-green-400 text-sm mb-4">
                    Notifiche automatiche per fatture in scadenza
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 dark:text-green-400 text-sm">Stato: Attivo</span>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                      Configura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'family' && (
            <div className="space-y-6">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>Portale Familiari</p>
                <p className="text-sm">Comunicazioni con familiari dei pazienti</p>
              </div>
              
              {/* Family Access Preview */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">Accessi Familiari Attivi</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Maria Rossi</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Figlia di Giuseppe Marino</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">
                      Attivo
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Antonio Bianchi</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Marito di Anna Bianchi</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs">
                      In attesa
                    </span>
                  </div>
                </div>
                
                <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Gestisci Accessi Familiari
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};