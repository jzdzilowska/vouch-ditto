// The sensual warm/dusk/honey hero gradient + grain + fades, used by
// the landing page and the discover profile photos.
export default function HeroBackdrop({
  variant = "warm",
  showAnnotation = false,
  annotation,
}: {
  variant?: "warm" | "dusk" | "honey";
  showAnnotation?: boolean;
  annotation?: string;
}) {
  return (
    <div className="hero-photo">
      <div className={`hero-art hero-${variant}`} />
      <div className="hero-grain" />
      <div className="top-fade" />
      <div className="bottom-fade" />
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
