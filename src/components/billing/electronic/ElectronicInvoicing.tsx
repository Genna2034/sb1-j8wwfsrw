import React, { useState, useEffect } from 'react';
import { 
  Send, FileText, Search, Filter, Download, CheckCircle, 
  XCircle, AlertTriangle, Clock, Calendar, Building, 
  FileSpreadsheet, RefreshCw, Settings, Upload
} from 'lucide-react';
import { ElectronicInvoiceTransmission } from '../../../types/billing/advanced';
import { useToast } from '../../../contexts/ToastContext';

export const ElectronicInvoicing: React.FC = () => {
  const { showToast } = useToast();
  const [transmissions, setTransmissions] = useState<ElectronicInvoiceTransmission[]>([]);
  const [filteredTransmissions, setFilteredTransmissions] = useState<ElectronicInvoiceTransmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadTransmissions();
  }, []);

  useEffect(() => {
    filterTransmissions();
  }, [transmissions, searchTerm, statusFilter, dateFilter]);

  const loadTransmissions = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockTransmissions: ElectronicInvoiceTransmission[] = [
          {
            id: '1',
            invoiceId: '1',
            invoiceNumber: 'FT-2025/0042',
            transmissionId: 'T-2025-0001',
            transmissionDate: '2025-06-15T10:30:00Z',
            recipient: 'Comune di Napoli',
            format: 'FPA12',
            status: 'delivered',
            statusDate: '2025-06-15T10:35:00Z',
            xmlContent: '<?xml version="1.0" encoding="UTF-8"?>...',
            notifications: [
              {
                date: '2025-06-15T10:30:00Z',
                type: 'RC',
                message: 'Ricevuta di consegna'
              }
            ],
            createdAt: '2025-06-15T10:30:00Z',
            updatedAt: '2025-06-15T10:35:00Z'
          },
          {
            id: '2',
            invoiceId: '2',
            invoiceNumber: 'FT-2025/0041',
            transmissionId: 'T-2025-0002',
            transmissionDate: '2025-06-10T11:15:00Z',
            recipient: 'ASL Napoli 1 Centro',
            format: 'FPA12',
            status: 'accepted',
            statusDate: '2025-06-10T14:20:00Z',
            xmlContent: '<?xml version="1.0" encoding="UTF-8"?>...',
            notifications: [
              {
                date: '2025-06-10T11:15:00Z',
                type: 'RC',
                message: 'Ricevuta di consegna'
              },
              {
                date: '2025-06-10T14:20:00Z',
                type: 'AT',
                message: 'Notifica di accettazione'
              }
            ],
            createdAt: '2025-06-10T11:15:00Z',
            updatedAt: '2025-06-10T14:20:00Z'
          },
          {
            id: '3',
            invoiceId: '3',
            invoiceNumber: 'FT-2025/0040',
            transmissionId: 'T-2025-0003',
            transmissionDate: '2025-06-05T09:45:00Z',
            recipient: 'Istituto Comprensivo Statale "Virgilio 4"',
            format: 'FPA12',
            status: 'accepted',
            statusDate: '2025-06-05T11:30:00Z',
            xmlContent: '<?xml version="1.0" encoding="UTF-8"?>...',
            notifications: [
              {
                date: '2025-06-05T09:45:00Z',
                type: 'RC',
                message: 'Ricevuta di consegna'
              },
              {
                date: '2025-06-05T11:30:00Z',
                type: 'AT',
                message: 'Notifica di accettazione'
              }
            ],
            createdAt: '2025-06-05T09:45:00Z',
            updatedAt: '2025-06-05T11:30:00Z'
          },
          {
            id: '4',
            invoiceId: '5',
            invoiceNumber: 'FT-2025/0038',
            transmissionId: 'T-2025-0004',
            transmissionDate: '2025-05-28T15:20:00Z',
            recipient: 'Comune di Napoli',
            format: 'FPA12',
            status: 'rejected',
            statusDate: '2025-05-28T16:45:00Z',
            xmlContent: '<?xml version="1.0" encoding="UTF-8"?>...',
            notifications: [
              {
                date: '2025-05-28T15:20:00Z',
                type: 'RC',
                message: 'Ricevuta di consegna'
              },
              {
                date: '2025-05-28T16:45:00Z',
                type: 'NE',
                message: 'Notifica di esito negativo: Codice fiscale non valido'
              }
            ],
            createdAt: '2025-05-28T15:20:00Z',
            updatedAt: '2025-05-28T16:45:00Z'
          }
        ];
        
        setTransmissions(mockTransmissions);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading transmissions:', error);
      setLoading(false);
    }
  };

  const filterTransmissions = () => {
    let filtered = [...transmissions];
    
    if (searchTerm) {
      filtered = filtered.filter(transmission => 
        transmission.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transmission.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transmission.transmissionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transmission => transmission.status === statusFilter);
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toISOString().split('T')[0];
      filtered = filtered.filter(transmission => 
        new Date(transmission.transmissionDate).toISOString().split('T')[0] === filterDate
      );
    }
    
    setFilteredTransmissions(filtered);
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      // In a real implementation, this would call an API to refresh the status
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast('success', 'Stato aggiornato', 'Lo stato delle trasmissioni è stato aggiornato con successo');
    } catch (error) {
      console.error('Error refreshing status:', error);
      showToast('error', 'Errore', 'Si è verificato un errore durante l\'aggiornamento dello stato');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadXml = (transmissionId: string) => {
    // In a real implementation, this would download the XML file
    showToast('success', 'XML scaricato', 'Il file XML è stato scaricato con successo');
  };

  const handleResendTransmission = (transmissionId: string) => {
    // In a real implementation, this would resend the transmission
    showToast('success', 'Trasmissione inviata', 'La trasmissione è stata inviata nuovamente con successo');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'delivered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return 'In attesa';
      case 'sent': return 'Inviata';
      case 'delivered': return 'Consegnata';
      case 'accepted': return 'Accettata';
      case 'rejected': return 'Rifiutata';
      case 'failed': return 'Fallita';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'delivered': return <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getNotificationTypeText = (type: string): string => {
    switch (type) {
      case 'RC': return 'Ricevuta di Consegna';
      case 'NS': return 'Notifica di Scarto';
      case 'MC': return 'Mancata Consegna';
      case 'AT': return 'Accettazione';
      case 'NE': return 'Esito Negativo';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inviate</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : transmissions.filter(t => t.status === 'sent' || t.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accettate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : transmissions.filter(t => t.status === 'accepted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rifiutate</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {loading ? '...' : transmissions.filter(t => t.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Attesa</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? '...' : transmissions.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca per numero fattura, destinatario o ID trasmissione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In Attesa</option>
            <option value="sent">Inviate</option>
            <option value="delivered">Consegnate</option>
            <option value="accepted">Accettate</option>
            <option value="rejected">Rifiutate</option>
            <option value="failed">Fallite</option>
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          
          <div className="flex space-x-2">
            <button
              onClick={handleRefreshStatus}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Aggiorna Stato
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Impostazioni
            </button>
          </div>
        </div>
      </div>

      {/* Transmissions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trasmissioni ({filteredTransmissions.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento trasmissioni...</p>
          </div>
        ) : filteredTransmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fattura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Destinatario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data Trasmissione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Formato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Notifiche
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransmissions.map((transmission) => (
                  <tr key={transmission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{transmission.invoiceNumber}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {transmission.transmissionId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {transmission.recipient}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(transmission.transmissionDate).toLocaleString('it-IT')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {transmission.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(transmission.status)}
                        <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transmission.status)}`}>
                          {getStatusText(transmission.status)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(transmission.statusDate).toLocaleString('it-IT')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {transmission.notifications.length} notifiche
                      </div>
                      {transmission.notifications.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ultima: {getNotificationTypeText(transmission.notifications[transmission.notifications.length - 1].type)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadXml(transmission.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Scarica XML"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        
                        {(transmission.status === 'rejected' || transmission.status === 'failed') && (
                          <button
                            onClick={() => handleResendTransmission(transmission.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Invia nuovamente"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Send className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nessuna trasmissione trovata</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchTerm || statusFilter !== 'all' || dateFilter
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Non ci sono trasmissioni di fatture elettroniche'
              }
            </p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Carica Notifiche SDI
        </h3>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Trascina qui i file di notifica SDI o clicca per selezionarli
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Supporta file XML ricevuti dal Sistema di Interscambio
          </p>
          <button
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            Seleziona File
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Impostazioni Fatturazione Elettronica
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Configurazione Trasmissione</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Modalità di Trasmissione
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    defaultValue="sdi"
                  >
                    <option value="sdi">Trasmissione diretta SDI</option>
                    <option value="pec">Trasmissione via PEC</option>
                    <option value="api">Trasmissione via API (provider esterno)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Formato Predefinito
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    defaultValue="FPA12"
                  >
                    <option value="FPA12">FPA12 (Pubblica Amministrazione)</option>
                    <option value="FPR12">FPR12 (Privati)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Codice Trasmittente
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    defaultValue="ABCDEF1"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="testMode"
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700"
                    defaultChecked={false}
                  />
                  <label htmlFor="testMode" className="text-sm text-gray-700 dark:text-gray-300">
                    Modalità Test
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Notifiche</h4>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700"
                    defaultChecked={true}
                  />
                  <label htmlFor="emailNotifications" className="text-sm text-gray-700 dark:text-gray-300">
                    Invia notifiche email per cambiamenti di stato
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoCheck"
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700"
                    defaultChecked={true}
                  />
                  <label htmlFor="autoCheck" className="text-sm text-gray-700 dark:text-gray-300">
                    Controlla automaticamente lo stato ogni ora
                  </label>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Salva Impostazioni
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};