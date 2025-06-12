import React from 'react';
import { 
  Building, Phone, Mail, MapPin, FileText, Edit, X, 
  CreditCard, Calendar, CheckCircle, XCircle, Globe, 
  FileSpreadsheet, Download
} from 'lucide-react';
import { BillingEntity, BillingEntityType } from '../../../types/billing/advanced';

interface BillingEntityDetailProps {
  entity: BillingEntity;
  onEdit: () => void;
  onClose: () => void;
}

export const BillingEntityDetail: React.FC<BillingEntityDetailProps> = ({
  entity,
  onEdit,
  onClose
}) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mr-4">
                <Building className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {entity.name}
                </h3>
                <div className="flex items-center mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getEntityTypeColor(entity.type)}`}>
                    {getEntityTypeLabel(entity.type)}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {entity.isPublicAdministration ? 'Pubblica Amministrazione' : 'Privato'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Modifica"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Fiscal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Informazioni Fiscali
              </h4>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-800 dark:text-blue-300">Codice Fiscale:</span>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-200">{entity.fiscalCode}</span>
                  </div>
                  
                  {entity.vatNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800 dark:text-blue-300">Partita IVA:</span>
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-200">{entity.vatNumber}</span>
                    </div>
                  )}
                  
                  {entity.isPublicAdministration && entity.paCode && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800 dark:text-blue-300">Codice IPA:</span>
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-200">{entity.paCode}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-800 dark:text-blue-300">Termini di Pagamento:</span>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-200">{entity.paymentTerms} giorni</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Indirizzo
              </h4>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                <address className="not-italic text-sm text-green-800 dark:text-green-300 space-y-1">
                  <div>{entity.address}</div>
                  <div>{entity.postalCode} {entity.city} ({entity.province})</div>
                  <div>{entity.country}</div>
                </address>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Phone className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Contatti
              </h4>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-sm text-purple-800 dark:text-purple-300">{entity.email}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-sm text-purple-800 dark:text-purple-300">{entity.phone}</span>
                  </div>
                  
                  {entity.pec && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                      <span className="text-sm text-purple-800 dark:text-purple-300">PEC: {entity.pec}</span>
                    </div>
                  )}
                  
                  {entity.contactPerson && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                      <span className="text-sm text-purple-800 dark:text-purple-300">Contatto: {entity.contactPerson}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                Fatturazione Elettronica
              </h4>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                {entity.isPublicAdministration ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm text-orange-800 dark:text-orange-300">
                        Pubblica Amministrazione
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                      <span className="text-sm text-orange-800 dark:text-orange-300">
                        Codice IPA: {entity.paCode || 'Non specificato'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                      <span className="text-sm text-orange-800 dark:text-orange-300">
                        Formato: FPA12
                      </span>
                    </div>
                  </div>
                ) : entity.sdiCode ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm text-orange-800 dark:text-orange-300">
                        Codice SDI: {entity.sdiCode}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                      <span className="text-sm text-orange-800 dark:text-orange-300">
                        Formato: FPR12
                      </span>
                    </div>
                  </div>
                ) : entity.pec ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm text-orange-800 dark:text-orange-300">
                        Invio tramite PEC: {entity.pec}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                      <span className="text-sm text-orange-800 dark:text-orange-300">
                        Formato: FPR12
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                      <span className="text-sm text-orange-800 dark:text-orange-300">
                        Fatturazione elettronica non configurata
                      </span>
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                      Configura un Codice SDI o un indirizzo PEC per l'invio delle fatture elettroniche.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {entity.notes && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                Note
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {entity.notes}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifica
            </button>
            
            <button
              onClick={() => {/* View contracts action */}}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Visualizza Contratti
            </button>
            
            <button
              onClick={() => {/* View invoices action */}}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Visualizza Fatture
            </button>
            
            <button
              onClick={() => {/* Export data action */}}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta Dati
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing User icon
const User = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);