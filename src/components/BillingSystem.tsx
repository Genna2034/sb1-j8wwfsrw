import React, { useState, useEffect } from 'react';
import { FileText, Euro, TrendingUp, CreditCard, Plus, Calculator, PieChart, BarChart3 } from 'lucide-react';
import { Invoice } from '../types/billing';
import { getInvoices, saveInvoice, deleteInvoice, generateFinancialSummary } from '../utils/billingStorage';
import { InvoiceList } from './billing/InvoiceList';
import { InvoiceForm } from './billing/InvoiceForm';
import { FinancialDashboard } from './billing/FinancialDashboard';
import { useAuth } from '../contexts/AuthContext';

export const BillingSystem: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'payments' | 'expenses' | 'reports'>('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [stats, setStats] = useState<any>({});

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
    // Could open invoice detail modal here
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    saveInvoice(invoice);
    loadStats();
    setShowInvoiceForm(false);
    setEditingInvoice(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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
          <h1 className="text-2xl font-bold text-gray-900">Sistema Fatturazione e Contabilità</h1>
          <p className="text-gray-600 mt-1">
            Gestione completa di fatture, pagamenti e analisi finanziarie
          </p>
        </div>
        <button
          onClick={handleCreateInvoice}
          className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuova Fattura
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ricavi Mese</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.revenue?.total || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fatture Totali</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalInvoices || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calculator className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bozze</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draftInvoices || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scadute</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagate</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.paidInvoices || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
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
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Gestione Pagamenti</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}
          
          {activeTab === 'expenses' && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Gestione Spese</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
            setEditingInvoice(null);
          }}
        />
      )}
    </div>
  );
};