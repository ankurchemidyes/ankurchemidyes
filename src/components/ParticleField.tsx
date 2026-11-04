import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  r: number;
}

export const ParticleField = ({ density = 70, className = "" }: { density?: number; className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Adapt particle count for mobile screens to preserve 60/120fps scrolling
    const effectiveDensity = window.innerWidth < 768 ? Math.min(density, 32) : density;

    let particles: Particle[] = [];
    let w = 0,
      h = 0,
      dpr = Math.min(window.devicePixelRatio || 1, 2);

    let canvasRect = canvas.getBoundingClientRect();

    const resize = () => {
      canvasRect = canvas.getBoundingClientRect();
      w = canvasRect.width;
      h = canvasRect.height;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: effectiveDensity }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.5,
      }));

      if (prefersReducedMotion) {
        drawFrame();
      }
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onScrollOrResize = () => {
      canvasRect = canvas.getBoundingClientRect();
    };
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX - canvasRect.left;
      mouse.current.y = e.clientY - canvasRect.top;
    };
    const onLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });

    // Cache theme color without querying DOM inside animation frame loop
    let currentColor = document.documentElement.classList.contains("dark")
      ? "234, 200, 255"
      : "60, 80, 200";

    const mo = new MutationObserver(() => {
      currentColor = document.documentElement.classList.contains("dark")
        ? "234, 200, 255"
        : "60, 80, 200";
      if (prefersReducedMotion) {
        drawFrame();
      }
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const maxDist = 130;
    const maxDistSq = 16900; // 130 * 130

    const drawFrame = () => {
      ctx.clearRect(0, 0, w, h);

      // Particle physics & mouse repulsion
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }

        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        if (Math.abs(dx) < 140 && Math.abs(dy) < 140) {
          const distSq = dx * dx + dy * dy;
          if (distSq < 19600 && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (140 - dist) / 140;
            p.x += (dx / dist) * force * 1.2;
            p.y += (dy / dist) * force * 1.2;
          }
        }
      }

      // Batch connection lines into Path2D buckets to reduce hundreds of draw calls to ~4
      const bucket0 = new Path2D();
      const bucket1 = new Path2D();
      const bucket2 = new Path2D();
      const bucket3 = new Path2D();
      let has0 = false,
        has1 = false,
        has2 = false,
        has3 = false;

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          if (dx > maxDist || dx < -maxDist) continue;
          const dy = a.y - b.y;
          if (dy > maxDist || dy < -maxDist) continue;

          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const d = Math.sqrt(distSq);
            const alpha = (1 - d / maxDist) * 0.25 * Math.min(a.z, b.z);
            if (alpha < 0.08) {
              bucket0.moveTo(a.x, a.y);
              bucket0.lineTo(b.x, b.y);
              has0 = true;
            } else if (alpha < 0.14) {
              bucket1.moveTo(a.x, a.y);
              bucket1.lineTo(b.x, b.y);
              has1 = true;
            } else if (alpha < 0.2) {
              bucket2.moveTo(a.x, a.y);
              bucket2.lineTo(b.x, b.y);
              has2 = true;
            } else {
              bucket3.moveTo(a.x, a.y);
              bucket3.lineTo(b.x, b.y);
              has3 = true;
            }
          }
        }
      }

      ctx.lineWidth = 0.6;
      if (has0) {
        ctx.strokeStyle = `rgba(${currentColor}, 0.06)`;
        ctx.stroke(bucket0);
      }
      if (has1) {
        ctx.strokeStyle = `rgba(${currentColor}, 0.12)`;
        ctx.stroke(bucket1);
      }
      if (has2) {
        ctx.strokeStyle = `rgba(${currentColor}, 0.18)`;
        ctx.stroke(bucket2);
      }
      if (has3) {
        ctx.strokeStyle = `rgba(${currentColor}, 0.24)`;
        ctx.stroke(bucket3);
      }

      // Batch particle circles into 2 opacity levels
      const dotPathLow = new Path2D();
      const dotPathHigh = new Path2D();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const r = p.r * p.z;
        if (p.z < 0.5) {
          dotPathLow.moveTo(p.x + r, p.y);
          dotPathLow.arc(p.x, p.y, r, 0, Math.PI * 2);
        } else {
          dotPathHigh.moveTo(p.x + r, p.y);
          dotPathHigh.arc(p.x, p.y, r, 0, Math.PI * 2);
        }
      }

      ctx.fillStyle = `rgba(${currentColor}, 0.35)`;
      ctx.fill(dotPathLow);
      ctx.fillStyle = `rgba(${currentColor}, 0.55)`;
      ctx.fill(dotPathHigh);
    };

    let isVisible = true;
    let isRunning = false;

    const loop = () => {
      if (!isVisible || prefersReducedMotion) {
        isRunning = false;
        return;
      }
      drawFrame();
      raf.current = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!isRunning && isVisible && !prefersReducedMotion) {
        isRunning = true;
        raf.current = requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      isRunning = false;
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = undefined;
      }
    };

    // Pause RAF animation loop completely when canvas scrolls out of viewport
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          start();
        } else {
          stop();
        }
      },
      { rootMargin: "150px" }
    );
    io.observe(canvas);

    if (prefersReducedMotion) {
      drawFrame();
    } else {
      start();
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full pointer-events-none ${className}`} aria-hidden />;
};
