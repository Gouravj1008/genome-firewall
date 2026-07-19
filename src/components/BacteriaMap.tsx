import { useMemo } from 'react';

interface BacteriaMapProps {
  currentYear: number;
}

// Coordinate system: X (0 to 1000), Y (0 to 500)
const CITIES = [
  { id: 'nyc', x: 280, y: 150, name: 'New York', baseIntensity: 0.2, emergenceYear: 2006 },
  { id: 'ldn', x: 470, y: 110, name: 'London', baseIntensity: 0.3, emergenceYear: 2005 },
  { id: 'mum', x: 680, y: 240, name: 'Mumbai', baseIntensity: 0.8, emergenceYear: 2011 },
  { id: 'tok', x: 850, y: 160, name: 'Tokyo', baseIntensity: 0.4, emergenceYear: 2008 },
  { id: 'sao', x: 330, y: 340, name: 'São Paulo', baseIntensity: 0.5, emergenceYear: 2013 },
  { id: 'lag', x: 500, y: 280, name: 'Lagos', baseIntensity: 0.6, emergenceYear: 2015 },
  { id: 'pek', x: 770, y: 140, name: 'Beijing', baseIntensity: 0.7, emergenceYear: 2010 },
  { id: 'mex', x: 200, y: 230, name: 'Mexico City', baseIntensity: 0.5, emergenceYear: 2012 },
  { id: 'jnb', x: 540, y: 400, name: 'Johannesburg', baseIntensity: 0.4, emergenceYear: 2016 },
  { id: 'syd', x: 880, y: 410, name: 'Sydney', baseIntensity: 0.2, emergenceYear: 2018 },
  { id: 'mos', x: 600, y: 90, name: 'Moscow', baseIntensity: 0.3, emergenceYear: 2014 },
  { id: 'kai', x: 540, y: 200, name: 'Cairo', baseIntensity: 0.6, emergenceYear: 2013 },
];

export default function BacteriaMap({ currentYear }: BacteriaMapProps) {
  
  // Create a stylized abstract map of dots instead of a complex SVG path for a modern sci-fi look
  const mapGrid = useMemo(() => {
    // A very rough approximation of landmasses using grid points
    const points = [];
    const step = 15;
    for (let x = 50; x < 950; x += step) {
      for (let y = 50; y < 450; y += step) {
        // Simple bounding boxes for continents to draw dots
        const inNA = x > 150 && x < 350 && y > 50 && y < 250;
        const inSA = x > 250 && x < 380 && y > 260 && y < 420;
        const inEU = x > 430 && x < 570 && y > 50 && y < 160;
        const inAF = x > 440 && x < 580 && y > 180 && y < 380;
        const inAS = x > 580 && x < 850 && y > 50 && y < 280;
        const inOC = x > 800 && x < 920 && y > 320 && y < 450;
        
        // Add some noise/randomness so it's not a perfect block
        if ((inNA || inSA || inEU || inAF || inAS || inOC) && Math.random() > 0.3) {
          points.push({ cx: x, cy: y });
        }
      }
    }
    return points;
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#020617] flex items-center justify-center pointer-events-none">
      
      {/* Background glow based on year */}
      <div 
        className="absolute inset-0 opacity-20 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at center, rgba(220, 38, 38, ${Math.max(0, (currentYear - 2005) / 40)}) 0%, transparent 70%)`
        }}
      />

      <svg viewBox="0 0 1000 500" className="w-full max-w-[1400px] h-auto drop-shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        
        {/* Abstract Base Map */}
        <g className="opacity-20">
          {mapGrid.map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r="1.5" fill="#334155" />
          ))}
        </g>

        {/* Connections/Spread lines (appear later) */}
        {currentYear > 2012 && CITIES.map((city, i) => {
          if (city.emergenceYear > currentYear) return null;
          // Connect to the previous city to show "spread"
          const target = CITIES[i === 0 ? CITIES.length - 1 : i - 1];
          if (target.emergenceYear > currentYear) return null;
          
          const opacity = Math.min(0.4, (currentYear - city.emergenceYear) / 20);
          
          return (
            <path 
              key={`conn-${i}`}
              d={`M ${city.x} ${city.y} Q ${(city.x + target.x)/2} ${(city.y + target.y)/2 - 100} ${target.x} ${target.y}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={opacity}
              className="animate-pulse-slow"
            />
          );
        })}

        {/* Hotspots */}
        {CITIES.map((city) => {
          const isActive = currentYear >= city.emergenceYear;
          if (!isActive) return null;

          const yearsActive = currentYear - city.emergenceYear;
          // Severity increases with time active + base intensity
          const severity = Math.min(1, (yearsActive / 15) + city.baseIntensity); 
          
          const radius = 3 + (severity * 15);
          const glowRadius = radius * 3;
          
          return (
            <g key={city.id} className="transition-all duration-1000 origin-center" style={{ transform: `translate(${city.x}px, ${city.y}px)` }}>
              
              {/* Outer Pulse */}
              {severity > 0.4 && (
                <circle 
                  cx="0" 
                  cy="0" 
                  r={glowRadius} 
                  fill="rgba(239, 68, 68, 0.15)" 
                  className="animate-ping"
                  style={{ animationDuration: `${3 - severity}s` }}
                />
              )}
              
              {/* Main Hotspot Glow */}
              <circle 
                cx="0" 
                cy="0" 
                r={radius} 
                fill={severity > 0.7 ? '#ef4444' : severity > 0.4 ? '#f97316' : '#fbbf24'} 
                opacity="0.6"
                filter={`drop-shadow(0 0 ${severity * 10}px ${severity > 0.7 ? 'red' : 'orange'})`}
              />
              
              {/* Core */}
              <circle 
                cx="0" 
                cy="0" 
                r="2" 
                fill="#fff" 
              />
              
              {/* City Label - Only show for major severe ones to avoid clutter */}
              {severity > 0.6 && (
                <text 
                  x="12" 
                  y="4" 
                  fill="#f87171" 
                  fontSize="10" 
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  letterSpacing="1"
                  className="animate-fade-in-up uppercase"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                >
                  {city.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
