"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ResultDisplay from "@/components/ResultDisplay";

const Wheel = dynamic(() => import("@/components/Wheel"), { ssr: false });

const STARS = [
  { top: "5%", left: "8%", duration: "2.5s", delay: "0s", size: "3px" },
  { top: "12%", left: "80%", duration: "3.5s", delay: "0.4s", size: "2px" },
  { top: "30%", left: "92%", duration: "2s", delay: "0.8s", size: "3px" },
  { top: "55%", left: "3%", duration: "4s", delay: "0.2s", size: "2px" },
  { top: "75%", left: "88%", duration: "3s", delay: "1s", size: "3px" },
  { top: "88%", left: "20%", duration: "2.8s", delay: "0.5s", size: "2px" },
  { top: "95%", left: "60%", duration: "3.2s", delay: "0.9s", size: "3px" },
];

export default function SpinPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    if (!email || spinning || hasSpun || loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Already spun
        setResult(data.result);
        setError("Email ini sudah pernah putar roda.");
        return;
      }

      if (!res.ok) {
        setError("Terjadi kesalahan. Coba lagi.");
        return;
      }

      setResult(data.result);
      setTargetIndex(data.segmentIndex);
      setHasSpun(true);
      setSpinning(true);
    } catch {
      setError("Tidak dapat terhubung. Periksa koneksimu.");
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0f0a2e" }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0f0a2e 0%, #0a0520 50%, #0f0a2e 100%)" }}
    >
      {/* Stars */}
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

      {/* Crescent decoration */}
      <div className="fixed top-6 right-6 opacity-60 lantern-float">
        <div className="crescent" style={{ width: "40px", height: "40px" }}>
          <div
            style={{
              position: "absolute",
              top: "6px",
              left: "9px",
              width: "30px",
              height: "30px",
              background: "#0f0a2e",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-6">
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-2xl font-extrabold mb-1"
            style={{
              background: "linear-gradient(135deg, #FFDE3D, #FFB800)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Roda Rezeki RevoU ☪️
          </h1>
          <p className="text-blue-200 text-sm">
            Selamat datang, <span className="text-white font-semibold">{email}</span>!
          </p>
        </div>

        {/* Wheel container */}
        <div
          className="relative p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,222,61,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <Wheel
            targetIndex={targetIndex}
            spinning={spinning}
            onSpinComplete={handleSpinComplete}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="w-full rounded-xl px-4 py-3 text-center text-sm"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fca5a5",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Spin button */}
        {!hasSpun && (
          <button
            onClick={handleSpin}
            disabled={spinning || loading}
            className="px-10 py-4 rounded-2xl font-bold text-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed glow-border"
            style={{
              background:
                spinning || loading
                  ? "rgba(255,222,61,0.3)"
                  : "linear-gradient(135deg, #FFDE3D, #FFB800)",
              color: "#0f0a2e",
              boxShadow: "0 4px 25px rgba(255, 222, 61, 0.5)",
              minWidth: "200px",
            }}
          >
            {loading ? "Memuat..." : spinning ? "Berputar... 🎡" : "Putar! 🎡"}
          </button>
        )}

        {/* Hint text */}
        {!hasSpun && !spinning && !loading && (
          <p className="text-xs text-blue-300 text-center">
            Kamu hanya bisa memutar roda <strong className="text-white">1 kali</strong>.
          </p>
        )}

        {/* Back button */}
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
