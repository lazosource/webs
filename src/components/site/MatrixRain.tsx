"use client";

import { useEffect, useRef } from "react";

const CHARS = "01アイウエオカキクケコサシスセソタチツテト";
const FONT_SIZE = 16;
const FPS_INTERVAL = 1000 / 24;

export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: number[] = [];
    let raf = 0;
    let lastTime = 0;

    function resize() {
      const parent = canvas!.parentElement;
      width = canvas!.width = parent ? parent.clientWidth : window.innerWidth;
      height = canvas!.height = parent ? parent.clientHeight : 320;
      columns = Math.floor(width / FONT_SIZE);
      drops = new Array(columns).fill(0).map(() => Math.random() * -50);
    }
    resize();

    function draw(time: number) {
      raf = requestAnimationFrame(draw);
      if (time - lastTime < FPS_INTERVAL) return;
      lastTime = time;
      if (!ctx) return;

      ctx.fillStyle = "rgba(5, 7, 10, 0.18)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${FONT_SIZE}px var(--font-mono, monospace)`;
      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const y = drops[i] * FONT_SIZE;
        ctx.fillStyle =
          Math.random() > 0.985 ? "rgba(230,241,239,0.9)" : "rgba(52,224,161,0.55)";
        ctx.fillText(char, i * FONT_SIZE, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
    />
  );
}
