export interface Segment {
  label: string;
  probability: number;
  color: string;
  textColor: string;
}

export const SEGMENTS: Segment[] = [
  {
    label: "Diskon 50%",
    probability: 10,
    color: "#4B0082",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 40%",
    probability: 10,
    color: "#006466",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 30% + BNSP",
    probability: 35,
    color: "#8B0000",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 30% + AI Video",
    probability: 35,
    color: "#1a3a5c",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 25% + BNSP + AI Video",
    probability: 10,
    color: "#5C2D8E",
    textColor: "#FFDE3D",
  },
];

export function pickResult(): { label: string; segmentIndex: number } {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < SEGMENTS.length; i++) {
    cumulative += SEGMENTS[i].probability;
    if (rand < cumulative) {
      return { label: SEGMENTS[i].label, segmentIndex: i };
    }
  }
  return {
    label: SEGMENTS[SEGMENTS.length - 1].label,
    segmentIndex: SEGMENTS.length - 1,
  };
}
