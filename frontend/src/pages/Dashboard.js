import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { analyticsAPI, exchangeRateAPI, cardsAPI } from '../services/api';
import { 
  CreditCardIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon, XMarkIcon
} from '@heroicons/react/24/outline';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exchangeRate, setExchangeRate] = useState(null);
  const navigate = useNavigate();
  const [loadCardId, setLoadCardId] = useState(null);
  const [loadAmount, setLoadAmount] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loadLoading, setLoadLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
    fetchExchangeRate();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await exchangeRateAPI.getLatestRate();
      console.log("Exchange rate response:", response.data);
      setExchangeRate(response.data.rate);
    } catch (error) {
      console.error('Error fetching exchange rate', error);
    }
  };

  const handleLoadBalance = async (e) => {
    e.preventDefault();
    setLoadError('');
    setLoadLoading(true);

    try {
      const response = await cardsAPI.loadBalance(loadCardId, {
        amount: parseFloat(loadAmount)
      });
      
      setLoadAmount('');
      setLoadCardId(null);
      loadDashboardData();
      
      alert(`✅ Successfully loaded $${loadAmount}!\n\n${response.data.message}`);
    } catch (err) {
      setLoadError(err.response?.data?.error || 'Failed to load balance');
    } finally {
      setLoadLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-secondary-200 border-t-primary-600 mb-4"></div>
            <p className="text-secondary-600 font-semibold">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <p className="text-danger-600 font-bold text-xl mb-4">{error}</p>
            <button onClick={loadDashboardData} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Welcome Header */}
          <div className="mb-8 animate-slide-down">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-display font-bold text-secondary-900 mb-2">
                  Financial Overview
                </h1>
                <p className="text-secondary-600 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.open('/statements', '_blank')}
                  className="px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total Balance Card */}
            <div className="metric-card group relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="icon-container icon-container-primary group-hover:scale-110 transition-transform">
                    <BanknotesIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {data?.totals?.card_count || 0} Cards
                  </span>
                </div>
                <p className="metric-title">Total Balance</p>
                <p className="text-3xl font-bold text-secondary-900 mb-1">
                  ${Number(data?.totals?.total_balance_usd)?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-secondary-500">
                  NPR {((Number(data?.totals?.total_balance_usd || 0)) * (exchangeRate || 0)).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Credit Limit Card */}
            <div className="metric-card group relative overflow-hidden animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="icon-container icon-container-secondary group-hover:scale-110 transition-transform">
                    <CreditCardIcon className="w-6 h-6" />
                  </div>
                </div>
                <p className="metric-title">Credit Limit</p>
                <p className="text-3xl font-bold text-secondary-900 mb-1">
                  ${Number(data?.totals?.total_limit_usd)?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-secondary-500">Total available</p>
              </div>
            </div>

            {/* Available Credit Card */}
            <div className="metric-card group relative overflow-hidden animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-success-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="icon-container icon-container-success group-hover:scale-110 transition-transform">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <span className="badge badge-success">Available</span>
                </div>
                <p className="metric-title">Available Credit</p>
                <p className="text-3xl font-bold text-success-600 mb-1">
                  ${Number(data?.totals?.total_available_usd)?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-secondary-500">Ready to use</p>
              </div>
            </div>

            {/* Monthly Spending Card */}
            <div className="metric-card group relative overflow-hidden animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-warning-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="icon-container icon-container-warning group-hover:scale-110 transition-transform">
                    <ArrowTrendingUpIcon className="w-6 h-6" />
                  </div>
                  <span className="badge badge-warning">This Month</span>
                </div>
                <p className="metric-title">Total Spending</p>
                <p className="text-3xl font-bold text-warning-600 mb-1">
                  ${Number(data?.spending_summary?.total_usd)?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-secondary-500">
                  NPR {(Number(data?.spending_summary?.total_usd || 0)) * (exchangeRate || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary-900">Exchange Rate</h3>
                  <p className="text-sm text-secondary-600">1 USD to NPR</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-primary-600">
                    NPR {exchangeRate !== null && exchangeRate !== undefined? exchangeRate.toFixed(2) : 'Loading...'}
                  </p>
                  
                </div>
                <p className="text-xs text-secondary-500">Updated today</p>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cards Overview - Takes 2 columns */}
            <div className="lg:col-span-2 card p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-secondary-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  Your Cards
                </h2>
                <button 
                  onClick={() => navigate('/cards')}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 hover:gap-2 duration-300"
                >
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {data?.cards?.length > 0 ? (
                <div className="space-y-4">
                  {data.cards.map((card, index) => (
                    <div 
                      key={card.id} 
                      className="group p-5 rounded-xl border-2 border-secondary-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{background: card.card_color || '#10b981'}}>
                            {card.card_type?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors text-lg">
                              {card.card_name}
                            </h3>
                            <p className="text-sm text-secondary-500">
                              {card.card_type} •••• {card.last_four_digits}
                            </p>
                          </div>
                        </div>
                        <span className={`badge ${
                          card.utilization > 80 ? 'badge-danger' :
                          card.utilization > 50 ? 'badge-warning' :
                          'badge-success'
                        }`}>
                          {Number(card.utilization)?.toFixed(0)}% Used
                        </span>
                        {/*Quick Load Button */}
                          <button
                            onClick={() => setLoadCardId(card.id)}
                            className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                            title="Load Balance"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary-600 font-medium">Balance</span>
                          <span className="font-bold text-secondary-900">${Number(card.current_balance)?.toFixed(2)}</span>
                        </div>
                        
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${
                              card.utilization > 80 ? 'bg-gradient-to-r from-danger-500 to-danger-600' :
                              card.utilization > 50 ? 'bg-gradient-to-r from-warning-500 to-warning-600' :
                              'bg-gradient-to-r from-success-500 to-success-600'
                            }`}
                            style={{ width: `${Math.min(card.utilization, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-secondary-500">
                          <span>Limit: <span className="font-semibold text-secondary-700">${Number(card.credit_limit)?.toFixed(2)}</span></span>
                          <span>Available: <span className="font-semibold text-success-600">${Number(card.available_credit)?.toFixed(2)}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCardIcon className="w-10 h-10 text-secondary-400" />
                  </div>
                  <p className="text-secondary-500 mb-4 font-medium">No cards added yet</p>
                  <button className="btn-primary">
                    <CreditCardIcon className="w-5 h-5" />
                    Add Your First Card
                  </button>
                </div>
              )}
            </div>

            {/* Recent Transactions - Takes 1 column */}
            <div className="card p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-secondary-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  Recent Activity
                </h2>
              </div>
              
              {data?.recent_transactions?.length > 0 ? (
                <div className="space-y-3">
                  {data.recent_transactions.slice(0, 6).map((transaction, index) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors cursor-pointer group"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                        <CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors truncate">
                          {transaction.merchant_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-secondary-500">
                          <ClockIcon className="w-3 h-3" />
                          {new Date(transaction.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <span className="px-2 py-0.5 bg-secondary-100 rounded-full font-medium">
                            {transaction.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-secondary-900">
                          ${Number(transaction.amount_usd)?.toFixed(2)}
                        </p>
                        <p className="text-xs text-secondary-500">
                          NPR{Number(transaction.amount_npr)?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ChartBarIcon className="w-8 h-8 text-secondary-400" />
                  </div>
                  <p className="text-secondary-500 text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Subscriptions */}
          {data?.active_subscriptions?.length > 0 && (
            <div className="card p-6 mt-8 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-secondary-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  Active Subscriptions
                </h2>
                <span className="badge badge-primary">
                  {data.active_subscriptions.length} Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.active_subscriptions.map((sub, index) => (
                  <div 
                    key={sub.id} 
                    className="group p-5 rounded-xl border-2 border-secondary-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {sub.service_name}
                      </h3>
                      <span className="badge badge-neutral text-xs">
                        {sub.category}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-1 mb-3">
                      <p className="text-2xl font-bold text-primary-600">
                        ${Number(sub.amount_usd)?.toFixed(2)}
                      </p>
                      <span className="text-sm text-secondary-500">/{sub.billing_cycle}</span>
                    </div>
                    
                    {sub.days_until_renewal !== undefined && (
                      <div className="flex items-center gap-2 text-xs text-secondary-600 bg-secondary-50 px-3 py-2 rounded-lg">
                        <CalendarIcon className="w-4 h-4" />
                        Renews in {sub.days_until_renewal} days
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Load Balance Modal */}
          {loadCardId && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-secondary-900">Load Balance</h2>
                  <button
                    onClick={() => {
                      setLoadCardId(null);
                      setLoadAmount('');
                      setLoadError('');
                    }}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-secondary-600" />
                  </button>
                </div>

                {loadError && (
                  <div className="bg-danger-50 border-2 border-danger-200 text-danger-700 px-4 py-3 rounded-xl mb-4 flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-semibold">{loadError}</p>
                  </div>
                )}

                <form onSubmit={handleLoadBalance} className="space-y-4">
                  <div className="bg-secondary-50 p-4 rounded-xl border-2 border-secondary-200">
                    <p className="text-xs text-secondary-600 mb-2 font-semibold">Selected Card</p>
                    <p className="font-bold text-secondary-900 text-lg mb-3">
                      {data?.cards?.find(c => c.id === loadCardId)?.card_name}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Current Balance:</span>
                        <span className="font-semibold text-secondary-900">
                          ${Number(data?.cards?.find(c => c.id === loadCardId)?.current_balance)?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Yearly Limit:</span>
                        <span className="font-semibold text-secondary-900">
                          ${Number(data?.cards?.find(c => c.id === loadCardId)?.credit_limit)?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-secondary-300">
                        <span className="text-secondary-600 font-semibold">Available to Load:</span>
                        <span className="font-bold text-primary-600">
                          ${Number(data?.cards?.find(c => c.id === loadCardId)?.available_credit)?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Amount to Load (USD) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-secondary-500 font-semibold">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={loadAmount}
                        onChange={(e) => setLoadAmount(e.target.value)}
                        className="input pl-10"
                        placeholder="100.00"
                        autoFocus
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLoadAmount('50')}
                        className="flex-1 py-2 text-xs font-semibold bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                      >
                        $50
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoadAmount('100')}
                        className="flex-1 py-2 text-xs font-semibold bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                      >
                        $100
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoadAmount('200')}
                        className="flex-1 py-2 text-xs font-semibold bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                      >
                        $200
                      </button>
                    </div>
                  </div>

                  <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-3">
                    <div className="flex gap-2">
                      <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-primary-900 leading-relaxed">
                        💡 You can load up to your yearly limit. This balance can be spent across all your transactions and subscriptions.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoadCardId(null);
                        setLoadAmount('');
                        setLoadError('');
                      }}
                      className="flex-1 btn-secondary py-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadLoading || !loadAmount}
                      className="flex-1 btn-primary py-3 disabled:opacity-50"
                    >
                      {loadLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </span>
                      ) : (
                        'Load Balance'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;