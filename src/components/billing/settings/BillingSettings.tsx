import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Building, FileText, Euro, 
  Mail, Phone, MapPin, Globe, Hash, Calendar
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

interface BillingSettings {
  company: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    vatNumber: string;
    fiscalCode: string;
    phone: string;
    email: string;
    website: string;
    pec: string;
    sdiCode: string;
  };
  invoicing: {
    defaultPaymentTerms: number;
    defaultVatRate: number;
    invoicePrefix: string;
    invoiceNumbering: 'yearly' | 'continuous';
    electronicInvoicing: boolean;
    transmissionFormat: 'FPA12' | 'FPR12';
    defaultCurrency: string;
  };
  notifications: {
    sendInvoiceEmails: boolean;
    sendPaymentReminders: boolean;
    reminderDaysBefore: number;
    overdueNotifications: boolean;
    overdueReminderDays: number[];
  };
  integration: {
    accountingSoftware: string;
    bankingIntegration: boolean;
    apiKey: string;
  };
}

export const BillingSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<BillingSettings>({
    company: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Italia',
      vatNumber: '',
      fiscalCode: '',
      phone: '',
      email: '',
      website: '',
      pec: '',
      sdiCode: ''
    },
    invoicing: {
      defaultPaymentTerms: 30,
      defaultVatRate: 22,
      invoicePrefix: 'FT',
      invoiceNumbering: 'yearly',
      electronicInvoicing: true,
      transmissionFormat: 'FPA12',
      defaultCurrency: 'EUR'
    },
    notifications: {
      sendInvoiceEmails: true,
      sendPaymentReminders: true,
      reminderDaysBefore: 7,
      overdueNotifications: true,
      overdueReminderDays: [7, 15, 30]
    },
    integration: {
      accountingSoftware: '',
      bankingIntegration: false,
      apiKey: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockSettings: BillingSettings = {
          company: {
            name: 'Emmanuel Cooperativa Sociale',
            address: 'Via Roma, 123',
            city: 'Napoli',
            postalCode: '80100',
            country: 'Italia',
            vatNumber: 'IT12345678901',
            fiscalCode: '12345678901',
            phone: '+39 081 1234567',
            email: 'info@emmanuel.coop',
            website: 'www.emmanuel.coop',
            pec: 'emmanuel@pec.it',
            sdiCode: 'ABCDEFG'
          },
          invoicing: {
            defaultPaymentTerms: 30,
            defaultVatRate: 22,
            invoicePrefix: 'FT',
            invoiceNumbering: 'yearly',
            electronicInvoicing: true,
            transmissionFormat: 'FPA12',
            defaultCurrency: 'EUR'
          },
          notifications: {
            sendInvoiceEmails: true,
            sendPaymentReminders: true,
            reminderDaysBefore: 7,
            overdueNotifications: true,
            overdueReminderDays: [7, 15, 30]
          },
          integration: {
            accountingSoftware: 'Fatture in Cloud',
            bankingIntegration: false,
            apiKey: ''
          }
        };
        
        setSettings(mockSettings);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to an API
      setTimeout(() => {
        showToast('success', 'Impostazioni salvate', 'Le impostazioni di fatturazione sono state aggiornate con successo');
        setSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('error', 'Errore', 'Si è verificato un errore durante il salvataggio delle impostazioni');
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof BillingSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'company', label: 'Azienda', icon: Building },
    { id: 'invoicing', label: 'Fatturazione', icon: FileText },
    { id: 'notifications', label: 'Notifiche', icon: Mail },
    { id: 'integration', label: 'Integrazioni', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Caricamento impostazioni...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Impostazioni Fatturazione
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configura le impostazioni per il sistema di fatturazione avanzato
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
        </button>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
          {/* Company Settings */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informazioni Azienda</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ragione Sociale
                  </label>
                  <input
                    type="text"
                    value={settings.company.name}
                    onChange={(e) => updateSettings('company', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Partita IVA
                  </label>
                  <input
                    type="text"
                    value={settings.company.vatNumber}
                    onChange={(e) => updateSettings('company', 'vatNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Codice Fiscale
                  </label>
                  <input
                    type="text"
                    value={settings.company.fiscalCode}
                    onChange={(e) => updateSettings('company', 'fiscalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Codice SDI
                  </label>
                  <input
                    type="text"
                    value={settings.company.sdiCode}
                    onChange={(e) => updateSettings('company', 'sdiCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    value={settings.company.address}
                    onChange={(e) => updateSettings('company', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Città
                  </label>
                  <input
                    type="text"
                    value={settings.company.city}
                    onChange={(e) => updateSettings('company', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CAP
                  </label>
                  <input
                    type="text"
                    value={settings.company.postalCode}
                    onChange={(e) => updateSettings('company', 'postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefono
                  </label>
                  <input
                    type="text"
                    value={settings.company.phone}
                    onChange={(e) => updateSettings('company', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.company.email}
                    onChange={(e) => updateSettings('company', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PEC
                  </label>
                  <input
                    type="email"
                    value={settings.company.pec}
                    onChange={(e) => updateSettings('company', 'pec', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sito Web
                  </label>
                  <input
                    type="url"
                    value={settings.company.website}
                    onChange={(e) => updateSettings('company', 'website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invoicing Settings */}
          {activeTab === 'invoicing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Impostazioni Fatturazione</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prefisso Fatture
                  </label>
                  <input
                    type="text"
                    value={settings.invoicing.invoicePrefix}
                    onChange={(e) => updateSettings('invoicing', 'invoicePrefix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numerazione
                  </label>
                  <select
                    value={settings.invoicing.invoiceNumbering}
                    onChange={(e) => updateSettings('invoicing', 'invoiceNumbering', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="yearly">Annuale</option>
                    <option value="continuous">Continua</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Termini di Pagamento (giorni)
                  </label>
                  <input
                    type="number"
                    value={settings.invoicing.defaultPaymentTerms}
                    onChange={(e) => updateSettings('invoicing', 'defaultPaymentTerms', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aliquota IVA Predefinita (%)
                  </label>
                  <input
                    type="number"
                    value={settings.invoicing.defaultVatRate}
                    onChange={(e) => updateSettings('invoicing', 'defaultVatRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formato Trasmissione
                  </label>
                  <select
                    value={settings.invoicing.transmissionFormat}
                    onChange={(e) => updateSettings('invoicing', 'transmissionFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="FPA12">FPA12 (Pubblica Amministrazione)</option>
                    <option value="FPR12">FPR12 (Privati)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valuta
                  </label>
                  <select
                    value={settings.invoicing.defaultCurrency}
                    onChange={(e) => updateSettings('invoicing', 'defaultCurrency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollaro USA (USD)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="electronicInvoicing"
                  checked={settings.invoicing.electronicInvoicing}
                  onChange={(e) => updateSettings('invoicing', 'electronicInvoicing', e.target.checked)}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                />
                <label htmlFor="electronicInvoicing" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Abilita Fatturazione Elettronica
                </label>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Impostazioni Notifiche</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendInvoiceEmails"
                    checked={settings.notifications.sendInvoiceEmails}
                    onChange={(e) => updateSettings('notifications', 'sendInvoiceEmails', e.target.checked)}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sendInvoiceEmails" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Invia email automatiche per le fatture
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendPaymentReminders"
                    checked={settings.notifications.sendPaymentReminders}
                    onChange={(e) => updateSettings('notifications', 'sendPaymentReminders', e.target.checked)}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sendPaymentReminders" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Invia promemoria di pagamento
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="overdueNotifications"
                    checked={settings.notifications.overdueNotifications}
                    onChange={(e) => updateSettings('notifications', 'overdueNotifications', e.target.checked)}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  />
                  <label htmlFor="overdueNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Notifiche per fatture scadute
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Giorni prima della scadenza per promemoria
                  </label>
                  <input
                    type="number"
                    value={settings.notifications.reminderDaysBefore}
                    onChange={(e) => updateSettings('notifications', 'reminderDaysBefore', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Integration Settings */}
          {activeTab === 'integration' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Integrazioni</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Software di Contabilità
                  </label>
                  <select
                    value={settings.integration.accountingSoftware}
                    onChange={(e) => updateSettings('integration', 'accountingSoftware', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Nessuno</option>
                    <option value="Fatture in Cloud">Fatture in Cloud</option>
                    <option value="Aruba">Aruba</option>
                    <option value="TeamSystem">TeamSystem</option>
                    <option value="Zucchetti">Zucchetti</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chiave API
                  </label>
                  <input
                    type="password"
                    value={settings.integration.apiKey}
                    onChange={(e) => updateSettings('integration', 'apiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Inserisci la chiave API"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bankingIntegration"
                  checked={settings.integration.bankingIntegration}
                  onChange={(e) => updateSettings('integration', 'bankingIntegration', e.target.checked)}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                />
                <label htmlFor="bankingIntegration" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Abilita integrazione bancaria per riconciliazione automatica
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};