"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/* ===========================================================================
 * THE BOOT.
 *
 * An instrument powering up and calibrating, not a spinner. Every line it
 * prints is a real number from the archive it is about to draw — 104 records,
 * 4 lanes, 9 fields, 3 samples — so the sequence is a genuine manifest of what
 * loaded rather than fake progress theatre.
 *
 * ⚠ IT MUST NEVER BE A GATE. Total run is under two seconds, any key or click
 * skips it immediately, `prefers-reduced-motion` skips it entirely, and the
 * page underneath is fully rendered and interactive the whole time — this is a
 * curtain over a finished room, not a loader in front of an empty one. A demo
 * that makes an employer wait to see the work has already failed.
 *
 * The visual idea is borrowed from how a plotter starts: it draws its own
 * frame first, checks its axes, and only then puts ink down. That is also
 * literally what the graph behind it is doing — see the `boot` prop threaded
 * into EvidenceRiver and AnatomyMap, which come up as wireframe and then take
 * their colour.
 * ======================================================================== */

const STEPS = [
  ["Archive", "104 records"],
  ["Contracts", "4 specialists"],
  ["Panel", "9 fields"],
  ["Samples", "3 preserved"],
  ["Inference", "none — demo mode"],
];

export default function Boot({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(-1);
  const [gone, setGone] = useState(false);

  /* ⚠ THE CALLBACK GOES IN A REF, AND THE EFFECT DEPENDS ON NOTHING BUT
   * `reduced`. The parent passes an inline arrow, so `onDone` is a new function
   * on every render; with it in the dependency array the effect tore down and
   * re-armed its timers on every single re-render and the sequence could never
   * reach its final step. The boot ran forever and the curtain never lifted. */
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (reduced) {
      setGone(true);
      done.current();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i), 180 + i * 170));
    });
    timers.push(setTimeout(() => done.current(), 900));
    timers.push(setTimeout(() => setGone(true), 1750));

    const skip = () => {
      timers.forEach(clearTimeout);
      done.current();
      setGone(true);
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {!gone ? (
        <motion.div
          className="room grain fixed inset-0 z-50 flex flex-col justify-between bg-ground px-[max(1.5rem,5vw)] py-8"
          initial={{ opacity: 1 }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          {/* The calibration grid draws itself, then fades. */}
          <motion.svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.16] }}
            transition={{ duration: 1.2, times: [0, 0.4, 1] }}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {Array.from({ length: 9 }, (_, i) => (
              <motion.line
                key={`v${i}`}
                x1={(i + 1) * 10}
                y1="0"
                x2={(i + 1) * 10}
                y2="100"
                stroke="#8fa7b2"
                strokeWidth="0.08"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: i * 0.02 }}
              />
            ))}
          </motion.svg>

          <p className="relative font-mono text-[11px] tracking-[0.22em] text-signal uppercase">
            Glycoswarm
          </p>

          <div className="relative grid gap-8">
            <h2 className="display max-w-[9ch] text-[clamp(2.5rem,9vw,8rem)]">
              {"Calibrating".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.022, duration: 0.4 }}
                  className="inline-block"
                >
                  {ch}
                </motion.span>
              ))}
            </h2>

            <ul className="grid max-w-[34rem] gap-1.5">
              {STEPS.map(([k, v], i) => (
                <motion.li
                  key={k}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step >= i ? 1 : 0.15 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-baseline gap-3 font-mono text-[12px] tracking-[0.08em] text-muted"
                >
                  <span className="text-ink">{k}</span>
                  <span
                    aria-hidden
                    className="h-px flex-1 translate-y-[-3px] bg-rule"
                  />
                  <span className={step >= i ? "text-signal" : ""}>{v}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.span
            className="relative block h-px origin-left bg-signal"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
