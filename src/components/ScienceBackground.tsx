"use client";
import React, { useEffect, useRef, useMemo } from "react";

/**
 * ScienceBackground
 * A responsive, performant, canvas-based animated background that renders
 * semi-transparent science doodles (equations, molecules, graphs) slowly
 * moving "forward" (toward the viewer) on a dark theme.
 *
 * ✅ Next.js ready (client component). No third-party animation libs.
 * ✅ Responsive: covers viewport, adapts to resize & DPR.
 * ✅ Smooth: requestAnimationFrame loop, batched canvas draws.
 * ✅ Lightweight: procedural shapes; reuses instances for endless flow.
 *
 * Usage: <ScienceBackground />
 */

type Props = {
  /** Overall speed multiplier (0.5–2.0 is reasonable) */
  speed?: number;
  /** Approx number of floating elements */
  density?: number;
  /** Base opacity of elements (0–1) */
  opacity?: number;
  /** Stroke color of elements */
  color?: string;
  /** Optional random seed for reproducible layouts */
  seed?: number;
  /** z-depth range (nearer => larger); tune for taste */
  zMin?: number; // nearest plane
  zMax?: number; // farthest plane
};

const ScienceBackground: React.FC<Props> = ({
  speed = 1,
  density = 72,
  opacity = 0.18,
  color = "#e2e8f0", // slate-200
  seed = 1337,
  zMin = 0.35,
  zMax = 2.2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const elementsRef = useRef<Floater[]>([]);
  const lastTimeRef = useRef<number>(0);

  // --- Deterministic tiny PRNG for reproducible procedural art ---
  const rand = useMemo(() => {
    let s = seed >>> 0;
    return () => {
      // xorshift32
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) / 0xffffffff);
    };
  }, [seed]);

  // --- Types & helpers ---
  type FloaterType = "equation" | "molecule" | "graph" | "chemRing";
  type Floater = {
    x: number; // logical world coords (0..1)
    y: number; // logical world coords (0..1)
    z: number; // depth (zMin..zMax)
    rot: number; // radians
    type: FloaterType;
    speed: number; // per-second depth delta
    scaleJitter: number; // variation in base scale
  };

  const spawn = (): Floater => {
    const t: FloaterType = ((v: number) =>
      v < 0.25 ? "equation" : v < 0.55 ? "molecule" : v < 0.8 ? "graph" : "chemRing")(rand());
    const z = zMax - (zMax - zMin) * Math.pow(rand(), 1.2); // bias farther
    return {
      x: rand(),
      y: rand(),
      z,
      rot: rand() * Math.PI * 2,
      type: t,
      speed: (0.12 + rand() * 0.28) * (1 + (zMax - z) * 0.6), // nearer => a touch faster
      scaleJitter: 0.8 + rand() * 0.6,
    };
  };

  const resize = () => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = window.innerWidth;
    const h = window.innerHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.style.width = w + "px";
    c.style.height = h + "px";
  };

  // Draw different science glyphs procedurally ----------------------
  const drawEquation = (ctx: CanvasRenderingContext2D, size: number) => {
    // Handwritten-style equations using bezier + text (mixed for variety)
    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    // Integral-like swoop
    ctx.moveTo(-0.45 * size, -0.4 * size);
    ctx.bezierCurveTo(-0.3 * size, 0.2 * size, -0.2 * size, -0.2 * size, 0.15 * size, 0.4 * size);
    ctx.stroke();
    // Little equals + variables
    ctx.font = `${Math.floor(size * 0.22)}px ui-rounded, system-ui, -apple-system`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha *= 0.9;
    ctx.fillText("E = mc²", 0.05 * size, -0.05 * size);
    ctx.restore();
  };

  const drawMolecule = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    const r = size * 0.08;
    // three atoms in a bent configuration
    const pts = [
      { x: -0.22 * size, y: 0.0 },
      { x: 0.0, y: -0.12 * size },
      { x: 0.24 * size, y: 0.06 * size },
    ];
    // bonds
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y); ctx.lineTo(pts[1].x, pts[1].y);
    ctx.moveTo(pts[1].x, pts[1].y); ctx.lineTo(pts[2].x, pts[2].y);
    ctx.stroke();
    // atoms
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawGraph = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    ctx.lineWidth = 1;
    // Axes
    ctx.beginPath();
    ctx.moveTo(-0.45 * size, 0.3 * size); ctx.lineTo(0.45 * size, 0.3 * size);
    ctx.moveTo(-0.25 * size, 0.5 * size); ctx.lineTo(-0.25 * size, -0.45 * size);
    ctx.stroke();
    // y = sin(x) damped
    ctx.beginPath();
    const amp = 0.18 * size;
    for (let i = -45; i <= 45; i++) {
      const t = (i / 45) * Math.PI * 2;
      const x = t / (Math.PI * 2) * 0.7 * size;
      const y = Math.sin(t) * amp * (0.9 - Math.abs(t) * 0.05);
      if (i === -45) ctx.moveTo(x - 0.2 * size, y - 0.05 * size);
      else ctx.lineTo(x - 0.2 * size, y - 0.05 * size);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawChemRing = (ctx: CanvasRenderingContext2D, size: number) => {
    // Benzene-like ring with alternating double bonds
    ctx.save();
    ctx.lineWidth = 1.4;
    const R = size * 0.22;
    const verts: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      verts.push({ x: R * Math.cos(a), y: R * Math.sin(a) });
    }
    ctx.beginPath();
    verts.forEach((v, i) => {
      if (i === 0) ctx.moveTo(v.x, v.y); else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();
    ctx.stroke();
    // alternating double bonds
    for (let i = 0; i < 6; i += 2) {
      const a = verts[i];
      const b = verts[(i + 1) % 6];
      const nx = b.y - a.y, ny = -(b.x - a.x);
      const len = Math.hypot(nx, ny) || 1;
      const off = (R * 0.08) / len;
      ctx.beginPath();
      ctx.moveTo(a.x + nx * off, a.y + ny * off);
      ctx.lineTo(b.x + nx * off, b.y + ny * off);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawFloater = (
    ctx: CanvasRenderingContext2D,
    f: Floater,
    w: number,
    h: number
  ) => {
    // Perspective-ish projection: nearer (smaller z) => larger scale, higher alpha
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const base = Math.min(w, h) * 0.25 * f.scaleJitter; // logical size
    const scale = 1 / (0.6 + f.z * 0.9); // tune for pleasing growth
    const size = base * scale;

    const x = f.x * w;
    const y = f.y * h;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(f.rot);

    // Subtle glow for legibility on dark bg
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity * (1.1 - Math.min(1, (f.z - zMin) / (zMax - zMin)));
    ctx.shadowBlur = 6 * dpr * scale;
    ctx.shadowColor = color;

    switch (f.type) {
      case "equation":
        drawEquation(ctx, size);
        break;
      case "molecule":
        drawMolecule(ctx, size);
        break;
      case "graph":
        drawGraph(ctx, size);
        break;
      case "chemRing":
        drawChemRing(ctx, size);
        break;
    }

    ctx.restore();
  };

  // Main effect ------------------------------------------------------
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: true });
    if (!ctx) return;

    let running = true;

    // Seed initial floaters
    const target = Math.max(12, Math.min(200, Math.round(density)));
    elementsRef.current = new Array(target).fill(0).map(spawn);

    const onResize = () => { resize(); };
    resize();
    window.addEventListener("resize", onResize);

    const loop = (t: number) => {
      if (!running) return;
      const w = c.width;
      const h = c.height;
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      // dt in seconds
      const last = lastTimeRef.current || t;
      const dt = Math.min(0.05, (t - last) / 1000);
      lastTimeRef.current = t;

      // Clear with gentle vignette-like fade to create subtle trails
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.5)"; // semi-opaque to suppress trails on resize
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Starfield-like depth advance (toward viewer => decreasing z)
      const arr = elementsRef.current;
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        // Slight drift to avoid straight-on feel
        f.x += (Math.sin(f.rot) * 0.004 + (rand() - 0.5) * 0.002) * dt * 60;
        f.y += (Math.cos(f.rot) * 0.004 + (rand() - 0.5) * 0.002) * dt * 60;
        f.z -= f.speed * speed * dt;
        f.rot += (rand() - 0.5) * 0.002;

        // Wrap edges softly for seamless feel
        if (f.x < -0.1) f.x = 1.1;
        if (f.x > 1.1) f.x = -0.1;
        if (f.y < -0.1) f.y = 1.1;
        if (f.y > 1.1) f.y = -0.1;

        if (f.z <= zMin * 0.85) {
          // Respawn this floater at far plane with new xy/rot, keep type for reuse
          const type = f.type;
          const nf = spawn();
          f.x = nf.x; f.y = nf.y; f.z = zMax; f.rot = nf.rot; f.speed = nf.speed; f.scaleJitter = nf.scaleJitter; f.type = type;
        }
      }

      // Draw pass
      ctx.save();
      ctx.clearRect(0, 0, 0, 0); // no-op but keeps pattern similar if refactored
      ctx.globalCompositeOperation = "lighter"; // subtle bloom when overlaps
      for (let i = 0; i < arr.length; i++) {
        drawFloater(ctx, arr[i], w, h);
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [color, density, opacity, speed, zMax, zMin, rand]);

  // Fixed, fullscreen canvas behind everything
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        background: "#000", // dark base as requested
      }}
    >
      <canvas ref={canvasRef} />
      {/* Optional: SSR/no-JS fallback (static SVG texture) */}
      <noscript>
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(1000px 600px at 10% 20%, rgba(255,255,255,0.06), transparent), radial-gradient(800px 500px at 80% 70%, rgba(255,255,255,0.05), transparent), #000",
          }}
        />
      </noscript>
    </div>
  );
};

export default ScienceBackground;



// Usage example:

// Animated background lives here
{/* <ScienceBackground density={80} speed={1} opacity={0.2} /> */}
