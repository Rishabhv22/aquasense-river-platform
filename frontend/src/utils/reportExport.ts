import { WaterParameters, PredictionResult } from '../types';

export function buildAssessmentReport(
  sample: WaterParameters, 
  result: PredictionResult,
  sampleLabel = 'Sample A'
) {
  return {
    platform: 'AquaSense — River Water Quality Analysis & Forecasting Platform',
    version: '2.0.0',
    sample_label: sampleLabel,
    timestamp: new Date().toISOString(),
    input_parameters: {
      temperature: { value: sample.temperature, unit: '°C', label: 'Temperature' },
      dissolved_oxygen: { value: sample.do, unit: 'mg/L', label: 'Dissolved Oxygen' },
      ph: { value: sample.ph, unit: '', label: 'pH Level' },
      conductivity: { value: sample.conductivity, unit: 'µS/cm', label: 'Electrical Conductivity' },
      bod: { value: sample.bod, unit: 'mg/L', label: 'Biochemical Oxygen Demand' },
      nitrate: { value: sample.nitrate, unit: 'mg/L', label: 'Nitrate (NO3)' },
      fecal_coliform: { value: sample.fecal_coliform, unit: 'CFU/100mL', label: 'Fecal Coliform' }
    },
    assessment_results: {
      cpcb_rule_classification: {
        code: result.cpcb_code,
        name: result.cpcb_class,
        score: result.cpcb_score,
        limiting_factor: result.limiting_factor
      },
      machine_learning_prediction: {
        model: 'Random Forest Classifier (300 estimators, max depth 15, 12 features)',
        code: result.ml_code,
        name: result.ml_class,
        confidence: `${(result.confidence * 100).toFixed(1)}%`,
        class_probabilities: result.probabilities,
        model_agreement_with_cpcb: result.agreement,
        agreement_message: result.agreement_message
      },
      water_quality_index: {
        score: result.water_quality_indicator,
        category: result.indicator_label,
        sub_parameter_scores: result.parameters_analysis.map(p => ({
          parameter: p.name,
          value: `${p.value} ${p.unit}`.trim(),
          status: p.status,
          score_out_of_100: p.score,
          regulatory_threshold: p.recommended_range,
          scientific_explanation: p.explanation
        }))
      },
      environmental_insights: result.insights,
      environmental_warnings: result.warnings,
      feature_importance: result.feature_importance.slice(0, 5).map(f => ({
        feature: f.label,
        importance_score: f.importance,
        percentage_contribution: `${f.percentage.toFixed(2)}%`,
        rank: f.rank,
        description: f.description
      }))
    },
    methodology_note: 'CPCB classifications are deterministic statutory standards based on designated best-use categories. Machine learning classifications are probabilistic estimates from a Random Forest ensemble trained on historical Indian river water quality records (2013–2023).',
    scientific_disclaimer: 'This assessment report is generated as an academic and analytical decision-support tool. It should not be used as a substitute for certified statutory laboratory compliance audits under the Water (Prevention and Control of Pollution) Act.'
  };
}

export function downloadJsonReport(
  sample: WaterParameters, 
  result: PredictionResult, 
  sampleLabel = 'Sample A'
) {
  const report = buildAssessmentReport(sample, result, sampleLabel);
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aquasense_assessment_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printAssessmentReport(
  sample: WaterParameters, 
  result: PredictionResult, 
  sampleLabel = 'Sample A'
) {
  const report = buildAssessmentReport(sample, result, sampleLabel);
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>AquaSense Water Quality Assessment Report — ${sampleLabel}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #0f3b48; line-height: 1.5; }
        h1 { font-size: 22px; margin-bottom: 4px; color: #0f3b48; }
        .header { border-bottom: 2px solid #1f8f9c; padding-bottom: 12px; margin-bottom: 20px; }
        .meta { font-size: 12px; color: #37707d; margin-bottom: 20px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-weight: bold; font-size: 12px; }
        .badge-a { background: #e6f3f2; color: #1f8f9c; }
        .badge-alert { background: #fee2e2; color: #991b1b; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
        th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #dbe7ea; }
        th { background: #f2f7f8; color: #37707d; font-size: 11px; text-transform: uppercase; }
        .section-title { font-size: 15px; font-weight: bold; margin-top: 25px; margin-bottom: 8px; color: #0f3b48; border-bottom: 1px solid #dbe7ea; padding-bottom: 4px; }
        .disclaimer { font-size: 11px; color: #89a8b0; margin-top: 30px; border-top: 1px solid #dbe7ea; padding-top: 10px; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>AquaSense — River Water Quality Assessment Report</h1>
        <div class="meta">
          <strong>${sampleLabel}</strong> | Generated: ${new Date(report.timestamp).toLocaleString()} | Platform Version: 2.0.0
        </div>
      </div>

      <div class="section-title">1. Primary Classifications & Status</div>
      <table>
        <tr>
          <th>Standard / Model</th>
          <th>Result Code</th>
          <th>Designated Use Classification</th>
          <th>Confidence / Metric</th>
        </tr>
        <tr>
          <td><strong>CPCB Statutory Standard</strong></td>
          <td><strong>${report.assessment_results.cpcb_rule_classification.code}</strong></td>
          <td>${report.assessment_results.cpcb_rule_classification.name}</td>
          <td>Deterministic Rule Score: ${report.assessment_results.cpcb_rule_classification.score}/4</td>
        </tr>
        <tr>
          <td><strong>Random Forest Model</strong></td>
          <td><strong>${report.assessment_results.machine_learning_prediction.code}</strong></td>
          <td>${report.assessment_results.machine_learning_prediction.name}</td>
          <td>Confidence: ${report.assessment_results.machine_learning_prediction.confidence}</td>
        </tr>
        <tr>
          <td><strong>Water Quality Index (WQI)</strong></td>
          <td><strong>${report.assessment_results.water_quality_index.score} / 100</strong></td>
          <td>${report.assessment_results.water_quality_index.category}</td>
          <td>Weighted 7-parameter index</td>
        </tr>
      </table>

      <div class="section-title">2. Limiting Factor Analysis</div>
      <p style="font-size: 13px; color: #37707d;">
        ${report.assessment_results.cpcb_rule_classification.limiting_factor}
      </p>

      <div class="section-title">3. Input Parameter Sub-Index Breakdown</div>
      <table>
        <tr>
          <th>Parameter</th>
          <th>Observed Value</th>
          <th>Status</th>
          <th>Sub-Score</th>
          <th>Recommended CPCB Range</th>
        </tr>
        ${report.assessment_results.water_quality_index.sub_parameter_scores.map(p => `
          <tr>
            <td><strong>${p.parameter}</strong></td>
            <td>${p.value}</td>
            <td>${p.status}</td>
            <td>${p.score_out_of_100.toFixed(0)} / 100</td>
            <td>${p.regulatory_threshold}</td>
          </tr>
        `).join('')}
      </table>

      <div class="section-title">4. Environmental Alerts & Insights</div>
      <ul style="font-size: 12px; color: #37707d;">
        ${report.assessment_results.environmental_insights.map(i => `<li>${i}</li>`).join('')}
        ${report.assessment_results.environmental_warnings.map(w => `<li style="color: #c0603f;">${w}</li>`).join('')}
      </ul>

      <div class="disclaimer">
        <strong>Methodology & Academic Notice:</strong> ${report.methodology_note}<br/>
        <strong>Disclaimer:</strong> ${report.scientific_disclaimer}
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
