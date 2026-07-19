'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BacteriaMap from '@/components/BacteriaMap';
import TimelineSlider from '@/components/TimelineSlider';
import StatsPanel from '@/components/StatsPanel';

export default function TimelinePage() {
  const [year, setYear] = useState(2005);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setYear((prev) => {
          if (prev >= 2025) {
            setIsPlaying(false);
            return 2025;
          }
          return prev + 1;
        });
      }, 800); // .8 seconds per year
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative min-h-screen bg-[#020617] overflow-hidden text-white font-sans selection:bg-red-500/30 flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-[#020617] to-transparent pointer-events-none">
        <Link 
          href="/" 
          className="pointer-events-auto flex items-center gap-2 text-slate-400 hover:text-white transition-colors group backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="pointer-events-auto text-right">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">Global Resistance Spread</h1>
          <p className="text-sm font-medium text-red-400 uppercase tracking-widest drop-shadow-md">Simulation v1.4</p>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative w-full h-full">
        <BacteriaMap currentYear={year} />
      </div>

      {/* UI Overlays */}
      <StatsPanel currentYear={year} />

      {/* Timeline Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-8 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent">
        <TimelineSlider 
          currentYear={year} 
          onChange={setYear} 
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      </div>
    </div>
  );
}
