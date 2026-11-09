import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  KeyRound, 
  Loader2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { loginStaff } from '../services/api';

const QUICK_ACCOUNTS = [
  {
    role: 'Admin',
    label: 'Shri Vikram Shinde (Alandi Chief Commissioner)',
    email: 'admin@fixmyarea.gov',
    dept: 'Alandi Municipal Council · All Divisions',
    color: 'border-slate-300 hover:bg-slate-100 text-slate-900'
  },
  {
    role: 'Officer',
    label: 'Dr. Sunita Deshmukh (Alandi Sanitation)',
    email: 'waste@fixmyarea.gov',
    dept: 'Alandi Municipal Council · Solid Waste Management',
    color: 'border-emerald-300 hover:bg-emerald-50/60 text-emerald-900'
  },
  {
    role: 'Officer',
    label: 'Er. Rajesh Kulkarni (Alandi Roads)',
    email: 'roads@fixmyarea.gov',
    dept: 'Alandi Municipal Council · Roads & Infrastructure',
    color: 'border-amber-300 hover:bg-amber-50/60 text-amber-900'
  },
  {
    role: 'Admin',
    label: 'Shri Rameshwar Thakre (Wardha CMO Admin)',
    email: 'wardha.admin@fixmyarea.gov',
    dept: 'Wardha Municipal Council · All Divisions',
    color: 'border-sky-300 hover:bg-sky-50/60 text-sky-900'
  },
  {
    role: 'Officer',
    label: 'Dr. Pradeep Wankhede (Wardha Sanitation)',
    email: 'wardha.waste@fixmyarea.gov',
    dept: 'Wardha Municipal Council · Solid Waste Management',
    color: 'border-teal-300 hover:bg-teal-50/60 text-teal-900'
  },
  {
    role: 'Officer',
    label: 'Er. Nitin Deshpande (Wardha Roads)',
    email: 'wardha.roads@fixmyarea.gov',
    dept: 'Wardha Municipal Council · Roads & Infrastructure',
    color: 'border-blue-300 hover:bg-blue-50/60 text-blue-900'
  }
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('officer123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your official municipal email');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await loginStaff(email, password);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (acc) => {
    setEmail(acc.email);
    setPassword(acc.role === 'Admin' ? 'admin123' : 'officer123');
    loginDirect(acc.email, acc.role === 'Admin' ? 'admin123' : 'officer123');
  };

  const loginDirect = async (userEmail, userPass) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await loginStaff(userEmail, userPass);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20">
              <img src="/logo-icon.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base">Department & Admin Terminal</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-400 text-slate-950 rounded uppercase">Official</span>
              </div>
              <p className="text-xs text-slate-300">FixMyArea Municipal Staff Authentication</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Department Role Login */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Official Department Profile:
            </label>
            <div className="space-y-1.5">
              {QUICK_ACCOUNTS.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition text-xs font-medium ${acc.color}`}
                >
                  <div>
                    <span className="font-bold block text-slate-900">{acc.label}</span>
                    <span className="text-[11px] text-slate-500">{acc.email} · {acc.dept}</span>
                  </div>
                  <span className="px-2 py-1 bg-white rounded-md text-[10px] font-bold shadow-xs border border-slate-200">
                    Sign in
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or Manual Sign In
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Manual Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@fixmyarea.gov"
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/25 flex items-center justify-center space-x-1.5 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Officer...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-sky-200" />
                  <span>Access Department Terminal</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

