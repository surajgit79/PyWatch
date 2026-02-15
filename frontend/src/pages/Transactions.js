import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { transactionsAPI, cardsAPI } from '../services/api';
import { BanknotesIcon, PlusIcon, TrashIcon, XMarkIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    card_id: '',
    category: '',
    start_date: '',
    end_date: ''
  });
  const [formData, setFormData] = useState({
    card_id: '',
    transaction_type: 'purchase',
    merchant_name: '',
    amount_usd: '',
    category: 'Shopping',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    is_recurring: false
  });
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const categories = [
    'Shopping', 'Food & Dining', 'Transportation', 'Entertainment',
    'Subscriptions', 'Travel', 'Health', 'Education', 'Bills', 'Other'
  ];

  const categoryIcons = {
    'Shopping': '🛍️',
    'Food & Dining': '🍔',
    'Transportation': '🚗',
    'Entertainment': '🎬',
    'Subscriptions': '📱',
    'Travel': '✈️',
    'Health': '💊',
    'Education': '📚',
    'Bills': '📄',
    'Other': '💰'
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      const [transResponse, cardsResponse] = await Promise.all([
        transactionsAPI.getAll(filters),
        cardsAPI.getAll()
      ]);
      
      setTransactions(transResponse.data.transactions);
      setCards(cardsResponse.data.cards);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      card_id: '',
      category: '',
      start_date: '',
      end_date: ''
    });
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      await transactionsAPI.create({
        ...formData,
        card_id: parseInt(formData.card_id),
        amount_usd: parseFloat(formData.amount_usd)
      });
      
      setFormData({
        card_id: '',
        transaction_type: 'purchase',
        merchant_name: '',
        amount_usd: '',
        category: 'Shopping',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        is_recurring: false
      });
      setShowAddModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (transactionId) => {
    setDeleteTransactionId(transactionId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await transactionsAPI.delete(deleteTransactionId); 
      loadData(); 
      setShowDeleteModal(false);
    } catch (err) {
      alert('Failed to delete transaction');
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false); 
    setDeleteTransactionId(null);
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

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-down">
            <div>
              <h1 className="text-4xl font-display font-bold text-secondary-900 mb-2">Transactions</h1>
              <p className="text-secondary-600">Track and manage all your spending</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary relative"
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-5 h-5" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="card p-6 mb-6 animate-slide-down">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-secondary-900 flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-primary-600" />
                  Filter Transactions
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-danger-600 hover:text-danger-700"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Card</label>
                  <select
                    name="card_id"
                    value={filters.card_id}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">All Cards</option>
                    {cards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.card_name} (••{card.last_four_digits})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          {transactions.length > 0 ? (
            <div className="table-container animate-fade-in">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Merchant</th>
                      <th>Card</th>
                      <th>Category</th>
                      <th className="text-right">Amount (USD)</th>
                      <th className="text-right">Amount (NPR)</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={transaction.id} className="animate-fade-in" style={{animationDelay: `${index * 0.03}s`}}>
                        <td>
                          <div className="font-medium text-secondary-900">
                            {new Date(transaction.transaction_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-xl">
                              {categoryIcons[transaction.category] || '💰'}
                            </div>
                            <div>
                              <div className="font-semibold text-secondary-900">{transaction.merchant_name}</div>
                              {transaction.description && (
                                <div className="text-xs text-secondary-500">{transaction.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div className="font-medium text-secondary-900">{transaction.card_name}</div>
                            <div className="text-secondary-500">••{transaction.last_four_digits}</div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-neutral">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="font-bold text-secondary-900 text-lg">
                            ${Number(transaction.amount_usd)?.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="text-secondary-600">
                            NPR{Number(transaction.amount_npr)?.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-right">
                          <td className="text-right">
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                              title="Delete transaction"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </td>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-16 text-center animate-fade-in">
              <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BanknotesIcon className="w-12 h-12 text-secondary-400" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">No transactions found</h3>
              <p className="text-secondary-600 mb-6">
                {activeFiltersCount > 0 ? 'Try adjusting your filters' : 'Add your first transaction to start tracking'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-5 h-5" />
                Add Your First Transaction
              </button>
            </div>
          )}

          {/* Add Transaction Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-secondary-900">Add Transaction</h2>
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
                      Card *
                    </label>
                    <select
                      name="card_id"
                      required
                      value={formData.card_id}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Select a card</option>
                      {cards.map(card => (
                        <option key={card.id} value={card.id}>
                          {card.card_name} (••{card.last_four_digits})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Transaction Type
                    </label>
                    <select
                      name="transaction_type"
                      value={formData.transaction_type}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="purchase">Purchase</option>
                      <option value="subscription">Subscription</option>
                      <option value="refund">Refund</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Merchant Name *
                    </label>
                    <input
                      type="text"
                      name="merchant_name"
                      required
                      value={formData.merchant_name}
                      onChange={handleChange}
                      className="input"
                      placeholder="Amazon"
                    />
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
                        placeholder="50.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-secondary-700 mb-2">
                        Category *
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
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="transaction_date"
                      required
                      value={formData.transaction_date}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="2"
                      className="input"
                      placeholder="Optional notes about this transaction"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                    <input
                      type="checkbox"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <label className="text-sm font-medium text-secondary-700">
                      This is a recurring transaction
                    </label>
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
                      {submitLoading ? 'Adding...' : 'Add Transaction'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-secondary-900 mb-4">Confirm Deletion</h2>
                  <p className="text-secondary-600 mb-6">Are you sure you want to delete this transaction?</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={cancelDelete}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Transactions;