import { Activity, ShieldAlert, Biohazard, Skull } from 'lucide-react';

interface StatsPanelProps {
  currentYear: number;
}

export default function StatsPanel({ currentYear }: StatsPanelProps) {
  // Calculate dynamic stats based on year
  const progress = (currentYear - 2005) / (2025 - 2005);
  
  const resistanceLevel = Math.floor(12 + (progress * 82)); // 12% to 94%
  const activeHotspots = Math.floor(4 + (progress * 342)); // 4 to 346
  const mutationRate = (1.2 + (progress * 7.6)).toFixed(1); // 1.2x to 8.8x
  const criticalThreats = Math.floor(progress * 15); // 0 to 15
  
  // Determine color scheme based on severity
  const getSeverityColor = (prog: number) => {
    if (prog < 0.3) return 'text-amber-400';
    if (prog < 0.7) return 'text-orange-500';
    return 'text-red-500';
  };

  const getSeverityBg = (prog: number) => {
    if (prog < 0.3) return 'bg-amber-500/20 border-amber-500/30';
    if (prog < 0.7) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30 animate-pulse-slow';
  };

  const severityColor = getSeverityColor(progress);

  return (
    <div className="absolute top-24 left-6 z-40 w-80 flex flex-col gap-4 pointer-events-none">
      
      {/* Global Status Card */}
      <div className={`backdrop-blur-xl bg-black/50 p-6 rounded-3xl border shadow-2xl transition-all duration-500 ${getSeverityBg(progress)}`}>
        <div className="flex items-center gap-3 mb-6">
          <Biohazard className={`w-8 h-8 ${severityColor} ${progress > 0.7 ? 'animate-spin-slow' : ''}`} />
          <div>
            <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Global Status</h2>
            <div className={`text-2xl font-black ${severityColor} transition-colors duration-500`}>
              {progress < 0.3 ? 'ELEVATED' : progress < 0.7 ? 'SEVERE' : 'CRITICAL'}
            </div>
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Resistance Spread</span>
              <span className={severityColor}>{resistanceLevel}%</span>
            </div>
            <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-500 ${progress > 0.7 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-orange-500'}`}
                style={{ width: `${resistanceLevel}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="backdrop-blur-xl bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
          <Activity className="w-5 h-5 text-slate-400 mb-2" />
          <span className="text-2xl font-bold text-white mb-1">{activeHotspots}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Hotspots</span>
        </div>
        
        <div className="backdrop-blur-xl bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
          <ShieldAlert className={`w-5 h-5 ${progress > 0.5 ? 'text-orange-400' : 'text-slate-400'} mb-2`} />
          <span className="text-2xl font-bold text-white mb-1">{mutationRate}x</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mutation Rate</span>
        </div>
      </div>
      
      {/* Critical Alert Box (Appears late in timeline) */}
      <div className={`backdrop-blur-xl bg-red-950/40 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 transition-all duration-1000 ${progress > 0.6 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
        <Skull className="w-6 h-6 text-red-500 flex-shrink-0 animate-pulse" />
        <div>
          <span className="block text-red-400 font-bold text-sm mb-1">{criticalThreats} Pan-Resistant Strains</span>
          <span className="text-xs text-red-300/70 leading-tight block">Warning: Untreatable pathogens detected in major urban centers.</span>
        </div>
      </div>

    </div>
  );
}
