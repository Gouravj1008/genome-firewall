import { Play, Pause } from 'lucide-react';

interface TimelineSliderProps {
  currentYear: number;
  onChange: (year: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function TimelineSlider({ currentYear, onChange, isPlaying, onPlayPause }: TimelineSliderProps) {
  const min = 2005;
  const max = 2025;
  const progress = ((currentYear - min) / (max - min)) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-fade-in-up">
      <div className="flex items-center gap-6 w-full backdrop-blur-xl bg-black/40 p-4 sm:p-6 rounded-3xl border border-white/10 shadow-[0_0_40px_-10px_rgba(255,0,0,0.2)] transition-all">
        
        <button 
          onClick={onPlayPause}
          className="flex-shrink-0 w-14 h-14 rounded-full bg-red-600/20 hover:bg-red-500/30 border border-red-500/50 flex items-center justify-center text-red-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>

        <div className="flex-1 flex flex-col relative group">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 px-1">
            <span>{min}</span>
            <span className="text-red-400 text-lg">{currentYear}</span>
            <span>{max}</span>
          </div>

          <div className="relative h-3 rounded-full bg-slate-800/80 border border-white/5 cursor-pointer flex items-center">
            {/* Slider track fill */}
            <div 
              className="absolute h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
            
            <input 
              type="range"
              min={min}
              max={max}
              value={currentYear}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />

            {/* Custom thumb */}
            <div 
              className="absolute w-5 h-5 bg-white border-4 border-red-600 rounded-full shadow-lg -ml-2.5 transition-transform duration-300 pointer-events-none group-hover:scale-125"
              style={{ left: `${progress}%` }}
            ></div>
          </div>
          
          {/* Tick marks */}
          <div className="flex justify-between px-2 mt-2">
            {[2005, 2010, 2015, 2020, 2025].map(year => (
              <div key={year} className="flex flex-col items-center text-[10px] text-slate-600 font-medium">
                <div className="h-1 w-px bg-slate-700 mb-1"></div>
                {year !== min && year !== max && year !== currentYear ? year : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
