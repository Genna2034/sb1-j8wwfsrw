import React, { useState, useEffect } from 'react';
import { FileText, Euro, TrendingUp, CreditCard, Plus, Calculator, PieChart, BarChart3 } from 'lucide-react';
import { Invoice } from '../types/billing';
import { getInvoices, saveInvoice, deleteInvoice, generateFinancialSummary, savePayment, generatePaymentId } from '../utils/billingStorage';
import { InvoiceList } from './billing/InvoiceList';
import { InvoiceForm } from './billing/InvoiceForm';
import { InvoiceDetail } from './billing/InvoiceDetail';
import { FinancialDashboard } from './billing/FinancialDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export const BillingSystem: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'payments' | 'expenses' | 'reports'>('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const summary = generateFinancialSummary(startOfMonth, endOfMonth);
    const invoices = getInvoices();
    
    setStats({
      ...summary,
      totalInvoices: invoices.length,
      draftInvoices: invoices.filter(inv => inv.status === 'draft').length,
      overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length
    });
  };

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(undefined);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setLoading(true);
    try {
      saveInvoice(invoice);
      loadStats();
      setShowInvoiceForm(false);
      setEditingInvoice(undefined);
      
      // Se è una nuova fattura, mostra notifica
      if (!editingInvoice) {
        showNotification(
          'Fattura creata',
          `La fattura ${invoice.number} è stata creata con successo`
        );
      }
    } catch (error) {
      console.error('Errore nel salvataggio fattura:', error);
      alert('Errore nel salvataggio della fattura');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = () => {
    if (selectedInvoice) {
      setLoading(true);
      try {
        deleteInvoice(selectedInvoice.id);
        loadStats();
        setShowInvoiceDetail(false);
        setSelectedInvoice(undefined);
        
        showNotification(
          'Fattura eliminata',
          `La fattura ${selectedInvoice.number} è stata eliminata`
        );
      } catch (error) {
        console.error('Errore nell\'eliminazione fattura:', error);
        alert('Errore nell\'eliminazione della fattura');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleStatusChange = (status: Invoice['status']) => {
    if (selectedInvoice) {
      setLoading(true);
      try {
        const updatedInvoice = { ...selectedInvoice, status, updatedAt: new Date().toISOString() };
        
        // Se lo stato è "paid", aggiorna anche gli importi
        if (status === 'paid' && selectedInvoice.remainingAmount > 0) {
          // Registra un pagamento
          const payment = {
            id: generatePaymentId(),
            invoiceId: selectedInvoice.id,
            amount: selectedInvoice.remainingAmount,
            method: 'bank_transfer' as const,
            date: new Date().toISOString().split('T')[0],
            reference: `Pagamento fattura ${selectedInvoice.number}`,
            createdAt: new Date().toISOString(),
            createdBy: user?.id || ''
          };
          
          savePayment(payment);
          
          // La savePayment aggiorna automaticamente lo stato della fattura
        } else {
          saveInvoice(updatedInvoice);
        }
        
        loadStats();
        setSelectedInvoice(updatedInvoice);
        
        showNotification(
          `Fattura ${getStatusText(status)}`,
          `La fattura ${selectedInvoice.number} è stata ${getStatusText(status).toLowerCase()}`
        );
      } catch (error) {
        console.error('Errore nel cambio stato fattura:', error);
        alert('Errore nel cambio stato della fattura');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'draft': return 'Bozza';
      case 'sent': return 'Inviata';
      case 'paid': return 'Pagata';
      case 'overdue': return 'Scaduta';
      case 'cancelled': return 'Annullata';
      default: return status;
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'invoices', label: 'Fatture', icon: FileText },
    { id: 'payments', label: 'Pagamenti', icon: CreditCard },
    { id: 'expenses', label: 'Spese', icon: TrendingUp },
    { id: 'reports', label: 'Report', icon: PieChart }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema Fatturazione e Contabilità</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestione completa di fatture, pagamenti e analisi finanziarie
          </p>
        </div>
        <button
          onClick={handleCreateInvoice}
          className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span>Caricamento...</span>
            </div>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Fattura
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Euro className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ricavi Mese</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.revenue?.total || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fatture Totali</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalInvoices || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Calculator className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bozze</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.draftInvoices || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scadute</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdueInvoices || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagate</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.paidInvoices || 0}</p>
            </div>
          </div>
        </div>
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
          {/* Tab Content */}
          {activeTab === 'dashboard' && <FinancialDashboard />}
          
          {activeTab === 'invoices' && (
            <InvoiceList
              onSelectInvoice={handleSelectInvoice}
              onCreateInvoice={handleCreateInvoice}
              onEditInvoice={handleEditInvoice}
            />
          )}
          
          {activeTab === 'payments' && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Gestione Pagamenti</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}
          
          {activeTab === 'expenses' && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Gestione Spese</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Report Finanziari</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showInvoiceForm && (
        <InvoiceForm
          invoice={editingInvoice}
          onSave={handleSaveInvoice}
          onClose={() => {
            setShowInvoiceForm(false);
            setEditingInvoice(undefined);
          }}
        />
      )}
      
      {showInvoiceDetail && selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          onEdit={() => {
            setEditingInvoice(selectedInvoice);
            setShowInvoiceDetail(false);
            setShowInvoiceForm(true);
          }}
          onDelete={handleDeleteInvoice}
          onClose={() => {
            setShowInvoiceDetail(false);
            setSelectedInvoice(undefined);
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};