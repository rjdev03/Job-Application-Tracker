export interface ColumnColorTheme {
  id: string;
  name: string;
  color: string;      // Tailwind class for header bg
  badgeBg: string;    // Tailwind class for count badge
  previewBg: string;  // Hex or Tailwind class for color swatch
}

export const COLUMN_COLORS: Record<string, ColumnColorTheme> = {
  cyan: {
    id: "cyan",
    name: "Cyan",
    color: "bg-cyan-600",
    badgeBg: "bg-cyan-700/50",
    previewBg: "bg-cyan-600",
  },
  purple: {
    id: "purple",
    name: "Purple",
    color: "bg-purple-600",
    badgeBg: "bg-purple-700/50",
    previewBg: "bg-purple-600",
  },
  emerald: {
    id: "emerald",
    name: "Emerald",
    color: "bg-emerald-600",
    badgeBg: "bg-emerald-700/50",
    previewBg: "bg-emerald-600",
  },
  amber: {
    id: "amber",
    name: "Amber",
    color: "bg-amber-600",
    badgeBg: "bg-amber-700/50",
    previewBg: "bg-amber-600",
  },
  rose: {
    id: "rose",
    name: "Rose",
    color: "bg-rose-600",
    badgeBg: "bg-rose-700/50",
    previewBg: "bg-rose-600",
  },
  indigo: {
    id: "indigo",
    name: "Indigo",
    color: "bg-indigo-600",
    badgeBg: "bg-indigo-700/50",
    previewBg: "bg-indigo-600",
  },
  blue: {
    id: "blue",
    name: "Blue",
    color: "bg-blue-600",
    badgeBg: "bg-blue-700/50",
    previewBg: "bg-blue-600",
  },
  slate: {
    id: "slate",
    name: "Slate",
    color: "bg-slate-700",
    badgeBg: "bg-slate-800/60",
    previewBg: "bg-slate-700",
  },
};

export function getColumnColor(colorKey?: string, defaultIndex: number = 0): ColumnColorTheme {
  if (colorKey && COLUMN_COLORS[colorKey]) {
    return COLUMN_COLORS[colorKey];
  }
  const keys = Object.keys(COLUMN_COLORS);
  const fallbackKey = keys[defaultIndex % keys.length];
  return COLUMN_COLORS[fallbackKey];
}