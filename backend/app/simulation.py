from __future__ import annotations

from dataclasses import dataclass
from hashlib import blake2b
from typing import List


@dataclass(frozen=True)
class Mutation:
    id: str
    gene: str
    change: str
    significance: str
    impact: str
    evidence: str


@dataclass(frozen=True)
class AntibioticOutcome:
    name: str
    simulated_efficacy: int
    category: str
    rationale: str
    mic: str


MUTATIONS: List[Mutation] = [
    Mutation('m1', 'blaKPC-2', 'Carbapenemase expansion', 'Strongly associated with carbapenem resistance.', 'High', 'Detected in multiple hospital outbreaks.'),
    Mutation('m2', 'gyrA S83L', 'Quinolone target-site alteration', 'Reduces fluoroquinolone binding.', 'High', 'Classic mutation linked to elevated ciprofloxacin MIC.'),
    Mutation('m3', 'porin loss OmpK35', 'Reduced outer-membrane permeability', 'Promotes multi-drug resistance by limiting antibiotic entry.', 'Moderate', 'Often co-occurs with beta-lactamase carriage.'),
    Mutation('m4', 'aac(6")-Ib', 'Aminoglycoside-modifying enzyme', 'Inactivates several aminoglycosides after uptake.', 'Moderate', 'Reported in both community and ICU isolates.'),
    Mutation('m5', 'mgrB disruption', 'Colistin resistance axis', 'Can increase resistance to polymyxins under selective pressure.', 'High', 'Frequently appears in rescue-therapy failure cases.')
]

ANTIBIOTICS: List[AntibioticOutcome] = [
    AntibioticOutcome('Meropenem', 24, 'Avoid', 'Carbapenemase signal dominates.', '>8 mg/L'),
    AntibioticOutcome('Cefiderocol', 66, 'Conditional', 'Some activity remains, but permeability loss lowers confidence.', '2 mg/L'),
    AntibioticOutcome('Amikacin', 58, 'Conditional', 'Moderate modifier enzyme burden is present.', '8 mg/L'),
    AntibioticOutcome('Polymyxin B', 49, 'Avoid', 'Rescue option only; resistance axis is active.', '4 mg/L'),
    AntibioticOutcome('Piperacillin/Tazobactam', 31, 'Avoid', 'Beta-lactamase profile predicts poor coverage.', '>64 mg/L')
]


def _hash_int(value: str) -> int:
    digest = blake2b(value.encode('utf-8'), digest_size=8).digest()
    return int.from_bytes(digest, 'big')


def simulate_analysis(source: str) -> dict:
    seed = _hash_int(source or 'demo-sample')
    risk_score = min(0.95, max(0.18, 0.42 + (seed % 32) / 100))
    confidence = min(0.92, max(0.62, 0.78 - (seed % 9) / 100))
    selected = [MUTATIONS[(seed + offset) % len(MUTATIONS)] for offset in range(4)]
    feature_importance = [
        {'feature': mutation.gene, 'weight': round(0.31 - index * 0.05 + (seed % 5) * 0.01, 2)}
        for index, mutation in enumerate(selected)
    ]
    antibiotics = sorted(
        [
            {
                **item.__dict__,
                'simulated_efficacy': max(8, min(96, item.simulated_efficacy + (((seed >> (index + 1)) % 18) - 6)))
            }
            for index, item in enumerate(ANTIBIOTICS)
        ],
        key=lambda item: item['simulated_efficacy'],
        reverse=True,
    )
    return {
        'label': 'High resistance risk' if risk_score > 0.68 else 'Elevated resistance risk' if risk_score > 0.48 else 'Lower resistance risk',
        'risk_score': round(risk_score, 2),
        'confidence': round(confidence, 2),
        'uncertainty': round(1 - confidence, 2),
        'dominant_genes': [mutation.__dict__ for mutation in selected],
        'feature_importance': feature_importance,
        'selected_antibiotics': antibiotics[:5],
    }


def simulate_time_machine(risk_score: float) -> list[dict]:
    return [
        {'horizon': '24h', 'resistance_risk': round(min(0.98, risk_score + 0.03), 2), 'note': 'Early selective pressure remains limited but detection risk is unchanged.'},
        {'horizon': '48h', 'resistance_risk': round(min(0.98, risk_score + 0.08), 2), 'note': 'Simulation suggests stronger enrichment of resistant subclones.'},
        {'horizon': '72h', 'resistance_risk': round(min(0.98, risk_score + 0.14), 2), 'note': 'If treatment pressure persists, resistance becomes more likely to dominate.'},
    ]


def simulate_antibiotic_lab(base_score: float, selected: list[str]) -> list[dict]:
    seed = _hash_int('|'.join(selected) or 'lab')
    results = []
    for index, item in enumerate(ANTIBIOTICS):
                if selected and item.name not in selected:
                        continue
                efficacy = max(6, min(98, item.simulated_efficacy + (seed % 13) - index * 4 - round(base_score * 8)))
                category = 'Preferred' if efficacy >= 65 else 'Conditional' if efficacy >= 40 else 'Avoid'
                results.append({
                        **item.__dict__,
                        'simulated_efficacy': efficacy,
                        'category': category,
                        'rationale': f'{item.rationale} Simulation adjusted for current resistance burden.'
                })
    return sorted(results, key=lambda item: item['simulated_efficacy'], reverse=True)


def answer_question(question: str) -> str:
    q = question.lower()
    if 'carbapenem' in q:
        return 'Grounded answer: the model currently penalizes carbapenems because beta-lactamase burden and porin loss are both present. In published surveillance, that combination is a strong signal for treatment failure.'
    if 'colistin' in q or 'polymyxin' in q:
        return 'Grounded answer: polymyxins remain a rescue-only option here. The simulation flags a possible mgrB-linked resistance axis, so the expected benefit is lower and should be interpreted cautiously.'
    if 'fluoroquinolone' in q:
        return 'Grounded answer: gyrA target-site alteration weakens fluoroquinolone activity. The assistant would rank this class below aminoglycosides and cefiderocol in the current scenario.'
    return 'Grounded answer: the evidence points to beta-lactamase activity, reduced permeability, and target-site alteration as the main drivers. The safest approach is to prefer the highest-scoring agents, then review culture data, MICs, and infection-site constraints.'
