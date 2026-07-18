import type { AnalysisResult, TimeMachinePoint } from './types';

export function buildReportMarkup(analysis: AnalysisResult, forecast: TimeMachinePoint[]): string {
  const topGene = analysis.dominantGenes[0];
  const topAntibiotic = analysis.selectedAntibiotics[0];
  const topCase = analysis.similarCases[0];

  const genes = analysis.dominantGenes
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.gene}</td>
          <td>${item.change}</td>
          <td>${item.significance}</td>
          <td>${item.evidence}</td>
        </tr>
      `
    )
    .join('');

  const rows = analysis.selectedAntibiotics
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.simulatedEfficacy}%</td>
          <td>${item.category}</td>
          <td>${item.MIC}</td>
        </tr>
      `
    )
    .join('');

  const timeline = forecast
    .map(
      (item) => `
        <li><strong>${item.horizon}</strong>: ${(item.resistanceRisk * 100).toFixed(0)}% risk - ${item.note}</li>
      `
    )
    .join('');

  return `
    <html>
      <head>
        <title>Genome Firewall AI Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; background: #07111f; color: #e5eefc; }
          .page { padding: 40px; }
          .card { background: rgba(14, 26, 49, 0.92); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 20px; padding: 24px; margin-bottom: 18px; }
          h1, h2 { margin: 0 0 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          td, th { border-bottom: 1px solid rgba(148, 163, 184, 0.2); padding: 10px 6px; text-align: left; }
          .muted { color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="card">
            <h1>Genome Firewall AI - Clinical Resistance Report</h1>
            <p class="muted">Generated for demo use. Prediction confidence: ${(analysis.confidence * 100).toFixed(0)}% | Uncertainty: ${(analysis.uncertainty * 100).toFixed(0)}%</p>
            <p>Classification: <strong>${analysis.label}</strong> with a risk score of ${(analysis.riskScore * 100).toFixed(0)}%.</p>
            <p class="muted">Snapshot: top gene ${topGene?.gene ?? 'n/a'}, top therapy ${topAntibiotic?.name ?? 'n/a'}, closest case ${topCase?.isolate ?? 'n/a'}.</p>
          </div>
          <div class="card">
            <h2>Top Genes and Evidence</h2>
            <table>
              <thead>
                <tr><th>#</th><th>Gene</th><th>Change</th><th>Significance</th><th>Evidence</th></tr>
              </thead>
              <tbody>${genes}</tbody>
            </table>
          </div>
          <div class="card">
            <h2>Top Antibiotic Ranking</h2>
            <table>
              <thead>
                <tr><th>#</th><th>Antibiotic</th><th>Simulated Efficacy</th><th>Category</th><th>MIC</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="card">
            <h2>Resistance Time Machine</h2>
            <ul>${timeline}</ul>
          </div>
        </div>
      </body>
    </html>
  `;
}
