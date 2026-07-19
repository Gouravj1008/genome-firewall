'use client';

import Link from 'next/link';
import { Shield, Dna, ArrowRight, Activity, Database, Lock, ChevronRight } from 'lucide-react';

export default function Page() {
  return (
    <div className="relative min-h-screen bg-[#030712] flex flex-col overflow-hidden text-white font-sans selection:bg-cyan-500/30">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-cyan-900/30 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[60%] -right-[20%] w-[60%] h-[60%] rounded-full bg-emerald-900/20 blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[20%] left-[60%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[100px] animate-pulse-slow delay-700"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full animate-fade-in-up">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Genome Firewall</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Technology</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Security</a>
          <Link href="/timeline" className="hover:text-red-400 transition-colors text-red-500 flex items-center gap-1 animate-pulse">
            <Activity className="w-4 h-4" /> Simulation
          </Link>
        </div>
        <Link 
          href="/login"
          className="rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-semibold backdrop-blur-md transition-all hover:bg-white/10 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          Enter Dashboard <ChevronRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center pb-20 mt-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 mb-8 backdrop-blur-sm animate-fade-in-up delay-100">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-sm font-medium text-cyan-300">Genome Engine v2.0 Live</span>
        </div>
        
        <h1 className="max-w-5xl text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 animate-fade-in-up delay-200">
          Predict Antimicrobial <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">Resistance in Real-Time</span>
        </h1>
        
        <p className="max-w-2xl text-lg text-slate-400 mb-10 animate-fade-in-up delay-300 leading-relaxed">
          Upload bacterial genomes and deploy a digital twin to instantly identify resistance markers, simulate therapies, and prevent outbreaks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-400">
          <Link 
            href="/signup"
            className="group relative flex h-14 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-8 font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]"
          >
            Launch Firewall App
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            href="/login"
            className="group flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 px-8 font-semibold text-white transition-all hover:bg-slate-800 hover:border-slate-600 backdrop-blur-sm active:scale-95"
          >
            <Dna className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            View Sample Report
          </Link>
        </div>

        {/* Floating Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-4 animate-fade-in-up delay-500">
          <div className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-cyan-500/30 hover:bg-white/10 hover:-translate-y-2 text-left">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
              <Activity className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Live Monitoring</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Real-time analysis of isolate mutations providing actionable intelligence on emerging resistance patterns.
            </p>
          </div>

          <div className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-blue-500/30 hover:bg-white/10 hover:-translate-y-2 text-left">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              <Database className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Genomic Database</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Cross-reference isolates against millions of known resistance markers in our proprietary global database.
            </p>
          </div>

          <div className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-purple-500/30 hover:bg-white/10 hover:-translate-y-2 text-left">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
              <Lock className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Enterprise Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Hospital-grade data protection ensuring patient data anonymity and secure processing pipelines.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
