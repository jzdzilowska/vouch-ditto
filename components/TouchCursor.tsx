"use client";

import { useEffect, useState } from "react";

type Point = { x: number; y: number };

export default function TouchCursor() {
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");

    function bind() {
      if (!mq.matches) return null;
      const root = document.documentElement;

      function onMove(e: MouseEvent) {
        setActive(true);
        setPos({ x: e.clientX, y: e.clientY });
        root.classList.add("touch-cursor-active");
      }

      function onLeave() {
        setActive(false);
        setPressed(false);
        root.classList.remove("touch-cursor-active");
      }

      function onDown() {
        setPressed(true);
      }

      function onUp() {
        setPressed(false);
      }

      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      window.addEventListener("mousedown", onDown);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("blur", onUp);

      return () => {
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("mousedown", onDown);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("blur", onUp);
        root.classList.remove("touch-cursor-active");
      };
    }

    let unbind: (() => void) | null = bind();

    function onMq() {
      unbind?.();
      unbind = bind();
      if (!mq.matches) {
        setActive(false);
        setPressed(false);
        document.documentElement.classList.remove("touch-cursor-active");
      }
    }

    mq.addEventListener("change", onMq);
    return () => {
      mq.removeEventListener("change", onMq);
      unbind?.();
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className={`touch-cursor-ring${pressed ? " touch-cursor-ring--pressed" : ""}`}
      style={{ left: pos.x, top: pos.y }}
      aria-hidden
    />
  );
}
