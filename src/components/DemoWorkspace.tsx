"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { converge, reconstruct } from "../demo/engine";
import source from "../demo/source-data.json";

const AnatomyMap = dynamic(() => import("./AnatomyMap"), { ssr: false, loading: () => <div className="map-loading">Loading the interactive anatomy map…</div> });
const colours: Record<string, string> = { renal: "#81d5bb", retinal: "#efd08a", neuropathy: "#a5b8f7", cardiovascular: "#ef9fa8" };
const labels: Record<string, [string, string]> = { egfr: ["eGFR", "mL/min/1.73m²"], uacr_mg_g: ["UACR", "mg/g"], creatinine_mg_dl: ["Creatinine", "mg/dL"], systolic_bp: ["Systolic BP", "mmHg"], years_with_diabetes: ["Diabetes duration", "years"], a1c_percent: ["HbA1c", "%"], ldl_mg_dl: ["LDL", "mg/dL"], hdl_mg_dl: ["HDL", "mg/dL"], triglycerides_mg_dl: ["Triglycerides", "mg/dL"] };
const descriptions: Record<string, string> = {
  renal: "The kidney specialist reads filtration, albumin and creatinine measurements.",
  retinal: "The retinal specialist uses blood pressure and diabetes duration. It does not analyze retinal images.",
  neuropathy: "The nerve specialist reads diabetes duration and HbA1c from the same patient panel.",
  cardiovascular: "The cardiovascular specialist reads the lipid panel independently of the other agents.",
};
const format = (value: number) => Number(value.toFixed(2)).toString();

export default function DemoWorkspace() {
  const [sample, setSample] = useState(0);
  const [selected, setSelected] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);
  const [phase, setPhase] = useState(3);
  const [panel, setPanel] = useState<'evidence'|'method'>('evidence');
  const timer = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timer.current.forEach(clearTimeout), []);
  const patient = source.samples[sample];
  const contract = source.contracts[selected];
  const results = source.contracts.map(item => reconstruct(patient, item, source.cohort, missing.includes(item.id)));
  const result = results[selected];
  const synthesis = converge(results);
  const activeColour = colours[contract.id];
  function finish() { timer.current.forEach(clearTimeout); timer.current = []; setPhase(3); }
  function run() {
    finish();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setPhase(0);
    timer.current = [setTimeout(() => setPhase(1), 350), setTimeout(() => setPhase(2), 1050), setTimeout(() => setPhase(3), 1700)];
  }
  function chooseSample(index: number) { finish(); setSample(index); }
  return <main className="swarm-app" id="main">
    <header className="swarm-nav"><a href="/" className="swarm-brand"><span className="swarm-brand-mark" aria-hidden="true">✳</span>Glyco<span>Swarm</span></a><span className="swarm-nav-note">MULTI-AGENT SYSTEMS / 2026</span><a href="https://matthewlabrador.vercel.app/work/glycoswarm-ai">About the project ↗</a></header>
    <aside className="swarm-demo-notice"><strong>Interactive demo</strong><span>The hackathon APIs and compute are offline. Explore preserved sample inputs and deterministic demo outputs. No live AI or clinical inference.</span></aside>
    <header className="swarm-heading"><div><p className="swarm-overline">One patient. Four independent perspectives.</p><h1>See the swarm <em>think.</em></h1></div><p>Choose a sample. Follow a specialist.<br />See how the evidence comes together.</p></header>
    <div className="swarm-workspace">
      <aside className="patient-panel" aria-label="Sample patient data"><div className="panel-label"><span>01 / THE INPUT</span><span>NHANES</span></div><h2>Patient panel</h2><p className="panel-intro">De-identified samples preserved from the original project.</p>
        <label htmlFor="sample-patient">Choose a sample</label><select id="sample-patient" value={sample} onChange={event => chooseSample(Number(event.target.value))}>{source.samples.map((item, index) => <option value={index} key={item.patient_id}>Sample {String(index+1).padStart(2,'0')} · {item.age} years · {item.sex}</option>)}</select>
        <div className="patient-demographics"><span><strong>{patient.age}</strong>years</span><span><strong>{patient.sex}</strong>recorded sex</span><span><strong>{format(patient.a1c_percent)}</strong>HbA1c %</span></div>
        <dl className="patient-labs">{Object.entries(labels).map(([field,[name,unit]]) => <div key={field} data-relevant={contract.fields.includes(field)}><dt>{name}<small>{unit}</small></dt><dd>{format(Number(patient[field as keyof typeof patient]))}</dd></div>)}</dl>
        <p className="patient-note">Highlighted measurements are read by the selected specialist.</p>
      </aside>
      <section className="anatomy-panel" aria-label="Explore the specialist network"><div className="panel-label"><span>02 / THE SPECIALISTS</span><span>PARALLEL READS</span></div>
        <div className="anatomy-stage"><div className="anatomy-orbit" aria-hidden="true"></div><AnatomyMap results={results} colours={colours} active={contract.id} onSelect={key => { const index=source.contracts.findIndex(item=>item.id===key); if(index>=0) {setSelected(index);setPanel('evidence');} }} /><span className="anatomy-caption">Drag to rotate · Select a specialist</span></div>
        <div className="specialist-buttons" aria-label="Select a specialist">{source.contracts.map((item,index) => <button key={item.id} type="button" aria-pressed={selected===index} style={{'--branch':colours[item.id]} as CSSProperties} onClick={()=>{setSelected(index);setPanel('evidence');}}><span className="specialist-number">0{index+1}</span><strong>{item.name}</strong><span>{missing.includes(item.id)?'Unavailable':phase<2?'Reading…':`${results[index].risk_score!.toFixed(2)} demo index`}</span></button>)}</div>
        <div className="swarm-run"><button onClick={run} disabled={phase<3} type="button">{phase<3?'Tracing the workflow…':'Replay the workflow'} <span aria-hidden="true">↗</span></button><p role="status">{['Reading sample inputs','Four independent reads','Combining available evidence','Demonstration complete'][phase]}</p></div>
      </section>
      <section className="evidence-panel" style={{'--branch':activeColour} as CSSProperties} aria-labelledby="evidence-title"><div className="panel-label"><span>03 / THE EVIDENCE</span><span>0{selected+1}</span></div><h2 id="evidence-title">{contract.name}</h2><p className="panel-intro">{descriptions[contract.id]}</p>
        <div className="evidence-tabs" aria-label="Evidence detail"><button type="button" aria-pressed={panel==='evidence'} onClick={()=>setPanel('evidence')}>Input & output</button><button type="button" aria-pressed={panel==='method'} onClick={()=>setPanel('method')}>How it works</button></div>
        {panel==='evidence'?<div className="evidence-detail"><div className="demo-index"><span>DATASET-RELATIVE DEMO INDEX</span><strong>{result.available?(phase<2?'—':result.risk_score!.toFixed(2)):'—'}</strong><p>{result.available?'A plotting index for this demonstration. Not a disease probability.':'Provider failure is simulated. No result is substituted.'}</p></div><dl className="contract-values">{Object.entries(result.input_labs).map(([field,value])=><div key={field}><dt>{labels[field][0]}</dt><dd>{format(value)} <small>{labels[field][1]}</small></dd></div>)}</dl></div>:<div className="method-detail"><p>Each specialist receives only its own input fields. The demo calculates their relative position in the archived dataset and passes a plotting index to synthesis.</p><pre>{result.code_used || 'No output: this specialist is unavailable.'}</pre><p>The original system used LLM-generated scoring code. These calculations are a deterministic reconstruction, not saved model output.</p></div>}
        <label className="failure-switch"><input type="checkbox" checked={missing.includes(contract.id)} onChange={()=>{finish();setMissing(previous=>previous.includes(contract.id)?previous.filter(key=>key!==contract.id):[...previous,contract.id]);}}/><span>Simulate this specialist being unavailable</span></label>
        <div className="synthesis-card"><span className="swarm-overline">Synthesis</span><div><strong>{phase<3?'—':synthesis.evidence_count}<small>/4</small></strong><span>specialist outputs<br />available</span></div><p>{synthesis.evidence_count===4?'All four branches contribute independently.':synthesis.evidence_count===0?'No evidence is available. Synthesis remains unavailable.':'Missing evidence stays missing. The remaining branches still contribute.'}</p><p className="clinical-note">Clinical recommendation: unavailable in this preserved demo.</p></div>
      </section>
    </div>
    <section className="swarm-explainer"><div><p className="swarm-overline">What the original system did</p><h2>One graph.<br /><em>Visible decisions.</em></h2></div><div><p>I designed the LangGraph workflow and led the FastAPI and Next.js build. Four specialists read the same patient independently before a synthesis agent combines their findings.</p><details><summary>What is preserved, and what is simulated? <span>+</span></summary><p>The sample data, field contracts, agent topology and anatomical map come from the original source. The temporary hackathon services are no longer available. No historical model outputs or referrals were included in the archive, so this demo uses clearly identified dataset-relative plotting indices. It makes no clinical recommendation.</p></details></div></section>
    <footer className="swarm-footer"><span>GlycoSwarm AI · AMD Developer Hackathon</span><span>Built by Matthew Labrador & team</span><a href="https://matthewlabrador.vercel.app/">Portfolio ↗</a></footer>
  </main>;
}
