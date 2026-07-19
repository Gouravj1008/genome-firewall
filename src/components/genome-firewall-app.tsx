'use client';

import { startTransition, useEffect, useState } from 'react';
import { Download, FileUp, Microscope, Sparkles, Stethoscope, Wand2 } from 'lucide-react';
import { GenomeHelix } from './genome-helix';
import { PlotlyPanel } from './plotly-panel';
import { SectionCard } from './section-card';
import { MutationTrustCard } from './mutation-trust-card';
import { buildReportMarkup } from '@/lib/report';
import { demoTrendData, evidenceNotes } from '@/lib/demo';
import { answerClinicalQuestion, simulateAnalysis, simulateAntibioticLab, simulateLivingTwin, simulateTimeMachine } from '@/lib/simulate';
import type { AnalysisResult, AssistantMessage } from '@/lib/types';
import { useRouter } from 'next/navigation';

const initialAnalysis = simulateAnalysis('demo-Genome-Firewall');

const chips = ['Demo dataset', 'Upload genome', 'Generate report', 'Clinical assistant'];
const quickConsults = [
  'Why is meropenem deprioritized?',
  'What makes cefiderocol the top option?',
  'Which mutation drives the highest risk?'
];

const timelineStops = [
  { label: 'Today', horizon: 'Today', hours: 0 },
  { label: '24 Hours', horizon: '24h', hours: 24 },
  { label: '48 Hours', horizon: '48h', hours: 48 },
  { label: '72 Hours', horizon: '72h', hours: 72 }
] as const;

const emergentMutationLabels = ['acrAB-tolC upregulation', 'ompK36 truncation', 'pmrB adaptive switch'];

function confidenceBar(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function GenomeFirewallApp() {
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysis);
  const [selectedMutation, setSelectedMutation] = useState(initialAnalysis.dominantGenes[0]?.id ?? '');
  const [selectedAntibiotics, setSelectedAntibiotics] = useState<string[]>(initialAnalysis.selectedAntibiotics.slice(0, 3).map((item) => item.name));
  const [assistantInput, setAssistantInput] = useState('Is meropenem still reasonable here?');
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    { role: 'assistant', content: 'I am ready to answer clinical questions using grounded evidence from the current simulated resistance profile.' }
  ]);
  const [sourceLabel, setSourceLabel] = useState('Demo Klebsiella pneumoniae isolate');
  const [sourceNotes, setSourceNotes] = useState('Synthetic hospital genome created for the demo.');
  const [backendStatus, setBackendStatus] = useState<'Checking gateway' | 'Gateway connected' | 'Gateway offline'>('Checking gateway');
  const [authStatus, setAuthStatus] = useState('JWT demo not connected');
  const [authToken, setAuthToken] = useState('');
  const [liveFrame, setLiveFrame] = useState(0);
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('genome_token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthToken(token);
      setAuthStatus('Authenticated');
    }
  }, [router]);

  useEffect(() => {
    setSelectedMutation((current) => (analysis.dominantGenes.some((mutation) => mutation.id === current) ? current : analysis.dominantGenes[0]?.id || ''));
    setSelectedAntibiotics((current) => (current.length ? current : analysis.selectedAntibiotics.slice(0, 3).map((item) => item.name)));
  }, [analysis]);

  useEffect(() => {
    let cancelled = false;

    async function checkGateway() {
      try {
        const response = await fetch('/api/health');
        if (!cancelled) {
          setBackendStatus(response.ok ? 'Gateway connected' : 'Gateway offline');
        }
      } catch {
        if (!cancelled) {
          setBackendStatus('Gateway offline');
        }
      }
    }

    void checkGateway();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveFrame((current) => current + 1);
    }, 900);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const forecast = simulateTimeMachine(analysis.riskScore);
  const timelineForecast = [
    {
      horizon: 'Today' as const,
      resistanceRisk: analysis.riskScore,
      note: 'Baseline profile from the current isolate before projected selective pressure.'
    },
    ...forecast
  ];
  const selectedTimeline = timelineStops[selectedTimelineIndex];
  const selectedTimelinePoint = timelineForecast[selectedTimelineIndex];
  const baselineLabResults = simulateAntibioticLab(analysis.riskScore, selectedAntibiotics);
  const labResults = simulateAntibioticLab(selectedTimelinePoint.resistanceRisk, selectedAntibiotics);
  const twin = simulateLivingTwin(analysis, selectedAntibiotics, liveFrame + selectedTimeline.hours * 0.12, selectedTimeline.hours);
  const emergentMutations = [
    ...analysis.dominantGenes.slice(0, Math.min(analysis.dominantGenes.length, selectedTimelineIndex + 1)).map((item) => item.gene),
    ...emergentMutationLabels.slice(0, Math.max(0, selectedTimelineIndex - 1))
  ];
  const liveUncertainty = Number((1 - twin.liveConfidence).toFixed(2));
  const selectedMutationDetails = analysis.dominantGenes.find((item) => item.id === selectedMutation) ?? analysis.dominantGenes[0];
  const topAntibiotic = analysis.selectedAntibiotics[0];
  const topHistoricalCase = analysis.similarCases[0];
  const topDriver = analysis.featureImportance[0];

  async function handleGenomeUpload(file: File) {
    const text = await file.text();
    const seed = `${file.name}:${text.slice(0, 1000)}`;

    startTransition(() => {
      setAnalysis(simulateAnalysis(seed));
      setSourceLabel(file.name);
      setSourceNotes(`${file.size.toLocaleString()} bytes processed. Signals extracted from uploaded sequence text.`);
    });
  }

  function handleDemoLoad() {
    startTransition(() => {
      setAnalysis(simulateAnalysis('demo-dataset-klebsiella'));
      setSourceLabel('Demo outbreak isolate');
      setSourceNotes('Preloaded demo case with resistance markers, explanation graph, and comparative therapy ranking.');
      setSelectedAntibiotics(['Meropenem', 'Cefiderocol', 'Amikacin']);
    });
  }

  async function handleDemoAuth() {
    setAuthStatus('Connecting demo session...');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'genome-firewall' })
      });

      if (!response.ok) {
        throw new Error('Demo login failed');
      }

      const data = (await response.json()) as { access_token?: string };
      if (!data.access_token) {
        throw new Error('Demo login did not return a token');
      }

      localStorage.setItem('genome_token', data.access_token);
      setAuthToken(data.access_token);
      setAuthStatus('Demo session connected');
    } catch {
      setAuthToken('');
      setAuthStatus('Demo auth unavailable');
    }
  }
  function handleLogout() {
    localStorage.removeItem('genome_token');
    router.push('/login');
  }

  function handleAssistantSend() {
    if (!assistantInput.trim()) return;
    const reply = answerClinicalQuestion(assistantInput);
    setAssistantMessages((current) => [...current, { role: 'user', content: assistantInput }, { role: 'assistant', content: reply }]);
    setAssistantInput('');
  }

  function handleReportDownload() {
    const reportMarkup = buildReportMarkup(analysis, forecast);
    const win = window.open('', '_blank', 'width=1280,height=960');
    if (!win) return;
    win.document.open();
    win.document.write(reportMarkup);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,rgba(7,11,20,1),rgba(3,7,18,1))]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="glass-panel rounded-[32px] px-5 py-4 shadow-glow md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1">Genome Firewall</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Clinical decision support</span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">Simulation mode</span>
              </div>
              <div className="max-w-4xl space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Predict antibiotic resistance from bacterial genomes with transparent, hospital-grade analysis.
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  Upload a bacterial genome or use the demo isolate, inspect the model rationale, explore mutations in 3D, compare simulated therapies, and export a polished clinical report.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[370px]">
              <button onClick={handleDemoLoad} className="glass-button flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Load demo isolate
              </button>
              <button onClick={handleLogout} className="glass-button flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300">
                Logout
              </button>
              <button onClick={handleReportDownload} className="glass-button col-span-2 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/40 hover:text-emerald-100">
                <Download className="h-4 w-4" />
                Export PDF report
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Backend gateway</p>
              <p className="mt-2 text-lg font-semibold text-white">{backendStatus}</p>
              <p className="mt-1 text-sm text-slate-400">FastAPI /health routed through the Next.js API rewrite.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">JWT auth</p>
              <p className="mt-2 text-lg font-semibold text-white">{authStatus}</p>
              <p className="mt-1 truncate text-sm text-slate-400">{authToken ? `${authToken.slice(0, 28)}...` : 'Demo token is loaded only after sign-in.'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Secure demo access</p>
              <button onClick={handleDemoAuth} className="mt-3 inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-400/15">
                Connect demo session
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-[30px] p-4 shadow-glow sm:p-5">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4 rounded-[28px] border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Upload genome</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">{sourceLabel}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-300">FastAPI ready</span>
                </div>
                <p className="text-sm leading-6 text-slate-300">{sourceNotes}</p>
                <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 px-4 py-4 transition hover:border-cyan-300/50 hover:bg-cyan-400/10">
                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
                    <FileUp className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Upload bacterial genome or demo FASTA/JSON</p>
                    <p className="text-xs text-slate-400">The sample is read locally and converted into a deterministic demo prediction.</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.fasta,.fa,.json,.csv"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleGenomeUpload(file);
                      }
                    }}
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  {chips.map((chip) => (
                    <div key={chip} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                      {chip}
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Top signal</p>
                    <p className="mt-2 text-lg font-semibold text-white">{topDriver?.feature}</p>
                    <p className="mt-1 text-sm text-slate-400">Contribution weight {(topDriver?.weight ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Top therapy</p>
                    <p className="mt-2 text-lg font-semibold text-white">{topAntibiotic?.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{topAntibiotic?.simulatedEfficacy}% simulated efficacy</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Closest case</p>
                    <p className="mt-2 text-lg font-semibold text-white">{topHistoricalCase?.isolate}</p>
                    <p className="mt-1 text-sm text-slate-400">{topHistoricalCase?.similarity}% similarity</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Resistance call</p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-semibold text-white">{analysis.label}</p>
                        <p className="text-sm text-slate-400">Risk score {confidenceBar(analysis.riskScore)}</p>
                      </div>
                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-right">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200">Confidence</p>
                        <p className="text-lg font-semibold text-white">{confidenceBar(twin.liveConfidence)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Uncertainty</p>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400" style={{ width: `${twin.liveConfidence * 100}%` }} />
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{(liveUncertainty * 100).toFixed(0)}% uncertainty with continuously updating confidence bands.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-3">
                <GenomeHelix twinState={twin} />
                <div className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">Living digital twin</p>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">Real-time simulation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Cell state</p>
                      <div className="mx-auto mt-2 h-4 w-10 rounded-full border border-white/20" style={{ backgroundColor: twin.cellColor }} />
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Mutation flux</p>
                      <p className="mt-2 text-base font-semibold text-white">{Math.round(twin.mutationFlux * 100)}%</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Live resistance</p>
                      <p className="mt-2 text-base font-semibold text-white">{Math.round(twin.liveResistance * 100)}%</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {twin.pathways.map((pathway) => (
                      <div key={pathway.name}>
                        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          <span>{pathway.name}</span>
                          <span>{Math.round(pathway.activation * 100)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-rose-400"
                            style={{ width: `${pathway.activation * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {twin.mutatingGenes.map((gene) => (
                      <span key={gene} className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                        {gene}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SectionCard
            title="Explainable output"
            subtitle="The model surfaces affected genes, mutation burden, and evidence-linked rationale."
            badge="XAI"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Affected genes</p>
                  <Microscope className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="mt-4 space-y-2">
                  {analysis.dominantGenes.map((mutation) => (
                    <button
                      key={mutation.id}
                      onClick={() => setSelectedMutation(mutation.id)}
                      className={`w-full rounded-2xl border px-3 py-3 text-left transition ${selectedMutation === mutation.id ? 'border-cyan-300/40 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-white">{mutation.gene}</span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">{mutation.impact}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{mutation.change}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <MutationTrustCard 
                  gene={selectedMutationDetails?.gene ?? 'gyrA'}
                  mutation={selectedMutationDetails?.change ?? 'Ser83Leu'}
                  reason={selectedMutationDetails?.significance ?? 'This mutation changes the binding site of Ciprofloxacin, making the drug ineffective.'}
                />
              </div>
            </div>
          </SectionCard>
        </section>

        <SectionCard title="Genome explorer and model evidence" subtitle="Click a mutation to see why it matters and how it contributes to the prediction." badge="Explorer">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Interactive mutation map</p>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">click to inspect</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {analysis.dominantGenes.map((mutation, index) => (
                  <button
                    key={mutation.id}
                    onClick={() => setSelectedMutation(mutation.id)}
                    className={`rounded-3xl border p-4 text-left transition duration-300 ${selectedMutation === mutation.id ? 'border-cyan-300/50 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.08)]' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'} ${index % 2 === 0 ? 'animate-float' : ''}`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Gene</p>
                    <p className="mt-2 text-lg font-semibold text-white">{mutation.gene}</p>
                    <p className="mt-2 text-sm text-slate-300">{mutation.change}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Confidence and rationale</p>
                <Wand2 className="h-4 w-4 text-amber-300" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Model confidence</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{confidenceBar(twin.liveConfidence)}</p>
                  </div>
                  <div className="w-36">
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400" style={{ width: `${twin.liveConfidence * 100}%` }} />
                    </div>
                    <p className="mt-2 text-right text-xs uppercase tracking-[0.24em] text-slate-500">calibrated</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  {evidenceNotes.map((note) => (
                    <p key={note} className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 leading-6">{note}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Explainable analytics" subtitle="Feature importance, outbreak trends, and simulated resistance trajectories in one view." badge="Analytics">
          <PlotlyPanel analysis={analysis} forecast={forecast} trendData={demoTrendData} />
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Resistance Time Machine" subtitle="Simulation story mode. Move the timeline and watch the bacteria evolve, mutate, and alter treatment outcomes." badge="Simulation">
            <div className="space-y-5">
              <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Timeline control</p>
                  <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100">
                    {selectedTimeline.label}
                  </span>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {timelineStops.map((stop, index) => (
                    <button
                      key={stop.label}
                      onClick={() => setSelectedTimelineIndex(index)}
                      className={`rounded-xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${selectedTimelineIndex === index ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                      {stop.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={0}
                  max={timelineStops.length - 1}
                  step={1}
                  value={selectedTimelineIndex}
                  onChange={(event) => setSelectedTimelineIndex(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400"
                  aria-label="Resistance time machine horizon"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Bacteria evolution</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{(selectedTimelinePoint.resistanceRisk * 100).toFixed(0)}%</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" style={{ width: `${selectedTimelinePoint.resistanceRisk * 100}%` }} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{selectedTimelinePoint.note}</p>
                  <p className="mt-2 text-sm text-slate-400">Live confidence shifts to {confidenceBar(twin.liveConfidence)} as pathways activate under projected pressure.</p>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Mutations emerging</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {emergentMutations.map((gene) => (
                      <span key={gene} className="rounded-full border border-rose-300/30 bg-rose-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-100">
                        {gene}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Pathway activation now ranges from {Math.round(twin.pathways[0].activation * 100)}% to {Math.round(twin.pathways[2].activation * 100)}%.</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Virtual Antibiotic Lab" subtitle="Test candidate agents and compare simulated outcomes side by side." badge="Lab">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {analysis.selectedAntibiotics.map((item) => {
                  const active = selectedAntibiotics.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      onClick={() => setSelectedAntibiotics((current) => (current.includes(item.name) ? current.filter((entry) => entry !== item.name) : [...current, item.name]))}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${active ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3">
                {labResults.map((item, index) => (
                  <div key={item.name} className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{index + 1}. {item.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{item.rationale}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Simulated efficacy</p>
                        <p className="text-2xl font-semibold text-white">{item.simulatedEfficacy}%</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          {(() => {
                            const baseline = baselineLabResults.find((baseItem) => baseItem.name === item.name)?.simulatedEfficacy ?? item.simulatedEfficacy;
                            const delta = item.simulatedEfficacy - baseline;
                            const sign = delta > 0 ? '+' : '';
                            return `${sign}${delta}% vs today`;
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{item.category}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">MIC {item.MIC}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard title="Clinical Assistant" subtitle="Answers are grounded in the simulated evidence profile and resistance mechanisms." badge="Assistant">
            <div className="flex h-full flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {quickConsults.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setAssistantInput(prompt)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="max-h-[350px] overflow-y-auto rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                <div className="space-y-3">
                  {assistantMessages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-[20px] px-4 py-3 text-sm leading-6 ${message.role === 'assistant' ? 'bg-cyan-400/10 text-cyan-50' : 'ml-auto bg-white/10 text-white'}`}>
                      {message.content}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleAssistantSend();
                    }
                  }}
                  placeholder="Ask about drug choice, mutations, or lab interpretation..."
                  className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                />
                <button onClick={handleAssistantSend} className="glass-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40">
                  <Stethoscope className="h-4 w-4" />
                  Ask assistant
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Similar historical cases" subtitle="The model surfaces cases with comparable signatures and outcomes." badge="Cases">
            <div className="space-y-3">
              {analysis.similarCases.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{item.isolate}</p>
                      <p className="text-sm text-slate-400">{item.ward} • {item.resistanceSignature}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Similarity</p>
                      <p className="text-lg font-semibold text-white">{item.similarity}%</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.outcome}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        <SectionCard title="Professional report output" subtitle="The report combines predictions, explanations, ranking, and simulation snapshots for live handoff." badge="PDF">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm leading-6 text-slate-300">Export a polished report with confidence, uncertainty, feature importance, antibiotic ranking, and forecast panels. The browser print flow is styled for direct PDF export in the demo.</p>
            </div>
            <button onClick={handleReportDownload} className="glass-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/40 hover:text-emerald-100">
              <Download className="h-4 w-4" />
              Generate PDF report
            </button>
          </div>
        </SectionCard>

        <footer className="pb-4 text-center text-xs uppercase tracking-[0.34em] text-slate-500">
          Built for clinical demos, research labs, and high-stakes decision support presentations.
        </footer>
      </div>
    </main>
  );
}
