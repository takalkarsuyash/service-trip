import React from 'react';
import { User, Briefcase, ChevronRight, ShieldCheck, X } from 'lucide-react';

export const AuthModal = ({
  isAuthModalOpen,
  setIsAuthModalOpen,
  authMode,
  setAuthMode,
  authStep,
  setAuthStep,
  authRole,
  setAuthRole,
  email,
  setEmail,
  password,
  setPassword,
  otpCode,
  setOtpCode,
  handleSignUp,
  handleVerifyOTP,
  handleLogin
}) => {
  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-gray-100 rounded-full p-1 z-10"
        >
          <X size={20} />
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white text-center">
          <div className="flex justify-center gap-4 border-b border-blue-500/50 pb-4 mb-4">
            <button 
              className={`text-lg font-bold pb-2 border-b-2 transition-all ${authMode === 'login' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}`}
              onClick={() => { setAuthMode('login'); setAuthStep('email'); }}
            >
              Log In
            </button>
            <button 
              className={`text-lg font-bold pb-2 border-b-2 transition-all ${authMode === 'signup' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}`}
              onClick={() => { setAuthMode('signup'); setAuthStep('email'); }}
            >
              Sign Up
            </button>
          </div>
          <p className="text-blue-100 text-sm">
            {authMode === 'login' ? 'Welcome back! Please log in.' : 'Create a new account to get started.'}
          </p>
        </div>

        <div className="p-6">
          {authStep === 'email' ? (
            <div className="space-y-6">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${authRole === 'customer' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}>
                      <User className="mb-2" size={24} />
                      <input type="radio" name="role" value="customer" checked={authRole === 'customer'} onChange={() => setAuthRole('customer')} className="hidden" />
                      <span className="font-semibold text-sm">Customer</span>
                    </label>
                    <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${authRole === 'vendor' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}>
                      <Briefcase className="mb-2" size={24} />
                      <input type="radio" name="role" value="vendor" checked={authRole === 'vendor'} onChange={() => setAuthRole('vendor')} className="hidden" />
                      <span className="font-semibold text-sm">Vendor</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-medium"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-medium"
                  placeholder="••••••••"
                />
              </div>

              {authMode === 'signup' ? (
                <button 
                  onClick={handleSignUp}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Sign Up <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Log In <ChevronRight size={18} />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <ShieldCheck className="mx-auto text-blue-600 mb-2" size={40} />
                <h3 className="text-lg font-bold text-gray-900">Verify Email</h3>
                <p className="text-sm text-gray-500 mt-1">6-digit code sent to {email}</p>
              </div>

              <div>
                <input 
                  type="text" 
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-bold text-xl"
                  placeholder="••••••"
                />
              </div>

              <button 
                onClick={handleVerifyOTP}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Verify & Create Account
              </button>
              <button 
                onClick={() => { setAuthStep('email'); setPassword(''); setOtpCode(''); }}
                className="w-full text-blue-600 font-medium text-sm hover:underline"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
