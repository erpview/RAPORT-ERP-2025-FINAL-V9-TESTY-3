import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the redirect path from location state
  const from = location.state?.from || '/admin/systemy';

  useEffect(() => {
    window.scrollTo(0, 0);
    // Redirect if already logged in
    if (user) {
      navigate(from);
    }
  }, [user, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signIn(email, password);
      navigate(from);
    } catch (err) {
      setError('Nieprawidłowy email lub hasło');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
      </Helmet>
      
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <form onSubmit={handleSubmit} className="sf-card p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#FF3B30]/10 text-[#FF3B30]">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-[15px]">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[15px] font-medium text-[#1d1d1f] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="sf-input pl-10 w-full"
                  placeholder="Wprowadź adres email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[15px] font-medium text-[#1d1d1f] mb-2">
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sf-input pl-10 w-full"
                  placeholder="Wprowadź hasło"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sf-button-primary w-full justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Logowanie...
                </>
              ) : (
                'Logowanie'
              )}
            </button>
          </form>

          {/* Registration Card */}
          <div className="sf-card p-6 space-y-4">
            <p className="text-[15px] text-[#424245] text-center">
              Jeśli nie posiadasz konta zarejestruj się
            </p>
            <Link
              to="/admin/register"
              className="sf-button-secondary w-full justify-center inline-flex"
            >
              Rejestracja
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};