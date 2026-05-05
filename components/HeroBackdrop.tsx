export default function HeroBackdrop({
  variant = "warm",
  showAnnotation = false,
  annotation,
}: {
  variant?: "warm" | "dusk" | "honey" | "rose";
  showAnnotation?: boolean;
  annotation?: string;
}) {
  return (
    <div className="hero-photo">
      <div className="hero-base" />
      {/* Orb A trail (behind) → head (front) */}
      <div className="orb orb-amber-t2" />
      <div className="orb orb-amber-t1" />
      <div className="orb orb-amber" />
      {/* Orb B trail (behind) → head (front) */}
      <div className="orb orb-indigo-t2" />
      <div className="orb orb-indigo-t1" />
      <div className="orb orb-indigo" />
      {/* Grain on top */}
      <div className="hero-grain" />
      {showAnnotation && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontFamily: "var(--font-typewriter), monospace",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.32)",
            textTransform: "uppercase",
            textAlign: "center",
            pointerEvents: "none",
            border: "1px dashed rgba(255,255,255,0.18)",
            padding: "6px 12px",
            borderRadius: 6,
          }}
        >
          {annotation || "[ photo · close, soft-focus ]"}
        </div>
      )}
    </div>
  );
}
