"use client";

import { useEffect, useRef } from "react";

export default function GrainOverlay({ opacity = 0.15 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.ceil(window.innerWidth * dpr);
    const h = Math.ceil(window.innerHeight * dpr);

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.createImageData(w, h);
    const buf32 = new Uint32Array(imageData.data.buffer);
    let frame: number;

    function draw() {
      for (let i = 0; i < buf32.length; i++) {
        const v = (Math.random() * 255) | 0;
        buf32[i] = (255 << 24) | (v << 16) | (v << 8) | v;
      }
      ctx!.putImageData(imageData, 0, 0);
    }

    let last = 0;
    const interval = 1000 / 24;

    function loop(time: number) {
      frame = requestAnimationFrame(loop);
      if (time - last < interval) return;
      last = time;
      draw();
    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "overlay",
      }}
    />
  );
}
