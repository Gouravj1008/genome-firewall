import React from 'react';
import { Dna, BookOpen, Percent, Info, AlertTriangle } from 'lucide-react';

interface MutationTrustCardProps {
  gene?: string;
  mutation?: string;
  reason?: string;
  confidence?: number;
  papers?: number;
}

export function MutationTrustCard({
  gene = "gyrA",
  mutation = "Ser83Leu",
  reason = "This mutation changes the binding site of Ciprofloxacin, making the drug ineffective.",
  confidence = 96,
  papers = 3
}: MutationTrustCardProps) {
  return (
    <div className="relative group w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/20">
      
      {/* Background Gradient Effect */}
      <div className="absolute -inset-px bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
      
      {/* Header: Gene and Mutation */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Dna className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Gene</p>
            <h3 className="text-xl font-bold text-white tracking-tight">{gene}</h3>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mutation</p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 mt-0.5 ring-1 ring-red-500/20">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-sm font-semibold text-red-400">{mutation}</span>
          </div>
        </div>
      </div>

      {/* Reason Box */}
      <div className="relative mb-6 rounded-xl bg-slate-800/50 border border-slate-700 p-4 transition-colors group-hover:bg-slate-800/80 z-10">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-300 leading-relaxed">
              {reason}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        {/* Confidence */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/30 p-3 ring-1 ring-slate-700/50 transition-all hover:bg-slate-800/60">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Model Confidence</p>
            <p className="text-lg font-bold text-emerald-400">{confidence}%</p>
          </div>
        </div>

        {/* Papers */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/30 p-3 ring-1 ring-slate-700/50 transition-all hover:bg-slate-800/60">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Literature</p>
            <p className="text-lg font-bold text-white">
              {papers} <span className="text-sm font-normal text-slate-400">papers</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
