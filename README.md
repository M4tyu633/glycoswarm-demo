# GlycoSwarm · preserved demo

A source-derived, interactive preservation of **GlycoSwarm AI**, built by Team Snowfall for the **AMD Developer Hackathon 2026 (ACT II, Track 3)**. This repository is separate from the historical project and does not change its deployment.

## Demo mode

The original hackathon APIs and compute endpoints are no longer online. This preserved demo uses sample inputs and deterministic reconstructed outputs to demonstrate the system's structure. **It does not perform live clinical inference.** This distinction is also visible inside the product.

The supplied archive contains no saved model outputs or clinical referrals. Nothing here is described as a recorded inference run. Clinical recommendations remain unavailable instead of being invented.

## Original project and provenance

The initial commit preserves a sanitized copy of the actual `AMD-developer-hackathon-act-ii-main` source archive supplied by Matthew Labrador. It contained no `.git` directory. This repository starts new history from that snapshot; it does not claim to preserve the original Git history or sole authorship of the team's work.

The untouched source files are now under `historical/`. `PROVENANCE.json` records SHA-256 checksums relative to their original paths. Environment files, credentials, caches and build output were excluded. The original README is retained at `historical/README.md`; its descriptions concern the historical system and are not claims about this demo's live capabilities. The original README mentions MIT, but no LICENSE file was supplied; this reconstruction does not invent a license grant for historical code.

## Original architecture

Next.js → FastAPI → LangGraph `StateGraph` → four parallel specialist nodes → synthesis. The original provider chain used Gemma / Ollama on AMD MI300X with a Fireworks hosted fallback. See `historical/backend/run_pipeline.py`, `specialists.py`, `agent_core.py` and `synthesis_agent.py`.

Renal reads eGFR, UACR and creatinine. Retinal reads systolic blood pressure and diabetes duration. Neuropathy reads duration and HbA1c. Cardiovascular reads LDL, HDL and triglycerides. The original model wrote and executed scoring code, including its own cutoffs. Those cutoffs were not fixed in the source and are not recreated as clinical rules here.

## What is real

- Source-extracted specialist field lists and source-compatible result contracts.
- Three unchanged, de-identified sample records from the archived NHANES-derived CSV.
- The original fan-out / fan-in topology, represented interactively in the browser.
- Null scores and flags for unavailable specialists, with missing evidence carried through synthesis.
- Preserved original implementation and architecture documentation.

## What is reconstructed

The interface and its deterministic graph adapter are new. `scripts/preserve-data.py` extracts source contracts, sample rows and the sorted values of the archived dataset. `src/demo/engine.ts` calculates **nonclinical plotting indices** using directed empirical mid-ranks across those 104 archived records. For eGFR and HDL the direction is inverted; the maximum directed rank becomes the branch index. A demo marker of 0.75 exists only to illustrate the boolean result contract.

The historical `risk_score` field name is retained for contract comparison, but its reconstructed value is a dataset-relative plotting index, **not a disease probability or clinically validated score**. This mapping is disclosed in the inspector. No original model-generated formula, threshold or clinical result is claimed. The new synthesis adapter shows available and missing evidence; it intentionally returns no clinical referral.

## What is not happening

No live clinical inference, MI300X inference, Ollama calls, Fireworks calls, generated clinical advice, clinical validation or background model work. Replay animates data flow only. The browser does not execute the historical Python backend. There are no API routes, environment-variable requirements or patient-entry forms.

## Run and deploy

Use Node.js 22.18+ (or Node 24) and Python 3 only if regenerating the extracted data.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm run build` creates a static `out/` directory. Import this repository into a **new** Vercel project at its root, using Next.js defaults. No secrets or backend are required. Do not attach it to the historical deployment. To regenerate the source-derived fixture: `npm run data`.

Tests cover exact specialist field mapping, deterministic reconstruction, and all 16 combinations of specialist availability, including all providers unavailable. No missing score becomes zero; no missing specialist becomes the leading branch.
