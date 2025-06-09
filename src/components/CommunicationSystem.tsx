import React, { useState, useEffect } from 'react';
import { MessageSquare, Bell, CheckSquare, Users, Send, Calendar, Settings, BarChart3 } from 'lucide-react';
import { getMessages, getNotifications, getTasks } from '../utils/communicationStorage';
import { MessageCenter } from './communications/MessageCenter';
import { TaskManager } from './communications/TaskManager';
import { useAuth } from '../contexts/AuthContext';

export const CommunicationSystem: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'tasks' | 'notifications' | 'automation' | 'family'>('messages');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = () => {
    const messages = getMessages({ userId: user?.id });
    const notifications = getNotifications(user?.id);
    const tasks = getTasks({ assignedTo: user?.id });
    
    setStats({
      totalMessages: messages.length,
      unreadMessages: messages.filter(msg => 
        msg.toUserIds.includes(user?.id || '') && 
        !msg.readBy.some(read => read.userId === user?.id)
      ).length,
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter(n => !n.isRead).length,
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
          <h1 className="text-2xl font-bold text-gray-900">Sistema Comunicazioni</h1>
          <p className="text-gray-600 mt-1">
            Centro messaggi, notifiche e gestione task integrata
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messaggi</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalMessages || 0}</p>
              {stats.unreadMessages > 0 && (
                <p className="text-xs text-red-600">{stats.unreadMessages} non letti</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Task</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalTasks || 0}</p>
              {stats.pendingTasks > 0 && (
                <p className="text-xs text-yellow-600">{stats.pendingTasks} in attesa</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifiche</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalNotifications || 0}</p>
              {stats.unreadNotifications > 0 && (
                <p className="text-xs text-purple-600">{stats.unreadNotifications} nuove</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completati</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks || 0}</p>
              {stats.overdueTasks > 0 && (
                <p className="text-xs text-red-600">{stats.overdueTasks} in ritardo</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  {tab.id === 'notifications' && stats.unreadNotifications > 0 && (
                    <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {stats.unreadNotifications}
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
          
          {activeTab === 'notifications' && (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Centro Notifiche</p>
              <p className="text-sm">Gestione avanzata notifiche in sviluppo</p>
            </div>
          )}
          
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Automazione Comunicazioni</p>
                <p className="text-sm">Configurazione automazioni e template</p>
              </div>
              
              {/* Automation Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Promemoria Appuntamenti</h3>
                  <p className="text-blue-800 text-sm mb-4">
                    Invio automatico promemoria 24h prima degli appuntamenti
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 text-sm">Stato: Attivo</span>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                      Configura
                    </button>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-3">Promemoria Fatture</h3>
                  <p className="text-green-800 text-sm mb-4">
                    Notifiche automatiche per fatture in scadenza
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 text-sm">Stato: Attivo</span>
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
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Portale Familiari</p>
                <p className="text-sm">Comunicazioni con familiari dei pazienti</p>
              </div>
              
              {/* Family Access Preview */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-3">Accessi Familiari Attivi</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                      <p className="font-medium text-gray-900">Maria Rossi</p>
                      <p className="text-sm text-gray-600">Figlia di Giuseppe Marino</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Attivo
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                      <p className="font-medium text-gray-900">Antonio Bianchi</p>
                      <p className="text-sm text-gray-600">Marito di Anna Bianchi</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
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