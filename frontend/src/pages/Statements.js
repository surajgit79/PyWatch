import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { cardsAPI } from '../services/api';
import { DocumentTextIcon, CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline';

function Statements() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await cardsAPI.getAll();
      setCards(response.data.cards);
    } catch (err) {
      console.error('Failed to load cards:', err);
    }
  };

  const handleGenerateStatement = async () => {
    if (!selectedCard) {
      setError('Please select a card');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const monthOnly = parseInt(month.slice(5));
      const response = await fetch(`http://localhost:5000/api/statements/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          card_id: selectedCard,
          month: monthOnly,
          year: year
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement-${month}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        setError('Failed to generate statement');
      }
    } catch (err) {
      setError('Failed to generate statement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 animate-slide-down">
            <h1 className="text-4xl font-display font-bold text-secondary-900 mb-2">Generate Statement</h1>
            <p className="text-secondary-600">Download monthly transaction statements in PDF format</p>
          </div>

          {/* Statement Generator Card */}
          <div className="card p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-7 h-7 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900">Monthly Statement</h2>
            </div>

            {error && (
              <div className="bg-danger-50 border-2 border-danger-200 text-danger-700 px-4 py-3 rounded-xl mb-6">
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Card Selection */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 mb-2">
                  Select Card *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCardIcon className="h-5 w-5 text-secondary-400" />
                  </div>
                  <select
                    value={selectedCard}
                    onChange={(e) => setSelectedCard(e.target.value)}
                    className="input pl-11"
                    required
                  >
                    <option value="">Choose a card</option>
                    {cards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.card_name} - {card.card_type} ••••{card.last_four_digits}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Month Selection */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 mb-2">
                  Select Month *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => 
                        {setMonth(e.target.value);
                        setYear(e.target.value.slice(0,4));
                    }}
                    max={new Date().toISOString().slice(0, 7)}
                    className="input pl-11"
                    required
                  />
                </div>
              </div>

              {/* Preview Info */}
              <div className="bg-secondary-50 p-4 rounded-xl border-2 border-secondary-200">
                <p className="text-sm text-secondary-700 mb-2 font-semibold">Statement Preview:</p>
                <div className="space-y-1 text-sm text-secondary-600">
                  <p>📅 Period: {month ? new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not selected'}</p>
                  <p>💳 Card: {selectedCard ? cards.find(c => c.id === parseInt(selectedCard))?.card_name : 'Not selected'}</p>
                  <p>📄 Format: PDF Document</p>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateStatement}
                disabled={loading || !selectedCard}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Statement...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <DocumentTextIcon className="w-6 h-6" />
                    Generate & Download Statement
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-primary-50 border-2 border-primary-200 rounded-xl p-4 animate-fade-in">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-primary-900">
                <p className="font-semibold mb-1">📊 Statement Details</p>
                <ul className="space-y-1 text-primary-800">
                  <li>• Includes all transactions for the selected month</li>
                  <li>• Shows amounts in both USD and NPR with exchange rates</li>
                  <li>• Displays opening and closing balances</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Statements;