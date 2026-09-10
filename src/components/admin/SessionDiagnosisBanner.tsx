import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Terminal, 
  Database, 
  KeyRound, 
  Copy, 
  Check, 
  Play
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DiagnosisData {
  loading: boolean;
  userId: string | null;
  userEmail: string | null;
  sessionExists: boolean;
  authError: string | null;
  adminRows: Array<{ id: string; email: string }> | null;
  adminTableUUID: string | null;
  adminTableEmail: string | null;
  adminQueryError: string | null;
  uuidMatch: boolean;
  rpcIsAdmin: boolean | null;
  rpcError: string | null;
  rawJwtSub: string | null;
  rawJwtRole: string | null;
  timestamp: string;
}

export function SessionDiagnosisBanner() {
  const [data, setData] = useState<DiagnosisData>({
    loading: true,
    userId: null,
    userEmail: null,
    sessionExists: false,
    authError: null,
    adminRows: null,
    adminTableUUID: null,
    adminTableEmail: null,
    adminQueryError: null,
    uuidMatch: false,
    rpcIsAdmin: null,
    rpcError: null,
    rawJwtSub: null,
    rawJwtRole: null,
    timestamp: new Date().toLocaleTimeString(),
  });

  const [copied, setCopied] = useState(false);
  const [testInsertStatus, setTestInsertStatus] = useState<string | null>(null);
  const [testingInsert, setTestingInsert] = useState(false);

  const runDiagnosis = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));

    try {
      // 1. Diagnose authentication user directly via Supabase Auth API
      const { data: userData, error: userError } = await supabase.auth.getUser();

      // 2. Diagnose session token existence
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      const user = userData?.user ?? null;
      const session = sessionData?.session ?? null;
      const authErr = userError?.message || sessionError?.message || null;

      // Extract JWT claims safely without exposing secret tokens
      const jwtPayload = session?.access_token
        ? (() => {
            try {
              const base64Url = session.access_token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              return JSON.parse(jsonPayload);
            } catch {
              return null;
            }
          })()
        : null;

      // 3. Query public.admins table directly using the current authenticated session
      const { data: adminRows, error: adminErr } = await supabase
        .from('admins')
        .select('id, email, created_at');

      // 4. Test public.is_admin() RPC function
      const { data: rpcData, error: rpcErr } = await supabase.rpc('is_admin');

      const adminTableUUID = adminRows && adminRows.length > 0 ? adminRows[0].id : null;
      const adminTableEmail = adminRows && adminRows.length > 0 ? adminRows[0].email : null;

      const isMatch = Boolean(
        user?.id && adminRows?.some((row) => row.id.toLowerCase() === user.id.toLowerCase())
      );

      const diagnosisResult: DiagnosisData = {
        loading: false,
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        sessionExists: Boolean(session),
        authError: authErr,
        adminRows: adminRows ? adminRows.map((r) => ({ id: r.id, email: r.email })) : null,
        adminTableUUID,
        adminTableEmail,
        adminQueryError: adminErr?.message ?? null,
        uuidMatch: isMatch,
        rpcIsAdmin: typeof rpcData === 'boolean' ? rpcData : null,
        rpcError: rpcErr?.message ?? null,
        rawJwtSub: jwtPayload?.sub ?? null,
        rawJwtRole: jwtPayload?.role ?? null,
        timestamp: new Date().toLocaleTimeString(),
      };

      setData(diagnosisResult);

      // Log full diagnosis output to console for developer inspection
      console.log('=== [MBH ADMIN AUTHENTICATION SESSION DIAGNOSIS] ===', {
        frontendAuthenticatedUserUUID: user?.id,
        frontendAuthenticatedEmail: user?.email,
        sessionExists: Boolean(session),
        authError: authErr,
        adminTableRows: adminRows,
        adminTableUUID,
        adminTableEmail,
        uuidMatch: isMatch,
        rpcIsAdmin: rpcData,
        rpcError: rpcErr?.message ?? null,
        jwtClaims: {
          sub: jwtPayload?.sub,
          role: jwtPayload?.role,
          email: jwtPayload?.email,
          exp: jwtPayload?.exp ? new Date(jwtPayload.exp * 1000).toISOString() : null,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setData((prev) => ({
        ...prev,
        loading: false,
        authError: `Diagnosis Exception: ${msg}`,
      }));
    }
  }, []);

  useEffect(() => {
    runDiagnosis();
  }, [runDiagnosis]);

  // Copy diagnosis report to clipboard
  const handleCopyReport = () => {
    const report = `
[MHB ADMIN AUTHENTICATION SESSION REPORT]
Time: ${data.timestamp}
1. Frontend Authenticated User UUID: ${data.userId || 'NULL'}
2. Frontend Email: ${data.userEmail || 'NULL'}
3. Session Exists: ${data.sessionExists ? 'YES' : 'NO'}
4. Auth Error: ${data.authError || 'None'}
5. Admin Table UUID: ${data.adminTableUUID || (data.adminQueryError ? 'Error: ' + data.adminQueryError : 'No rows returned')}
6. Admin Table Email: ${data.adminTableEmail || 'N/A'}
7. UUIDs Match: ${data.uuidMatch ? 'YES (MATCH)' : 'NO (MISMATCH)'}
8. RPC is_admin(): ${data.rpcIsAdmin !== null ? (data.rpcIsAdmin ? 'TRUE' : 'FALSE') : 'N/A'} (Error: ${data.rpcError || 'None'})
9. JWT Role: ${data.rawJwtRole || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Test Member INSERT directly to probe RLS policy in real-time
  const handleTestMemberInsert = async () => {
    setTestingInsert(true);
    setTestInsertStatus('Testing INSERT into public.members with current auth token...');

    const probeId = `probe-${Date.now()}`;
    const probeRecord = {
      id: probeId,
      name: 'Diagnostic Test Beatboxer',
      handle: '@mbh_probe',
      specialty: 'Probe Check',
      area: 'Carter Road',
      experience: '1 year',
      voice_note_title: 'Diagnostic Tone',
      voice_note_duration: '0:05',
      sound_type: 'bass-growl',
      avatar_initials: 'DB',
      accent_bg: '#FFC93C',
      photo_url: '',
    };

    try {
      const { data: insertData, error: insertErr } = await supabase
        .from('members')
        .insert([probeRecord])
        .select();

      if (insertErr) {
        setTestInsertStatus(
          `INSERT FAILED: [${insertErr.code || 'RLS_BLOCK'}] ${insertErr.message}`
        );
      } else {
        // Clean up test record immediately
        await supabase.from('members').delete().eq('id', probeId);
        setTestInsertStatus(
          `INSERT SUCCEEDED! Row was written and deleted cleanly. (Members table INSERT RLS is working)`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestInsertStatus(`INSERT EXCEPTION: ${msg}`);
    } finally {
      setTestingInsert(false);
    }
  };

  return (
    <div className="mb-8 bg-[#1A1713] border-2 border-[#FFC93C] p-4 sm:p-5 shadow-[6px_6px_0px_0px_#14120F]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4EFE4]/15">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#FFC93C] text-[#14120F] font-bold">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="font-['Anton'] text-lg uppercase tracking-tight text-[#F4EFE4] flex items-center gap-2">
              <span>Authentication Session & RLS Diagnosis</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FFC93C]/20 text-[#FFC93C] border border-[#FFC93C]/40">
                LIVE PROBE
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#F4EFE4]/60">
              Evaluated via Supabase JavaScript Client in browser runtime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runDiagnosis}
            disabled={data.loading}
            className="px-3 py-1.5 bg-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] text-[#F4EFE4] border border-[#F4EFE4]/20 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${data.loading ? 'animate-spin' : ''}`} />
            <span>Re-Check</span>
          </button>

          <button
            type="button"
            onClick={handleCopyReport}
            className="px-3 py-1.5 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Diagnosis'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Diagnostic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {/* Metric 1: Frontend User UUID */}
        <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#FFC93C] mb-1 flex items-center justify-between">
            <span>1. Frontend User UUID</span>
            <KeyRound className="w-3 h-3 text-[#FFC93C]/70" />
          </div>
          <div className="font-mono text-xs text-[#F4EFE4] break-all select-all font-bold">
            {data.loading ? 'Checking...' : data.userId || 'NULL (No user authenticated)'}
          </div>
          <div className="text-[10px] font-mono text-[#F4EFE4]/50 mt-1 truncate">
            Email: {data.userEmail || 'N/A'}
          </div>
        </div>

        {/* Metric 2: Admin Table UUID */}
        <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#FFC93C] mb-1 flex items-center justify-between">
            <span>2. Admin Table UUID</span>
            <Database className="w-3 h-3 text-[#FFC93C]/70" />
          </div>
          <div className="font-mono text-xs text-[#F4EFE4] break-all select-all font-bold">
            {data.loading
              ? 'Checking...'
              : data.adminTableUUID ||
                (data.adminQueryError
                  ? `Blocked: ${data.adminQueryError}`
                  : 'No rows in public.admins')}
          </div>
          <div className="text-[10px] font-mono text-[#F4EFE4]/50 mt-1 truncate">
            Admin Email: {data.adminTableEmail || 'N/A'}
          </div>
        </div>

        {/* Metric 3: UUID Match Status */}
        <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#FFC93C] mb-1">
            3. UUID Match Verification
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {data.loading ? (
              <span className="font-mono text-xs text-[#F4EFE4]/50">Comparing...</span>
            ) : data.uuidMatch ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>MATCH: CONFIRMED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E4402A]/20 border border-[#E4402A] text-[#E4402A] text-xs font-mono font-bold">
                <XCircle className="w-3.5 h-3.5 text-[#E4402A]" />
                <span>MISMATCH / UNVERIFIED</span>
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono text-[#F4EFE4]/50 mt-1">
            RPC is_admin():{' '}
            <span
              className={
                data.rpcIsAdmin === true
                  ? 'text-emerald-400 font-bold'
                  : 'text-[#E4402A] font-bold'
              }
            >
              {data.rpcIsAdmin === true
                ? 'TRUE (Authorized)'
                : data.rpcIsAdmin === false
                ? 'FALSE (Not Admin)'
                : 'PENDING'}
            </span>
          </div>
        </div>

        {/* Metric 4: Supabase Session Exists */}
        <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#FFC93C] mb-1">
            4. Supabase Session Exists
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {data.loading ? (
              <span className="font-mono text-xs text-[#F4EFE4]/50">Checking...</span>
            ) : data.sessionExists ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ACTIVE SESSION</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E4402A]/20 border border-[#E4402A] text-[#E4402A] text-xs font-mono font-bold">
                <XCircle className="w-3.5 h-3.5 text-[#E4402A]" />
                <span>NO SESSION FOUND</span>
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono text-[#F4EFE4]/50 mt-1">
            Auth Error:{' '}
            <span className={data.authError ? 'text-[#E4402A]' : 'text-emerald-400'}>
              {data.authError || 'None (Clean)'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Member INSERT Policy Probe Bar */}
      <div className="mt-4 pt-3 border-t border-[#F4EFE4]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14120F]/60 p-3">
        <div>
          <div className="text-xs font-mono text-[#F4EFE4] flex items-center gap-2">
            <span className="font-bold text-[#FFC93C] uppercase">
              Members Table INSERT RLS Probe:
            </span>
            <span className="text-[11px] text-[#F4EFE4]/60">
              Policy "Allow admin members insert" WITH CHECK (public.is_admin())
            </span>
          </div>
          {testInsertStatus && (
            <div className="text-xs font-mono mt-1 text-[#F4EFE4] break-all">
              {testInsertStatus.includes('SUCCEEDED') ? (
                <span className="text-emerald-400 font-bold">{testInsertStatus}</span>
              ) : testInsertStatus.includes('FAILED') ? (
                <span className="text-[#E4402A] font-bold">{testInsertStatus}</span>
              ) : (
                <span className="text-[#FFC93C]">{testInsertStatus}</span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleTestMemberInsert}
          disabled={testingInsert || data.loading}
          className="px-3 py-1.5 bg-[#E4402A] hover:bg-[#ff5733] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${testingInsert ? 'animate-pulse' : ''}`} />
          <span>{testingInsert ? 'Testing Probe...' : 'Probe Members INSERT'}</span>
        </button>
      </div>
    </div>
  );
}
