"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import source from "../demo/source-data.json";
import { converge, rank, reconstruct } from "../demo/engine";

const fieldLabels: Record<string, [string, string]> = {
  egfr: ["eGFR", "mL/min/1.73m²"], uacr_mg_g: ["UACR", "mg/g"],
  creatinine_mg_dl: ["Creatinine", "mg/dL"], systolic_bp: ["Systolic BP", "mmHg"],
  years_with_diabetes: ["Diabetes duration", "years"], a1c_percent: ["HbA1c", "%"],
  ldl_mg_dl: ["LDL", "mg/dL"], hdl_mg_dl: ["HDL", "mg/dL"],
  triglycerides_mg_dl: ["Triglycerides", "mg/dL"],
};
const cases = ["Contrasting branches", "A different distribution", "Competing inputs"];
const fmt = (v: number) => Number(v.toFixed(2)).toString();

export default function Page() {
  const [selected, setSelected] = useState(0);
  const [focus, setFocus] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);
  const [stage, setStage] = useState(3);
  const [tab, setTab] = useState("Evidence");
  const [info, setInfo] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const patient = source.samples[selected];
  const contract = source.contracts[focus];
  const results = source.contracts.map(c => reconstruct(patient, c, source.cohort, missing.includes(c.id)));
  const result = results[focus];
  const synthesis = converge(results);
  function cancelReplay() { timers.current.forEach(clearTimeout); timers.current = []; setStage(3); }
  function replay() {
    cancelReplay();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setStage(0);
    timers.current = [1, 2, 3].map(s => setTimeout(() => setStage(s), s * 650));
  }
  function toggleMissing(id: string) {
    cancelReplay();
    setMissing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  return <>
    <a className="skip" href="#workspace">Skip to the demonstration</a>
    <header className="topbar">
      <a className="brand" href="/" aria-label="GlycoSwarm home"><span className="brand-mark" aria-hidden>G<span>↗</span></span> GLYCOSWARM <span className="edition">AI / 2026</span></a>
      <button className="preservation" aria-expanded={info} aria-controls="preservation-note" onClick={() => setInfo(!info)}><i aria-hidden /> Demo mode <span>· Preservation notes</span> <b aria-hidden>{info ? "−" : "+"}</b></button>
    </header>
    <div className="notice">Original hackathon services are offline. This demo uses preserved sample inputs and deterministic reconstructions. <strong>No live clinical inference.</strong></div>
    {info && <aside id="preservation-note" className="preservation-note">
      <div><span className="eyebrow">What survived</span><h2>The system, without the temporary infrastructure.</h2></div>
      <div><p>The original build used LangGraph, FastAPI and Next.js, with Gemma on AMD MI300X / Ollama and a hosted fallback. This version preserves the actual field contracts, sample data and graph topology.</p><p>No recorded model outputs or referrals were found in the supplied archive. The numbers here are reconstructed dataset-relative plotting indices—not historical results, disease probabilities or validated clinical scores. Clinical referral output stays unavailable.</p><a href="https://github.com/M4tyu633/glycoswarm-demo" target="_blank" rel="noreferrer">Source & provenance ↗</a></div>
    </aside>}
    <main id="workspace">
      <section className="masthead">
        <div><p className="eyebrow">GlycoSwarm / AMD Developer Hackathon 2026</p><h1>Four minds.<br /><em>One evidence trail.</em></h1></div>
        <div className="masthead-note"><span className="cross" aria-hidden>+</span><p>A laboratory panel fans out to four independent specialists. Follow the inputs, inspect each contract, and see what reaches synthesis.</p><p className="small">Source archive: AMD Developer Hackathon 2026<br />Team Snowfall · reconstructed September 2026</p></div>
      </section>
      <section className="casebar" aria-label="Preserved sample cases">
        <span className="eyebrow">Sample case</span>
        <div className="cases">{cases.map((name, i) => <button key={name} aria-pressed={selected === i} onClick={() => { cancelReplay(); setSelected(i); setMissing([]); }}><span>0{i + 1}</span>{name}</button>)}</div>
        <button className="replay" onClick={replay}>{stage < 3 ? "Restart trace ↻" : "Replay data flow ↻"}</button>
      </section>
      <div className="workspace" data-stage={stage}>
        <section className="lab-panel">
          <div className="section-label"><span>01 / INPUT</span><span aria-hidden>↘</span></div>
          <h2>Laboratory panel</h2>
          <div className="patient-id">{patient.patient_id}<span>Archived sample</span></div>
          <dl className="demographics"><div><dt>Age</dt><dd>{patient.age}</dd></div><div><dt>Sex</dt><dd>{patient.sex}</dd></div><div><dt>Duration</dt><dd>{patient.years_with_diabetes}<small> y</small></dd></div></dl>
          <dl className="labs">{Object.entries(fieldLabels).map(([field, [name, unit]]) => <div key={field} className={contract.fields.includes(field) ? "is-read" : ""} style={{ "--branch": contract.color } as CSSProperties}><dt>{name}<small>{unit}</small></dt><dd>{fmt(Number(patient[field as keyof typeof patient]))}</dd></div>)}</dl>
          <p className="small lab-note">Unchanged fields from the source NHANES dataset. Highlighted values feed the selected specialist.</p>
        </section>
        <section className="graph" aria-label="Four parallel specialist branches">
          <div className="section-label"><span>02 / PARALLEL READS</span><span>4 branches</span></div>
          <div className="fan-label"><span className="junction" />Patient input <span className="line" /> START</div>
          <div className="branches">
            {source.contracts.map((c, i) => {
              const r = results[i];
              return <button key={c.id} className={`branch ${focus === i ? "selected" : ""} ${!r.available ? "unavailable" : ""}`} style={{ "--branch": c.color } as CSSProperties} aria-pressed={focus === i} onClick={() => { setFocus(i); setTab("Evidence"); }}>
                <span className="node-index">0{i + 1}</span><span className="branch-copy"><strong>{c.name}</strong><small>{c.fields.map(f => fieldLabels[f][0]).join(" / ")}</small></span>
                <svg className="branch-fieldplot" viewBox="0 0 200 48" aria-hidden="true">{c.fields.map((field, fi) => { const values = source.cohort[field as keyof typeof source.cohort]; const x = 12 + rank(Number(patient[field as keyof typeof patient]), values) * 176; const y = 9 + fi * 14; return <g key={field}><path d={`M12 ${y} H188`} /><circle cx={x} cy={y} r="3" /></g>; })}</svg>
                <span className="branch-value">{stage < 2 ? "—" : r.available ? r.risk_score!.toFixed(2) : "N/A"}<small>{r.available ? "demo index" : "unavailable"}</small></span>
                <span className="trace-track" aria-hidden><span style={{ width: r.available ? `${r.risk_score! * 100}%` : "0%" }} /></span>
              </button>;
            })}
          </div>
          <div className="fan-label bottom"><span className="junction" />Evidence convergence <span className="line" /> {stage < 3 ? "…" : `${synthesis.evidence_count}/4`}</div>
          <div className="synthesis" aria-live="polite">
            <div className="section-label"><span>03 / SYNTHESIS</span><span>↓</span></div>
            <h2>{stage < 3 ? "Tracing preserved inputs…" : synthesis.missing.length ? "Missing stays missing." : "Separate inputs. Shared evidence."}</h2>
            <p>{stage < 3 ? "A visual replay of the graph; no inference is running." : `${synthesis.evidence_count} reconstructed outputs converge. ${synthesis.missing.length ? `Unavailable: ${synthesis.missing.join(", ")}. No zero scores are substituted.` : "Each branch keeps its own input and result contract."}`}</p>
            <div className="referral"><span>Clinical referral</span><strong>Unavailable in archive</strong></div>
            <p className="small">No historical referral was found. This reconstruction does not invent one.</p>
          </div>
        </section>
        <section className="inspector" style={{ "--branch": contract.color } as CSSProperties} aria-label="Specialist inspector">
          <div className="section-label"><span>INSPECT / 0{focus + 1}</span><span className="branch-dot" /></div>
          <h2>{contract.name}</h2>
          <p className="inspector-intro">{contract.fields.length} input fields → one explicit result contract.</p>
          <div className="inspect-tabs" aria-label="Inspector views">{["Evidence", "Calculation", "Contract"].map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>
          <div className="inspect-content" aria-live="polite">
            {tab === "Evidence" && <>
              <div className="index-heading"><span>{result.available ? "Relative demo index" : "Specialist unavailable"}</span><strong>{result.available ? result.risk_score!.toFixed(3) : "null"}</strong></div>
              <p className="small">Dataset position, not clinical risk. The original model chose its own cutoffs; those outputs were not archived.</p>
              <div className="distribution">{contract.fields.map(field => {
                const value = Number(patient[field as keyof typeof patient]);
                const values = source.cohort[field as keyof typeof source.cohort];
                const position = rank(value, values);
                return <div className="measurement" key={field}><div><span>{fieldLabels[field][0]}</span><strong>{fmt(value)} <small>{fieldLabels[field][1]}</small></strong></div><div className="plot" aria-label={`${fieldLabels[field][0]} at dataset percentile ${Math.round(position * 100)}`}><span className="ticks" /><i style={{ left: `${position * 100}%` }} /></div><div className="plot-label"><span>{fmt(values[0])}</span><span>source range</span><span>{fmt(values[values.length - 1])}</span></div></div>;
              })}</div>
              <p className="small">Each marker shows this sample’s rank among {source.cohortSize} archived records. Range labels show actual minimum and maximum values.</p>
            </>}
            {tab === "Calculation" && <><p>Deterministic reconstruction</p><pre>{result.code_used ?? "risk_score = null\nflag = null\navailable = false"}</pre><p className="small">{result.reasoning}</p><p className="small">Lower eGFR / HDL ranks are inverted for this visualization. The 0.75 marker is an arbitrary demo marker, not a clinical threshold.</p></>}
            {tab === "Contract" && <><p className="small">Original field names, reconstructed values. The historical <code>risk_score</code> key carries a nonclinical plotting index here.</p><pre>{JSON.stringify({ specialist: result.specialist, available: result.available, risk_score: result.risk_score, flag: result.flag, used_llm: false, input_labs: result.input_labs, thresholds_used: result.thresholds_used }, null, 2)}</pre></>}
          </div>
          <button className="failure-control" aria-pressed={!result.available} onClick={() => toggleMissing(contract.id)}><span aria-hidden>{result.available ? "−" : "+"}</span>{result.available ? "Simulate specialist unavailable" : "Restore demo output"}</button>
          <p className="small">Try the failure path. Its evidence becomes null all the way to synthesis.</p>
        </section>
      </div>
      <footer><p><strong>Preserved, not connected.</strong> Zero model calls. No credentials. No clinical validation.</p><a href="https://github.com/M4tyu633/glycoswarm-demo" target="_blank" rel="noreferrer">Read the source & preservation notes ↗</a></footer>
    </main>
  </>;
}
