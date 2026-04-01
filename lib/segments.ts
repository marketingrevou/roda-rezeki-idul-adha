export interface Segment {
  label: string;
  probability: number;
  color: string;
  textColor: string;
}

export const SEGMENTS: Segment[] = [
  {
    label: "Diskon 50%",
    probability: 0,
    color: "#E8730A",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 40%",
    probability: 0,
    color: "#0a4a62",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 30% + BNSP",
    probability: 0,
    color: "#0e2255",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 30% + AI Video",
    probability: 30,
    color: "#1a3575",
    textColor: "#FFDE3D",
  },
  {
    label: "Diskon 25% + BNSP + AI Video",
    probability: 70,
    color: "#0d3a52",
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
