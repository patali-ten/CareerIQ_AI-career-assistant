import { useEffect, useRef } from "react";

const PARTICLES = 55;
const NAVBAR_H = 100; // keeps words below the navbar

// side: "L" | "R"  → which side lane the shape lives in
// lx: 0..1 → distance from the OUTER screen edge toward the centre (0 = edge)
// Outlined shapes sit on the INNER side (lx ≈ 0.8); words sit on the OUTER side.
const SHAPES = [
  // Left lane
  { type: "circle",   side: "L", lx: 0.20, y: 0.20, size: 180, opacity: 0.055, rot: 0.04,  drift: 22, pulse: 0.50 },
  { type: "triangle", side: "L", lx: 0.80, y: 0.38, size: 50,  opacity: 0.28,  rot: -0.30, drift: 16, pulse: 0.75 },
  { type: "hexagon",  side: "L", lx: 0.85, y: 0.65, size: 70,  opacity: 0.22,  rot: -0.22, drift: 18, pulse: 0.80 },
  { type: "circle",   side: "L", lx: 0.25, y: 0.92, size: 140, opacity: 0.045, rot: 0.05,  drift: 18, pulse: 0.70 },
  // Right lane
  { type: "triangle", side: "R", lx: 0.80, y: 0.15, size: 55,  opacity: 0.28,  rot: 0.32,  drift: 16, pulse: 0.90 },
  { type: "ring",     side: "R", lx: 0.80, y: 0.45, size: 90,  opacity: 0.20,  rot: 0,     drift: 10, pulse: 0.90 },
  { type: "circle",   side: "R", lx: 0.25, y: 0.68, size: 240, opacity: 0.045, rot: 0.03,  drift: 26, pulse: 0.35 },
  { type: "hexagon",  side: "R", lx: 0.80, y: 0.88, size: 75,  opacity: 0.22,  rot: 0.22,  drift: 18, pulse: 0.60 },
];

// General skills that appear on almost any CV, on the outer side of each lane
const WORDS = [
  { text: "Communication", side: "L", lx: 0.30, y: 0.17 },
  { text: "Excel",         side: "L", lx: 0.45, y: 0.31 },
  { text: "Leadership",    side: "L", lx: 0.28, y: 0.47 },
  { text: "Marketing",     side: "L", lx: 0.42, y: 0.62 },
  { text: "SQL",           side: "L", lx: 0.30, y: 0.77 },
  { text: "Strategy",      side: "L", lx: 0.42, y: 0.90 },

  { text: "Planning",      side: "R", lx: 0.30, y: 0.18 },
  { text: "Sales",         side: "R", lx: 0.45, y: 0.32 },
  { text: "Python",        side: "R", lx: 0.28, y: 0.50 },
  { text: "Research",      side: "R", lx: 0.42, y: 0.64 },
  { text: "Finance",       side: "R", lx: 0.30, y: 0.78 },
  { text: "Analytics",     side: "R", lx: 0.42, y: 0.91 },
];

function drawHexagon(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawTriangle(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.866, y + size * 0.5);
  ctx.lineTo(x - size * 0.866, y + size * 0.5);
  ctx.closePath();
}

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const start = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const particles = Array.from({ length: PARTICLES }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1.5 + Math.random() * 2.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: -(0.1 + Math.random() * 0.35),
      alpha: 0.2 + Math.random() * 0.5,
    }));

    // Floating words (each has its own bob speed, height and phase)
    const words = WORDS.map((w) => ({
      ...w,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 0.7,   // rad/s → ~4–8 s per bob
      amp: 8 + Math.random() * 6,         // px up/down
      alpha: 0.12 + Math.random() * 0.08,
      size: 14 + Math.random() * 6,
    }));

    const draw = (now) => {
      const t = (now - start) / 1000; // seconds
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Keep the middle column free for the hero text + upload card
      const centerW = Math.min(900, W * 0.62);
      const laneW = Math.max(0, (W - centerW) / 2);
      const fade = W < 700 ? 0.5 : 1; // softer on small screens

      // ── Large background shapes ──
      SHAPES.forEach((s, i) => {
        const extent = s.size * (s.type === "ring" ? 1.5 : 1.15) + s.drift;

        let cx = s.side === "L" ? laneW * s.lx : W - laneW * s.lx;
        if (s.side === "L") cx = Math.min(cx, laneW - extent);
        else cx = Math.max(cx, W - laneW + extent);

        cx += Math.sin(t * 0.25 + i) * s.drift;
        const cy = s.y * H + Math.cos(t * 0.2 + i * 1.7) * s.drift;

        const breathe = Math.sin(t * s.pulse + i);           // -1..1
        const scale = 1 + breathe * 0.08;                    // size breathes ±8%
        const alpha = s.opacity * (0.8 + breathe * 0.2) * fade;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * s.rot);
        ctx.scale(scale, scale);

        if (s.type === "ring") {
          // 3 concentric rings expanding outward and fading (pulse)
          for (let k = 0; k < 3; k++) {
            const p = (t * 0.25 + k / 3) % 1;
            ctx.beginPath();
            ctx.arc(0, 0, s.size * (0.4 + p * 0.9), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(99,179,237,${s.opacity * (1 - p) * fade})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        } else if (s.type === "hexagon") {
          drawHexagon(ctx, 0, 0, s.size);
          ctx.strokeStyle = `rgba(99,179,237,${alpha})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        } else if (s.type === "triangle") {
          drawTriangle(ctx, 0, 0, s.size);
          ctx.strokeStyle = `rgba(139,92,246,${alpha})`; // purple accent
          ctx.lineWidth = 1.4;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59,130,246,${alpha})`;
          ctx.fill();
        }
        ctx.restore();
      });

      // ── Floating words (bob up and down, side lanes only) ──
      if (laneW > 110) {
        ctx.textAlign = "center";
        words.forEach((w) => {
          ctx.font = `600 ${w.size}px 'Helvetica Neue', sans-serif`;
          const hw = ctx.measureText(w.text).width / 2;

          let px = w.side === "L" ? laneW * w.lx : W - laneW * w.lx;
          if (w.side === "L") {
            px = Math.min(px, laneW - hw - 14);
            px = Math.max(px, hw + 16);
          } else {
            px = Math.max(px, W - laneW + hw + 14);
            px = Math.min(px, W - hw - 16);
          }

          px += Math.sin(t * 0.3 + w.phase) * 6;
          let py = w.y * H + Math.sin(t * w.speed + w.phase) * w.amp;
          py = Math.max(NAVBAR_H, Math.min(H - 24, py)); // never under the navbar or off-screen

          ctx.fillStyle = `rgba(147,197,253,${w.alpha * fade})`;
          ctx.fillText(w.text, px, py);
        });
      }

      // ── Particles ──
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,237,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
      });

      // ── Connecting lines between nearby particles ──
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,179,237,${0.12 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}