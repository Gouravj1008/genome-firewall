import type { AntibioticOutcome, HistoricalCase, Mutation, TrendPoint } from './types';

export const demoMutations: Mutation[] = [
  {
    id: 'm1',
    gene: 'blaKPC-2',
    change: 'Carbapenemase expansion',
    significance: 'Strongly associated with carbapenem resistance and treatment failure.',
    impact: 'High',
    evidence: 'Detected in multiple Klebsiella pneumoniae hospital outbreaks.'
  },
  {
    id: 'm2',
    gene: 'gyrA S83L',
    change: 'Quinolone target-site alteration',
    significance: 'Reduces fluoroquinolone binding at the DNA gyrase target site.',
    impact: 'High',
    evidence: 'Classic mutation linked to elevated ciprofloxacin MIC.'
  },
  {
    id: 'm3',
    gene: 'porin loss OmpK35',
    change: 'Reduced outer-membrane permeability',
    significance: 'Promotes multi-drug resistance by limiting antibiotic entry.',
    impact: 'Moderate',
    evidence: 'Often co-occurs with beta-lactamase carriage.'
  },
  {
    id: 'm4',
    gene: 'aac(6")-Ib',
    change: 'Aminoglycoside-modifying enzyme',
    significance: 'Inactivates several aminoglycosides after uptake.',
    impact: 'Moderate',
    evidence: 'Reported in both community and ICU isolates.'
  },
  {
    id: 'm5',
    gene: 'mgrB disruption',
    change: 'Colistin resistance axis',
    significance: 'Can increase resistance to polymyxins under selective pressure.',
    impact: 'High',
    evidence: 'Frequently appears in rescue-therapy failure cases.'
  }
];

export const demoAntibiotics: AntibioticOutcome[] = [
  { name: 'Meropenem', simulatedEfficacy: 24, category: 'Avoid', rationale: 'Carbapenemase signal dominates.', MIC: '>8 mg/L' },
  { name: 'Cefiderocol', simulatedEfficacy: 66, category: 'Conditional', rationale: 'Some activity remains, but permeability loss lowers confidence.', MIC: '2 mg/L' },
  { name: 'Amikacin', simulatedEfficacy: 58, category: 'Conditional', rationale: 'Moderate modifier enzyme burden is present.', MIC: '8 mg/L' },
  { name: 'Polymyxin B', simulatedEfficacy: 49, category: 'Avoid', rationale: 'Rescue option only; resistance axis is active.', MIC: '4 mg/L' },
  { name: 'Piperacillin/Tazobactam', simulatedEfficacy: 31, category: 'Avoid', rationale: 'Beta-lactamase profile predicts poor coverage.', MIC: '>64 mg/L' }
];

export const demoHistoricalCases: HistoricalCase[] = [
  {
    id: 'c1',
    isolate: 'Kp-ICU-014',
    ward: 'MICU',
    resistanceSignature: 'blaKPC-2 + OmpK35 loss',
    similarity: 94,
    outcome: 'Escalation to cefiderocol stabilized culture clearance.'
  },
  {
    id: 'c2',
    isolate: 'Kp-ED-221',
    ward: 'Emergency',
    resistanceSignature: 'gyrA mutation + efflux increase',
    similarity: 88,
    outcome: 'Fluoroquinolone failure required aminoglycoside switch.'
  },
  {
    id: 'c3',
    isolate: 'Kp-Transplant-08',
    ward: 'Transplant',
    resistanceSignature: 'mgrB disruption + porin loss',
    similarity: 84,
    outcome: 'Polymyxin exposure produced only transient response.'
  }
];

export const demoTrendData: TrendPoint[] = [
  { label: 'ICU', resistanceRate: 18, isolates: 52 },
  { label: 'Surgery', resistanceRate: 13, isolates: 36 },
  { label: 'Transplant', resistanceRate: 22, isolates: 27 },
  { label: 'Emergency', resistanceRate: 15, isolates: 44 },
  { label: 'Oncology', resistanceRate: 26, isolates: 31 }
];

export const evidenceNotes = [
  'Beta-lactamase abundance is the leading driver of the current prediction.',
  'Target-site mutation burden raises the fluoroquinolone resistance probability.',
  'Permeability loss and efflux together reduce the modeled effect size of several agents.'
];
