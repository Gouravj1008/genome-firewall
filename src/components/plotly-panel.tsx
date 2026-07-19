'use client';

import dynamic from 'next/dynamic';
import type { AnalysisResult, TimeMachinePoint, TrendPoint } from '@/lib/types';

type PlotProps = {
  analysis: AnalysisResult;
  forecast: TimeMachinePoint[];
  trendData: TrendPoint[];
};

type PlotlyComponentProps = {
  data?: unknown[];
  layout?: Record<string, unknown>;
  config?: Record<string, unknown>;
};

const Plot = dynamic<PlotlyComponentProps>(
  () => import('react-plotly.js').then((module) => module.default),
  { ssr: false }
);

export function PlotlyPanel({ analysis, forecast, trendData }: PlotProps) {
  const featureImportance = {
    data: [
      {
        type: 'bar',
        orientation: 'h',
        x: analysis.featureImportance.map((item) => item.weight),
        y: analysis.featureImportance.map((item) => item.feature),
        marker: { color: ['#7dd3fc', '#34d399', '#60a5fa', '#fbbf24'] },
        hovertemplate: '%{y}<br>Weight: %{x}<extra></extra>'
      }
    ],
    layout: {
      margin: { l: 120, r: 18, t: 10, b: 30 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#cbd5e1' },
      xaxis: { gridcolor: 'rgba(148,163,184,0.14)', title: 'Contribution' },
      yaxis: { gridcolor: 'rgba(148,163,184,0.14)' },
      showlegend: false,
      height: 280
    }
  };

  const trendChart = {
    data: [
      {
        type: 'scatter',
        mode: 'lines+markers',
        x: trendData.map((item) => item.label),
        y: trendData.map((item) => item.resistanceRate),
        line: { color: '#22d3ee', width: 3 },
        marker: { size: 10, color: '#34d399' },
        fill: 'tozeroy',
        fillcolor: 'rgba(34,211,238,0.08)',
        hovertemplate: '%{x}<br>Resistance: %{y}%<extra></extra>'
      }
    ],
    layout: {
      margin: { l: 48, r: 18, t: 10, b: 34 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#cbd5e1' },
      yaxis: { gridcolor: 'rgba(148,163,184,0.14)', title: 'Resistance %' },
      xaxis: { gridcolor: 'rgba(148,163,184,0.14)' },
      showlegend: false,
      height: 280
    }
  };

  const timeMachineChart = {
    data: [
      {
        type: 'scatter',
        mode: 'lines+markers',
        x: forecast.map((item) => item.horizon),
        y: forecast.map((item) => item.resistanceRisk * 100),
        line: { color: '#f59e0b', width: 3, dash: 'dot' },
        marker: { size: 11, color: '#f97316' },
        hovertemplate: '%{x}<br>Simulated risk: %{y:.0f}%<extra></extra>'
      }
    ],
    layout: {
      margin: { l: 48, r: 18, t: 10, b: 34 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#cbd5e1' },
      yaxis: { gridcolor: 'rgba(148,163,184,0.14)', title: 'Risk %' },
      xaxis: { gridcolor: 'rgba(148,163,184,0.14)' },
      showlegend: false,
      height: 280
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">Feature importance</p>
        <Plot data={featureImportance.data} layout={featureImportance.layout} config={{ displayModeBar: false, responsive: true }} />
      </div>
      <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">Outbreak dashboard</p>
        <Plot data={trendChart.data} layout={trendChart.layout} config={{ displayModeBar: false, responsive: true }} />
      </div>
      <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">Resistance time machine</p>
        <Plot data={timeMachineChart.data} layout={timeMachineChart.layout} config={{ displayModeBar: false, responsive: true }} />
      </div>
    </div>
  );
}
