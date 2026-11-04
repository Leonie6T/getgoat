/** Simple stroke icons: picture cues for buyers who read little. */
type P = { className?: string };
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconSex = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="10" cy="14" r="5" />
    <path d="M14 10l6-6M15 4h5v5" />
  </svg>
);
export const IconFemale = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="9" r="5" />
    <path d="M12 14v7M9 18h6" />
  </svg>
);
export const IconAge = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
export const IconWeight = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 8h12l2 12H4z" />
    <circle cx="12" cy="5" r="2" />
  </svg>
);
export const IconColour = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 004-4c0-4.5-4-8-9-8z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="11" cy="7" r="1" />
    <circle cx="16" cy="8" r="1" />
  </svg>
);
export const IconBaby = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M6 21c0-4 3-6 6-6s6 2 6 6" />
  </svg>
);
export const IconTag = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 12V4h8l10 10-8 8z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </svg>
);
export const IconChat = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />
  </svg>
);
export const IconPhone = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);
