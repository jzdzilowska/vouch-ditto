"use client";

import { useEffect, useRef, useState } from "react";

// Wraps the entire app in a 402×874 iPhone-shaped frame on desktop
// (matching the design bundle's IOSDevice spec — dynamic island, status
// bar, home indicator) and collapses to full-screen on real mobile.
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState<string>("9:41");

  // Live status-bar clock
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: false });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Auto-scale the 402×874 device down if the viewport is shorter/narrower.
  useEffect(() => {
    const fit = () => {
      if (!frameRef.current) return;
      const pad = 48; // matches .phone-stage padding * 2
      const sx = (window.innerWidth - pad) / 402;
      const sy = (window.innerHeight - pad) / 874;
      const s = Math.min(sx, sy, 1);
      frameRef.current.style.setProperty("--phone-scale", String(s));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <>
      <div className="phone-backdrop" aria-hidden />
      <div className="phone-stage">
        <div className="phone-frame" ref={frameRef}>
          <div className="phone-island" aria-hidden />

          <div className="phone-statusbar" aria-hidden>
            <span className="phone-statusbar-time">{time}</span>
            <span className="phone-statusbar-icons">
              {/* Signal */}
              <svg width="19" height="12" viewBox="0 0 19 12">
                <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill="currentColor" />
                <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill="currentColor" />
                <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill="currentColor" />
                <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill="currentColor" />
              </svg>
              {/* Wifi */}
              <svg width="17" height="12" viewBox="0 0 17 12">
                <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill="currentColor" />
                <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill="currentColor" />
                <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
              </svg>
              {/* Battery */}
              <svg width="27" height="13" viewBox="0 0 27 13">
                <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" strokeOpacity="0.35" fill="none" />
                <rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor" />
                <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill="currentColor" fillOpacity="0.4" />
              </svg>
            </span>
          </div>

          <div className="phone-screen">{children}</div>
        </div>
      </div>
    </>
  );
}
