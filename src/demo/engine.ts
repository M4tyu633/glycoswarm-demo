// Source-compatible contracts; demo-only arithmetic. No network or inference.
import type { SpecialistResult } from "../types/index.ts";

export type Contract = { id: string; name: string; fields: string[]; color: string };
export type Sample = Record<string, string | number>;
export type Cohort = Record<string, number[]>;

export function rank(value: number, values: number[]): number {
  return (values.filter(v => v < value).length + values.filter(v => v === value).length / 2) / values.length;
}

export function reconstruct(sample: Sample, contract: Contract, cohort: Cohort, unavailable: boolean): SpecialistResult {
  const input_labs = Object.fromEntries(contract.fields.map(f => [f, Number(sample[f])]));
  const common = { specialist: contract.id, used_llm: false, duration_ms: 0, input_labs };
  if (unavailable) return {
    ...common, available: false, risk_score: null, flag: null, thresholds_used: {}, code_used: null,
    reasoning: "Simulated provider unavailable. No result was substituted.",
    steps: ["Input contract preserved", "Specialist output unavailable", "Null evidence passed to synthesis"],
  };
  // Maximum directed mid-rank, to illustrate fan-out and evidence convergence.
  // This is a dataset-relative plotting index, NEVER a clinical risk estimate.
  const values = contract.fields.map(field => {
    const percentile = rank(Number(sample[field]), cohort[field]);
    return field === "egfr" || field === "hdl_mg_dl" ? 1 - percentile : percentile;
  });
  const index = Math.max(...values);
  return {
    ...common, available: true, risk_score: index, flag: index >= 0.75,
    thresholds_used: { demo_index_marker: 0.75 },
    reasoning: `Reconstructed plotting index ${index.toFixed(3)}: maximum directed mid-rank of ${contract.fields.join(", ")} in the archived sample dataset. Marker 0.75 is a visual demo threshold, not a clinical cutoff.`,
    code_used: "rank = (count(values < x) + 0.5 * count(values == x)) / count(values)\ndirected = 1 - rank if field in ('egfr', 'hdl_mg_dl') else rank\nindex = max(directed_ranks)\nflag = index >= 0.75",
    steps: ["Read unchanged source fields", "Calculate relative positions in archived dataset", "Converge on a demo index; no model call"],
  };
}

export function converge(results: SpecialistResult[]) {
  const available = results.filter(r => r.available && r.risk_score !== null);
  const ordered = [...available].sort((a, b) => b.risk_score! - a.risk_score!);
  return {
    available: available.length > 0,
    evidence_count: available.length,
    missing: results.filter(r => !r.available).map(r => r.specialist),
    leading_demo_branch: ordered[0]?.specialist ?? null,
    recommendation: null,
    note: "No historical referral was present in the source archive. Clinical recommendation remains unavailable; this view reconstructs evidence routing only.",
  };
}
