'use client';

import { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
}

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const frameRef = useRef<number>(0);
  const lastScrollYRef = useRef(0);
  const scrollVelRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const MAX_DIST = 160; // slightly larger for longer connections

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.floor((canvas.width * canvas.height) / 12000);
      dotsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      }));
    }

    function draw(delta: number) {
      timeRef.current += delta;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dotsRef.current.forEach((d, i) => {
        // idle wiggle (unchanged)
        const idleX = Math.sin(timeRef.current * 0.001 + i) * 0.2;
        const idleY = Math.cos(timeRef.current * 0.001 + i * 1.3) * 0.2;

        // ⚡ stronger scroll burst
        const angle = (i / dotsRef.current.length) * Math.PI * 1;
        const burstX = Math.cos(angle) * scrollVelRef.current * 0.1;
        const burstY = Math.sin(angle) * scrollVelRef.current * 0.20;

        d.x += idleX + burstX;
        d.y += idleY + burstY;

        // wrap around
        if (d.x < 0) d.x += canvas.width;
        if (d.x > canvas.width) d.x -= canvas.width;
        if (d.y < 0) d.y += canvas.height;
        if (d.y > canvas.height) d.y -= canvas.height;
      });

      // draw connections
      ctx.lineWidth = 1;
      for (let i = 0; i < dotsRef.current.length; i++) {
        for (let j = i + 1; j < dotsRef.current.length; j++) {
          const a = dotsRef.current[i];
          const b = dotsRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAX_DIST) {
            ctx.strokeStyle = `rgba(0,0,256,${1 - dist / MAX_DIST})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw dots
      ctx.fillStyle = 'rgba(50,50,50,0.8)';
      dotsRef.current.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // slightly slower decay so motion lingers
      scrollVelRef.current *= 0.5;
    }

    let lastTime = performance.now();
    function animate(now: number) {
      const delta = now - lastTime;
      lastTime = now;
      draw(delta);
      frameRef.current = requestAnimationFrame(animate);
    }

    function onScroll() {
      const y = window.scrollY;
      scrollVelRef.current = y - lastScrollYRef.current;
      lastScrollYRef.current = y;
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full  md:mt-20 mt-10 md:h-[80vh] h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
