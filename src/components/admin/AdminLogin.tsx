import React, { useState } from 'react';
import { Lock, Mail, Key, ShieldCheck, ArrowRight, AlertCircle, Loader2, Info, ExternalLink, CheckCircle2 } from 'lucide-react';
import { signInAdmin } from '../../lib/adminAuth';
import { supabase } from '../../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onGoHome: () => void;
}

export function AdminLogin({ onLoginSuccess, onGoHome }: AdminLoginProps) {
  const [email, setEmail] = useState('ramonrbakuri@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResetSuccess(null);

    try {
      const result = await signInAdmin(email.trim(), password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(result.error || 'Authentication failed. Please verify credentials in your Supabase Auth dashboard.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your administrator email first.');
      return;
    }

    setResetLoading(true);
    setErrorMsg(null);
    setResetSuccess(null);

    try {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) {
          setErrorMsg(`Reset failed: ${error.message}`);
        } else {
          setResetSuccess(`Password reset link sent to ${email.trim()}! Please check your inbox.`);
        }
      } else {
        setErrorMsg('Supabase client not initialized.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14120F] text-[#F4EFE4] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-[#FFC93C] selection:text-[#14120F]">
      {/* Background Graphic Lines */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC93C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E4402A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#1A1713] border-2 border-[#FFC93C] shadow-[8px_8px_0px_0px_#14120F] relative z-10 p-6 sm:p-8">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C] text-[11px] font-mono font-bold uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFC93C]" />
          <span>MBH INTERNAL // SECURE ACCESS</span>
        </div>

        <h1 className="font-['Anton'] text-3xl sm:text-4xl uppercase tracking-tight text-[#F4EFE4] mb-2">
          Admin Portal
        </h1>
        <p className="font-mono text-xs text-[#F4EFE4]/60 mb-6">
          Mumbai Beatbox Hub private administration panel. Verified administrator credentials required.
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-[#E4402A]/15 border border-[#E4402A] text-[#F4EFE4] text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#E4402A] shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-bold text-[#E4402A] block uppercase mb-0.5">Authorization Notice</span>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Reset Password Success Alert */}
        {resetSuccess && (
          <div className="mb-6 p-3.5 bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{resetSuccess}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#F4EFE4]/80 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Admin Email</span>
              <Mail className="w-3.5 h-3.5 text-[#FFC93C]/70" />
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramonrbakuri@gmail.com"
              autoComplete="email"
              className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] placeholder-[#F4EFE4]/30 text-sm font-mono focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-[#F4EFE4]/80 uppercase tracking-wider flex items-center gap-1.5">
                <span>Password</span>
                <Key className="w-3.5 h-3.5 text-[#FFC93C]/70" />
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="text-[11px] font-mono text-[#FFC93C] hover:underline cursor-pointer disabled:opacity-50"
              >
                {resetLoading ? 'Sending email...' : 'Reset Password?'}
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] placeholder-[#F4EFE4]/30 text-sm font-mono focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#14120F] transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#14120F] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#14120F]" />
                <span>Authenticating with Supabase...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#14120F]" />
              </>
            )}
          </button>
        </form>

        {/* Supabase Cloud Instructions Card */}
        <div className="mt-6 p-3 bg-[#14120F] border border-[#F4EFE4]/15 text-[11px] font-mono text-[#F4EFE4]/70 space-y-2">
          <div className="flex items-center gap-1.5 text-[#FFC93C] font-bold">
            <Info className="w-3.5 h-3.5" />
            <span>Supabase Auth Credentials</span>
          </div>
          <p>
            Your admin password is set inside your Supabase project under <strong>Authentication &gt; Users</strong>.
          </p>
          <div className="pt-1">
            <a
              href="https://supabase.com/dashboard/project/tcsovxxhoypfpkbmowhd/auth/users"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFC93C] hover:underline inline-flex items-center gap-1 font-bold"
            >
              <span>Manage or create user in Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-8 pt-4 border-t border-[#F4EFE4]/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#F4EFE4]/50">
            <Lock className="w-3.5 h-3.5 text-[#FFC93C]/70 shrink-0" />
            <span>Public registration disabled. Users must pre-exist in Supabase Auth with admin privileges.</span>
          </div>

          <button
            type="button"
            onClick={onGoHome}
            className="text-left font-mono text-xs text-[#FFC93C] hover:underline cursor-pointer flex items-center gap-1.5 transition-colors pt-2"
          >
            <span>&larr; Return to Mumbai Beatbox Hub</span>
          </button>
        </div>

      </div>
      
      {/* Route watermark */}
      <div className="mt-6 text-center font-mono text-[11px] text-[#F4EFE4]/40">
        ROUTE: <span className="text-[#FFC93C]">/mhb-admin/login</span> &bull; SUPABASE AUTH PROTECTED
      </div>
    </div>
  );
}
