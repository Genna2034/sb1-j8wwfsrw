import React, { useState, useEffect } from 'react';
import { 
  Cloud, Mail, Database, Zap, Settings, CheckCircle, XCircle, 
  AlertTriangle, Wifi, WifiOff, Key, Shield, Download, Upload,
  RefreshCw, Monitor, BarChart3, Globe
} from 'lucide-react';
import { getEmailService, initializeEmailService, type EmailConfig } from '../../services/emailService';
import { getApiService, initializeApiService, type ApiConfig } from '../../services/apiService';
import { getBackupService, initializeBackupService, type BackupConfig } from '../../services/backupService';
import { getPerformanceService, type PerformanceConfig } from '../../services/performanceService';

export const ExternalIntegrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'api' | 'backup' | 'performance'>('email');
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'mock',
    apiKey: '',
    serviceId: '',
    templateId: ''
  });
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    baseUrl: 'https://api.emmanuel.local',
    apiKey: '',
    timeout: 10000,
    retries: 3
  });
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    provider: 'local',
    autoBackup: false,
    backupInterval: 24,
    retentionDays: 30,
    compressionLevel: 6
  });
  const [performanceConfig, setPerformanceConfig] = useState<PerformanceConfig>({
    enableMetrics: true,
    enableCaching: true,
    cacheSize: 50,
    enableCompression: true,
    enableLazyLoading: true,
    enableServiceWorker: true,
    metricsInterval: 30
  });

  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({
    email: false,
    api: false,
    backup: false,
    performance: true
  });

  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadConfigurations();
    testConnections();
  }, []);

  const loadConfigurations = () => {
    // Carica configurazioni salvate
    const savedEmailConfig = localStorage.getItem('emmanuel_email_config');
    if (savedEmailConfig) {
      setEmailConfig(JSON.parse(savedEmailConfig));
    }

    const savedApiConfig = localStorage.getItem('emmanuel_api_config');
    if (savedApiConfig) {
      setApiConfig(JSON.parse(savedApiConfig));
    }

    const savedBackupConfig = localStorage.getItem('emmanuel_backup_config');
    if (savedBackupConfig) {
      setBackupConfig(JSON.parse(savedBackupConfig));
    }

    const savedPerformanceConfig = localStorage.getItem('emmanuel_performance_config');
    if (savedPerformanceConfig) {
      setPerformanceConfig(JSON.parse(savedPerformanceConfig));
    }
  };

  const testConnections = async () => {
    // Test Email Service
    try {
      const emailService = getEmailService();
      setConnectionStatus(prev => ({ ...prev, email: true }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, email: false }));
    }

    // Test API Service
    try {
      const apiService = getApiService();
      const result = await apiService.testConnection();
      setConnectionStatus(prev => ({ ...prev, api: result.success }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, api: false }));
    }

    // Test Backup Service
    try {
      const backupService = getBackupService();
      setConnectionStatus(prev => ({ ...prev, backup: true }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, backup: false }));
    }
  };

  const saveEmailConfig = () => {
    localStorage.setItem('emmanuel_email_config', JSON.stringify(emailConfig));
    initializeEmailService(emailConfig);
    setConnectionStatus(prev => ({ ...prev, email: true }));
    alert('✅ Configurazione email salvata!');
  };

  const saveApiConfig = () => {
    localStorage.setItem('emmanuel_api_config', JSON.stringify(apiConfig));
    initializeApiService(apiConfig);
    testConnections();
    alert('✅ Configurazione API salvata!');
  };

  const saveBackupConfig = () => {
    localStorage.setItem('emmanuel_backup_config', JSON.stringify(backupConfig));
    initializeBackupService(backupConfig);
    setConnectionStatus(prev => ({ ...prev, backup: true }));
    alert('✅ Configurazione backup salvata!');
  };

  const savePerformanceConfig = () => {
    localStorage.setItem('emmanuel_performance_config', JSON.stringify(performanceConfig));
    const performanceService = getPerformanceService();
    performanceService.updateConfig(performanceConfig);
    alert('✅ Configurazione performance salvata!');
  };

  const testEmailService = async () => {
    setLoading(prev => ({ ...prev, email: true }));
    
    try {
      const emailService = getEmailService();
      const result = await emailService.sendEmail(
        'test@example.com',
        'user-credentials',
        {
          name: 'Test User',
          username: 'test.user',
          password: 'test123',
          role: 'Test Role',
          department: 'Test Department',
          position: 'Test Position'
        }
      );

      setTestResults(prev => ({
        ...prev,
        email: {
          success: result.success,
          message: result.success ? 'Email di test inviata con successo!' : result.error,
          messageId: result.messageId
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        email: {
          success: false,
          message: error instanceof Error ? error.message : 'Errore sconosciuto'
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  const testApiService = async () => {
    setLoading(prev => ({ ...prev, api: true }));
    
    try {
      const apiService = getApiService();
      const result = await apiService.testConnection();

      setTestResults(prev => ({
        ...prev,
        api: {
          success: result.success,
          message: result.success ? `Connessione API riuscita (${result.latency}ms)` : result.error,
          latency: result.latency
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        api: {
          success: false,
          message: error instanceof Error ? error.message : 'Errore sconosciuto'
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, api: false }));
    }
  };

  const testBackupService = async () => {
    setLoading(prev => ({ ...prev, backup: true }));
    
    try {
      const backupService = getBackupService();
      const result = await backupService.createBackup({
        name: 'Test Backup',
        dataTypes: ['patients'],
        compress: true
      });

      setTestResults(prev => ({
        ...prev,
        backup: {
          success: result.success,
          message: result.success ? 'Backup di test creato con successo!' : result.error,
          backupId: result.backupId
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        backup: {
          success: false,
          message: error instanceof Error ? error.message : 'Errore sconosciuto'
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, backup: false }));
    }
  };

  const generatePerformanceReport = () => {
    const performanceService = getPerformanceService();
    const report = performanceService.generatePerformanceReport();
    
    setTestResults(prev => ({
      ...prev,
      performance: {
        success: true,
        message: `Report generato: ${report.summary}`,
        report
      }
    }));
  };

  const tabs = [
    { id: 'email', label: 'Email Service', icon: Mail },
    { id: 'api', label: 'API REST', icon: Globe },
    { id: 'backup', label: 'Backup Cloud', icon: Cloud },
    { id: 'performance', label: 'Performance', icon: Monitor }
  ];

  const getStatusIcon = (service: string) => {
    const status = connectionStatus[service];
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrazioni Esterne</h2>
          <p className="text-gray-600 mt-1">
            Configura e gestisci i servizi esterni per email, API, backup e performance
          </p>
        </div>
        <button
          onClick={testConnections}
          className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Test Connessioni
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const status = connectionStatus[tab.id];
          return (
            <div key={tab.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    status ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      status ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tab.label}</p>
                    <p className={`text-sm ${
                      status ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {status ? 'Connesso' : 'Disconnesso'}
                    </p>
                  </div>
                </div>
                {getStatusIcon(tab.id)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Tabs */}
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
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Email Configuration */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Configurazione Email Service</h3>
                <button
                  onClick={testEmailService}
                  disabled={loading.email}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading.email ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Test Email
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Email
                  </label>
                  <select
                    value={emailConfig.provider}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, provider: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="mock">Mock (Test)</option>
                    <option value="emailjs">EmailJS</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="smtp">SMTP Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={emailConfig.apiKey || ''}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Inserisci API Key"
                  />
                </div>

                {emailConfig.provider === 'emailjs' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service ID
                      </label>
                      <input
                        type="text"
                        value={emailConfig.serviceId || ''}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, serviceId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="EmailJS Service ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template ID
                      </label>
                      <input
                        type="text"
                        value={emailConfig.templateId || ''}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, templateId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="EmailJS Template ID"
                      />
                    </div>
                  </>
                )}
              </div>

              {testResults.email && (
                <div className={`p-4 rounded-lg border ${
                  testResults.email.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    {testResults.email.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-medium ${
                      testResults.email.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResults.email.message}
                    </span>
                  </div>
                  {testResults.email.messageId && (
                    <p className="text-sm text-green-700 mt-1">
                      Message ID: {testResults.email.messageId}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={saveEmailConfig}
                  className="flex items-center px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Salva Configurazione
                </button>
              </div>
            </div>
          )}

          {/* API Configuration */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Configurazione API REST</h3>
                <button
                  onClick={testApiService}
                  disabled={loading.api}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading.api ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4 mr-2" />
                  )}
                  Test API
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={apiConfig.baseUrl}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="https://api.emmanuel.local"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiConfig.apiKey || ''}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Bearer token o API key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={apiConfig.timeout}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, timeout: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    min="1000"
                    max="60000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    value={apiConfig.retries}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, retries: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              {testResults.api && (
                <div className={`p-4 rounded-lg border ${
                  testResults.api.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    {testResults.api.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-medium ${
                      testResults.api.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResults.api.message}
                    </span>
                  </div>
                  {testResults.api.latency && (
                    <p className="text-sm text-green-700 mt-1">
                      Latenza: {testResults.api.latency}ms
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={saveApiConfig}
                  className="flex items-center px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Salva Configurazione
                </button>
              </div>
            </div>
          )}

          {/* Backup Configuration */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Configurazione Backup Cloud</h3>
                <button
                  onClick={testBackupService}
                  disabled={loading.backup}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading.backup ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4 mr-2" />
                  )}
                  Test Backup
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Backup
                  </label>
                  <select
                    value={backupConfig.provider}
                    onChange={(e) => setBackupConfig(prev => ({ ...prev, provider: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="local">Local Storage</option>
                    <option value="dropbox">Dropbox</option>
                    <option value="googledrive">Google Drive</option>
                    <option value="onedrive">OneDrive</option>
                    <option value="s3">Amazon S3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Automatico
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={backupConfig.autoBackup}
                      onChange={(e) => setBackupConfig(prev => ({ ...prev, autoBackup: e.target.checked }))}
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Abilita backup automatico</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervallo Backup (ore)
                  </label>
                  <input
                    type="number"
                    value={backupConfig.backupInterval}
                    onChange={(e) => setBackupConfig(prev => ({ ...prev, backupInterval: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    min="1"
                    max="168"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention (giorni)
                  </label>
                  <input
                    type="number"
                    value={backupConfig.retentionDays}
                    onChange={(e) => setBackupConfig(prev => ({ ...prev, retentionDays: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              {testResults.backup && (
                <div className={`p-4 rounded-lg border ${
                  testResults.backup.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    {testResults.backup.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-medium ${
                      testResults.backup.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResults.backup.message}
                    </span>
                  </div>
                  {testResults.backup.backupId && (
                    <p className="text-sm text-green-700 mt-1">
                      Backup ID: {testResults.backup.backupId}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={saveBackupConfig}
                  className="flex items-center px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Salva Configurazione
                </button>
              </div>
            </div>
          )}

          {/* Performance Configuration */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Configurazione Performance</h3>
                <button
                  onClick={generatePerformanceReport}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Genera Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={performanceConfig.enableMetrics}
                      onChange={(e) => setPerformanceConfig(prev => ({ ...prev, enableMetrics: e.target.checked }))}
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Abilita monitoraggio metriche</span>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={performanceConfig.enableCaching}
                      onChange={(e) => setPerformanceConfig(prev => ({ ...prev, enableCaching: e.target.checked }))}
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Abilita cache intelligente</span>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={performanceConfig.enableLazyLoading}
                      onChange={(e) => setPerformanceConfig(prev => ({ ...prev, enableLazyLoading: e.target.checked }))}
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Abilita lazy loading</span>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={performanceConfig.enableServiceWorker}
                      onChange={(e) => setPerformanceConfig(prev => ({ ...prev, enableServiceWorker: e.target.checked }))}
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Abilita Service Worker</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cache Size (MB)
                    </label>
                    <input
                      type="number"
                      value={performanceConfig.cacheSize}
                      onChange={(e) => setPerformanceConfig(prev => ({ ...prev, cacheSize: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      min="10"
                      max="500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervallo Metriche (secondi)
                    </label>
                    <input
                      type="number"
                      value={performanceConfig.metricsInterval}
                      onChange={(e) => setPerformanceConfig(prev => ({ ...prev, metricsInterval: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      min="10"
                      max="300"
                    />
                  </div>
                </div>
              </div>

              {testResults.performance && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">
                      {testResults.performance.message}
                    </span>
                  </div>
                  
                  {testResults.performance.report && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Load Time:</span>
                        <span className="ml-2">{testResults.performance.report.metrics.loadTime.toFixed(0)}ms</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Memory:</span>
                        <span className="ml-2">{testResults.performance.report.metrics.memoryUsage.toFixed(1)}MB</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Cache Hit:</span>
                        <span className="ml-2">{(testResults.performance.report.metrics.cacheHitRatio * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Errors:</span>
                        <span className="ml-2">{(testResults.performance.report.metrics.errorRate * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={savePerformanceConfig}
                  className="flex items-center px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Salva Configurazione
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};