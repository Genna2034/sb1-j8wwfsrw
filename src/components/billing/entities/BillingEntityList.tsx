import React, { useState, useEffect } from 'react';
import { 
  Building, Search, Filter, Plus, Edit, Trash2, Eye, 
  FileText, Send, Download, CheckCircle, XCircle, AlertTriangle 
} from 'lucide-react';
import { BillingEntity, BillingEntityType } from '../../../types/billing/advanced';
import { BillingEntityForm } from './BillingEntityForm';
import { BillingEntityDetail } from './BillingEntityDetail';
import { useToast } from '../../../contexts/ToastContext';

export const BillingEntityList: React.FC = () => {
  const { showToast } = useToast();
  const [entities, setEntities] = useState<BillingEntity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<BillingEntity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<BillingEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntities();
  }, []);

  useEffect(() => {
    filterEntities();
  }, [entities, searchTerm, typeFilter]);

  const loadEntities = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockEntities: BillingEntity[] = [
          {
            id: '1',
            name: 'Comune di Napoli',
            type: 'municipality',
            fiscalCode: '80014890638',
            vatNumber: '01207650639',
            address: 'Piazza Municipio, 1',
            city: 'Napoli',
            postalCode: '80100',
            province: 'NA',
            country: 'Italia',
            email: 'protocollo@pec.comune.napoli.it',
            phone: '081 7951111',
            pec: 'protocollo@pec.comune.napoli.it',
            sdiCode: 'UFGKZE',
            paymentTerms: 30,
            isPublicAdministration: true,
            paCode: 'c_f839',
            contactPerson: 'Mario Rossi',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'ASL Napoli 1 Centro',
            type: 'health_authority',
            fiscalCode: '06328131211',
            vatNumber: '06328131211',
            address: 'Via Comunale del Principe, 13/A',
            city: 'Napoli',
            postalCode: '80145',
            province: 'NA',
            country: 'Italia',
            email: 'aslnapoli1centro@pec.aslna1centro.it',
            phone: '081 2544111',
            pec: 'aslnapoli1centro@pec.aslna1centro.it',
            sdiCode: 'UFTY8T',
            paymentTerms: 60,
            isPublicAdministration: true,
            paCode: 'asl_na1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Istituto Comprensivo Statale "Virgilio 4"',
            type: 'school',
            fiscalCode: '80103400635',
            vatNumber: '80103400635',
            address: 'Via A. Labriola, 10/H',
            city: 'Napoli',
            postalCode: '80144',
            province: 'NA',
            country: 'Italia',
            email: 'naic8af00e@pec.istruzione.it',
            phone: '081 5434566',
            pec: 'naic8af00e@pec.istruzione.it',
            sdiCode: 'UF6Z7I',
            paymentTerms: 30,
            isPublicAdministration: true,
            paCode: 'istsc_naic8af00e',
            contactPerson: 'Dirigente Scolastico',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Famiglia Esposito',
            type: 'private_family',
            fiscalCode: 'SPSRRT80A01F839W',
            address: 'Via Toledo, 45',
            city: 'Napoli',
            postalCode: '80134',
            province: 'NA',
            country: 'Italia',
            email: 'roberto.esposito@email.it',
            phone: '333 1234567',
            paymentTerms: 15,
            isPublicAdministration: false,
            contactPerson: 'Roberto Esposito',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setEntities(mockEntities);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading billing entities:', error);
      setLoading(false);
    }
  };

  const filterEntities = () => {
    let filtered = [...entities];
    
    if (searchTerm) {
      filtered = filtered.filter(entity => 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.fiscalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.vatNumber && entity.vatNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entity => entity.type === typeFilter);
    }
    
    setFilteredEntities(filtered);
  };

  const handleAddEntity = () => {
    setSelectedEntity(null);
    setShowForm(true);
  };

  const handleEditEntity = (entity: BillingEntity) => {
    setSelectedEntity(entity);
    setShowForm(true);
  };

  const handleViewEntity = (entity: BillingEntity) => {
    setSelectedEntity(entity);
    setShowDetail(true);
  };

  const handleDeleteEntity = (entityId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.')) {
      // In a real implementation, this would call an API
      setEntities(prev => prev.filter(entity => entity.id !== entityId));
      showToast('success', 'Cliente eliminato', 'Il cliente è stato eliminato con successo');
    }
  };

  const handleSaveEntity = (entity: BillingEntity) => {
    if (selectedEntity) {
      // Update existing entity
      setEntities(prev => prev.map(e => e.id === entity.id ? entity : e));
      showToast('success', 'Cliente aggiornato', 'Le informazioni del cliente sono state aggiornate');
    } else {
      // Add new entity
      const newEntity = {
        ...entity,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setEntities(prev => [...prev, newEntity]);
      showToast('success', 'Cliente aggiunto', 'Il nuovo cliente è stato aggiunto con successo');
    }
    setShowForm(false);
  };

  const getEntityTypeLabel = (type: BillingEntityType): string => {
    switch (type) {
      case 'municipality': return 'Comune';
      case 'school': return 'Scuola';
      case 'health_authority': return 'ASL';
      case 'public_entity': return 'Ente Pubblico';
      case 'private_family': return 'Famiglia';
      case 'insurance': return 'Assicurazione';
      case 'other': return 'Altro';
      default: return type;
    }
  };

  const getEntityTypeColor = (type: BillingEntityType): string => {
    switch (type) {
      case 'municipality': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'school': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'health_authority': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'public_entity': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'private_family': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'insurance': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca per nome, codice fiscale o P.IVA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tutti i tipi</option>
            <option value="municipality">Comuni</option>
            <option value="school">Scuole</option>
            <option value="health_authority">ASL</option>
            <option value="public_entity">Enti Pubblici</option>
            <option value="private_family">Famiglie</option>
            <option value="insurance">Assicurazioni</option>
            <option value="other">Altri</option>
          </select>
          
          <button
            onClick={handleAddEntity}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Cliente
          </button>
        </div>
      </div>

      {/* Entities List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Clienti ({filteredEntities.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento clienti...</p>
          </div>
        ) : filteredEntities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Codice Fiscale / P.IVA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contatti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fatturazione Elettronica
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEntities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                          <Building className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{entity.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {entity.city}, {entity.province}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getEntityTypeColor(entity.type)}`}>
                        {getEntityTypeLabel(entity.type)}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {entity.isPublicAdministration ? 'Pubblica Amministrazione' : 'Privato'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{entity.fiscalCode}</div>
                      {entity.vatNumber && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">P.IVA: {entity.vatNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{entity.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{entity.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entity.isPublicAdministration ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {entity.paCode}
                          </span>
                        </div>
                      ) : entity.sdiCode ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {entity.sdiCode}
                          </span>
                        </div>
                      ) : entity.pec ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            PEC
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-1" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            Non configurata
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEntity(entity)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Visualizza"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditEntity(entity)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Modifica"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntity(entity.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Building className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nessun cliente trovato</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchTerm || typeFilter !== 'all' 
                ? 'Prova a modificare i filtri di ricerca' 
                : 'Aggiungi il tuo primo cliente per iniziare'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && (
              <button
                onClick={handleAddEntity}
                className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Aggiungi Cliente
              </button>
            )}
          </div>
        )}
      </div>

      {/* Entity Form Modal */}
      {showForm && (
        <BillingEntityForm
          entity={selectedEntity}
          onSave={handleSaveEntity}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Entity Detail Modal */}
      {showDetail && selectedEntity && (
        <BillingEntityDetail
          entity={selectedEntity}
          onEdit={() => {
            setShowDetail(false);
            setShowForm(true);
          }}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};