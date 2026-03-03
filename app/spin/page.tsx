"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import ResultDisplay from "@/components/ResultDisplay";

const Wheel = dynamic(() => import("@/components/Wheel"), { ssr: false });

const STARS = [
  { top: "7%",  left: "11%", duration: "2.5s", delay: "0s",   size: "2px" },
  { top: "14%", left: "78%", duration: "3.8s", delay: "0.5s", size: "1px" },
  { top: "25%", left: "40%", duration: "2.2s", delay: "1.1s", size: "2px" },
  { top: "38%", left: "91%", duration: "4.2s", delay: "0.3s", size: "1px" },
  { top: "52%", left: "4%",  duration: "3.1s", delay: "0.8s", size: "2px" },
  { top: "65%", left: "86%", duration: "2.7s", delay: "0.6s", size: "1px" },
  { top: "80%", left: "23%", duration: "3.5s", delay: "1.3s", size: "2px" },
  { top: "91%", left: "62%", duration: "2.9s", delay: "0.2s", size: "1px" },
  { top: "4%",  left: "57%", duration: "3.3s", delay: "0.9s", size: "1px" },
  { top: "47%", left: "96%", duration: "2.4s", delay: "1.5s", size: "2px" },
  { top: "18%", left: "6%",  duration: "3.6s", delay: "0.7s", size: "1px" },
  { top: "72%", left: "50%", duration: "2.8s", delay: "1.2s", size: "2px" },
];

const LANTERN_MASK =
  "radial-gradient(ellipse 60% 78% at 50% 55%, black 28%, transparent 82%)";

const BG =
  "radial-gradient(ellipse at 50% 38%, #1e4f8c 0%, #0e3270 30%, #071d4a 65%, #040e28 100%)";

export default function SpinPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [freeSpin, setFreeSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");
  const [hasSpun, setHasSpun] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("rr_email");
    if (!stored) {
      router.replace("/");
      return;
    }
    setEmail(stored);
  }, [router]);

  const handleSpinComplete = useCallback(() => {
    setSpinning(false);
    setShowResult(true);
  }, []);

  async function handleSpin() {
    if (!email || freeSpin || spinning || hasSpun) return;
    setError("");
    setHasSpun(true);

    // Start wheel spinning immediately — Phase 1
    setFreeSpin(true);

    try {
      const res = await fetch("/api/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setFreeSpin(false);
        setResult(data.result);
        setError("Email ini sudah pernah putar roda.");
        return;
      }

      if (!res.ok) {
        setFreeSpin(false);
        setHasSpun(false);
        setError("Terjadi kesalahan. Coba lagi.");
        return;
      }

      // Stop free spin, trigger landing — Phase 2
      setFreeSpin(false);
      setResult(data.result);
      setTargetIndex(data.segmentIndex);
      setSpinning(true);
    } catch {
      setFreeSpin(false);
      setHasSpun(false);
      setError("Tidak dapat terhubung. Periksa koneksimu.");
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden"
      style={{ background: BG }}
    >
      {/* ── Stars ── */}
      {STARS.map((star, i) => (
        <div
          key={i}
          className="star-item"
          style={{
            top: star.top,
            left: star.left,
            "--duration": star.duration,
            "--delay": star.delay,
            width: star.size,
            height: star.size,
          } as React.CSSProperties}
        />
      ))}

      {/* ── Vector.png — centered mandala, faded ── */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -52%)",
          zIndex: 1,
        }}
      >
        <Image
          src="/images/Vector.png"
          alt=""
          width={680}
          height={680}
          className="object-contain"
          style={{ opacity: 0.1 }}
        />
      </div>

      {/* ── Lantern LEFT — large ── */}
      <div
        className="fixed top-0 w-[80px] sm:w-[148px] lantern-sway pointer-events-none"
        style={{ left: 0, zIndex: 3, animationDuration: "4.4s" }}
      >
        <Image
          src="/images/Lantern1.png"
          alt=""
          width={148}
          height={370}
          style={{
            width: "100%",
            height: "auto",
            maskImage: LANTERN_MASK,
            WebkitMaskImage: LANTERN_MASK,
            opacity: 0.92,
          }}
        />
      </div>

      {/* ── Lantern LEFT-CENTER — smaller ── */}
      <div
        className="fixed top-0 hidden sm:block lantern-sway pointer-events-none"
        style={{ left: "148px", zIndex: 3, animationDuration: "5.6s", animationDelay: "0.8s" }}
      >
        <Image
          src="/images/Lantern1.png"
          alt=""
          width={108}
          height={270}
          className="object-contain"
          style={{
            maskImage: LANTERN_MASK,
            WebkitMaskImage: LANTERN_MASK,
            opacity: 0.72,
          }}
        />
      </div>

      {/* ── Lantern RIGHT — large, mirrored ── */}
      <div
        className="fixed top-0 w-[80px] sm:w-[148px] lantern-sway pointer-events-none"
        style={{
          right: 0,
          zIndex: 3,
          animationDuration: "4.8s",
          animationDelay: "1.4s",
          transform: "scaleX(-1)",
          transformOrigin: "top center",
        }}
      >
        <Image
          src="/images/Lantern1.png"
          alt=""
          width={148}
          height={370}
          style={{
            width: "100%",
            height: "auto",
            maskImage: LANTERN_MASK,
            WebkitMaskImage: LANTERN_MASK,
            opacity: 0.88,
          }}
        />
      </div>

      {/* ── Lantern RIGHT-CENTER — smaller, mirrored ── */}
      <div
        className="fixed top-0 hidden sm:block lantern-sway pointer-events-none"
        style={{
          right: "148px",
          zIndex: 3,
          animationDuration: "5.4s",
          animationDelay: "2.1s",
          transform: "scaleX(-1)",
          transformOrigin: "top center",
        }}
      >
        <Image
          src="/images/Lantern1.png"
          alt=""
          width={108}
          height={270}
          className="object-contain"
          style={{
            maskImage: LANTERN_MASK,
            WebkitMaskImage: LANTERN_MASK,
            opacity: 0.68,
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative w-full max-w-lg flex flex-col items-center gap-5" style={{ zIndex: 10 }}>

        {/* Logo */}
        <Image
          src="/revoulogo.png"
          alt="RevoU"
          width={80}
          height={80}
          className="object-contain"
          style={{ opacity: 0.95 }}
        />

        {/* Header */}
        <div className="text-center">
          <h1
            className="font-pacifico leading-tight mb-1"
            style={{
              fontSize: "clamp(28px, 7vw, 42px)",
              color: "#ffffff",
              textShadow: "0 0 30px rgba(255,220,60,0.35), 0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            Roda Rezeki
          </h1>
          <p
            className="font-cinzel text-xs tracking-widest uppercase mb-2"
            style={{ color: "#FFDE3D", opacity: 0.6, letterSpacing: "0.26em" }}
          >
            Ramadan Special 2026
          </p>
          <p className="text-blue-200 text-sm">
            Selamat datang,{" "}
            <span className="text-white font-semibold">{email}</span>!
          </p>
        </div>

        {/* Wheel */}
        <div
          className="relative p-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,222,61,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <Wheel
            targetIndex={targetIndex}
            spinning={spinning}
            freeSpin={freeSpin}
            onSpinComplete={handleSpinComplete}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="w-full rounded-xl px-4 py-3 text-center text-sm"
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#fca5a5",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Spin button */}
        {!hasSpun && (
          <button
            onClick={handleSpin}
            className="px-10 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 glow-border"
            style={{
              background: "linear-gradient(135deg, #FFDE3D, #FFB800)",
              color: "#0a1e3d",
              boxShadow: "0 4px 28px rgba(255,222,61,0.45)",
              minWidth: "200px",
              letterSpacing: "0.05em",
            }}
          >
            Putar!
          </button>
        )}

        {/* Hint */}
        {!hasSpun && (
          <p className="text-xs text-blue-300 text-center">
            Kamu hanya bisa memutar roda <strong className="text-white">1 kali</strong>.
          </p>
        )}

        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="text-sm text-blue-400 hover:text-blue-200 transition-colors underline"
        >
          ← Kembali ke beranda
        </button>
      </div>

      {/* Result overlay */}
      {showResult && result && email && (
        <ResultDisplay
          result={result}
          email={email}
          onClose={() => {
            sessionStorage.removeItem("rr_email");
            router.push("/");
          }}
        />
      )}
    </main>
  );
}
