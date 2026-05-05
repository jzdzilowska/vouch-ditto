// Tiny solid-fill heart used inside cta-pill buttons. Pairs with the
// .cta-pill__label / .cta-pill__heart cross-fade in globals.css so any
// CTA on any screen can hover-fade from text into a single heart.
export default function HeartIcon() {
  return (
    <svg
      className="cta-heart"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M12 21s-8-5.5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 5.5-8 11-8 11z" />
    </svg>
  );
}
