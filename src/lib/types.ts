export type Mutation = {
  id: string;
  gene: string;
  change: string;
  significance: string;
  impact: 'High' | 'Moderate' | 'Low';
  evidence: string;
};

export type AntibioticOutcome = {
  name: string;
  simulatedEfficacy: number;
  category: 'Preferred' | 'Conditional' | 'Avoid';
  rationale: string;
  MIC: string;
};

export type HistoricalCase = {
  id: string;
  isolate: string;
  ward: string;
  resistanceSignature: string;
  similarity: number;
  outcome: string;
};

export type TrendPoint = {
  label: string;
  resistanceRate: number;
  isolates: number;
};

export type AssistantMessage = {
  role: 'assistant' | 'user';
  content: string;
};

export type AnalysisResult = {
  label: string;
  riskScore: number;
  confidence: number;
  uncertainty: number;
  dominantGenes: Mutation[];
  featureImportance: { feature: string; weight: number }[];
  similarCases: HistoricalCase[];
  selectedAntibiotics: AntibioticOutcome[];
};

export type TimeMachinePoint = {
  horizon: '24h' | '48h' | '72h';
  resistanceRisk: number;
  note: string;
};
