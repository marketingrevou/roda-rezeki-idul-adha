"use client";

import { useEffect, useState } from "react";
import { Star, Gift } from "lucide-react";

interface ResultDisplayProps {
  result: string;
  email: string;
  onClose?: () => void;
}

export default function ResultDisplay({ result, email, onClose }: ResultDisplayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(5, 15, 5, 0.92)" }}
    >
      {/* Floating stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            top: `${Math.random() * 80 + 5}%`,
            left: `${Math.random() * 80 + 5}%`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.6,
          }}
        >
          <Star size={12} fill="#FFDE3D" color="#FFDE3D" />
        </div>
      ))}

      <div
        className="relative w-full max-w-md rounded-2xl p-8 text-center"
        style={{
          background: "linear-gradient(135deg, #0a1f0a 0%, #0d2e0d 50%, #0a1f0a 100%)",
          border: "2px solid #FFDE3D",
          boxShadow: "0 0 40px rgba(255, 222, 61, 0.4), 0 20px 60px rgba(0,0,0,0.6)",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.8) translateY(20px)",
          opacity: visible ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Geometric corner decorations */}
        <div className="absolute top-3 left-3 w-8 h-8 opacity-40"
          style={{ borderTop: "2px solid #FFDE3D", borderLeft: "2px solid #FFDE3D" }} />
        <div className="absolute top-3 right-3 w-8 h-8 opacity-40"
          style={{ borderTop: "2px solid #FFDE3D", borderRight: "2px solid #FFDE3D" }} />
        <div className="absolute bottom-3 left-3 w-8 h-8 opacity-40"
          style={{ borderBottom: "2px solid #FFDE3D", borderLeft: "2px solid #FFDE3D" }} />
        <div className="absolute bottom-3 right-3 w-8 h-8 opacity-40"
          style={{ borderBottom: "2px solid #FFDE3D", borderRight: "2px solid #FFDE3D" }} />

        {/* Icon */}
        <div
          className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #FFDE3D, #B8860B)",
            boxShadow: "0 0 20px rgba(255, 222, 61, 0.6)",
          }}
        >
          <Gift size={32} className="text-[#0a1f0a]" />
        </div>

        {/* Selamat */}
        <p className="text-sm font-semibold tracking-widest uppercase mb-2"
          style={{ color: "#FFDE3D", letterSpacing: "0.2em" }}>
          Selamat! 🎉
        </p>

        <h2 className="text-xl font-bold text-white mb-1">Kamu Mendapatkan</h2>

        {/* Result box */}
        <div
          className="my-5 px-4 py-4 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(255,222,61,0.15), rgba(255,222,61,0.05))",
            border: "1px solid rgba(255, 222, 61, 0.5)",
          }}
        >
          <p
            className="text-2xl font-bold leading-tight"
            style={{ color: "#FFDE3D" }}
          >
            {result}
          </p>
        </div>

        <p className="text-sm text-blue-200 mb-1">
          Untuk kamu:{" "}
          <span className="font-semibold text-white">{email}</span>
        </p>

        <p className="text-xs text-blue-300 mb-6 leading-relaxed">
          Hubungi tim RevoU untuk menggunakan bonusmu.<br />
          Selamat Idul Adha! 🐑
        </p>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-[#0a1f0a] transition-all hover:brightness-110 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FFDE3D, #FFB800)",
              boxShadow: "0 4px 15px rgba(255, 222, 61, 0.4)",
            }}
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );
}
