import React, { useState } from 'react';
import { 
  Mail, 
  ArrowLeft, 
  AlertCircle, 
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown
} from 'lucide-react';
import { loginStaff } from '../services/api';

export default function LoginPage({ onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await loginStaff(email.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Incorrect email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] w-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center py-10 px-4 bg-[#FAFAFC]">
      
      {/* Aesthetic Ambient Background Glows (contained to prevent any horizontal scroll) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-200/25 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-emerald-100/20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-[440px] w-full my-auto space-y-3.5">
        
        {/* Top Header with Back to Home */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </button>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Authority Portal</span>
        </div>

        {/* Clean Glassmorphic Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl p-7 sm:p-9">
          
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            
            {/* Raw Logo Icon (No Square Background Box) */}
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/logo-icon.png" 
                alt="FixMyArea" 
                className="h-12 w-auto object-contain drop-shadow-2xs" 
              />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Authority Portal
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Welcome back. Sign in to review and manage civic issues in your area.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2 mb-4">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fixmyarea.gov"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition active:scale-98 shadow-sm flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>

          </form>

          {/* Quick Demo Helper (Collapsible) */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <span>Demo accounts by Municipality</span>
              <ChevronDown className={`w-3.5 h-3.5 transform transition ${showDemoCredentials ? 'rotate-180' : ''}`} />
            </button>

            {showDemoCredentials && (
              <div className="mt-2.5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3 text-[11px]">
                
                {/* 1. Alandi Municipal Council (Pune) */}
                <div>
                  <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Alandi Municipal Council (Pune)</span>
                  </div>
                  <div className="space-y-1 pl-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Shri Vikram Shinde (Admin):</span>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('admin@fixmyarea.gov', 'admin123')}
                        className="font-mono text-emerald-700 font-semibold hover:underline"
                      >
                        admin@fixmyarea.gov
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Dr. Sunita Deshmukh (Sanitation):</span>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('waste@fixmyarea.gov', 'officer123')}
                        className="font-mono text-emerald-700 font-semibold hover:underline"
                      >
                        waste@fixmyarea.gov
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Er. Rajesh Kulkarni (Roads):</span>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('roads@fixmyarea.gov', 'officer123')}
                        className="font-mono text-emerald-700 font-semibold hover:underline"
                      >
                        roads@fixmyarea.gov
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Wardha Municipal Council (Vidarbha) */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    <span>Wardha Municipal Council (Vidarbha)</span>
                  </div>
                  <div className="space-y-1 pl-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Shri Rameshwar Thakre (CMO Admin):</span>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('wardha.admin@fixmyarea.gov', 'admin123')}
                        className="font-mono text-sky-700 font-semibold hover:underline"
                      >
                        wardha.admin@fixmyarea.gov
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Dr. Pradeep Wankhede (Sanitation):</span>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('wardha.waste@fixmyarea.gov', 'officer123')}
                        className="font-mono text-sky-700 font-semibold hover:underline"
                      >
                        wardha.waste@fixmyarea.gov
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Er. Nitin Deshpande (Roads):</span>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('wardha.roads@fixmyarea.gov', 'officer123')}
                        className="font-mono text-sky-700 font-semibold hover:underline"
                      >
                        wardha.roads@fixmyarea.gov
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Pan-India Directorate */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>Apex Directorate (Pan-India)</span>
                  </div>
                  <div className="space-y-1 pl-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Director General (All India):</span>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('director@fixmyarea.gov', 'admin123')}
                        className="font-mono text-indigo-700 font-semibold hover:underline"
                      >
                        director@fixmyarea.gov
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
