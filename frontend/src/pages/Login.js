import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { EnvelopeIcon, LockClosedIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Track dollar cards & subscriptions',
    'Real-time USD to NPR conversion',
    'Smart alerts & reminders',
    'Beautiful analytics & reports'
  ];

  return (
    <div className="min-h-screen flex">
      
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 text-white relative overflow-hidden">
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between w-full">
          
          {/* Logo and Title */}
          <div>
            <div className="flex items-center gap-4 mb-8 animate-slide-down">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
                <ChartBarIcon className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold">PayWatch</h1>
                <p className="text-primary-100">Your Financial Companion</p>
              </div>
            </div>

            <div className="space-y-6 mt-16 animate-fade-in">
              <h2 className="text-5xl font-display font-bold leading-tight">
                Manage Your<br />
                Finances<br />
                Effortlessly
              </h2>
              <p className="text-xl text-primary-100 max-w-md">
                Take control of your dollar cards and subscriptions with intelligent tracking and insights.
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 animate-slide-up">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 text-primary-50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircleIcon className="w-6 h-6 text-primary-300 flex-shrink-0" />
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-secondary-50">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-slide-down">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl mb-4">
              <ChartBarIcon className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold gradient-text">PayWatch</h1>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left animate-slide-up">
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Welcome Back! 👋
            </h2>
            <p className="text-secondary-600">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className="card p-8 animate-scale-in">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {error && (
                <div className="bg-danger-50 border-2 border-danger-200 text-danger-700 px-4 py-3 rounded-xl animate-fade-in flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-secondary-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-11"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-secondary-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-11"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-secondary-500">New to PayWatch?</span>
                </div>
              </div>

              <Link 
                to="/register" 
                className="block w-full text-center px-6 py-3 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 transition-all duration-300 font-bold border-2 border-secondary-200 hover:border-secondary-300"
              >
                Create an Account
              </Link>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-secondary-500 animate-fade-in">
            © 2026 PayWatch. Secure & reliable financial management.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;