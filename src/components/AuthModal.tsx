import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Flame, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import type { User, Zone, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: Zone[];
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  zones,
  onLoginSuccess,
  onRegisterSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  
  // Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regZone, setRegZone] = useState('Zone 1 - Kings Court');
  const [regCellName, setRegCellName] = useState('');

  // Reset State
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          zone: regZone,
          cellName: regCellName,
          proposedRole: 'cell_leader'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg(data.message);
      onRegisterSuccess(data.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset request failed');
      }

      setResetMessage(data.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error requesting password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b-2 border-amber-500 bg-slate-900 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-['Outfit']">
                Leader Portal Sign In
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                Christ Embassy Prolific Church
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center">
          <button
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            className={`py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'login' ? 'bg-white text-slate-900 border-b-2 border-amber-500 font-extrabold shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-600" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            className={`py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'register' ? 'bg-white text-slate-900 border-b-2 border-amber-500 font-extrabold shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-600" />
            <span>Register</span>
          </button>

          <button
            onClick={() => { setTab('reset'); setErrorMsg(null); }}
            className={`py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'reset' ? 'bg-white text-slate-900 border-b-2 border-amber-500 font-extrabold shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>Forgot Password</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 space-y-4 bg-slate-50 overflow-y-auto">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN TAB */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address or Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. yourname@prolificchurch.ce or +234..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border-b-2 border-amber-500 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>{isLoading ? 'Signing In...' : 'Sign In to Portal'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-[11px] text-amber-700 font-semibold hover:underline cursor-pointer"
                >
                  Need an account? Register here
                </button>
                <button
                  type="button"
                  onClick={() => setTab('reset')}
                  className="text-[11px] text-slate-500 font-medium hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {/* REGISTER TAB */}
          {tab === 'register' && (
            <div>
              {successMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Registration Submitted!</h4>
                  <p className="text-xs text-emerald-700">{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Brother / Sister Name"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-amber-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number <span className="text-amber-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Zone <span className="text-amber-600">*</span>
                      </label>
                      <select
                        value={regZone}
                        onChange={(e) => setRegZone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        {zones.map(z => (
                          <option key={z.id} value={z.name}>{z.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Cell Leader"
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-600 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cell Fellowship Name
                    </label>
                    <input
                      type="text"
                      value={regCellName}
                      onChange={(e) => setRegCellName(e.target.value)}
                      placeholder="e.g. Victorious Light Cell"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border-b-2 border-amber-500 shadow-xs cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span>{isLoading ? 'Submitting...' : 'Register for Pastoral Approval'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* RESET PASSWORD TAB */}
          {tab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <p className="text-xs text-slate-600">
                Enter your registered church email address and we will dispatch a password reset code.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="leader@prolificchurch.ce"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {resetMessage && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-700 font-medium">
                  {resetMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 border-b-2 border-amber-500 transition-colors shadow-xs cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>{isLoading ? 'Dispatching...' : 'Send Password Reset Email'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
