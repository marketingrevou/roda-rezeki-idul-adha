"use client";

import { useEffect, useRef, useCallback } from "react";
import { SEGMENTS } from "@/lib/segments";

interface WheelProps {
  targetIndex: number | null;
  spinning: boolean;
  onSpinComplete: () => void;
}

const FULL_CIRCLE = Math.PI * 2;
const SEGMENT_ANGLE = FULL_CIRCLE / SEGMENTS.length;
const GOLD = "#FFDE3D";
const SPIN_DURATION = 5000;
const FULL_ROTATIONS = 7;

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function Wheel({ targetIndex, spinning, onSpinComplete }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentAngleRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startAngleRef = useRef(0);
  const targetAngleRef = useRef(0);

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 12;

    ctx.clearRect(0, 0, size, size);

    // Draw outer glow
    const glowGradient = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius + 10);
    glowGradient.addColorStop(0, "rgba(255, 222, 61, 0)");
    glowGradient.addColorStop(1, "rgba(255, 222, 61, 0.3)");
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 10, 0, FULL_CIRCLE);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Draw segments
    SEGMENTS.forEach((seg, i) => {
      const startAngle = angle + i * SEGMENT_ANGLE - Math.PI / 2;
      const endAngle = startAngle + SEGMENT_ANGLE;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Segment border
      ctx.strokeStyle = "rgba(255, 222, 61, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + SEGMENT_ANGLE / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = seg.textColor;

      const lines = seg.label.split(" + ");
      const fontSize = size < 320 ? 9 : size < 400 ? 11 : 13;
      ctx.font = `bold ${fontSize}px Poppins, sans-serif`;

      const textRadius = radius * 0.82;

      if (lines.length === 1) {
        ctx.fillText(lines[0], textRadius, fontSize / 3);
      } else {
        const lineHeight = fontSize + 3;
        const totalHeight = lines.length * lineHeight;
        lines.forEach((line, li) => {
          ctx.fillText(line, textRadius, -totalHeight / 2 + li * lineHeight + fontSize / 2);
        });
      }
      ctx.restore();
    });

    // Decorative gold border (outer ring)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, FULL_CIRCLE);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Inner decorative ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 8, 0, FULL_CIRCLE);
    ctx.strokeStyle = "rgba(255, 222, 61, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center circle
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    centerGrad.addColorStop(0, "#FFE97A");
    centerGrad.addColorStop(1, "#B8860B");
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, FULL_CIRCLE);
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center star
    drawStar(ctx, cx, cy, 5, 14, 6, "#0f0a2e");
  }, []);

  function drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    color: string
  ) {
    let rot = (-Math.PI / 2);
    ctx.beginPath();
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += Math.PI / spikes;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += Math.PI / spikes;
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Initial draw
  useEffect(() => {
    drawWheel(0);
  }, [drawWheel]);

  // Spin animation
  useEffect(() => {
    if (!spinning || targetIndex === null) return;

    // Cancel any ongoing animation
    if (animRef.current) cancelAnimationFrame(animRef.current);

    // The wheel pointer is at the top (12 o'clock).
    // Segment i starts at angle: i * SEGMENT_ANGLE - Math.PI/2 (offset from draw fn)
    // We want segment center at top: targetAngle = -(i * SEGMENT_ANGLE + SEGMENT_ANGLE/2)
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

  // Responsive canvas size
  const size = 380;

  return (
    <div className="relative flex items-center justify-center">
      {/* Pointer triangle at top */}
      <div
        className="absolute top-0 left-1/2 z-10"
        style={{
          transform: "translateX(-50%) translateY(-4px)",
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderTop: "36px solid #FFDE3D",
          filter: "drop-shadow(0 2px 4px rgba(255,222,61,0.6))",
        }}
      />
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
