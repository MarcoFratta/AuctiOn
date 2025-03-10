export const shapeIcons = {
  circle: `<svg viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" />
  </svg>`,

  square: `<svg viewBox="0 0 24 24" width="24" height="24">
    <rect x="2" y="2" width="20" height="20" rx="3" />
  </svg>`,

  triangle: `<svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M12 2 L22 22 L2 22 Z" rx="1" />
  </svg>`,
}

export type ShapeType = keyof typeof shapeIcons
