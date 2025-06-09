import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Search, Filter, Plus, Reply, Forward, 
  Trash2, Star, Archive, Users, Clock, AlertCircle, CheckCircle,
  Paperclip, Eye, EyeOff
} from 'lucide-react';
import { Message } from '../../types/communications';
import { getMessages, saveMessage, markMessageAsRead, generateMessageId } from '../../utils/communicationStorage';
import { getUsers } from '../../utils/userManagement';
import { getPatients } from '../../utils/medicalStorage';
import { useAuth } from '../../contexts/AuthContext';

export const MessageCenter: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [user]);

  const loadMessages = () => {
    setLoading(true);
    try {
      const userMessages = getMessages({ userId: user?.id });
      setMessages(userMessages);
    } catch (error) {
      console.error('Errore nel caricamento messaggi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if user is recipient
    if (message.toUserIds.includes(user?.id || '') && !message.readBy.some(read => read.userId === user?.id)) {
      markMessageAsRead(message.id, user?.id || '', user?.name || '');
      loadMessages();
    }
  };

  const handleSendMessage = (messageData: Partial<Message>) => {
    const newMessage: Message = {
      id: generateMessageId(),
      type: messageData.type || 'internal',
      priority: messageData.priority || 'normal',
      status: 'sent',
      subject: messageData.subject || '',
      content: messageData.content || '',
      fromUserId: user?.id || '',
      fromUserName: user?.name || '',
      toUserIds: messageData.toUserIds || [],
      toUserNames: messageData.toUserNames || [],
      patientId: messageData.patientId,
      patientName: messageData.patientName,
      readBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSystemGenerated: false
    };

    saveMessage(newMessage);
    loadMessages();
    setShowCompose(false);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.fromUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.patientName && message.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || message.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getUnreadCount = () => {
    return messages.filter(msg => 
      msg.toUserIds.includes(user?.id || '') && 
      !msg.readBy.some(read => read.userId === user?.id)
    ).length;
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'patient': return 'bg-green-100 text-green-800';
      case 'family': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (message: Message) => {
    const isRead = message.readBy.some(read => read.userId === user?.id);
    const isRecipient = message.toUserIds.includes(user?.id || '');
    
    if (isRecipient) {
      return isRead ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />;
    } else {
      return message.status === 'read' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento messaggi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Message List */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Messaggi ({getUnreadCount()} non letti)
            </h3>
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nuovo
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca messaggi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex space-x-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
              >
                <option value="all">Tutti i tipi</option>
                <option value="internal">Interni</option>
                <option value="patient">Pazienti</option>
                <option value="family">Familiari</option>
                <option value="system">Sistema</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
              >
                <option value="all">Tutti gli stati</option>
                <option value="sent">Inviati</option>
                <option value="read">Letti</option>
                <option value="draft">Bozze</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((message) => {
            const isUnread = message.toUserIds.includes(user?.id || '') && 
                           !message.readBy.some(read => read.userId === user?.id);
            
            return (
              <div
                key={message.id}
                onClick={() => handleSelectMessage(message)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedMessage?.id === message.id ? 'bg-sky-50 border-r-4 border-sky-500' : ''
                } ${isUnread ? 'bg-blue-25' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeColor(message.type)}`}>
                      {message.type}
                    </span>
                    {message.priority !== 'normal' && (
                      <AlertCircle className={`w-4 h-4 ${getPriorityColor(message.priority)}`} />
                    )}
                  </div>
                  {getStatusIcon(message)}
                </div>
                
                <h4 className={`font-medium text-sm mb-1 ${isUnread ? 'font-bold' : ''}`}>
                  {message.subject}
                </h4>
                
                <p className="text-xs text-gray-600 mb-2">
                  Da: {message.fromUserName}
                  {message.patientName && ` • Paziente: ${message.patientName}`}
                </p>
                
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                  {message.content}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(message.createdAt).toLocaleDateString('it-IT')}</span>
                  {message.attachments && message.attachments.length > 0 && (
                    <Paperclip className="w-3 h-3" />
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredMessages.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun messaggio trovato</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        {selectedMessage ? (
          <>
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>Da: {selectedMessage.fromUserName}</span>
                    <span>•</span>
                    <span>A: {selectedMessage.toUserNames.join(', ')}</span>
                    <span>•</span>
                    <span>{new Date(selectedMessage.createdAt).toLocaleString('it-IT')}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeColor(selectedMessage.type)}`}>
                    {selectedMessage.type}
                  </span>
                  {selectedMessage.priority !== 'normal' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedMessage.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      selectedMessage.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedMessage.priority}
                    </span>
                  )}
                </div>
              </div>

              {selectedMessage.patientName && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      Paziente: {selectedMessage.patientName}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  <Reply className="w-4 h-4 mr-1" />
                  Rispondi
                </button>
                <button className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  <Forward className="w-4 h-4 mr-1" />
                  Inoltra
                </button>
                <button className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Elimina
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {selectedMessage.content}
                </div>
              </div>

              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Allegati</h4>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Paperclip className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="text-sm text-gray-700">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMessage.readBy.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Letto da</h4>
                  <div className="space-y-2">
                    {selectedMessage.readBy.map((read, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{read.userName}</span>
                        <span className="text-gray-500">
                          {new Date(read.readAt).toLocaleString('it-IT')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Seleziona un messaggio</p>
              <p className="text-sm">Scegli un messaggio dalla lista per visualizzarlo</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeMessageModal
          onSend={handleSendMessage}
          onClose={() => setShowCompose(false)}
        />
      )}
    </div>
  );
};

// Compose Message Modal Component
const ComposeMessageModal: React.FC<{
  onSend: (message: Partial<Message>) => void;
  onClose: () => void;
}> = ({ onSend, onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: 'internal' as Message['type'],
    priority: 'normal' as Message['priority'],
    subject: '',
    content: '',
    toUserIds: [] as string[],
    toUserNames: [] as string[],
    patientId: '',
    patientName: ''
  });

  useEffect(() => {
    setUsers(getUsers());
    setPatients(getPatients());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.content.trim() || formData.toUserIds.length === 0) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    onSend(formData);
  };

  const handleRecipientChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setFormData(prev => ({
        ...prev,
        toUserIds: [userId],
        toUserNames: [user.name]
      }));
    }
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName: patient ? `${patient.personalInfo.name} ${patient.personalInfo.surname}` : ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Nuovo Messaggio</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Messaggio
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="internal">Interno</option>
                <option value="patient">Paziente</option>
                <option value="family">Familiare</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorità
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="low">Bassa</option>
                <option value="normal">Normale</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destinatario *
            </label>
            <select
              value={formData.toUserIds[0] || ''}
              onChange={(e) => handleRecipientChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona destinatario</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paziente (opzionale)
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Seleziona paziente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.personalInfo.name} {patient.personalInfo.surname}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oggetto *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Oggetto del messaggio"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Messaggio *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={6}
              placeholder="Scrivi il tuo messaggio..."
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2 inline" />
              Invia Messaggio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};