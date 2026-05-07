"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadySpun, setAlreadySpun] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setAlreadySpun(null);

    const trimmed = email.trim().toLowerCase();
    if (!validateEmail(trimmed)) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError("Terjadi kesalahan. Coba lagi.");
        return;
      }
      if (data.exists) {
        setAlreadySpun(data.result);
        return;
      }

      sessionStorage.setItem("rr_email", trimmed);
      router.push("/spin");
    } catch {
      setError("Tidak dapat terhubung. Periksa koneksimu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-start pt-12 sm:justify-center sm:pt-0 px-6 overflow-hidden"
      style={{ backgroundColor: "#053805" }}
    >
      {/* ── Mosque background ── */}
      <div
        className="fixed inset-0 pointer-events-none translate-y-[20%] sm:translate-y-0"
        style={{ zIndex: 1 }}
      >
        <Image
          src="/images/Mosque2.png"
          alt=""
          fill
          className="object-contain object-center"
          style={{ opacity: 0.85, transform: "scale(1.6)" }}
        />
      </div>

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

{/* ── Main content ── */}
      <div className="relative w-full max-w-sm flex flex-col items-center" style={{ zIndex: 10 }}>

        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/revoulogo.png"
            alt="RevoU"
            width={80}
            height={80}
            className="object-contain"
            style={{ opacity: 0.95 }}
          />
        </div>

        {/* Headline block */}
        <div className="text-center mb-10">

          {/* Title */}
          <h1
            className="font-pacifico leading-tight mb-3"
            style={{
              fontSize: "clamp(34px, 10vw, 54px)",
              color: "#ffffff",
              textShadow:
                "0 0 30px rgba(255, 220, 60, 0.35), 0 2px 8px rgba(0,0,0,0.5)",
              letterSpacing: "0.01em",
            }}
          >
            Roda Rezeki
          </h1>

          <p
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "#FFDE3D", opacity: 0.65, letterSpacing: "0.26em" }}
          >
            Idul Adha Special 2026
          </p>
        </div>

        {/* Form / Already spun */}
        {!alreadySpun ? (
          <form onSubmit={handleSubmit} className="w-full space-y-3 sm:bg-black/25 sm:backdrop-blur-sm sm:rounded-2xl sm:p-6 sm:border sm:border-white/10">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Masukkan email kamu"
              className="w-full px-5 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,222,61,0.25)",
                caretColor: "#FFDE3D",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(255,222,61,0.6)";
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255,222,61,0.25)";
                e.target.style.background = "rgba(255,255,255,0.07)";
              }}
              disabled={loading}
              autoComplete="email"
            />

            {error && (
              <p className="text-xs text-red-400 px-1">⚠ {error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #FFDE3D, #FFB800)",
                color: "#0a1e3d",
                letterSpacing: "0.06em",
                boxShadow:
                  loading || !email ? "none" : "0 4px 28px rgba(255,222,61,0.35)",
              }}
            >
              {loading ? "Mengecek..." : "Putar Roda"}
            </button>
          </form>
        ) : (
          <div
            className="w-full rounded-xl p-5 text-center"
            style={{
              background: "rgba(255,222,61,0.07)",
              border: "1px solid rgba(255,222,61,0.3)",
            }}
          >
            <p className="text-xs text-blue-200 mb-2">
              Email ini sudah pernah putar roda.
            </p>
            <p className="text-lg font-bold mb-3" style={{ color: "#FFDE3D" }}>
              {alreadySpun}
            </p>
            <p className="text-xs text-blue-300 mb-4">
              Hubungi tim RevoU untuk menggunakan bonusmu.
            </p>
            <button
              onClick={() => { setAlreadySpun(null); setEmail(""); }}
              className="text-xs text-blue-300 hover:text-white transition-colors underline"
            >
              Coba email lain
            </button>
          </div>
        )}

        <p
          className="mt-8 text-center"
          style={{ fontSize: "11px", color: "rgba(148,163,184,0.4)" }}
        >
          Setiap email hanya bisa putar 1 kali · S&K berlaku
        </p>
      </div>

      {/* ── Cow — bottom left ── */}
      <div
        className="hidden sm:block fixed bottom-0 pointer-events-none"
        style={{ left: 0, zIndex: 3 }}
      >
        <Image
          src="/images/cow.png"
          alt=""
          width={280}
          height={220}
          className="object-contain object-bottom"
          style={{ opacity: 1 }}
        />
      </div>

      {/* ── Goat — bottom right ── */}
      <div
        className="hidden sm:block fixed bottom-0 pointer-events-none"
        style={{ right: 0, zIndex: 3 }}
      >
        <Image
          src="/images/goat.png"
          alt=""
          width={220}
          height={220}
          className="object-contain object-bottom"
          style={{ opacity: 1 }}
        />
      </div>

    </main>
  );
}
