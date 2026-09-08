"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { SpecialistResult } from "../types/index.ts";

/* ===========================================================================
 * THE PATIENT.
 *
 * The anatomical risk map from the original GlycoSwarm dashboard, preserved.
 * The rig, the hotspot anatomy and the limb maths below are the team's own
 * work: see historical/frontend/src/features/dashboard/components/OrganRiskMap3D.tsx,
 * which is left untouched. This is an adaptation of it for the preserved demo,
 * not a rewrite — the geometry constants are carried across unchanged so the
 * figure is the same figure.
 *
 * ⚠ ONE DELIBERATE DEPARTURE FROM THE ORIGINAL, AND IT IS AN HONESTY FIX. The
 * historical version coloured each hotspot by a red/amber/green severity band
 * derived from `risk_score`. In this demo `risk_score` carries a dataset-
 * relative plotting index, NOT a clinical risk, so a red marker would be
 * inventing a severity the archive never produced. Hotspots are therefore
 * coloured BY SPECIALIST — the same four branch colours used everywhere else —
 * and an unavailable specialist is drawn hollow and muted rather than green.
 * The legend under the canvas says exactly that.
 *
 * Everything else is real: the figure is procedural geometry (no model file to
 * load), the hotspots sit at the anatomical positions the original placed them
 * at, and clicking one selects that branch in the graph.
 * ======================================================================== */

type HotspotKey = "retinal" | "cardiovascular" | "renal" | "neuropathy";

const LABELS: Record<HotspotKey, string> = {
  retinal: "Retina",
  renal: "Kidneys",
  neuropathy: "Nerves",
  cardiovascular: "Heart and vessels",
};

/* --- the rig. Pelvis-centred frame, y = 0 at the hips. Carried across from
 * the original component unchanged. --------------------------------------- */
const HEAD_R = 0.115;
const HEAD_Y = 1.05;
const TORSO_Y = 0.585;
const TORSO_R = 0.156;
const TORSO_LEN = 0.4;
const SHOULDER_X = 0.21;
const SHOULDER_Y = 0.82;
const ARM_LEN = 0.55;
const ARM_R = 0.045;
const ARM_ANGLE = 0.25;
const HIP_X = 0.085;
const LEG_LEN = 0.62;
const LEG_R = 0.065;
const LEG_ANGLE = 0.05;
const HIP_Y = TORSO_Y - TORSO_LEN / 2 - 0.035;

function limbEndpoint(
  pivot: [number, number, number],
  length: number,
  angle: number,
  side: number,
): [number, number, number] {
  const [px, py, pz] = pivot;
  return [
    px + length * Math.sin(side * angle),
    py - length * Math.cos(side * angle),
    pz,
  ];
}

const FIGURE_TOP_Y = HEAD_Y + HEAD_R;
const FIGURE_BOTTOM_Y = HIP_Y - LEG_LEN * Math.cos(LEG_ANGLE) - LEG_R;
const RIG_Y_OFFSET = -(FIGURE_TOP_Y + FIGURE_BOTTOM_Y) / 2;

const TORSO_EMBED = 0.065;
const HEAD_EMBED = 0.03;
const ARM_TIP_PULLBACK = 0.05;
const LEG_TIP_PULLBACK = 0.06;

const hotspots: Record<
  HotspotKey,
  { points: [number, number, number][]; labelOffset: [number, number, number] }
> = {
  retinal: {
    points: [
      [-0.04, HEAD_Y + 0.01, HEAD_R - HEAD_EMBED],
      [0.04, HEAD_Y + 0.01, HEAD_R - HEAD_EMBED],
    ],
    labelOffset: [0, 0.2, 0],
  },
  cardiovascular: {
    points: [[-0.06, TORSO_Y + 0.14, TORSO_R - TORSO_EMBED]],
    labelOffset: [0, 0.2, 0],
  },
  renal: {
    points: [
      [-0.075, TORSO_Y - 0.13, -(TORSO_R - TORSO_EMBED)],
      [0.075, TORSO_Y - 0.13, -(TORSO_R - TORSO_EMBED)],
    ],
    labelOffset: [0, -0.22, -0.08],
  },
  neuropathy: {
    points: [
      limbEndpoint(
        [-SHOULDER_X, SHOULDER_Y, 0],
        ARM_LEN - ARM_TIP_PULLBACK,
        ARM_ANGLE,
        -1,
      ),
      limbEndpoint(
        [SHOULDER_X, SHOULDER_Y, 0],
        ARM_LEN - ARM_TIP_PULLBACK,
        ARM_ANGLE,
        1,
      ),
      limbEndpoint([-HIP_X, HIP_Y, 0], LEG_LEN - LEG_TIP_PULLBACK, LEG_ANGLE, -1),
      limbEndpoint([HIP_X, HIP_Y, 0], LEG_LEN - LEG_TIP_PULLBACK, LEG_ANGLE, 1),
    ],
    labelOffset: [0, -0.22, 0],
  },
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/** Translucent figure from primitive geometry. Limbs hang from nested pivot
 *  groups, which is why they read as joints rather than as floating capsules. */
function Figure() {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#2f7f8c"),
        transparent: true,
        opacity: 0.42,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        emissive: new THREE.Color("#4fb8ad"),
        emissiveIntensity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  );

  return (
    <group position={[0, RIG_Y_OFFSET, 0]}>
      <mesh position={[0, HEAD_Y, 0]} material={material} renderOrder={1}>
        <sphereGeometry args={[HEAD_R, 32, 32]} />
      </mesh>
      <mesh position={[0, TORSO_Y, 0]} material={material} renderOrder={1}>
        <capsuleGeometry args={[TORSO_R, TORSO_LEN, 16, 32]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group
          key={`arm${side}`}
          position={[side * SHOULDER_X, SHOULDER_Y, 0]}
          rotation={[0, 0, side * ARM_ANGLE]}
        >
          <mesh
            position={[0, -ARM_LEN / 2, 0]}
            material={material}
            renderOrder={1}
          >
            <capsuleGeometry args={[ARM_R, ARM_LEN - ARM_R * 2, 16, 32]} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group
          key={`leg${side}`}
          position={[side * HIP_X, HIP_Y, 0]}
          rotation={[0, 0, side * LEG_ANGLE]}
        >
          <mesh
            position={[0, -LEG_LEN / 2, 0]}
            material={material}
            renderOrder={1}
          >
            <capsuleGeometry args={[LEG_R, LEG_LEN - LEG_R * 2, 16, 32]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ScanRing() {
  const y =
    limbEndpoint([HIP_X, HIP_Y, 0], LEG_LEN, LEG_ANGLE, 1)[1] -
    LEG_R +
    RIG_Y_OFFSET;
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={0}>
      <ringGeometry args={[0.52, 0.56, 48]} />
      <meshBasicMaterial
        color="#64808c"
        transparent
        opacity={0.32}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Markers({
  results,
  colours,
  active,
  onHover,
  onSelect,
}: {
  results: SpecialistResult[];
  colours: Record<string, string>;
  active: string | null;
  onHover: (k: string | null) => void;
  onSelect: (k: string) => void;
}) {
  const byId = useMemo(
    () =>
      results.reduce<Record<string, SpecialistResult>>((acc, r) => {
        acc[r.specialist] = r;
        return acc;
      }, {}),
    [results],
  );

  return (
    <group position={[0, RIG_Y_OFFSET, 0]}>
      {(Object.keys(hotspots) as HotspotKey[]).map((key) => {
        const found = byId[key];
        if (!found) return null;
        const meta = hotspots[key];
        const isActive = active === key;
        // Colour is the SPECIALIST, never a severity band. See the file note.
        const colour = found.available ? colours[key] : "#7e929b";
        const r = isActive ? 0.034 : 0.02;

        return (
          <group key={key}>
            {meta.points.map((p, i) => (
              <group key={i} position={p}>
                {/* Oversized invisible hit target, so a 20px dot is still
                    reachable with a thumb. */}
                <mesh
                  onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                    e.stopPropagation();
                    onHover(key);
                    document.body.style.cursor = "pointer";
                  }}
                  onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                    e.stopPropagation();
                    onHover(null);
                    document.body.style.cursor = "auto";
                  }}
                  onClick={(e: ThreeEvent<MouseEvent>) => {
                    e.stopPropagation();
                    onSelect(key);
                  }}
                >
                  <sphereGeometry args={[0.1, 10, 10]} />
                  <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>

                {isActive ? (
                  <mesh renderOrder={18}>
                    <sphereGeometry args={[r + 0.036, 16, 16]} />
                    <meshBasicMaterial
                      color={colour}
                      transparent
                      opacity={0.22}
                      depthWrite={false}
                      depthTest={false}
                    />
                  </mesh>
                ) : null}

                <mesh renderOrder={19}>
                  <sphereGeometry args={[r * 1.6, 14, 14]} />
                  <meshBasicMaterial
                    color={colour}
                    transparent
                    opacity={found.available ? 0.28 : 0.14}
                    depthWrite={false}
                    depthTest={false}
                  />
                </mesh>

                <mesh renderOrder={20}>
                  <sphereGeometry args={[r, 16, 16]} />
                  {found.available ? (
                    <meshStandardMaterial
                      color={colour}
                      emissive={colour}
                      emissiveIntensity={0.9}
                      roughness={0.35}
                      transparent
                      depthTest={false}
                    />
                  ) : (
                    /* Unavailable is hollow and grey. It is never a colour on
                       a severity ramp, because there is no severity to show. */
                    <meshBasicMaterial
                      color={colour}
                      wireframe
                      transparent
                      opacity={0.85}
                      depthTest={false}
                    />
                  )}
                </mesh>
              </group>
            ))}

            {isActive ? (
              <Html
                position={[
                  meta.points[0][0] + meta.labelOffset[0],
                  meta.points[0][1] + meta.labelOffset[1],
                  meta.points[0][2] + meta.labelOffset[2],
                ]}
                center
                occlude={false}
                style={{ pointerEvents: "none" }}
              >
                <span
                  className="border border-rule bg-ground/90 px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] whitespace-nowrap uppercase"
                  style={{ color: colour }}
                >
                  {LABELS[key]}
                </span>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

export default function AnatomyMap({
  results,
  colours,
  active,
  onSelect,
}: {
  results: SpecialistResult[];
  colours: Record<string, string>;
  active: string | null;
  onSelect: (k: string) => void;
}) {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const [hover, setHover] = useState<string | null>(null);

  if (webgl === null) return <div className="h-full w-full" />;

  if (!webgl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-6 text-center">
        <span className="text-sm text-muted">
          This browser cannot draw the 3D patient map.
        </span>
        <span className="text-xs text-muted">
          Every finding it shows is also in the branches beside it.
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* A WebGL mesh cannot take DOM focus, so the keyboard path is a set of
          real buttons driving the same state. */}
      <div className="sr-only">
        {(Object.keys(hotspots) as HotspotKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onFocus={() => setHover(key)}
            onBlur={() => setHover(null)}
            onClick={() => onSelect(key)}
          >
            {LABELS[key]}
            {active === key ? " (selected)" : ""}
          </button>
        ))}
      </div>

      <Canvas
        camera={{ position: [0, 0.05, 2.75], fov: 38 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={0.9} color="#dfeef0" />
        <pointLight position={[-2, 0.6, -1.2]} intensity={0.5} color="#3ba8b6" />
        <pointLight position={[0.5, 1, 1.8]} intensity={0.35} color="#f2f7f5" />
        <Suspense fallback={null}>
          <Figure />
          <ScanRing />
          <Markers
            results={results}
            colours={colours}
            active={hover ?? active}
            onHover={setHover}
            onSelect={onSelect}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2.1}
          maxDistance={3.4}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI - Math.PI / 5}
          autoRotate={!reduced}
          autoRotateSpeed={1.4}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
