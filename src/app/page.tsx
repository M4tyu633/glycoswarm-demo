"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Ambience from "../components/Ambience";
import Boot from "../components/Boot";
import EvidenceRiver from "../components/EvidenceRiver";
import { converge, rank, reconstruct } from "../demo/engine";
import source from "../demo/source-data.json";

/* ===========================================================================
 * GLYCOSWARM — PRESERVED DEMO
 *
 * One sentence made operable: FOUR SPECIALISTS READ DIFFERENT EVIDENCE AT THE
 * SAME TIME, AND ONLY THEN DOES ANYTHING COMBINE.
 *
 * The page is paced, not packed. Four movements, each a different height and
 * rhythm: the river, the patient, the contract, the provenance. There is no
 * dashboard grid anywhere in this file and no bordered card; separation comes
 * from space, light and a violent jump between display and body type.
 *
 * The stack does real work rather than decorating:
 *   react-three-fiber  the anatomical patient, preserved from the original
 *                      dashboard. Click an organ, focus that lane.
 *   svg                the four lanes, which physically diverge and rejoin.
 *   motion             every state change, on springs.
 *   tailwind           all layout and state. globals.css is tokens + materials.
 *
 * ⚠ WHAT THIS DEMO WILL NOT DO, and every one was a real temptation:
 *   - it will not print a clinical recommendation. The archive contained none
 *     and inventing one would be the worst thing on the page.
 *   - it will not show 0.00 for an unavailable specialist. Unavailable is
 *     `null`, drawn as a broken lane.
 *   - it will not call anything. No API routes, no credentials, no model calls.
 *   - it will not describe its plotting index as a risk probability.
 * ======================================================================== */

const AnatomyMap = dynamic(() => import("../components/AnatomyMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

const COLOUR: Record<string, string> = {
  renal: "#82c5ae",
  retinal: "#dfbb79",
  neuropathy: "#90b8d9",
  cardiovascular: "#e99c88",
};

const FIELDS: Record<string, [string, string]> = {
  egfr: ["eGFR", "mL/min/1.73m²"],
  uacr_mg_g: ["UACR", "mg/g"],
  creatinine_mg_dl: ["Creatinine", "mg/dL"],
  systolic_bp: ["Systolic BP", "mmHg"],
  years_with_diabetes: ["Diabetes duration", "years"],
  a1c_percent: ["HbA1c", "%"],
  ldl_mg_dl: ["LDL", "mg/dL"],
  hdl_mg_dl: ["HDL", "mg/dL"],
  triglycerides_mg_dl: ["Triglycerides", "mg/dL"],
};

const CASES = ["Contrasting", "Distribution", "Competing"];
const fmt = (v: number) => Number(v.toFixed(2)).toString();
const MONO = "font-mono text-[11px] tracking-[0.22em] uppercase";
const PAD = "px-[max(1.5rem,5vw)]";
const spring = { type: "spring" as const, stiffness: 220, damping: 28 };

export default function Page() {
  const [sample, setSample] = useState(0);
  const [focus, setFocus] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);
  const [stage, setStage] = useState(3);
  const [tab, setTab] = useState("Evidence");
  const [notes, setNotes] = useState(false);
  const [booted, setBooted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const patient = source.samples[sample];
  const contract = source.contracts[focus];
  const colour = COLOUR[contract.id];
  const results = source.contracts.map((c) =>
    reconstruct(patient, c, source.cohort, missing.includes(c.id)),
  );
  const result = results[focus];
  const synthesis = converge(results);

  function stop() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage(3);
  }

  /* The signature interaction. One panel travels into all four lanes at once.
     ⚠ No per-lane delay, ever: concurrency is the claim. */
  function replay() {
    stop();
    if (reduced) return;
    setStage(0);
    timers.current = [1, 2, 3].map((s) => setTimeout(() => setStage(s), s * 640));
  }

  function focusById(id: string) {
    const i = source.contracts.findIndex((c) => c.id === id);
    if (i >= 0) {
      setFocus(i);
      setTab("Evidence");
    }
  }

  return (
    <div className="grain relative isolate min-h-dvh">
      {/* ⚠ Never a flat ground. See the component. */}
      <Ambience />
      {/* The instrument comes up before the page does. See the component: it is
          a curtain over a finished room, never a gate in front of an empty one. */}
      <Boot onDone={() => setBooted(true)} />

      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-panel-2 focus:px-4 focus:py-2"
        href="#river"
      >
        Skip to the demonstration
      </a>

      {/* ---------------------------------------------------------------
       * CHROME. Two lines and a control. Nothing is boxed.
       * ------------------------------------------------------------- */}
      <header
        className={`relative z-10 flex items-center justify-between gap-6 pt-7 pb-5 ${PAD}`}
      >
        <a href="/" className={`${MONO} text-ink`}>
          Glycoswarm
          <span className="ml-3 text-muted">AI / 2026</span>
        </a>
        <motion.button
          whileHover={{ x: -2 }}
          onClick={() => setNotes(!notes)}
          aria-expanded={notes}
          aria-controls="notes"
          className={`${MONO} flex items-center gap-3 text-signal`}
        >
          <motion.span
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2.6, repeat: Infinity }}
            className="size-1.5 rounded-full bg-signal"
            aria-hidden
          />
          Demo mode
          <span aria-hidden className="text-muted">
            {notes ? "close" : "notes"}
          </span>
        </motion.button>
      </header>

      <AnimatePresence initial={false}>
        {notes ? (
          <motion.aside
            id="notes"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="relative z-10 overflow-hidden"
          >
            <div
              className={`grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-20 ${PAD}`}
            >
              <h2 className="display max-w-[14ch] text-[clamp(1.75rem,3.4vw,3rem)]">
                The system, without the temporary infrastructure.
              </h2>
              <div className="max-w-[62ch] space-y-5 text-[17px] leading-relaxed text-ink-2">
                <p>
                  The original build ran LangGraph and FastAPI behind a Next.js
                  front end, with Gemma on an AMD MI300X through Ollama and a
                  hosted fallback. This version preserves the field contracts,
                  the archived samples, the graph topology and the anatomical
                  map from the original dashboard.
                </p>
                <p>
                  No recorded model outputs or referrals were present in the
                  supplied archive. The numbers here are reconstructed
                  dataset-relative plotting indices, not historical results,
                  disease probabilities or validated clinical scores. The
                  clinical referral stays unavailable rather than invented.
                </p>
                <a
                  href="https://github.com/M4tyu633/glycoswarm-demo"
                  target="_blank"
                  rel="noreferrer"
                  className={`${MONO} inline-block text-signal`}
                >
                  Source and provenance &#8599;
                </a>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* ---------------------------------------------------------------
       * I. THE RIVER. The whole idea, at full size, above the fold.
       * ------------------------------------------------------------- */}
      {/* ---------------------------------------------------------------
       * I. THE RIVER. The graph IS the hero: it runs the full width behind
       * the type rather than sitting in a box underneath it.
       * ------------------------------------------------------------- */}
      {/* ---------------------------------------------------------------
       * I. THE RIVER. The graph IS the hero: full width, behind the type,
       * with only a headline above it and one control strip below.
       *
       * ⚠ Nothing else goes in this section. An earlier pass put the intro
       * paragraph and the sample picker inside it and both landed on top of a
       * lane. Copy that needs to be read lives after the fold.
       * ------------------------------------------------------------- */}
      <section
        id="river"
        className={`relative z-10 grid min-h-[100svh] grid-rows-[auto_minmax(0,1fr)_auto] gap-6 pt-[clamp(1rem,3vh,2.5rem)] pb-[clamp(1rem,3vh,2rem)] ${PAD}`}
      >
        <h1 className="display max-w-[19ch] text-[clamp(2.75rem,5.9vw,6.5rem)]">
          Four specialists.
          <span className="block text-muted">One evidence trail.</span>
        </h1>

        <div className="min-h-0 overflow-hidden py-2">
          <EvidenceRiver
            contracts={source.contracts}
            results={results}
            colours={COLOUR}
            focus={focus}
            onFocus={(i) => {
              setFocus(i);
              setTab("Evidence");
            }}
            stage={stage}
            evidenceCount={synthesis.evidence_count}
            booted={booted}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
          <div className="flex items-baseline gap-5">
            <span className={`${MONO} text-muted`}>Sample</span>
            {CASES.map((name, i) => (
              <button
                key={name}
                aria-pressed={sample === i}
                onClick={() => {
                  stop();
                  setSample(i);
                  setMissing([]);
                }}
                className="relative pb-1.5 text-[15px] transition-colors"
                style={{
                  color: sample === i ? undefined : "var(--color-muted)",
                }}
              >
                {name}
                {sample === i ? (
                  <motion.span
                    layoutId="sample-underline"
                    className="absolute inset-x-0 bottom-0 h-px bg-signal"
                    transition={spring}
                  />
                ) : null}
              </button>
            ))}
          </div>

          <motion.button
            onClick={replay}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`${MONO} flex items-center gap-3 text-signal`}
          >
            <motion.span
              aria-hidden
              animate={{ rotate: stage < 3 ? 360 : 0 }}
              transition={
                stage < 3
                  ? { duration: 1.4, repeat: Infinity, ease: "linear" }
                  : spring
              }
              className="inline-block"
            >
              &#8635;
            </motion.span>
            {stage < 3 ? "Tracing" : "Replay the trace"}
          </motion.button>
        </div>
      </section>

      <section
        className={`relative z-10 grid gap-x-16 gap-y-8 pt-[clamp(3rem,8vh,6rem)] pb-[clamp(3rem,8vh,6rem)] lg:grid-cols-2 ${PAD}`}
      >
        <p className="max-w-[34ch] text-[clamp(1.25rem,2.4vw,2rem)] leading-[1.2] tracking-[-0.02em]">
          One laboratory panel separates into four independent reads. None of
          them can see another&rsquo;s answer.
        </p>
        <div className="max-w-[58ch] space-y-4 text-[15px] leading-relaxed text-muted">
          <p>
            Only after all four have finished does anything combine. The
            synthesis stage receives four separate answers and never averages
            them into one.
          </p>
          <p>
            The original hackathon compute and API services are no longer
            online. This preserved version uses source-derived sample data and
            deterministic outputs to demonstrate the original system.{" "}
            <span className="text-ink">
              No live clinical inference is performed.
            </span>
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------
       * II. THE PATIENT. Full-bleed figure, type held to one side.
       * ------------------------------------------------------------- */}
      <section className="relative z-10 grid items-center gap-x-16 gap-y-10 pb-[clamp(4rem,10vh,8rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="relative h-[clamp(26rem,62vh,46rem)]">
          <AnatomyMap
            results={results}
            colours={COLOUR}
            active={contract.id}
            onSelect={focusById}
          />
          <p
            className={`${MONO} pointer-events-none absolute bottom-0 left-[max(1.5rem,5vw)] text-muted`}
          >
            {patient.patient_id}
            <span className="ml-4 text-ink">
              {patient.age} &middot; {patient.sex} &middot;{" "}
              {patient.years_with_diabetes}y
            </span>
          </p>
        </div>

        <div className={`lg:pr-[max(1.5rem,5vw)] ${PAD} lg:pl-0`}>
          <p className={`${MONO} text-signal`}>The patient</p>
          <h2 className="display mt-5 max-w-[13ch] text-[clamp(2.25rem,4.4vw,4.25rem)]">
            Every lane reads a different part of the same body.
          </h2>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-ink-2">
            Turn the figure and press an organ to follow that specialist.
            Markers are coloured by which specialist owns them, never by a
            severity band: this demo has no clinical score to grade, and a red
            marker would be inventing one.
          </p>

          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
            {source.contracts.map((c, i) => (
              <button
                key={c.id}
                onClick={() => {
                  setFocus(i);
                  setTab("Evidence");
                }}
                className="text-left text-[15px] transition-opacity"
                style={{
                  color: focus === i ? COLOUR[c.id] : "var(--color-muted)",
                  opacity: results[i].available ? 1 : 0.5,
                }}
              >
                {c.name}
                {results[i].available ? "" : " · no answer"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
       * III. THE SPECIALIST. One at a time, at reading size.
       * ------------------------------------------------------------- */}
      <section
        className={`relative z-10 pb-[clamp(4rem,10vh,8rem)] ${PAD}`}
        aria-label="Specialist inspector"
      >
        <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
          <span className={`${MONO} text-muted`}>0{focus + 1} / Inspect</span>
          <AnimatePresence mode="wait">
            <motion.h2
              key={contract.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="display text-[clamp(2.5rem,6vw,5.5rem)]"
              style={{ color: colour }}
            >
              {contract.name}
            </motion.h2>
          </AnimatePresence>
          <p className="ml-auto max-w-[30ch] text-[15px] leading-relaxed text-muted">
            {contract.fields.length} input fields, one explicit result contract,
            and nothing shared with the other three.
          </p>
        </div>

        <div className="mt-10 flex gap-9">
          {["Evidence", "Calculation", "Contract"].map((t) => (
            <button
              key={t}
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className="relative pb-2 text-[15px] transition-colors"
              style={{ color: tab === t ? colour : "var(--color-muted)" }}
            >
              {t}
              {tab === t ? (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 bottom-0 h-px"
                  style={{ background: colour }}
                  transition={spring}
                />
              ) : null}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${tab}-${contract.id}-${sample}-${result.available}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24 }}
            className="pt-10"
            aria-live="polite"
          >
            {tab === "Evidence" ? (
              <>
                <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
                  <span
                    className="display font-mono text-[clamp(3.5rem,9vw,7.5rem)]"
                    style={{ color: result.available ? colour : "var(--color-muted)" }}
                  >
                    {result.available ? result.risk_score!.toFixed(3) : "null"}
                  </span>
                  <span className="max-w-[34ch] text-[15px] leading-relaxed text-muted">
                    {result.available
                      ? "A relative demo index: this sample's position in the archived dataset. Not a clinical risk."
                      : "This specialist returned nothing. No value is substituted anywhere downstream."}
                  </span>
                </div>

                <div className="mt-12 grid gap-x-14 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {contract.fields.map((field) => {
                    const value = Number(patient[field as keyof typeof patient]);
                    const values =
                      source.cohort[field as keyof typeof source.cohort];
                    const position = rank(value, values);
                    return (
                      <div key={field}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-[15px] text-muted">
                            {FIELDS[field][0]}
                          </span>
                          <span className="font-mono text-[22px] tracking-[-0.03em]">
                            {fmt(value)}
                            <small className="ml-2 font-sans text-[11px] text-muted">
                              {FIELDS[field][1]}
                            </small>
                          </span>
                        </div>
                        {/* ⚠ A chart has to encode something. The axis is the
                            archived cohort, the marker is this sample's
                            mid-rank, and the end labels are the real minimum
                            and maximum of that column. */}
                        <div
                          className="relative mt-5 h-6"
                          role="img"
                          aria-label={`${FIELDS[field][0]} sits at the ${Math.round(position * 100)}th position of ${source.cohortSize} archived records`}
                        >
                          <span className="absolute inset-x-0 top-1/2 h-px bg-rule" />
                          <motion.span
                            className="absolute top-0 h-6 w-px -translate-x-1/2"
                            style={{ background: colour }}
                            initial={false}
                            animate={{ left: `${position * 100}%` }}
                            transition={{ ...spring, stiffness: 160 }}
                          >
                            <span
                              className="absolute top-1/2 -left-[3.5px] size-[7px] -translate-y-1/2 rounded-full"
                              style={{ background: colour }}
                            />
                          </motion.span>
                        </div>
                        <div className="mt-2.5 flex justify-between font-mono text-[10px] tracking-[0.1em] text-muted uppercase">
                          <span>{fmt(values[0])}</span>
                          <span>n={source.cohortSize}</span>
                          <span>{fmt(values[values.length - 1])}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}

            {tab === "Calculation" ? (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
                <pre
                  className="overflow-x-auto border-l-2 pl-6 font-mono text-[14px] leading-loose break-words whitespace-pre-wrap text-ink-2"
                  style={{ borderColor: colour }}
                >
                  {result.code_used ??
                    "risk_score = null\nflag = null\navailable = false"}
                </pre>
                <div className="max-w-[52ch] space-y-4 text-[15px] leading-relaxed text-muted">
                  <p>
                    A deterministic reconstruction. The original specialist wrote
                    and executed its own Python, including its own cutoffs; that
                    code was not archived, so this is a stated substitute rather
                    than a recovered formula.
                  </p>
                  <p>{result.reasoning}</p>
                  <p>
                    Lower eGFR and HDL ranks are inverted for this
                    visualisation. The 0.75 marker is an arbitrary demo
                    threshold, not a clinical cutoff.
                  </p>
                </div>
              </div>
            ) : null}

            {tab === "Contract" ? (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
                <pre
                  className="overflow-x-auto border-l-2 pl-6 font-mono text-[14px] leading-loose break-words whitespace-pre-wrap text-ink-2"
                  style={{ borderColor: colour }}
                >
                  {JSON.stringify(
                    {
                      specialist: result.specialist,
                      available: result.available,
                      risk_score: result.risk_score,
                      flag: result.flag,
                      used_llm: false,
                      input_labs: result.input_labs,
                      thresholds_used: result.thresholds_used,
                    },
                    null,
                    2,
                  )}
                </pre>
                <p className="max-w-[52ch] text-[15px] leading-relaxed text-muted">
                  The original field names, with reconstructed values. The
                  historical <span className="text-signal">risk_score</span> key
                  is kept so the shape stays comparable to the archive; the
                  value it carries here is a nonclinical plotting index.
                </p>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4">
          <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            aria-pressed={!result.available}
            onClick={() => {
              stop();
              setMissing((prev) =>
                prev.includes(contract.id)
                  ? prev.filter((x) => x !== contract.id)
                  : [...prev, contract.id],
              );
            }}
            className={`${MONO} flex items-center gap-4`}
            style={{ color: result.available ? "var(--color-signal)" : colour }}
          >
            <span aria-hidden>{result.available ? "—" : "+"}</span>
            {result.available
              ? `Break the ${contract.name.toLowerCase()} lane`
              : "Restore the lane"}
          </motion.button>
          <p className="max-w-[56ch] text-[15px] leading-relaxed text-muted">
            The outbound half goes dashed, the pulse never leaves, the marker on
            the patient goes hollow, and the count at the junction drops.
            Nothing turns into a zero.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------
       * IV. THE INPUT CONTRACT. A typographic sheet, no table chrome.
       * ------------------------------------------------------------- */}
      <section className={`relative z-10 pb-[clamp(4rem,10vh,8rem)] ${PAD}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <h2 className="display text-[clamp(1.75rem,3.4vw,3rem)]">
            One panel. Nine values.
          </h2>
          <p className={`${MONO} text-muted`}>
            Lit: what {contract.name.toLowerCase()} reads
          </p>
        </div>

        <dl className="mt-10 grid gap-x-12 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(FIELDS).map(([field, [name, unit]]) => {
            const on = contract.fields.includes(field);
            return (
              <motion.div
                key={field}
                animate={{ opacity: on ? 1 : 0.36 }}
                transition={{ duration: 0.28 }}
                className="flex items-baseline justify-between gap-5 border-b border-rule pb-3"
              >
                <dt className="text-[15px] text-muted">
                  {name}
                  <span className="ml-2 text-[11px]">{unit}</span>
                </dt>
                <motion.dd
                  animate={{ color: on ? colour : "var(--color-ink)" }}
                  className="font-mono text-[clamp(1.25rem,1.9vw,1.75rem)] tracking-[-0.04em]"
                >
                  {fmt(Number(patient[field as keyof typeof patient]))}
                </motion.dd>
              </motion.div>
            );
          })}
        </dl>

        <p className="mt-8 max-w-[62ch] text-[15px] leading-relaxed text-muted">
          Unchanged fields from the archived source dataset. Two specialists
          read <span className="text-ink">diabetes duration</span>. Nothing else
          is shared, which is why four lanes and not one.
        </p>
      </section>

      {/* ---------------------------------------------------------------
       * V. PROVENANCE.
       * ------------------------------------------------------------- */}
      <footer
        className={`relative z-10 flex flex-wrap items-baseline justify-between gap-6 border-t border-rule py-10 ${PAD}`}
      >
        <p className="max-w-[52ch] text-[15px] leading-relaxed text-muted">
          <span className="text-ink">Preserved, not connected.</span> Zero model
          calls, no credentials, no clinical validation. The clinical referral
          the original system produced was not in the archive and is not
          reconstructed here.
        </p>
        <a
          href="https://github.com/M4tyu633/glycoswarm-demo"
          target="_blank"
          rel="noreferrer"
          className={`${MONO} text-signal`}
        >
          Source and preservation notes &#8599;
        </a>
      </footer>
    </div>
  );
}
