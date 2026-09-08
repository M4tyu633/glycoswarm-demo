"use client";

import { motion } from "motion/react";
import type { SpecialistResult } from "../types/index.ts";

/* ===========================================================================
 * THE EVIDENCE RIVER.
 *
 * This is the whole product. Not four cards in a row: one stream that leaves
 * the patient, SEPARATES into four lanes that never touch, and rejoins at a
 * single point. The architecture is the composition — if you deleted every
 * word on this screen the picture would still say "four independent reads,
 * then one synthesis".
 *
 * ⚠ WHAT THIS REPLACED, AND WHY. The first two passes drew four bordered
 * rectangles side by side under a heading. That is a monitoring dashboard: it
 * says "here are four things" and nothing about how they relate. Rectangles
 * cannot show separation and convergence, so the lanes are real SVG paths that
 * physically diverge and physically meet.
 *
 * Geometry lives in ONE place — `LANES` and the `path()` builder below — and
 * the HTML labels are positioned from the same numbers, so type can never
 * drift off the ribbon it belongs to.
 *
 * ⚠ THE FOUR LANES ARE ALWAYS SYNCHRONOUS. Every animation in this file runs
 * the four together with identical timing. There is no stagger, no cascade and
 * no sequence, because concurrency is the only claim the topology makes and
 * staggering would animate its opposite.
 *
 * ⚠ AN UNAVAILABLE SPECIALIST BREAKS ITS OUTBOUND LANE AND NOTHING ELSE. The
 * inbound half stays solid: the patient's data still went in. The outbound
 * half becomes a dashed gap, the pulse never leaves, and the count at the
 * junction drops. What must never happen is a lane that carries a zero.
 * ======================================================================== */

const W = 1000;
const H = 470;
const START_X = 8;
const END_X = 992;
const MID_Y = H / 2;
/** Where each lane runs flat, as a fraction of the box. */
const LANE_Y = [0.175, 0.39, 0.61, 0.825].map((f) => f * H);
const FAN_IN = 330;
const FAN_OUT = 670;

const IN = (y: number) =>
  `C ${START_X + 190} ${MID_Y}, ${FAN_IN - 190} ${y}, ${FAN_IN} ${y}`;
const OUT = (y: number) =>
  `C ${FAN_OUT + 190} ${y}, ${END_X - 190} ${MID_Y}, ${END_X} ${MID_Y}`;

const inbound = (y: number) => `M ${START_X} ${MID_Y} ${IN(y)}`;
const flat = (y: number) => `M ${FAN_IN} ${y} L ${FAN_OUT} ${y}`;
const outbound = (y: number) => `M ${FAN_OUT} ${y} ${OUT(y)}`;
/** The whole lane as one path, so a normalised dash can travel its full run. */
const full = (y: number) =>
  `M ${START_X} ${MID_Y} ${IN(y)} L ${FAN_OUT} ${y} ${OUT(y)}`;

const spring = { type: "spring" as const, stiffness: 200, damping: 28 };

/* ---------------------------------------------------------------------------
 * THE SPINE — the same topology on a phone.
 *
 * ⚠ NOT THE FAN, SHRUNK. At 390px the four lanes collapse into each other and
 * the labels stack on top of one another; the first attempt at this was
 * unreadable. A vertical spine says the same thing correctly: one input at the
 * top, four branches hanging off it at the same level of authority, one join at
 * the bottom. No branch is above another in the reading order by accident.
 * ------------------------------------------------------------------------ */
function Spine({
  contracts,
  results,
  colours,
  focus,
  onFocus,
  stage,
  evidenceCount,
}: {
  contracts: { id: string; name: string; fields: string[] }[];
  results: SpecialistResult[];
  colours: Record<string, string>;
  focus: number;
  onFocus: (i: number) => void;
  stage: number;
  evidenceCount: number;
}) {
  return (
    <div className="md:hidden">
      <p className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-signal uppercase">
        <span className="size-2 rounded-full bg-signal" aria-hidden />
        Patient panel in
      </p>

      <ul className="relative ml-1 border-l border-rule pl-6">
        {contracts.map((c, i) => {
          const on = focus === i;
          const r = results[i];
          const colour = colours[c.id];
          return (
            <li key={c.id} className="relative py-5">
              {/* the stub off the spine */}
              <span
                aria-hidden
                className="absolute top-1/2 -left-6 h-px w-6"
                style={{
                  background: colour,
                  opacity: r.available ? 1 : 0.35,
                  ...(r.available
                    ? {}
                    : {
                        backgroundImage: `repeating-linear-gradient(to right, ${colour} 0 4px, transparent 4px 8px)`,
                        background: undefined,
                      }),
                }}
              />
              <motion.button
                onClick={() => onFocus(i)}
                aria-pressed={on}
                animate={{ opacity: on ? 1 : 0.6 }}
                transition={spring}
                className="flex w-full items-baseline justify-between gap-4 text-left"
              >
                <span>
                  <span
                    className="block font-mono text-[10px] tracking-[0.2em]"
                    style={{ color: colour }}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className="block text-[1.5rem] leading-none font-medium tracking-[-0.03em]"
                    style={{ color: on ? colour : "var(--color-ink)" }}
                  >
                    {c.name}
                  </span>
                  <span className="mt-1.5 block text-[11px] text-muted">
                    {c.fields.map((f) => FIELD_SHORT[f] ?? f).join(" · ")}
                  </span>
                </span>
                <span
                  className="font-mono text-[1.75rem] leading-none tracking-[-0.05em]"
                  style={{
                    color: r.available ? colour : "var(--color-muted)",
                  }}
                >
                  {stage < 2 ? "—" : r.available ? r.risk_score!.toFixed(2) : "N/A"}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      <p className="mt-1 flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-signal uppercase">
        <span className="size-2 rounded-full bg-signal" aria-hidden />
        Synthesis
        <span className="ml-auto font-mono text-[1.5rem] tracking-[-0.04em] text-ink normal-case">
          {stage < 3 ? "—" : evidenceCount}
          <span className="text-muted">/4</span>
        </span>
      </p>
    </div>
  );
}

export default function EvidenceRiver({
  contracts,
  results,
  colours,
  focus,
  onFocus,
  stage,
  evidenceCount,
  booted,
}: {
  contracts: { id: string; name: string; fields: string[] }[];
  results: SpecialistResult[];
  colours: Record<string, string>;
  focus: number;
  onFocus: (i: number) => void;
  stage: number;
  evidenceCount: number;
  /** False until the boot sequence has finished. While false the lanes draw
   *  themselves as bare geometry and the type has not arrived: the plotter is
   *  laying out its own frame before it puts any ink down. */
  booted: boolean;
}) {
  const flowing = stage >= 1;
  /** Every path draws itself once, all four together, over 1.1s. */
  const draw = {
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1] as const },
  };

  return (
    <>
      {/* Two compositions, not one that scales. See Spine. */}
      <Spine
        contracts={contracts}
        results={results}
        colours={colours}
        focus={focus}
        onFocus={onFocus}
        stage={stage}
        evidenceCount={evidenceCount}
      />

      <div
      /* ⚠ Width is capped by the viewport HEIGHT, not just by the column.
         The box holds a 1000x470 ratio, so left to fill the width it was
         620px tall on a 1366x768 laptop and pushed the control strip under
         the fold. 19rem is the headline plus the strip plus the padding. */
      className="relative mx-auto hidden aspect-[1000/470] md:block"
      style={{ width: "min(100%, calc((100svh - 19rem) * 2.128))" }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          {contracts.map((c) => (
            <radialGradient key={c.id} id={`glow-${c.id}`}>
              <stop offset="0%" stopColor={colours[c.id]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colours[c.id]} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* The light each lane throws on the ground it runs over. This is where
            the depth comes from; there is no card and no border to make it. */}
        {contracts.map((c, i) => (
          <motion.ellipse
            key={`bed-${c.id}`}
            cx={(FAN_IN + FAN_OUT) / 2}
            cy={LANE_Y[i]}
            rx={230}
            ry={62}
            fill={`url(#glow-${c.id})`}
            initial={false}
            animate={{ opacity: booted ? (focus === i ? 1 : 0.22) : 0 }}
            transition={{ ...spring, delay: booted ? 0 : 0 }}
          />
        ))}

        {contracts.map((c, i) => {
          const on = focus === i;
          const gone = !results[i].available;
          const colour = colours[c.id];
          const width = on ? 8 : 3.5;
          const dim = on ? 1 : 0.5;

          return (
            <g key={c.id}>
              {/* inbound: the patient's data reaching the specialist. It stays
                  solid even when the specialist is unavailable, because the
                  request was still made. */}
              <motion.path
                d={inbound(LANE_Y[i])}
                fill="none"
                stroke={colour}
                strokeLinecap="round"
                initial={draw.initial}
                animate={{ ...draw.animate, strokeWidth: width, opacity: dim }}
                transition={{ ...spring, pathLength: draw.transition }}
              />
              <motion.path
                d={flat(LANE_Y[i])}
                fill="none"
                stroke={colour}
                strokeLinecap="round"
                initial={draw.initial}
                animate={{
                  ...draw.animate,
                  strokeWidth: width,
                  opacity: gone ? 0.2 : dim,
                }}
                transition={{ ...spring, pathLength: draw.transition }}
              />
              {/* outbound: the evidence leaving. This is the half that breaks. */}
              <motion.path
                d={outbound(LANE_Y[i])}
                fill="none"
                stroke={colour}
                strokeLinecap="round"
                strokeDasharray={gone ? "7 9" : undefined}
                initial={draw.initial}
                animate={{
                  ...draw.animate,
                  strokeWidth: gone ? 1.5 : width,
                  opacity: gone ? 0.28 : dim,
                }}
                transition={{ ...spring, pathLength: draw.transition }}
              />

              {/* The pulse. `pathLength={1}` normalises the dash units, so one
                  set of numbers is correct at any viewport. All four run with
                  identical timing. */}
              {flowing && !gone ? (
                <motion.path
                  key={`pulse-${stage}-${c.id}-${gone}`}
                  d={full(LANE_Y[i])}
                  fill="none"
                  stroke={colour}
                  strokeWidth={on ? 10 : 6}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="0.07 0.93"
                  initial={{ strokeDashoffset: 1, opacity: 0.95 }}
                  animate={{ strokeDashoffset: 0, opacity: 0.95 }}
                  transition={{ duration: 1.7, ease: [0.3, 0.1, 0.2, 1] }}
                />
              ) : null}
            </g>
          );
        })}

        {/* the two junctions */}
        <circle cx={START_X + 2} cy={MID_Y} r="9" fill="#e0a86b" />
        <motion.circle
          cx={END_X - 2}
          cy={MID_Y}
          r="9"
          fill="#e0a86b"
          initial={false}
          animate={{ scale: stage >= 3 ? 1 : 0.4, opacity: stage >= 3 ? 1 : 0.4 }}
          transition={spring}
          style={{ transformOrigin: `${END_X - 2}px ${MID_Y}px` }}
        />
      </svg>

      {/* ---- the type, positioned off the same geometry ---- */}
      {contracts.map((c, i) => {
        const on = focus === i;
        const r = results[i];
        const colour = colours[c.id];
        return (
          <motion.button
            key={c.id}
            onClick={() => onFocus(i)}
            aria-pressed={on}
            initial={false}
            animate={{
              opacity: booted ? (on ? 1 : 0.55) : 0,
              y: booted ? 0 : 10,
            }}
            whileHover={{ opacity: 1 }}
            transition={spring}
            /* ⚠ Anchored by its BOTTOM edge to the lane, not centred on it.
               Centring put the top lane's type above the frame where it was
               clipped, and struck a 13px ribbon through the other three. */
            className="absolute flex -translate-y-full items-end gap-x-5 pb-4 text-left"
            style={{
              left: `${(FAN_IN / W) * 100}%`,
              top: `${(LANE_Y[i] / H) * 100}%`,
              width: `${((FAN_OUT - FAN_IN) / W) * 100}%`,
            }}
          >
            <span className="flex flex-col">
              <span
                className="font-mono text-[11px] tracking-[0.2em] uppercase"
                style={{ color: colour }}
              >
                0{i + 1}
              </span>
              <motion.span
                animate={{ scale: on ? 1 : 0.86 }}
                transition={spring}
                className="origin-left text-[clamp(1.25rem,2.4vw,2.2rem)] leading-none font-medium tracking-[-0.03em] whitespace-nowrap"
                style={{ color: on ? colour : "var(--color-ink)" }}
              >
                {c.name}
              </motion.span>
              <span className="mt-1.5 text-[clamp(0.7rem,0.85vw,0.8rem)] text-muted">
                {c.fields
                  .map((f) => FIELD_SHORT[f] ?? f)
                  .join("  ·  ")}
              </span>
            </span>

            <span className="ml-auto flex flex-col items-end">
              <motion.span
                animate={{ scale: on ? 1 : 0.82 }}
                transition={spring}
                className="origin-right font-mono leading-none tracking-[-0.05em]"
                style={{
                  color: r.available ? colour : "var(--color-muted)",
                  fontSize: "clamp(1.5rem, 3.4vw, 3.1rem)",
                }}
              >
                {stage < 2 ? "—" : r.available ? r.risk_score!.toFixed(2) : "N/A"}
              </motion.span>
              <span className="mt-1 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
                {r.available ? "demo index" : "no answer"}
              </span>
            </span>
          </motion.button>
        );
      })}

      {/* the patient end */}
      <p
        className="absolute -translate-y-1/2 font-mono text-[11px] tracking-[0.18em] text-signal uppercase"
        style={{ left: 0, top: "50%", marginTop: "-2.6em" }}
      >
        Patient
        <span className="mt-1 block text-muted">panel in</span>
      </p>

      {/* the synthesis end */}
      <div
        className="absolute right-0 -translate-y-1/2 text-right"
        style={{ top: "50%", marginTop: "-3.4em" }}
      >
        <p className="font-mono text-[11px] tracking-[0.18em] text-signal uppercase">
          Synthesis
        </p>
        <motion.p
          key={evidenceCount}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-[clamp(1.6rem,3vw,2.6rem)] leading-none tracking-[-0.05em]"
        >
          {stage < 3 ? "—" : evidenceCount}
          <span className="text-muted">/4</span>
        </motion.p>
        <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
          reads arrived
        </p>
      </div>
    </div>
    </>
  );
}

const FIELD_SHORT: Record<string, string> = {
  egfr: "eGFR",
  uacr_mg_g: "UACR",
  creatinine_mg_dl: "Creatinine",
  systolic_bp: "Systolic BP",
  years_with_diabetes: "Duration",
  a1c_percent: "HbA1c",
  ldl_mg_dl: "LDL",
  hdl_mg_dl: "HDL",
  triglycerides_mg_dl: "Triglycerides",
};
