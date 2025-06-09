import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Search, Filter, Calendar, User, AlertTriangle, 
  Clock, CheckCircle, XCircle, Edit, Trash2, Flag
} from 'lucide-react';
import { Task } from '../../types/communications';
import { getTasks, saveTask, completeTask, generateTaskId } from '../../utils/communicationStorage';
import { getUsers } from '../../utils/userManagement';
import { getPatients } from '../../utils/medicalStorage';
import { useAuth } from '../../hooks/useAuth';

export const TaskManager: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = () => {
    setLoading(true);
    try {
      const filters: any = {};
      
      // Filter by user role
      if (user?.role === 'staff') {
        filters.assignedTo = user.id;
      }
      
      const allTasks = getTasks(filters);
      setTasks(allTasks);
    } catch (error) {
      console.error('Errore nel caricamento task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    const task: Task = {
      id: editingTask?.id || generateTaskId(),
      title: taskData.title || '',
      description: taskData.description || '',
      type: taskData.type || 'other',
      priority: taskData.priority || 'normal',
      status: taskData.status || 'pending',
      assignedTo: taskData.assignedTo || '',
      assignedToName: taskData.assignedToName || '',
      assignedBy: user?.id || '',
      assignedByName: user?.name || '',
      patientId: taskData.patientId,
      patientName: taskData.patientName,
      appointmentId: taskData.appointmentId,
      dueDate: taskData.dueDate || '',
      notes: taskData.notes,
      createdAt: editingTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminders: editingTask?.reminders || []
    };

    saveTask(task);
    loadTasks();
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    loadTasks();
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo task?')) {
      // Implementation for delete task
      loadTasks();
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.patientName && task.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignedTo === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesAssignee;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'appointment': return 'Appuntamento';
      case 'follow_up': return 'Follow-up';
      case 'administrative': return 'Amministrativo';
      case 'medical': return 'Medico';
      case 'billing': return 'Fatturazione';
      case 'other': return 'Altro';
      default: return type;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'pending': return 'In Attesa';
      case 'in_progress': return 'In Corso';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Annullato';
      case 'overdue': return 'In Ritardo';
      default: return status;
    }
  };

  const getPriorityDisplayName = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'normal': return 'Normale';
      case 'low': return 'Bassa';
      default: return priority;
    }
  };

  const todayTasks = filteredTasks.filter(task => task.dueDate === new Date().toISOString().split('T')[0]);
  const overdueTasks = filteredTasks.filter(task => task.status === 'overdue');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestione Task</h3>
          <p className="text-sm text-gray-600">
            {filteredTasks.length} task totali • {todayTasks.length} oggi • {overdueTasks.length} in ritardo
          </p>
        </div>
        <button
          onClick={handleCreateTask}
          className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Task
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Oggi</p>
              <p className="text-xl font-bold text-yellow-600">{todayTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Ritardo</p>
              <p className="text-xl font-bold text-red-600">{overdueTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completati</p>
              <p className="text-xl font-bold text-green-600">{completedTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Totali</p>
              <p className="text-xl font-bold text-blue-600">{filteredTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In Attesa</option>
            <option value="in_progress">In Corso</option>
            <option value="completed">Completati</option>
            <option value="overdue">In Ritardo</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">Tutti i tipi</option>
            <option value="appointment">Appuntamenti</option>
            <option value="follow_up">Follow-up</option>
            <option value="administrative">Amministrativi</option>
            <option value="medical">Medici</option>
            <option value="billing">Fatturazione</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className={`font-medium text-gray-900 ${
                        task.status === 'completed' ? 'line-through text-gray-500' : ''
                      }`}>
                        {task.title}
                      </h4>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusDisplayName(task.status)}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {getTypeDisplayName(task.type)}
                      </span>
                      
                      {task.priority !== 'normal' && (
                        <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {task.assignedToName}
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString('it-IT')}
                      </div>
                      
                      {task.patientName && (
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {task.patientName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {task.status !== 'completed' && task.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Completa"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifica"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTasks.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun task trovato</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Crea il primo task per iniziare'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskFormModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

// Task Form Modal Component
const TaskFormModal: React.FC<{
  task?: Task | null;
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
}> = ({ task, onSave, onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    type: task?.type || 'other' as Task['type'],
    priority: task?.priority || 'normal' as Task['priority'],
    status: task?.status || 'pending' as Task['status'],
    assignedTo: task?.assignedTo || '',
    assignedToName: task?.assignedToName || '',
    patientId: task?.patientId || '',
    patientName: task?.patientName || '',
    dueDate: task?.dueDate || new Date().toISOString().split('T')[0],
    notes: task?.notes || ''
  });

  useEffect(() => {
    setUsers(getUsers());
    setPatients(getPatients());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.assignedTo || !formData.dueDate) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    onSave(formData);
  };

  const handleAssigneeChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setFormData(prev => ({
      ...prev,
      assignedTo: userId,
      assignedToName: user ? user.name : ''
    }));
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
          <h3 className="text-lg font-semibold text-gray-900">
            {task ? 'Modifica Task' : 'Nuovo Task'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="appointment">Appuntamento</option>
                <option value="follow_up">Follow-up</option>
                <option value="administrative">Amministrativo</option>
                <option value="medical">Medico</option>
                <option value="billing">Fatturazione</option>
                <option value="other">Altro</option>
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
              Assegnato a *
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona utente</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Scadenza *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stato
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="pending">In Attesa</option>
                <option value="in_progress">In Corso</option>
                <option value="completed">Completato</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={3}
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
              {task ? 'Salva Modifiche' : 'Crea Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};