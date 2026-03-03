"use client";

import { useEffect, useRef, useCallback } from "react";
import { SEGMENTS } from "@/lib/segments";

interface WheelProps {
  targetIndex: number | null;
  spinning: boolean;
  freeSpin: boolean;
  onSpinComplete: () => void;
}

const FULL_CIRCLE = Math.PI * 2;
const SEGMENT_ANGLE = FULL_CIRCLE / SEGMENTS.length;
const GOLD = "#FFDE3D";
const SPIN_DURATION = 5000;
const FULL_ROTATIONS = 7;
const FREE_SPIN_SPEED = 0.006; // radians per frame

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Split "Diskon 30% + BNSP" → { big: "30%", small: "BNSP" } */
function parseLabel(label: string): { big: string; small: string } {
  const match = label.match(/(\d+%)/);
  if (!match) return { big: label, small: "" };
  const pct = match[1];
  const rest = label.replace(`Diskon ${pct}`, "").replace(/^\s*\+\s*/, "").trim();
  return { big: pct, small: rest };
}

export default function Wheel({ targetIndex, spinning, freeSpin, onSpinComplete }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentAngleRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startAngleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const freeSpinRef = useRef(false);

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 22;

    ctx.clearRect(0, 0, size, size);

    // Outer glow — stays within canvas bounds
    const glowGradient = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius + 16);
    glowGradient.addColorStop(0, "rgba(255, 222, 61, 0)");
    glowGradient.addColorStop(0.7, "rgba(255, 222, 61, 0.12)");
    glowGradient.addColorStop(1, "rgba(255, 222, 61, 0.4)");
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 16, 0, FULL_CIRCLE);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Draw segments
    SEGMENTS.forEach((seg, i) => {
      const startAngle = angle + i * SEGMENT_ANGLE - Math.PI / 2;
      const endAngle = startAngle + SEGMENT_ANGLE;
      const midAngle = startAngle + SEGMENT_ANGLE / 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();

      // Jackpot segment (index 0) gets a vivid amber gradient
      if (i === 0) {
        const innerX = cx + Math.cos(midAngle) * radius * 0.15;
        const innerY = cy + Math.sin(midAngle) * radius * 0.15;
        const outerX = cx + Math.cos(midAngle) * radius;
        const outerY = cy + Math.sin(midAngle) * radius;
        const jackpotGrad = ctx.createLinearGradient(innerX, innerY, outerX, outerY);
        jackpotGrad.addColorStop(0, "#9a3d00");
        jackpotGrad.addColorStop(1, "#FF8C00");
        ctx.fillStyle = jackpotGrad;
      } else {
        ctx.fillStyle = seg.color;
      }

      ctx.fill();

      // Ultra-thin white separator — clean, borderless look
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 0.75;
      ctx.stroke();
    });

    // Depth overlay: darker at center, adds 3D feel
    const depthGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    depthGradient.addColorStop(0, "rgba(0, 0, 20, 0.5)");
    depthGradient.addColorStop(0.4, "rgba(0, 0, 10, 0.18)");
    depthGradient.addColorStop(1, "rgba(30, 80, 160, 0.04)");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, FULL_CIRCLE);
    ctx.fillStyle = depthGradient;
    ctx.fill();

    // Typographic hierarchy: big % + small detail
    const bigSize = size < 320 ? 18 : size < 400 ? 22 : 26;
    const smallSize = size < 320 ? 10 : size < 400 ? 11 : 13;
    const textRadius = radius * 0.78;

    SEGMENTS.forEach((seg, i) => {
      const startAngle = angle + i * SEGMENT_ANGLE - Math.PI / 2;
      const { big, small } = parseLabel(seg.label);

      const gap = 3;
      const totalH = small ? bigSize + gap + smallSize : bigSize;
      const baseY = -totalH / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + SEGMENT_ANGLE / 2);
      ctx.textAlign = "right";

      // Big percentage number
      ctx.font = `800 ${bigSize}px Poppins, sans-serif`;
      ctx.fillStyle = seg.textColor;
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 5;
      ctx.fillText(big, textRadius, baseY + bigSize * 0.75);

      // Small supporting text (centered under big text rather than right-aligned)
      if (small) {
        // measure big width using the big font first
        ctx.font = `800 ${bigSize}px Poppins, sans-serif`;
        const bigW = ctx.measureText(big).width;
        // then switch to small font for the label
        ctx.font = `600 ${smallSize}px Poppins, sans-serif`;
        ctx.globalAlpha = 0.82;
        const smallW = ctx.measureText(small).width;
        const smallX = textRadius - (bigW - smallW) / 2;
        ctx.fillText(small, smallX, baseY + bigSize + gap + smallSize * 0.75);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    });

    // Outer ring — single crisp gold border + inner accent
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, FULL_CIRCLE);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius - 8, 0, FULL_CIRCLE);
    ctx.strokeStyle = "rgba(255, 222, 61, 0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glassmorphic center button
    // Dark navy base
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, FULL_CIRCLE);
    ctx.fillStyle = "#071d4a";
    ctx.fill();

    // Glass shimmer arc (top-left highlight)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 26, Math.PI * 1.1, Math.PI * 1.85);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Gold border ring with glow
    ctx.shadowColor = "rgba(255, 222, 61, 0.65)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, FULL_CIRCLE);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner subtle ring
    ctx.beginPath();
    ctx.arc(cx, cy, 21, 0, FULL_CIRCLE);
    ctx.strokeStyle = "rgba(255, 222, 61, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, []);

  // Initial draw — wait for Poppins to load
  useEffect(() => {
    document.fonts.ready.then(() => drawWheel(0));
  }, [drawWheel]);

  // Phase 1: free spin — constant speed loop while waiting for API
  useEffect(() => {
    freeSpinRef.current = freeSpin;

    if (!freeSpin) return;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const loop = () => {
      if (!freeSpinRef.current) return;
      currentAngleRef.current += FREE_SPIN_SPEED;
      drawWheel(currentAngleRef.current);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [freeSpin, drawWheel]);

  // Phase 2: landing — decelerate to target segment
  useEffect(() => {
    if (!spinning || targetIndex === null) return;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const segmentCenterAngle = -(targetIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
    const normalizedTarget = ((segmentCenterAngle % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;

    startAngleRef.current = currentAngleRef.current;
    const currentNorm = ((currentAngleRef.current % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
    let delta = normalizedTarget - currentNorm;
    if (delta < 0) delta += FULL_CIRCLE;

    targetAngleRef.current =
      currentAngleRef.current + FULL_ROTATIONS * FULL_CIRCLE + delta;

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const easedProgress = easeOut(progress);

      currentAngleRef.current =
        startAngleRef.current +
        (targetAngleRef.current - startAngleRef.current) * easedProgress;

      drawWheel(currentAngleRef.current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        currentAngleRef.current = targetAngleRef.current;
        drawWheel(currentAngleRef.current);
        onSpinComplete();
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [spinning, targetIndex, drawWheel, onSpinComplete]);

  const size = 380;

  return (
    <div className="relative flex items-center justify-center">
      {/* SVG pointer pin — crisp, glowing, gradient-filled */}
      <svg
        className="absolute left-1/2 z-10"
        style={{
          top: 0,
          transform: "translateX(-50%) translateY(-6px)",
          filter: "drop-shadow(0 3px 8px rgba(255,222,61,0.75))",
        }}
        width="28" height="38" viewBox="0 0 28 38"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ptrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF5B0" />
            <stop offset="55%" stopColor="#FFDE3D" />
            <stop offset="100%" stopColor="#C8A000" />
          </linearGradient>
        </defs>
        {/* Arrow body pointing down */}
        <polygon points="14,38 0,6 28,6" fill="url(#ptrGrad)" />
        {/* Flat top cap */}
        <rect x="0" y="0" width="28" height="7" rx="3.5" fill="#FFF5B0" />
      </svg>

      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="max-w-full"
        style={{ maxWidth: "min(380px, 90vw)", maxHeight: "min(380px, 90vw)" }}
      />
    </div>
  );
}
