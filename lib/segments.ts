export interface Segment {
  label: string;
  probability: number;
  color: string;
  textColor: string;
}

export const SEGMENTS: Segment[] = [
  {
    label: "BNSP + AI Free Learning + Starter Kit",
    probability: 50,
    color: "#E8730A",
    textColor: "#FFDE3D",
  },
  {
    label: "BNSP + Starter Kit",
    probability: 25,
    color: "#1a5c1a",
    textColor: "#FFDE3D",
  },
  {
    label: "BNSP + AI Free Learning",
    probability: 25,
    color: "#0d3b0d",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 50%",
    probability: 0,
    color: "#2d5a1a",
    textColor: "#FFDE3D",
  },
  {
    label: "BNSP",
    probability: 0,
    color: "#1a4010",
    textColor: "#FFDE3D",
  },
];

export const SWE_SEGMENTS: Segment[] = [
  {
    label: "Jaminan refund 6 juta",
    probability: 10,
    color: "#E8730A",
    textColor: "#FFDE3D",
  },
  {
    label: "Jaminan refund 4.5 juta",
    probability: 30,
    color: "#1a5c1a",
    textColor: "#FFDE3D",
  },
  {
    label: "Jaminan refund 3 juta",
    probability: 60,
    color: "#0d3b0d",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 50%",
    probability: 0,
    color: "#2d5a1a",
    textColor: "#FFDE3D",
  },
  {
    label: "BNSP",
    probability: 0,
    color: "#1a4010",
    textColor: "#FFDE3D",
  },
];

function pickFromSegments(segments: Segment[]): { label: string; segmentIndex: number } {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < segments.length; i++) {
    cumulative += segments[i].probability;
    if (rand < cumulative) {
      return { label: segments[i].label, segmentIndex: i };
    }
  }
  return {
    label: segments[segments.length - 1].label,
    segmentIndex: segments.length - 1,
  };
}

export function pickResult(): { label: string; segmentIndex: number } {
  return pickFromSegments(SEGMENTS);
}

export function pickResultForVariant(variant?: string): { label: string; segmentIndex: number } {
  if (variant === "swe") return pickFromSegments(SWE_SEGMENTS);
  return pickFromSegments(SEGMENTS);
}
