import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertTriangle, Calendar, PieChart, BarChart3 } from 'lucide-react';
import { FinancialSummary } from '../../types/billing';
import { generateFinancialSummary } from '../../utils/billingStorage';

export const FinancialDashboard: React.FC = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, [period]);

  const loadFinancialData = () => {
    setLoading(true);
    
    const today = new Date();
    let startDate: string;
    let endDate: string = today.toISOString().split('T')[0];

    switch (period) {
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterStart = Math.floor(today.getMonth() / 3) * 3;
        startDate = new Date(today.getFullYear(), quarterStart, 1).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    }

    const financialSummary = generateFinancialSummary(startDate, endDate);
    setSummary(financialSummary);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getPeriodDisplayName = () => {
    switch (period) {
      case 'month': return 'Questo Mese';
      case 'quarter': return 'Questo Trimestre';
      case 'year': return 'Quest\'Anno';
      default: return 'Questo Mese';
    }
  };

  if (loading || !summary) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dati finanziari...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Dashboard Finanziaria</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p === 'month' ? 'Mese' : p === 'quarter' ? 'Trimestre' : 'Anno'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ricavi Totali</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.revenue.total)}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Incassati: {formatCurrency(summary.revenue.collected)}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Spese Totali</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.expenses.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${
              summary.profitLoss.netIncome >= 0 ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                summary.profitLoss.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utile Netto</p>
              <p className={`text-2xl font-bold ${
                summary.profitLoss.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.profitLoss.netIncome)}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Margine: {formatPercentage(summary.profitLoss.margin)}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Da Incassare</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summary.revenue.outstanding)}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Scaduto: {formatCurrency(summary.revenue.overdue)}
          </div>
        </div>
      </div>

      {/* Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Flusso di Cassa</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-green-900">Entrate</span>
              </div>
              <span className="font-bold text-green-600">
                {formatCurrency(summary.cashFlow.inflow)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <TrendingDown className="w-5 h-5 text-red-600 mr-3" />
                <span className="font-medium text-red-900">Uscite</span>
              </div>
              <span className="font-bold text-red-600">
                {formatCurrency(summary.cashFlow.outflow)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-t-2 border-blue-200">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-900">Flusso Netto</span>
              </div>
              <span className={`font-bold ${
                summary.cashFlow.net >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.cashFlow.net)}
              </span>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Indicatori Chiave</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Valore Medio Fattura</span>
              <span className="font-semibold">{formatCurrency(summary.metrics.averageInvoiceValue)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasso di Incasso</span>
              <span className="font-semibold">{formatPercentage(summary.metrics.collectionRate)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giorni Medi Pagamento</span>
              <span className="font-semibold">{summary.metrics.daysToPayment.toFixed(0)} giorni</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Crediti in Sospeso</span>
              <span className="font-semibold">{formatPercentage(summary.metrics.outstandingRatio)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Ripartizione Spese per Categoria</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(summary.expenses.byCategory).map(([category, amount]) => (
            <div key={category} className="text-center">
              <div className="p-3 bg-gray-100 rounded-lg mb-2">
                <PieChart className="w-6 h-6 text-gray-600 mx-auto" />
              </div>
              <div className="text-sm font-medium text-gray-900">
                {getCategoryDisplayName(category)}
              </div>
              <div className="text-sm text-gray-600">
                {formatCurrency(amount as number)}
              </div>
              <div className="text-xs text-gray-500">
                {formatPercentage(((amount as number) / summary.expenses.total) * 100)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Period Summary */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
        <h4 className="text-lg font-semibold text-sky-900 mb-4">
          Riepilogo {getPeriodDisplayName()}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sky-600 font-medium">Performance Finanziaria</div>
            <div className="mt-2">
              <div className="flex justify-between">
                <span>Ricavi:</span>
                <span className="font-semibold">{formatCurrency(summary.revenue.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Spese:</span>
                <span className="font-semibold">{formatCurrency(summary.expenses.total)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span>Risultato:</span>
                <span className={`font-bold ${
                  summary.profitLoss.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.profitLoss.netIncome)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sky-600 font-medium">Stato Crediti</div>
            <div className="mt-2">
              <div className="flex justify-between">
                <span>Fatturato:</span>
                <span className="font-semibold">{formatCurrency(summary.revenue.invoiced)}</span>
              </div>
              <div className="flex justify-between">
                <span>Incassato:</span>
                <span className="font-semibold">{formatCurrency(summary.revenue.collected)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span>Da incassare:</span>
                <span className="font-bold text-yellow-600">
                  {formatCurrency(summary.revenue.outstanding)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sky-600 font-medium">Efficienza</div>
            <div className="mt-2">
              <div className="flex justify-between">
                <span>Margine:</span>
                <span className="font-semibold">{formatPercentage(summary.profitLoss.margin)}</span>
              </div>
              <div className="flex justify-between">
                <span>Incasso:</span>
                <span className="font-semibold">{formatPercentage(summary.metrics.collectionRate)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span>Giorni pagamento:</span>
                <span className="font-bold">{summary.metrics.daysToPayment.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getCategoryDisplayName = (category: string): string => {
  switch (category) {
    case 'medical_supplies': return 'Forniture Mediche';
    case 'equipment': return 'Attrezzature';
    case 'utilities': return 'Utenze';
    case 'rent': return 'Affitto';
    case 'salaries': return 'Stipendi';
    case 'insurance': return 'Assicurazioni';
    case 'maintenance': return 'Manutenzione';
    case 'other': return 'Altro';
    default: return category;
  }
};