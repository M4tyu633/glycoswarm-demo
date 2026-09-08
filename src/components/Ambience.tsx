"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

/* ===========================================================================
 * AMBIENCE.
 *
 * ⚠ NO SURFACE ON THIS SITE IS EVER A FLAT COLOUR. A blank dark background is
 * the fastest way to make a page read as generated, and it is what the first
 * two passes of this demo shipped. There is always something behind the
 * content: slow light, a ruling, drifting motes, and grain.
 *
 * ⚠ AND IT HAS TO ACTUALLY BE VISIBLE. An earlier version of this component
 * rendered correctly and was invisible: it sat at `z-index: -10`, which paints
 * BEHIND the body's own opaque background. It now sits at z-0 with the page
 * content lifted to z-10 above it. If the page ever looks flat again, check
 * that first.
 *
 * Four layers, back to front:
 *   1. drifting fields — five very large, very soft radial blobs on long,
 *      mutually prime durations, so the composition never visibly repeats.
 *      They animate `transform` only: one composited layer, no layout cost.
 *   2. the ruling — a measurement grid at the pitch the instrument's own plots
 *      use, masked so it fades at the edges of the frame.
 *   3. motes — a slow drift of dim particles. Deterministic positions from a
 *      seeded generator rather than Math.random, so the server and the client
 *      agree and React does not warn about a hydration mismatch.
 *   4. the room's falloff — a vignette, so the page edges are never lit.
 *
 * ⚠ IT MUST NOT COMPETE. The movement is 40 to 80 seconds per cycle, slow
 * enough that you only notice it if you stop and look. If a reader can follow
 * a blob with their eye it is too fast or too bright.
 * ======================================================================== */

const FIELDS = [
  { colour: "#1f6b80", size: "84vw", x: "-22%", y: "-26%", dx: 9, dy: 6, s: 47, o: 0.75 },
  { colour: "#2f8f80", size: "62vw", x: "56%", y: "-18%", dx: -7, dy: 9, s: 53, o: 0.45 },
  { colour: "#e0a86b", size: "48vw", x: "70%", y: "56%", dx: -8, dy: -6, s: 61, o: 0.2 },
  { colour: "#1c4a78", size: "70vw", x: "-14%", y: "58%", dx: 10, dy: -7, s: 71, o: 0.5 },
  { colour: "#3a7f96", size: "40vw", x: "30%", y: "26%", dx: -5, dy: 8, s: 79, o: 0.3 },
];

/** Deterministic pseudo-random, so SSR and the client produce the same motes. */
function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function Ambience() {
  const reduced = useReducedMotion();

  /* ⚠ CLIENT ONLY, ON PURPOSE. Motion writes its own inline style on mount
   * (opacity and will-change among others) and the server markup cannot match
   * it, which React reports as a hydration mismatch on every field and every
   * mote. This layer is decorative and `aria-hidden`, so there is nothing to
   * gain from server-rendering it and a real error to avoid. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const motes = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: seeded(i + 1) * 100,
        top: seeded(i + 41) * 100,
        size: 1 + seeded(i + 91) * 2.2,
        drift: 14 + seeded(i + 131) * 26,
        seconds: 26 + seeded(i + 171) * 34,
        opacity: 0.1 + seeded(i + 211) * 0.28,
      })),
    [],
  );

  // ⚠ After every hook, never before one.
  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {FIELDS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[80px]"
          style={{
            width: f.size,
            height: f.size,
            background: `radial-gradient(circle, ${f.colour} 0%, transparent 66%)`,
            opacity: f.o,
            left: f.x,
            top: f.y,
            willChange: "transform",
          }}
          animate={
            reduced
              ? undefined
              : {
                  x: [`0%`, `${f.dx}%`, `0%`],
                  y: [`0%`, `${f.dy}%`, `0%`],
                  scale: [1, 1.14, 1],
                }
          }
          transition={{ duration: f.s, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* The ruling. Same pitch the inspector's plots are drawn on. */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff12 1px, transparent 1px), linear-gradient(90deg, #ffffff12 1px, transparent 1px)",
          backgroundSize: "1.75rem 1.75rem",
          maskImage:
            "radial-gradient(120% 100% at 50% 40%, black 15%, transparent 80%)",
        }}
      />

      {/* Motes. Enough to feel like air in the room, few enough to ignore. */}
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-ink"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            opacity: m.opacity,
            willChange: "transform",
          }}
          animate={
            reduced
              ? undefined
              : { y: [0, -m.drift, 0], x: [0, m.drift * 0.35, 0] }
          }
          transition={{
            duration: m.seconds,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* The room's falloff. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(135% 110% at 50% 42%, transparent 34%, #050c12 100%)",
        }}
      />
    </div>
  );
}
