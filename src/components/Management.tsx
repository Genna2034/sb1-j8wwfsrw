import React, { useState, useEffect } from 'react';
import { UserPlus, Edit3, Trash2, Save, X, Shield, Users, Key, Eye, EyeOff, Mail, Send, Clock, CheckCircle, Settings, Database, Cloud, Zap } from 'lucide-react';
import { User } from '../types/auth';
import { getUsers, saveUser, deleteUser, generateUserId } from '../utils/userManagement';
import { sendCredentialsEmail, previewEmail, getEmailLogs } from '../utils/emailService';
import { ExternalIntegrations } from './system/ExternalIntegrations';
import { DatabaseIntegration } from './system/DatabaseIntegration';
import { SystemReset } from './system/SystemReset';

export const Management: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'integrations' | 'database' | 'system'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    setUsers(getUsers());
    setEmailLogs(getEmailLogs());
  }, []);

  const handleAddUser = async (userData: Partial<User> & { email: string }) => {
    console.log('Creando nuovo utente con dati:', userData);
    
    // Validazione
    if (!userData.username || !userData.password || !userData.name || !userData.email) {
      alert('Username, password, nome ed email sono obbligatori!');
      return;
    }
    
    const newUser: User = {
      id: generateUserId(),
      username: userData.username,
      name: userData.name,
      role: userData.role || 'staff',
      department: userData.department || '',
      position: userData.position || '',
      password: userData.password
    };

    console.log('Nuovo utente da salvare:', newUser);
    
    try {
      // Salva l'utente
      saveUser(newUser);
      setUsers(prev => [...prev, newUser]);
      
      // Invia email con credenziali
      setSendingEmail(newUser.id);
      
      const emailSent = await sendCredentialsEmail({
        to: userData.email,
        username: newUser.username,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        position: newUser.position
      });
      
      setSendingEmail(null);
      
      if (emailSent) {
        alert(`✅ Utente ${newUser.name} creato con successo!\n📧 Email con credenziali inviata a: ${userData.email}`);
        setEmailLogs(getEmailLogs()); // Aggiorna i log
      } else {
        alert(`⚠️ Utente ${newUser.name} creato, ma errore nell'invio email.\nCredenziali: ${newUser.username} / ${newUser.password}`);
      }
      
      setShowAddUser(false);
    } catch (error) {
      setSendingEmail(null);
      console.error('Errore nella creazione utente:', error);
      alert('Errore nella creazione dell\'utente. Controlla la console per i dettagli.');
    }
  };

  const handleEditUser = (updatedUser: User) => {
    console.log('Aggiornando utente:', updatedUser);
    
    if (!updatedUser.password) {
      alert('La password è obbligatoria!');
      return;
    }
    
    try {
      saveUser(updatedUser);
      setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
      setEditingUser(null);
      alert(`Utente ${updatedUser.name} aggiornato con successo!`);
    } catch (error) {
      console.error('Errore nell\'aggiornamento utente:', error);
      alert('Errore nell\'aggiornamento dell\'utente. Controlla la console per i dettagli.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'admin') {
      alert('Non puoi eliminare un amministratore!');
      return;
    }
    
    if (window.confirm('Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.')) {
      deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleResendCredentials = async (user: User) => {
    const email = prompt(`Inserisci l'email per inviare le credenziali a ${user.name}:`);
    if (!email) return;
    
    setSendingEmail(user.id);
    
    const emailSent = await sendCredentialsEmail({
      to: email,
      username: user.username,
      password: user.password || 'Password non disponibile',
      name: user.name,
      role: user.role,
      department: user.department,
      position: user.position
    });
    
    setSendingEmail(null);
    
    if (emailSent) {
      alert(`✅ Credenziali inviate con successo a: ${email}`);
      setEmailLogs(getEmailLogs());
    } else {
      alert('❌ Errore nell\'invio dell\'email');
    }
  };

  const handlePreviewEmail = (user: User) => {
    previewEmail({
      to: 'esempio@email.com',
      username: user.username,
      password: user.password || 'Password non disponibile',
      name: user.name,
      role: user.role,
      department: user.department,
      position: user.position
    });
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'coordinator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'staff': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Amministratore';
      case 'coordinator': return 'Coordinatore';
      case 'staff': return 'Staff';
      default: return role;
    }
  };

  const adminUsers = users.filter(user => user.role === 'admin');
  const coordinatorUsers = users.filter(user => user.role === 'coordinator');
  const staffUsers = users.filter(user => user.role === 'staff');

  const tabs = [
    { id: 'users', label: 'Gestione Utenti', icon: Users },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'integrations', label: 'Integrazioni', icon: Cloud },
    { id: 'system', label: 'Sistema', icon: Settings }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestione Sistema</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Amministrazione completa del sistema Emmanuel
          </p>
        </div>
        {activeTab === 'users' && (
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nuovo Utente
          </button>
        )}
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
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amministratori</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{adminUsers.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Coordinatori</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{coordinatorUsers.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Staff</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{staffUsers.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Key className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Totale Utenti</p>
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{users.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Logs */}
              {emailLogs.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Invii Email</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {emailLogs.slice(-5).reverse().map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Credenziali inviate a {log.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {log.to} • {new Date(log.sentAt).toLocaleString('it-IT')}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Inviata</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Utenti Registrati</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Utente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Credenziali
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Ruolo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Dipartimento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Azioni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                user.role === 'coordinator' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                              }`}>
                                <span className={`font-semibold ${
                                  user.role === 'admin' ? 'text-purple-600 dark:text-purple-400' :
                                  user.role === 'coordinator' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white font-mono">{user.username}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <span className="font-mono mr-2">
                                {showPasswords[user.id] ? user.password || '••••••••' : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {showPasswords[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {getRoleDisplayName(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Modifica utente"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleResendCredentials(user)}
                                disabled={sendingEmail === user.id}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                title="Invia credenziali via email"
                              >
                                {sendingEmail === user.id ? (
                                  <Clock className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </button>
                              
                              <button
                                onClick={() => handlePreviewEmail(user)}
                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                title="Anteprima email"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Elimina utente"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && <DatabaseIntegration />}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && <ExternalIntegrations />}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <SystemReset />
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informazioni Sistema</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Versione</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">5.1.0</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Rilascio</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">Giugno 2025</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ambiente</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">Produzione</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Stato</p>
                      <div className="flex items-center mt-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">Operativo</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-300">Ambiente Pronto per i Test</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                          L'ambiente è stato resettato e preparato per i test reali. Puoi iniziare a creare nuovi pazienti, operatori e assegnazioni.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddUser || editingUser) && (
        <UserModal
          user={editingUser}
          onSave={editingUser ? handleEditUser : handleAddUser}
          onClose={() => {
            setShowAddUser(false);
            setEditingUser(null);
          }}
          sendingEmail={sendingEmail}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal: React.FC<{
  user?: User | null;
  onSave: (user: any) => void;
  onClose: () => void;
  sendingEmail?: string | null;
}> = ({ user, onSave, onClose, sendingEmail }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    name: user?.name || '',
    role: user?.role || 'staff',
    department: user?.department || '',
    position: user?.position || '',
    password: user?.password || '',
    email: '' // Campo email solo per nuovi utenti
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione
    if (!formData.username.trim()) {
      alert('Username è obbligatorio!');
      return;
    }
    if (!formData.name.trim()) {
      alert('Nome è obbligatorio!');
      return;
    }
    if (!formData.password.trim()) {
      alert('Password è obbligatoria!');
      return;
    }
    if (!formData.department.trim()) {
      alert('Dipartimento è obbligatorio!');
      return;
    }
    if (!formData.position.trim()) {
      alert('Posizione è obbligatoria!');
      return;
    }
    
    // Per nuovi utenti, email è obbligatoria
    if (!user && !formData.email.trim()) {
      alert('Email è obbligatoria per inviare le credenziali!');
      return;
    }
    
    console.log('Dati form da salvare:', formData);
    onSave(formData);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user ? 'Modifica Utente' : 'Nuovo Utente'}
          </h3>
          {!user && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Le credenziali verranno inviate automaticamente via email
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="email@esempio.com"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Le credenziali verranno inviate a questo indirizzo
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={generatePassword}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Genera
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ruolo *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="staff">Staff</option>
              <option value="coordinator">Coordinatore</option>
              <option value="admin">Amministratore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dipartimento *
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Seleziona dipartimento</option>
              <option value="Assistenza Domiciliare">Assistenza Domiciliare</option>
              <option value="Assistenza Scolastica">Assistenza Scolastica</option>
              <option value="Amministrazione">Amministrazione</option>
              <option value="Coordinamento">Coordinamento</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Posizione *
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="es. Infermiere, Fisioterapista, OSS..."
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={!!sendingEmail}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              disabled={!!sendingEmail}
            >
              {sendingEmail ? (
                <div className="flex items-center justify-center">
                  <Clock className="w-4 h-4 animate-spin mr-2" />
                  Inviando...
                </div>
              ) : (
                user ? 'Salva' : 'Crea e Invia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Management;