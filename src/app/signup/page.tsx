'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        let errorMessage = 'Signup failed';
        try {
          const data = await response.json();
          errorMessage = data.detail || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030712] flex items-center justify-center p-4 text-white font-sans">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-10 group cursor-pointer">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Genome Firewall</span>
        </Link>

        <div className="glass-panel rounded-3xl p-8 border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-2">Create Account</h2>
          <p className="text-slate-400 mb-6 text-sm">Join to access your private genome analysis dashboard.</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">Account created successfully! Redirecting to login...</div>}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <input
                type="text"
                required
                minLength={3}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Create a password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || success}
              className="w-full group relative flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 font-semibold text-slate-950 transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
