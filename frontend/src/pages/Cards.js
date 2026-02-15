import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { cardsAPI } from '../services/api';
import { CreditCardIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  // const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadCardId, setLoadCardId] = useState(null);
  const [loadAmount, setLoadAmount] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loadLoading, setLoadLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_name: '',
    card_type: 'Visa',
    last_four_digits: '',
    credit_limit: '',
    current_balance: '0',
    expiry_date: '',
    issuing_bank: '',
    card_color: '#10b981'
  });
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await cardsAPI.getAll();
      setCards(response.data.cards);
    } catch (err) {
      console.error('Failed to load cards:', err);
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
      await cardsAPI.create({
        ...formData,
        credit_limit: parseFloat(formData.credit_limit),
        current_balance: parseFloat(formData.current_balance)
      });
      
      setFormData({
        card_name: '',
        card_type: 'Visa',
        last_four_digits: '',
        credit_limit: '',
        current_balance: '0',
        expiry_date: '',
        issuing_bank: '',
        card_color: '#10b981'
      });
      setShowAddModal(false);
      loadCards();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add card');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      await cardsAPI.delete(cardId);
      loadCards();
    } catch (err) {
      alert('Failed to delete card');
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
      loadCards();
      alert(response.data.message);
    } catch (err) {
      setLoadError(err.response?.data?.error || 'Failed to load balance');
    } finally {
      setLoadLoading(false);
    }
  };

  const cardColors = [
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Slate', value: '#64748b' },
  ];

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-down">
            <div>
              <h1 className="text-4xl font-display font-bold text-secondary-900 mb-2">My Cards</h1>
              <p className="text-secondary-600">Manage your dollar cards and track spending</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Card
            </button>
          </div>

          {/* Cards Grid */}
          {cards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <div 
                  key={card.id} 
                  className="card overflow-hidden hover-lift animate-fade-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {/* Card Visual */}
                  <div 
                    className="relative p-6 text-white h-48 flex flex-col justify-between"
                    style={{ 
                      background: `linear-gradient(135deg, ${card.card_color} 0%, ${card.card_color}dd 100%)`
                    }}
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                          {card.card_type}
                        </span>
                        <CreditCardIcon className="w-8 h-8 opacity-80" />
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-xs opacity-75 mb-1">{card.issuing_bank}</p>
                      <p className="text-xl font-bold mb-3">{card.card_name}</p>
                      <p className="text-lg tracking-widest font-mono">•••• •••• •••• {card.last_four_digits}</p>
                      <div className="flex justify-between mt-3 text-xs opacity-90">
                        <span>Exp: {new Date(card.expiry_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-5 bg-secondary-50/50">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-secondary-600 font-medium">Current Balance</span>
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
                      <div className="flex justify-between text-xs text-secondary-500 mt-2">
                        <span>Limit: ${Number(card.credit_limit)?.toFixed(2)}</span>
                        <span className={`font-semibold ${
                          card.utilization > 80 ? 'text-danger-600' :
                          card.utilization > 50 ? 'text-warning-600' :
                          'text-success-600'
                        }`}>
                          {Number(card.utilization)?.toFixed(1)}% Used
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4 p-3 bg-success-50 rounded-lg border border-success-200">
                      <span className="text-secondary-700 font-medium">Available Credit</span>
                      <span className="font-bold text-success-600">${Number(card.available_credit)?.toFixed(2)}</span>
                    </div>
                    {/*Load Balance Button */}
                    <button
                      onClick={() => {
                        setLoadCardId(card.id); 
                        // setShowLoadModal(true);
                      }}
                      className="w-full py-3 mb-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Load Balance
                    </button>

                    <button
                      onClick={() => handleDelete(card.id)}
                      className="w-full py-3 bg-danger-50 text-danger-600 rounded-xl hover:bg-danger-100 transition-all font-semibold border-2 border-danger-100 hover:border-danger-200 flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Delete Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center animate-fade-in">
              <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCardIcon className="w-12 h-12 text-secondary-400" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">No cards added yet</h3>
              <p className="text-secondary-600 mb-6">Add your first card to start tracking your spending</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-5 h-5" />
                Add Your First Card
              </button>
            </div>
          )}

          {/* Add Card Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-secondary-900">Add New Card</h2>
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
                      Card Name *
                    </label>
                    <input
                      type="text"
                      name="card_name"
                      required
                      value={formData.card_name}
                      onChange={handleChange}
                      className="input"
                      placeholder="My Travel Card"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-secondary-700 mb-2">
                        Card Type *
                      </label>
                      <select
                        name="card_type"
                        value={formData.card_type}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="American Express">American Express</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-secondary-700 mb-2">
                        Last 4 Digits *
                      </label>
                      <input
                        type="text"
                        name="last_four_digits"
                        required
                        maxLength="4"
                        pattern="[0-9]{4}"
                        value={formData.last_four_digits}
                        onChange={handleChange}
                        className="input"
                        placeholder="1234"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-secondary-700 mb-2">
                        Credit Limit (USD) *
                      </label>
                      <input
                        type="number"
                        name="credit_limit"
                        required
                        step="0.01"
                        min="0"
                        value={formData.credit_limit}
                        onChange={handleChange}
                        className="input"
                        placeholder="1000.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-secondary-700 mb-2">
                        Current Balance (USD) *
                      </label>
                      <input
                        type="number"
                        name="current_balance"
                        step="0.01"
                        min="0"
                        value={formData.current_balance}
                        onChange={handleChange}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      name="expiry_date"
                      required
                      value={formData.expiry_date}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Issuing Bank
                    </label>
                    <input
                      type="text"
                      name="issuing_bank"
                      value={formData.issuing_bank}
                      onChange={handleChange}
                      className="input"
                      placeholder="Your Bank Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">
                      Card Color
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {cardColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({...formData, card_color: color.value})}
                          className={`w-full h-12 rounded-lg transition-all ${
                            formData.card_color === color.value 
                              ? 'ring-4 ring-primary-500 ring-offset-2 scale-110' 
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
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
                      {submitLoading ? 'Adding...' : 'Add Card'}
                    </button>
                  </div>
                </form>
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
                      {cards?.find(c => c.id === loadCardId)?.card_name}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Current Balance:</span>
                        <span className="font-semibold text-secondary-900">
                          ${Number(cards?.find(c => c.id === loadCardId)?.current_balance)?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Yearly Limit:</span>
                        <span className="font-semibold text-secondary-900">
                          ${Number(cards?.find(c => c.id === loadCardId)?.credit_limit)?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-secondary-300">
                        <span className="text-secondary-600 font-semibold">Available to Load:</span>
                        <span className="font-bold text-primary-600">
                          ${Number(cards?.find(c => c.id === loadCardId)?.available_credit)?.toFixed(2)}
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

export default Cards;