// Tiny pill badge used in the landing chip-row + onboarding meta.
export default function Chip({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="chip">
      {icon && <svg viewBox="0 0 13 13">{icon}</svg>}
      <span>{label}</span>
    </div>
  );
}

// Premise chip set from the design.
export const PREMISE_CHIPS = [
  {
    label: "FRIEND-WRITTEN",
    icon: <path d="M2 5h11M2 9h7M2 13h5" />,
  },
  {
    label: "3 QUESTIONS",
    icon: (
      <>
        <circle cx="6.5" cy="6.5" r="4" />
        <path d="M5 6c0-.8.7-1.5 1.5-1.5S8 5.2 8 6c0 1-1.5 1-1.5 2" />
        <circle cx="6.5" cy="9" r="0.5" fill="#fff" />
      </>
    ),
  },
  {
    label: "NO LIES",
    icon: <path d="M2 8l3 3 6-6" />,
  },
  {
    label: "INVITE-ONLY",
    icon: (
      <>
        <rect x="3" y="6" width="8" height="6" rx="1" />
        <path d="M5 6V4a2 2 0 0 1 4 0v2" />
      </>
    ),
  },
];
