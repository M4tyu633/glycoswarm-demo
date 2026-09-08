"use client";

import { useEffect, useRef, useState } from "react";

/* ===========================================================================
 * THE EDGES.
 *
 * The fan-out and fan-in drawn as real routed paths rather than as four CSS
 * pseudo-element stubs. This is the one place on the page where SVG is clearly
 * the right tool: the endpoints are laid out by CSS grid at whatever the
 * viewport happens to be, and the connector has to start at the right edge of
 * a panel, bend, and land on the top edge of a box that is somewhere else.
 *
 * ⚠ THE GEOMETRY IS MEASURED, NOT GUESSED. Every endpoint comes from
 * getBoundingClientRect on the actual node, recomputed by a ResizeObserver, so
 * the routing is correct at any width and after any reflow. An earlier version
 * positioned the connectors with percentage arithmetic derived from the grid's
 * fr values, and it drifted the moment a column's content changed height.
 *
 * ⚠ ALL EIGHT EDGES DRAW AT THE SAME TIME during a replay. No per-branch
 * delay, ever: concurrency is the only claim this diagram makes.
 *
 * ⚠ AN UNAVAILABLE BRANCH GETS A DASHED, MUTED EDGE ON THE OUTBOUND SIDE ONLY.
 * The input still reaches it — the panel was asked — and nothing comes back.
 * That is the honest picture of a provider that did not answer, and it is why
 * the two halves are drawn as separate paths.
 * ======================================================================== */

type Edge = {
  d: string;
  colour: string;
  dashed: boolean;
  key: string;
};

export default function GraphEdges({
  containerRef,
  inputRef,
  branchRefs,
  synthRef,
  colours,
  unavailable,
  stage,
  deps,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLElement | null>;
  branchRefs: React.RefObject<(HTMLElement | null)[]>;
  synthRef: React.RefObject<HTMLElement | null>;
  colours: string[];
  unavailable: boolean[];
  stage: number;
  /** Anything that can change the layout without resizing the container. */
  deps: unknown;
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [edges, setEdges] = useState<Edge[]>([]);
  const raf = useRef(0);

  useEffect(() => {
    const measure = () => {
      const root = containerRef.current;
      const input = inputRef.current;
      const synth = synthRef.current;
      const branches = branchRefs.current ?? [];
      if (!root || !input || !synth) return;

      const r = root.getBoundingClientRect();
      // Below the two-column breakpoint the panels stack and a routed edge
      // between them would cross the whole page. The CSS hides the layer there;
      // bailing out here as well keeps us from measuring a stacked layout.
      if (r.width < 1250) {
        setEdges([]);
        setBox({ w: r.width, h: r.height });
        return;
      }

      const rel = (el: Element) => {
        const b = el.getBoundingClientRect();
        return {
          left: b.left - r.left,
          right: b.right - r.left,
          top: b.top - r.top,
          bottom: b.bottom - r.top,
          cx: b.left + b.width / 2 - r.left,
          cy: b.top + b.height / 2 - r.top,
        };
      };

      const i = rel(input);
      const s = rel(synth);
      const bs = branches.filter(Boolean).map((el) => rel(el as Element));
      if (bs.length !== 4) return;

      // The fan opens from a single point on the input panel's right edge, at
      // the vertical middle of the four branches, and closes to the mirror of
      // that point on the synthesis panel's left edge.
      const top = Math.min(...bs.map((b) => b.top));
      const bottom = Math.max(...bs.map((b) => b.bottom));
      const mid = (top + bottom) / 2;
      const from = { x: i.right, y: mid };
      const to = { x: s.left, y: mid };

      const next: Edge[] = [];
      bs.forEach((b, n) => {
        const gapIn = (b.cx - from.x) * 0.55;
        next.push({
          key: `in-${n}`,
          colour: colours[n],
          dashed: false,
          d: `M ${from.x} ${from.y} C ${from.x + gapIn} ${from.y}, ${b.cx - gapIn * 0.4} ${b.top - 34}, ${b.cx} ${b.top - 2}`,
        });
        const gapOut = (to.x - b.cx) * 0.55;
        next.push({
          key: `out-${n}`,
          colour: colours[n],
          dashed: unavailable[n],
          d: `M ${b.cx} ${b.bottom + 2} C ${b.cx + gapOut * 0.4} ${b.bottom + 34}, ${to.x - gapOut} ${to.y}, ${to.x} ${to.y}`,
        });
      });

      setBox({ w: r.width, h: r.height });
      setEdges(next);
    };

    const schedule = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(measure);
    };

    schedule();
    const ro = new ResizeObserver(schedule);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, inputRef, synthRef, branchRefs, deps, unavailable.join()]);

  if (edges.length === 0) return null;

  return (
    <svg
      className="edges"
      width={box.w}
      height={box.h}
      viewBox={`0 0 ${box.w} ${box.h}`}
      aria-hidden
      data-stage={stage}
    >
      {edges.map((e) => (
        <path
          key={e.key}
          d={e.d}
          fill="none"
          stroke={e.colour}
          strokeWidth="1.25"
          strokeDasharray={e.dashed ? "5 6" : undefined}
          opacity={e.dashed ? 0.4 : 0.85}
        />
      ))}
    </svg>
  );
}
