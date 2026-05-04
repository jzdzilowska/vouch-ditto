"use client";

import { useEffect, useRef } from "react";

const GRAIN_SIZE = 128;
const FPS = 12;

export default function GrainOverlay({ opacity = 0.12 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = GRAIN_SIZE;
    canvas.height = GRAIN_SIZE;

    const imageData = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE);
    const pixels = imageData.data;
    let frame: number;

    function draw() {
      for (let i = 0; i < pixels.length; i += 4) {
        const v = Math.random() * 255;
        pixels[i] = v;
        pixels[i + 1] = v;
        pixels[i + 2] = v;
        pixels[i + 3] = 255;
      }
      ctx!.putImageData(imageData, 0, 0);
    }

    let last = 0;
    const interval = 1000 / FPS;

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
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "overlay",
        imageRendering: "pixelated",
      }}
    />
  );
}
