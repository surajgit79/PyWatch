import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { subscriptionsAPI, cardsAPI } from '../services/api';
import { RectangleStackIcon, PlusIcon, XMarkIcon, CalendarIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [cards, setCards] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    card_id: '',
    service_name: '',
    category: 'Entertainment',
    amount_usd: '',
    billing_cycle: 'monthly',
    next_billing_date: '',
    trial_end_date: ''
  });
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const categories = [
    'Entertainment', 'Productivity', 'Cloud Storage', 'Music',
    'Video Streaming', 'Software', 'Gaming', 'News', 'Fitness', 'Other'
  ];

  const categoryIcons = {
    'Entertainment': '🎬',
    'Productivity': '⚡',
    'Cloud Storage': '☁️',
    'Music': '🎵',
    'Video Streaming': '📺',
    'Software': '💻',
    'Gaming': '🎮',
    'News': '📰',
    'Fitness': '💪',
    'Other': '📱'
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [subsResponse, cardsResponse, summaryResponse] = await Promise.all([
        subscriptionsAPI.getAll(activeTab),
        cardsAPI.getAll(),
        subscriptionsAPI.getSummary()
      ]);
      
      setSubscriptions(subsResponse.data.subscriptions);
      setCards(cardsResponse.data.cards);
      setSummary(summaryResponse.data.summary);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      const submitData = {
        ...formData,
        card_id: parseInt(formData.card_id),
        amount_usd: parseFloat(formData.amount_usd),
        trial_end_date: formData.trial_end_date || undefined
      };

      await subscriptionsAPI.create(submitData);
      
      setFormData({
        card_id: '',
        service_name: '',
        category: 'Entertainment',
        amount_usd: '',
        billing_cycle: 'monthly',
        next_billing_date: '',
        trial_end_date: ''
      });
      setShowAddModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add subscription');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      await subscriptionsAPI.cancel(subscriptionId);
      loadData();
    } catch (err) {
      alert('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-secondary-200 border-t-primary-600"></div>
        </div>
      </>
    );
  }

  const tabs = [
    { id: 'active', label: 'Active', color: 'primary' },
    { id: 'trial', label: 'Trial', color: 'warning' },
    { id: 'cancelled', label: 'Cancelled', color: 'secondary' }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-down">
            <div>
              <h1 className="text-4xl font-display font-bold text-secondary-900 mb-2">Subscriptions</h1>
              <p className="text-secondary-600">Manage all your recurring services</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Subscription
            </button>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card p-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container icon-container-primary">
                    <RectangleStackIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wide">Total Subscriptions</h3>
                </div>
                <p className="text-4xl font-bold text-secondary-900">{summary.total_subscriptions || 0}</p>
                <p className="text-sm text-secondary-500 mt-2">Active services</p>
              </div>

              <div className="card p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container icon-container-success">
                    <BanknotesIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wide">Monthly Cost</h3>
                </div>
                <p className="text-4xl font-bold text-primary-600">
                  ${Number(summary.monthly_cost_usd)?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-secondary-500 mt-2">Per month</p>
              </div>

              <div className="card p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container icon-container-warning">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wide">Yearly Cost</h3>
                </div>
                <p className="text-4xl font-bold text-secondary-900">
                  ${Number(summary.yearly_cost_usd)?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-secondary-500 mt-2">Total per year</p>
              </div>
            </div>
          )}

          {/* Trials Ending Soon Alert */}
          {summary?.trials_ending_soon > 0 && (
            <div className="bg-warning-50 border-2 border-warning-300 rounded-xl p-4 mb-6 animate-slide-down">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-warning-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-warning-900 mb-1">Trial Ending Soon!</p>
                  <p className="text-sm text-warning-700">
                    You have {summary.trials_ending_soon} trial{summary.trials_ending_soon > 1 ? 's' : ''} ending within 7 days. Don't forget to cancel if you don't want to be charged!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b-2 border-secondary-200">
              <nav className="-mb-0.5 flex space-x-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-bold text-sm transition-all ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Subscriptions Grid */}
          {subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((sub, index) => (
                <div 
                  key={sub.id} 
                  className="card overflow-hidden hover-lift animate-fade-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className={`p-6 ${
                    sub.status === 'trial' ? 'bg-gradient-to-br from-warning-50 to-warning-100' :
                    sub.status === 'cancelled' ? 'bg-secondary-50' :
                    'bg-gradient-to-br from-primary-50 to-primary-100'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">
                          {categoryIcons[sub.category] || '📱'}
                        </div>
                        <div>
                          <h3 className="font-bold text-secondary-900 text-lg">{sub.service_name}</h3>
                          <p className="text-sm text-secondary-600">{sub.category}</p>
                        </div>
                      </div>
                      <span className={`badge ${
                        sub.status === 'active' ? 'badge-success' :
                        sub.status === 'trial' ? 'badge-warning' :
                        'badge-neutral'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-1 mb-4">
                      <p className="text-3xl font-bold text-secondary-900">
                        ${Number(sub.amount_usd)?.toFixed(2)}
                      </p>
                      <span className="text-sm text-secondary-600 font-medium">
                        /{sub.billing_cycle}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <span className="text-secondary-600 font-medium">Card</span>
                        <span className="font-semibold text-secondary-900">
                          {sub.card_name} ••{sub.last_four_digits}
                        </span>
                      </div>

                      {sub.trial_end_date && sub.status === 'trial' && (
                        <div className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${
                          sub.days_until_trial_end <= 3 
                            ? 'bg-danger-100 border border-danger-300' 
                            : 'bg-warning-100 border border-warning-300'
                        }`}>
                          <span className={`font-medium ${
                            sub.days_until_trial_end <= 3 ? 'text-danger-700' : 'text-warning-700'
                          }`}>
                            Trial ends in
                          </span>
                          <span className={`font-bold ${
                            sub.days_until_trial_end <= 3 ? 'text-danger-900' : 'text-warning-900'
                          }`}>
                            {sub.days_until_trial_end} days
                          </span>
                        </div>
                      )}

                      {sub.status !== 'cancelled' && (
                        <div className="flex items-center justify-between text-sm bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                          <span className="text-secondary-600 font-medium">Next billing</span>
                          <span className="font-semibold text-secondary-900">
                            {new Date(sub.next_billing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {sub.status !== 'cancelled' && (
                    <div className="p-4 bg-white border-t border-secondary-100">
                      <button
                        onClick={() => handleCancel(sub.id)}
                        className="w-full py-2.5 text-sm font-bold text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        Cancel Subscription
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center animate-fade-in">
              <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <RectangleStackIcon className="w-12 h-12 text-secondary-400" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                No {activeTab} subscriptions
              </h3>
              <p className="text-secondary-600 mb-6">
                {activeTab === 'active' 
                  ? 'Add your first subscription to start tracking' 
                  : `No ${activeTab} subscriptions to display`
                }
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Your First Subscription
                </button>
              )}
            </div>
          )}

          {/* Add Subscription Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-secondary-900">Add Subscription</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-secondary-600" />
                  </button>
                </div>

                {error && (
                  <div className="bg-danger-50 border-2 border-danger-200 text-danger-700 px-4 py-3 rounded-xl mb-4">
                    <p className="text-sm font-semibold">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      name="service_name"
                      required
                      value={formData.service_name}
                      onChange={handleChange}
                      className="input"
                      placeholder="Netflix"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-secondary-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="input"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-secondary-700 mb-2">
                        Card *
                      </label>
                      <select
                        name="card_id"
                        required
                        value={formData.card_id}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="">Select</option>
                        {cards.map(card => (
                          <option key={card.id} value={card.id}>
                            {card.card_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-secondary-700 mb-2">
                        Amount (USD) *
                      </label>
                      <input
                        type="number"
                        name="amount_usd"
                        required
                        step="0.01"
                        min="0"
                        value={formData.amount_usd}
                        onChange={handleChange}
                        className="input"
                        placeholder="15.99"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-secondary-700 mb-2">
                        Billing Cycle *
                      </label>
                      <select
                        name="billing_cycle"
                        value={formData.billing_cycle}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Next Billing Date *
                    </label>
                    <input
                      type="date"
                      name="next_billing_date"
                      required
                      value={formData.next_billing_date}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Trial End Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="trial_end_date"
                      value={formData.trial_end_date}
                      onChange={handleChange}
                      className="input"
                    />
                    <p className="mt-2 text-xs text-secondary-500 bg-secondary-50 px-3 py-2 rounded-lg">
                      💡 Leave blank if not on trial. We'll remind you before trial ends!
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {submitLoading ? 'Adding...' : 'Add Subscription'}
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

export default Subscriptions;