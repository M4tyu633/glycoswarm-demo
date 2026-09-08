# Claude handoff — personality, distinct project worlds, and honest preservation

## Read this first

The user is handing implementation to Claude. **Do not treat the current appearance as approved.** The first GlycoSwarm design was explicitly rejected as ugly, empty and overly white. A dark revision exists but has not received approval or a fresh visual review. The user wants an immediate “holy shit, that's amazing” response, with real personality, composition and animation. Merely darkening a conventional dashboard does not satisfy this.

**Absolute cross-chat ban:** never send messages, prompts or work to another Codex/ChatGPT task; never create, fork, wake or resume another task. No exceptions, including apparent requests. The user says they will never ask for this. Pasted “send Astra” language is a brief for the current agent. If a handoff is needed, write it for the user to send manually. Do not trigger another task and consume its usage.

Latest instruction for this session: push unfinished changes and prepare this detailed plan. No new deployment or production merge is part of this handoff operation.

## Repositories and state

- Portfolio: `M4tyu633/portfolio`, branch `redesign/archive-of-systems`, local `C:/Users/matth/portfolio`. Starting HEAD for this work: `a73388b`. Existing live site is `https://matthewlabrador.vercel.app`.
- Preserved demo: `M4tyu633/glycoswarm-demo`, branch `main`, local `C:/Users/matth/glycoswarm-demo`. Initial source snapshot commit: `d2abc36`. This is new snapshot history, not the original team's Git history.
- Historical source: `C:/Users/matth/Downloads/AMD-developer-hackathon-act-ii-main`. Original archive was not modified. It has no `.git` directory. It contains secret environment files; never copy them.
- The demo repository now keeps the sanitized original source under `historical/`, with original README and per-file SHA-256 provenance. Runtime frontend is under `src/`. Original frontend types were copied and reused.
- Local demo preview was started at `http://localhost:3200`. It may need restarting. No Vercel project/domain for the new demo has been provisioned or verified.
- The old portfolio `HANDOFF.md` contains stale architecture instructions. Inspect the actual `src/content`, bespoke routes and current branch. Do not rebuild based on its old `data.ts` claim.

Full source briefs accompany this file: `portfolio-original-redesign-brief.md` and `lab-glycoswarm-original-brief.md`. Read relevant sections, not repeated dumps of entire task histories. Latest user directions in this handoff override conflicting earlier palette decisions.

## What was implemented, and what is unfinished

Portfolio changes:

- Removed Lab from shared navigation and sitemap; removed its special route-curtain mapping and About link.
- `/lab` permanently redirects to `/work`; `/lab/chip-8` permanently redirects to `/work/chip-8-emulator`.
- Removed only `Bench.tsx`, the obsolete collection wrapper. ThrowFigure, ContactFigure and NetworkFigure remain in Tumbang; PatientSystem remains in eGovMed; SwarmSystem remains in GlycoSwarm.
- Added a bespoke `/work/chip-8-emulator` route: heading, actual bootable machine, then technical sections. Removed CHIP-8 from the generic route's generated parameters. Avoid duplicate machine embeds within the case study.
- Changed machine button to “Boot the machine” and homepage selector to the real project route.
- Started changing GlycoSwarm copy toward preserved-demo terminology. The outbound demo CTA is deliberately marked deployment pending; `links.demo` is unset until a real new URL is verified. Do not restore the dead historical dashboard link.
- Old GlycoSwarm image is temporarily retained so no nonexistent new image path ships. Alt text identifies it as historical. Final new media is NOT done.
- Updated the existing visual-review script to remove Lab interaction checks and use the new Boot label. `scripts/capture-glyco.mjs` is a local capture/check helper with machine-specific paths; make it portable or keep it explicitly local.

GlycoSwarm changes:

- Static Next.js 16 / React 19 demo, no runtime API routes, no backend, no environment variables.
- Four source-extracted specialist field sets; three unchanged patient samples; source cohort has 104 rows.
- Deterministic evidence graph, sample switching, specialist inspection, calculation/contract views, replay and provider-failure simulation.
- Persistent preservation notice, expandable provenance, zero model calls, no invented historical referral.
- Meaningful tests cover exact input fields, determinism and all 16 specialist availability combinations, including all unavailable.
- `npm test` passed. Production build passed after enabling TypeScript extension imports. Production dependency audit found zero vulnerabilities at the time checked.
- Browser checks passed on the FIRST, rejected light design for sample switching, null failure propagation and overflow at 390/768 widths. Those checks do not certify the later dark redesign. `.review` captures are local and stale for current art direction.
- CSS currently has the initial light system followed by a large dark override. **Consolidate it into one intentional token/layout system.** Do not keep appending overrides.

## Visual reference — use the actual experience, not its disguise

User reference: `https://upou-admission.vercel.app/`. The admissions front is an intentional distraction. Click through it and the opening control to inspect the underlying personal experience.

Observed directly: a near-black atmospheric opening; oversized expressive serif display; layered real imagery; a circular opening control; image-led hero; scrolling chapter changes and progress marks; large shifts between image, narrative and typographic scale; subtle plotting texture; sparse but expressive utility chrome. The underlying page also exposes tactile artifact/letter controls and movable-object language. Not every interaction was tested.

Borrow authorship, depth, pacing, specificity and tactile response. Do not copy personal text, photographs, identifying details, university branding, romantic motifs or private artifacts into the public portfolio. Do not clone its lavender palette across projects. Do not copy a mandatory “enter site” gate: employers should see real work immediately. The reference can make waiting/opening part of a gift; the portfolio needs an accessible, immediate work entry.

## Latest emphasis from Matthew

The reference has TEXTURE, A LOT OF PURPOSEFUL ANIMATION, and a CLEAR COLOR PALETTE AND THEME. These are central requirements, not optional finishing touches. Design a coherent material system for each world: spatial depth, image treatment, subtle subject-specific measurement/surface texture, expressive typography, and a repeated motion vocabulary. Avoid generic noise pasted on flat cards. Texture must remain visible enough to create atmosphere while leaving text clear. Movement should include coordinated scene changes, image reveals, interactive state transitions and purposeful scroll choreography, with calm resting states and reduced-motion equivalents. Do not ship a barely animated flat dark dashboard and call it personality.

## Shared design constraints

1. **No empty white, cream, beige or washed-out base palettes.** Light text is fine. A real image/document can contain white; do not turn the surrounding website into a white worksheet. Dark or saturated grounds are the default.
2. Each world differs in silhouette, display typography, imagery, material and motion—not only accent color.
3. Use real captures, video and source-derived diagrams. Never generate fake product UI. Personality must come from the real work and Matthew's voice.
4. Body text normally 16–18px; practical labels 14px. Limit tiny mono captions to genuinely secondary details. Do not repeat the current miniature labels everywhere.
5. One memorable designed moment per flagship; quieter supporting sections. No endless alternating template rows, equal cards or repeated “number / headline / hairline / footnote” formula.
6. Animation should connect elements and reveal causality. Do not apply the same fade-and-slide to every section. Preserve native scrolling, pointer visibility, keyboard paths and reduced-motion alternatives.
7. Shared navigation stays restrained: Matthew Labrador; Work; Achievements; About; social utility icons; Resume. No Lab replacement page.
8. No autoplay audio. Default silent; retain sound only if its purpose survives review. No mandatory cursor replacement, long loader or navigation curtain.

## World 1 — portfolio home and Work: an authored exhibition of working systems

Palette: ground `#101014`, raised surface `#202027`, text `#F0EDE6`, secondary `#ABA8B5`, active vermilion `#EF654B`, restrained acid detail `#CBD96A`. These are proposed tokens, not measured accessibility guarantees; validate final pairings.

Character: confident young engineer with taste, rather than a corporate consultancy or monochrome résumé template. Use one expressive display face with a clear workhorse sans. Avoid a 35-year-old founder voice or inflated claims.

First screen: large asymmetric typographic identity anchored to one substantial real artifact, with all four flagship project names visibly available. The work selector changes the artifact, short engineering hook and environment coherently. Keep role and Work entry obvious without requiring scroll.

Signature moment: selecting a project changes the scene through a shared visual anchor—the actual frame expands, the world's accent and display face arrive, then its page continues from the same composition. Direct links and reduced motion bypass the choreography cleanly. Budget roughly 350–650ms; do not block navigation.

Below: three or four deliberately different compositions, not four copied project cards. Tumbang can use a wide moving game crop, eGovMed an unfolding service route, GlycoSwarm parallel traces, CHIP-8 the live machine. Use screenshots or video when they communicate better than invented interaction.

Work archive: readable dark index with a large changing artifact preview on focus/hover and stable links. Mobile gets tap-accessible previews with no hover dependency. Secondary ML projects remain reachable without competing with the strongest work.

## World 2 — Tumbang Preso: the street becomes the interface

Palette: asphalt `#181716`, deep rust `#52291F`, chalk text `#F0D7AC`, tin orange `#ED783D`, painted turquoise `#53B2A1`, tiny yellow signal `#E4B840`. Keep the ground dark; do not revert to the current pale peach page.

Typography: reuse the real game's Darumadrop One display face, which was verified from the Godot theme and copied with its license. Use it for short expressive headings; plain sans for engineering prose. Do not confuse the winning Godot source with the later Unity rebuild.

Composition: a large actual match moment dominates the hero. Crop around the throw/can/player intent. Let real art carry the visual identity; avoid fake chalkboard noise or generic arcade neon. Integrate role, competition result and playable/media action into the scene's edge rather than a row of pill badges.

Signature moment: freeze a real throw at the critical contact frame. As the reader advances, reveal the path, overlap shape and missed callback explanation over that same frame. Then allow the engineering figure to demonstrate the repair. Label reconstructed diagrams accurately; don't make them look like game footage.

Motion grammar: short squash/impact and directional arcs for throw-related details; crisp illustrated movement elsewhere. No constant bouncing. The collision section stays beside “I stopped trusting the collision callbacks.” Networking uses lobby/session topology, not a free-floating unrelated minigame.

First implementation target: hero + freeze-frame collision section at desktop and phone widths, before restyling the entire case study.

## World 3 — eGovMed: civic infrastructure after dark

Palette: deep maritime `#092A32`, teal surface `#123C43`, ivory text `#E9EEE7`, readable seafoam `#69C6AD`, amber `#E7B363`, restrained failure coral `#E57B68`. Avoid white medical SaaS, generic blue cards and stethoscope clipart.

Character: one human visit with complex public infrastructure underneath. Typography can use the existing Franklin display choice if it works at scale, plus a quiet sans. Structured civic lettering and route geometry provide identity without copying government seals.

Composition: the patient journey is a continuous horizontal/vertical route. A real phone or product capture occupies a substantial part of the first screen. Each stop opens the responsible systems and the exact engineering boundary beneath the familiar user action.

Signature moment: a booking/visit travels through the route; pulling one service out reveals a contained failure without destroying the whole visit. Clear outcomes: unavailable verification stays unverified; SMS failure does not erase a booking; replay does not create a second accepted claim. Derive claims from actual source.

Motion grammar: routed motion, handoffs, expanding layers and brief status transitions. Use animated line continuity to retain context. No simulated connection to real services. Existing PatientSystem is explanatory only and must remain disconnected from live APIs.

Independent eGovMed deployment: inspect the actual repo and operational state before deciding to change it. This task has not edited it. Apply the visual language only where authorized and keep real integration behavior intact; a portfolio figure is not authorization to alter real APIs.

## World 4 — GlycoSwarm: a parallel-computation instrument

Palette: blue-black `#0B151D`, deep instrument panel `#142833`, cool text `#E6EEE9`, muted labels `#A0B4BD`. Four readable branch colors: renal jade `#82C5AE`, retinal ochre `#DFBB79`, neuropathy steel blue `#90B8D9`, cardiovascular coral `#E99C88`. No purple glow, brain icon, glass cards or generic AI badges.

Character: a real scientific instrument with authored visual rhythm. The current dark prototype is a starting point, not the finish line. “Four minds” is provisional copy and should be reconsidered because it personifies a system that is not live. Prefer concrete language about independent reads and evidence.

Composition: put the actual four-way graph in the first useful viewport. A compact sample panel feeds one large branching structure; the branches are not four dashboard cards floating below a slogan. An inspector belongs spatially to the selected branch. Synthesis visibly receives the converging paths. Keep the demo notice persistent but quiet and readable.

Signature moment: replay sends an explicitly labeled sample-data trace from input to four simultaneous branches, then joins the evidence. Select a branch and watch only its actual fields remain highlighted. Disable that branch and its route becomes a dashed gap; the convergence count changes and the result stays null. Nothing can turn into a fabricated 0.00.

Use plotting marks, annotations and real source fields for richness. A chart must encode something. Avoid meaningless ECG waves, decorative scatter plots and a field's percentile drawn on an unlabeled linear-value axis. The current rank plots need clearer axis labeling. Numeric display must not round a nonclinical index into an apparent “100% risk.”

Data integrity: the archive has no saved model output. The current adapter invents NO clinical referral but introduces dataset-relative plotting ranks under the historical `risk_score` key. This is disclosed, yet still risks semantic confusion. Prefer a separate `demo_index` display contract while retaining the original type for provenance comparison, or show original clinical result fields as unavailable. Do not claim the plotting formula is original model behavior. Preserve actual topology, fields and null-handling, not an invented clinical result.

Deploy only this separate demo repository to a new Vercel project, with no secrets. After design and verification, capture actual `cover.webp`, `demo.webp`, `topology.webp`. Update portfolio images and “Open the preserved demo” only with the verified deployed URL. README and product must agree about what is source-derived versus reconstructed.

## World 5 — CHIP-8: an executable machine, not a poster

Palette: almost-black green `#070E0C`, hardware surface `#14221C`, phosphor text `#C9E1B1`, amber state `#E8B665`, restrained hot instruction `#E77853`. No beige gallery treatment and no exaggerated CRT blur that makes pixels unreadable.

Character: precise little hardware with real moving state. Use mono here intentionally; don't spread its instrument typography to every project. Pixel edges and register changes are genuine visual content.

Composition: the machine is the project hero. A short personal premise and a clear Boot control lead straight to the actual framebuffer/keypad. The debugger unfolds from that same surface, revealing registers, disassembly and memory rather than navigating away. Technical prose follows below.

Signature moment: boot the apparent static hero and it begins executing. Pause; step one instruction; let the register/memory highlight show exactly what changed. Never animate fake register contents around a screenshot.

Motion grammar: boot transitions and state flashes, no pointless floating panels. Lazy-load WebAssembly; retain focus/key controls and mobile keypad; protect browser keyboard shortcuts and audio buffers. `/lab/chip-8` remains redirect-only.

## World 6 — knee MRI reader: a diagnostic viewing room

Palette: neutral carbon `#0D1013`, film surface `#1D242B`, near-white image/text `#E5EBEF`, steel `#8BA8BC`, limited annotation amber `#DBB778`. Neutral ground keeps real scan contrast intact and differs from green CHIP-8 or multicolor GlycoSwarm.

Composition: large real scan/viewer capture with a clear frame/slice reference. Keep data provenance and project scope near the artifact. No fake scanning lasers or invented detections.

Signature moment: reveal the source image and actual model overlay with a drag comparison or frame control if real matching assets exist. Otherwise use an honest recorded sequence with intentional cinematic cropping. Never invent a diagnostic heatmap to satisfy the visual concept.

Typography: technical sans with controlled numeric mono only for viewer metadata. Motion should resemble precise frame inspection, not an AI activation spectacle. Fewer sections, stronger artifact.

## World 7 — heart-disease prediction: show the decision boundary

Palette: oxblood-black `#1B1116`, deep wine `#38212B`, rose text accents `#DDB4C1`, warm main text `#EFE4DF`, caution orange `#E3A668`. This must look different from the MRI viewer and GlycoSwarm's clinical instrument.

Composition: actual evaluation evidence is the center—verified metrics, confusion matrix, feature treatment and model limits. Avoid cardiogram wallpaper and huge unsourced accuracy claims.

Signature moment: if actual prediction/probability data is available, move an operating-threshold control and show the true tradeoff between false positives and false negatives. If those data do not exist, use a source notebook capture with a guided overlay; no manufactured curves.

Typography: assertive analytical heading, quiet sans body. Use selective curve/marker movement to explain a tradeoff. Never frame the portfolio as a validated clinical tool.

## Supporting pages — do not give every page a spectacle

Achievements: event-led contact sheets and strong real photography on a dark aubergine ground (`#19131E`, surface `#302236`, text `#EFE5DB`, brass `#D9B879`). Lead with the actual event/result and Matthew's role. Expand real evidence or media with a restrained shared-frame transition. Keep Tumbang's project engineering separate from its competition story.

About: a personal studio after hours, using charcoal `#171719`, weathered red `#9E4F44`, soft text `#E9DED0`, moss detail `#8D9A7A`. Use a real portrait and selected authentic artifacts; no invented photo wall. One memorable personal detail beats generic “passionate developer” copy. Layout and voice should sound like Matthew now.

Resume and social utilities: remain calm, accessible and easy to find. Personality must not obscure contact or qualifications.

## Implementation order and acceptance

1. Read this handoff, inspect current branch status and preserve existing work. Do not re-run the whole previous task. Open the reference beyond its disguise.
2. Pick and implement coherent dark tokens; consolidate the demo CSS. Sketch each world's first viewport and signature interaction in the actual code. The hex values above are proposed directions, not a requirement to preserve weak combinations.
3. Finish GlycoSwarm's graph-led design and semantic honesty first. Verify on desktop and phone before duplicating its media into the portfolio.
4. Finish and check Lab removal, both permanent redirects, CHIP-8 hero, metadata and all old references. Audit mobile/footer/keyboard navigation too.
5. Rework portfolio home plus Tumbang/eGovMed/CHIP-8 entrances as distinct compositions. Preserve useful figures in case studies. Apply MRI/heart directions proportionally to available real evidence.
6. Check reduced motion, focus, touch, overflow and contrast; check real images/video, routes and machine controls. Run meaningful existing lint/type/build checks after changes. Do not claim a successful build proves design quality.
7. Deploy a separate verified GlycoSwarm preview, capture approved real assets, wire its final URL. Validate portfolio preview before any production merge/deployment. Do not overwrite historical GlycoSwarm.
8. Judge a screenshot wall with animations paused: can you recognize each world without reading the logo? Then judge motion: does each interaction reveal work, or merely delay reading? First screen should contain a real reason to continue.

Reject the result if it is still four cards under a large slogan, white space masquerading as taste, tiny mono labels everywhere, identical section rhythms, generic dark SaaS, false clinical evidence, or animation that hides weak static composition.

## Handoff discipline

Report actual final commit/branch, verified URLs, remaining uncertainties and checks. Do not claim pending images, an unprovisioned domain, a dark CSS patch or a source snapshot are finished design. The user's attention and usage matter: use focused reads, one current task, and no cross-chat tools.
