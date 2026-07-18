import { demoAntibiotics, demoHistoricalCases, demoMutations } from './demo';
import type { AnalysisResult, AntibioticOutcome, HistoricalCase, TimeMachinePoint } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function rotateSelection<T>(items: T[], seed: number, count: number): T[] {
  return Array.from({ length: count }, (_, index) => items[(seed + index) % items.length]);
}

function rankAntibiotics(seed: number): AntibioticOutcome[] {
  return demoAntibiotics
    .map((item, index) => {
      const swing = ((seed >> (index + 1)) % 18) - 6;
      return {
        ...item,
        simulatedEfficacy: clamp(item.simulatedEfficacy + swing, 8, 96)
      };
    })
    .sort((left, right) => right.simulatedEfficacy - left.simulatedEfficacy);
}

function similarCases(seed: number): HistoricalCase[] {
  return rotateSelection(demoHistoricalCases, seed % demoHistoricalCases.length, 3).map((item, index) => ({
    ...item,
    similarity: clamp(item.similarity - index * 2 + (seed % 4), 72, 98)
  }));
}

export function simulateAnalysis(source: string): AnalysisResult {
  const seed = hashString(source || 'demo-sample');
  const riskScore = clamp(0.42 + (seed % 32) / 100, 0.18, 0.95);
  const confidence = clamp(0.78 - (seed % 9) / 100, 0.62, 0.92);
  const uncertainty = Number((1 - confidence).toFixed(2));
  const dominantGenes = rotateSelection(demoMutations, seed % demoMutations.length, 4);
  const featureImportance = dominantGenes.map((mutation, index) => ({
    feature: mutation.gene,
    weight: Number((0.31 - index * 0.05 + (seed % 5) * 0.01).toFixed(2))
  }));

  return {
    label: riskScore > 0.68 ? 'High resistance risk' : riskScore > 0.48 ? 'Elevated resistance risk' : 'Lower resistance risk',
    riskScore: Number(riskScore.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    uncertainty,
    dominantGenes,
    featureImportance,
    similarCases: similarCases(seed),
    selectedAntibiotics: rankAntibiotics(seed).slice(0, 5)
  };
}

export function simulateTimeMachine(riskScore: number): TimeMachinePoint[] {
  return [
    {
      horizon: '24h',
      resistanceRisk: clamp(riskScore + 0.03, 0, 0.98),
      note: 'Early selective pressure remains limited but detection risk is unchanged.'
    },
    {
      horizon: '48h',
      resistanceRisk: clamp(riskScore + 0.08, 0, 0.98),
      note: 'Simulation suggests stronger enrichment of resistant subclones.'
    },
    {
      horizon: '72h',
      resistanceRisk: clamp(riskScore + 0.14, 0, 0.98),
      note: 'If treatment pressure persists, resistance becomes more likely to dominate.'
    }
  ];
}

export function simulateAntibioticLab(baseScore: number, antibiotics: string[]): AntibioticOutcome[] {
  const seed = hashString(antibiotics.join('|') || 'lab');
  return demoAntibiotics
    .filter((item) => antibiotics.length === 0 || antibiotics.includes(item.name))
    .map((item, index) => {
      const efficacy = clamp(item.simulatedEfficacy + (seed % 13) - index * 4 - Math.round(baseScore * 8), 6, 98);
      const category = efficacy >= 65 ? 'Preferred' : efficacy >= 40 ? 'Conditional' : 'Avoid';
      return {
        ...item,
        simulatedEfficacy: efficacy,
        category,
        rationale: `${item.rationale} Simulation adjusted for current resistance burden.`
      };
    })
    .sort((left, right) => right.simulatedEfficacy - left.simulatedEfficacy);
}

export function answerClinicalQuestion(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('carbapenem')) {
    return 'Grounded answer: the model currently penalizes carbapenems because beta-lactamase burden and porin loss are both present. In published surveillance, that combination is a strong signal for treatment failure.';
  }
  if (q.includes('colistin') || q.includes('polymyxin')) {
    return 'Grounded answer: polymyxins remain a rescue-only option here. The simulation flags a possible mgrB-linked resistance axis, so the expected benefit is lower and should be interpreted cautiously.';
  }
  if (q.includes('fluoroquinolone')) {
    return 'Grounded answer: gyrA target-site alteration weakens fluoroquinolone activity. The assistant would rank this class below aminoglycosides and cefiderocol in the current scenario.';
  }
  return 'Grounded answer: the evidence points to beta-lactamase activity, reduced permeability, and target-site alteration as the main drivers. The safest approach is to prefer the highest-scoring agents, then review culture data, MICs, and infection-site constraints.';
}
