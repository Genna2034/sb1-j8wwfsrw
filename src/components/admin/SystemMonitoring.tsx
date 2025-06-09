import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, Clock, TrendingUp, BarChart3, Settings, RefreshCw, Download, Cpu, HardDrive, MemoryStick as Memory, Network, Shield, Zap } from 'lucide-react';
import { PerformanceOptimizer } from '../../utils/performanceOptimizer';
import { ExternalIntegrationsManager } from '../../utils/externalIntegrations';
import { DeploymentManager } from '../../utils/deploymentManager';

export const SystemMonitoring: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const [integrationStatus, setIntegrationStatus] = useState<any>({});
  const [deploymentInfo, setDeploymentInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemData, 30000); // Refresh ogni 30 secondi
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadSystemData = async () => {
    setLoading(true);
    try {
      const [health, performance, integrations, deployment] = await Promise.all([
        DeploymentManager.getInstance().performHealthCheck(),
        PerformanceOptimizer.getInstance().getPerformanceReport(),
        ExternalIntegrationsManager.getInstance().checkIntegrationsHealth(),
        Promise.resolve(DeploymentManager.getInstance().getDeploymentInfo())
      ]);

      setSystemHealth(health);
      setPerformanceMetrics(performance);
      setIntegrationStatus(integrations);
      setDeploymentInfo(deployment);
    } catch (error) {
      console.error('Errore caricamento dati sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'enabled':
      case true:
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'disabled':
      case false:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string | boolean) => {
    if (status === 'healthy' || status === true) {
      return <CheckCircle className="w-4 h-4" />;
    } else if (status === 'warning') {
      return <AlertTriangle className="w-4 h-4" />;
    } else {
      return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const exportSystemReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth,
      performanceMetrics,
      integrationStatus,
      deploymentInfo,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento monitoraggio sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoraggio Sistema</h2>
          <p className="text-gray-600 mt-1">
            Stato in tempo reale di sistema, performance e integrazioni
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={loadSystemData}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Aggiorna
          </button>
          <button
            onClick={exportSystemReport}
            className="flex items-center px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Esporta Report
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Server className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sistema</p>
              <p className={`text-2xl font-bold ${getStatusColor(systemHealth.status)}`}>
                {systemHealth.status === 'healthy' ? 'Operativo' : 'Problemi'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-blue-600">
                {performanceMetrics.metrics?.LCP?.latest ? 
                  `${(performanceMetrics.metrics.LCP.latest / 1000).toFixed(1)}s` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Network className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Integrazioni</p>
              <p className="text-2xl font-bold text-purple-600">
                {Object.values(integrationStatus).filter((status: any) => status.status === 'healthy').length}/
                {Object.keys(integrationStatus).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ambiente</p>
              <p className="text-2xl font-bold text-orange-600">
                {deploymentInfo.environment?.toUpperCase() || 'DEV'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Stato Sistema</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemHealth.checks && Object.entries(systemHealth.checks).map(([check, status]) => (
              <div key={check} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {getStatusIcon(status as boolean)}
                  <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                    {check.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status as any)}`}>
                  {status ? 'OK' : 'Error'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Metriche Performance</h3>
        </div>
        <div className="p-6">
          {performanceMetrics.metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(performanceMetrics.metrics).map(([metric, data]: [string, any]) => (
                <div key={metric} className="text-center">
                  <div className="p-4 bg-gray-50 rounded-lg mb-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {metric === 'LCP' ? `${(data.latest / 1000).toFixed(1)}s` :
                       metric === 'FID' ? `${data.latest.toFixed(0)}ms` :
                       metric === 'CLS' ? data.latest.toFixed(3) : data.latest}
                    </div>
                    <div className="text-sm text-gray-600">{metric}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Avg: {metric === 'LCP' ? `${(data.avg / 1000).toFixed(1)}s` :
                          metric === 'FID' ? `${data.avg.toFixed(0)}ms` :
                          metric === 'CLS' ? data.avg.toFixed(3) : data.avg.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nessuna metrica disponibile</p>
            </div>
          )}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Stato Integrazioni</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(integrationStatus).map(([integration, status]: [string, any]) => (
              <div key={integration} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    status.status === 'healthy' ? 'bg-green-500' :
                    status.status === 'disabled' ? 'bg-gray-400' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {integration.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">{status.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                    {status.status === 'healthy' ? 'Attivo' :
                     status.status === 'disabled' ? 'Disabilitato' : 'Errore'}
                  </span>
                  {status.lastCheck && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(status.lastCheck).toLocaleTimeString('it-IT')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deployment Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Informazioni Deployment</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Configurazione</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Versione:</span>
                  <span className="font-medium">{deploymentInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Build:</span>
                  <span className="font-medium">{deploymentInfo.buildNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ambiente:</span>
                  <span className={`font-medium ${
                    deploymentInfo.environment === 'production' ? 'text-red-600' :
                    deploymentInfo.environment === 'staging' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {deploymentInfo.environment?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deploy:</span>
                  <span className="font-medium">
                    {deploymentInfo.deploymentDate ? 
                      new Date(deploymentInfo.deploymentDate).toLocaleDateString('it-IT') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Feature Flags</h4>
              <div className="space-y-2">
                {deploymentInfo.features && Object.entries(deploymentInfo.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enabled)}`}>
                      {enabled ? 'Attivo' : 'Disattivo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Statistics */}
      {performanceMetrics.cacheStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Statistiche Cache</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-4 bg-blue-50 rounded-lg mb-2">
                  <HardDrive className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {performanceMetrics.cacheStats.size}
                  </div>
                  <div className="text-sm text-gray-600">Elementi in Cache</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-green-50 rounded-lg mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {(performanceMetrics.cacheStats.hitRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Hit Rate</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-purple-50 rounded-lg mb-2">
                  <Memory className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {((performanceMetrics.cacheStats.size * 1024) / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="text-sm text-gray-600">Memoria Stimata</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};