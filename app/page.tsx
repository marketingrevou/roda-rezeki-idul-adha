"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Predefined star positions to avoid hydration mismatch
const STARS = [
  { top: "8%", left: "12%", duration: "2.5s", delay: "0s", size: "3px" },
  { top: "15%", left: "75%", duration: "3.5s", delay: "0.4s", size: "2px" },
  { top: "22%", left: "38%", duration: "2s", delay: "0.8s", size: "3px" },
  { top: "35%", left: "90%", duration: "4s", delay: "0.2s", size: "2px" },
  { top: "45%", left: "5%", duration: "3s", delay: "1s", size: "3px" },
  { top: "60%", left: "60%", duration: "2.8s", delay: "0.5s", size: "2px" },
  { top: "70%", left: "25%", duration: "3.2s", delay: "0.9s", size: "3px" },
  { top: "80%", left: "82%", duration: "2.3s", delay: "0.3s", size: "2px" },
  { top: "90%", left: "45%", duration: "3.7s", delay: "0.7s", size: "3px" },
  { top: "5%", left: "55%", duration: "2.6s", delay: "1.1s", size: "2px" },
  { top: "50%", left: "95%", duration: "3.1s", delay: "0.6s", size: "3px" },
  { top: "28%", left: "18%", duration: "2.9s", delay: "0.2s", size: "2px" },
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

      // New email — go to spin page
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
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0f0a2e 0%, #0a0520 50%, #0f0a2e 100%)" }}
    >
      {/* Stars background */}
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

      {/* Crescent top-right decoration */}
      <div
        className="fixed top-8 right-8 opacity-70 lantern-float"
        style={{ animationDelay: "0s" }}
      >
        <div className="crescent" style={{ width: "48px", height: "48px" }}>
          <div
            style={{
              position: "absolute",
              top: "7px",
              left: "11px",
              width: "36px",
              height: "36px",
              background: "#0f0a2e",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      {/* Crescent bottom-left decoration */}
      <div
        className="fixed bottom-12 left-6 opacity-40 lantern-float"
        style={{ animationDelay: "2s" }}
      >
        <div
          className="crescent"
          style={{ width: "32px", height: "32px" }}
        >
          <div
            style={{
              position: "absolute",
              top: "5px",
              left: "8px",
              width: "24px",
              height: "24px",
              background: "#0f0a2e",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      {/* Content card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 222, 61, 0.25)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/revoulogo.png"
            alt="RevoU Logo"
            width={140}
            height={40}
            className="object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span style={{ fontSize: "28px" }}>☪️</span>
            <h1
              className="text-3xl font-extrabold text-gold-gradient"
              style={{
                background: "linear-gradient(135deg, #FFDE3D, #FFB800, #FFDE3D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Roda Rezeki
            </h1>
            <span style={{ fontSize: "28px" }}>☪️</span>
          </div>
          <p
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: "#FFDE3D", opacity: 0.8, letterSpacing: "0.15em" }}
          >
            Ramadan Special 2025
          </p>
          <p className="text-blue-200 text-sm mt-3 leading-relaxed">
            Putar roda keberuntungan dan menangkan<br />
            bonus eksklusif dari RevoU!
          </p>
        </div>

        {/* Form */}
        {!alreadySpun ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: "#FFDE3D" }}
              >
                Email Kamu
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-blue-300 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255, 222, 61, 0.3)",
                  fontSize: "15px",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(255, 222, 61, 0.7)";
                  e.target.style.boxShadow = "0 0 12px rgba(255,222,61,0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255, 222, 61, 0.3)";
                  e.target.style.boxShadow = "none";
                }}
                disabled={loading}
                autoComplete="email"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <span>⚠️</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading || !email
                  ? "rgba(255,222,61,0.3)"
                  : "linear-gradient(135deg, #FFDE3D, #FFB800)",
                color: "#0f0a2e",
                boxShadow: loading || !email
                  ? "none"
                  : "0 4px 20px rgba(255, 222, 61, 0.4)",
                fontSize: "16px",
              }}
            >
              {loading ? "Mengecek..." : "Putar Sekarang! 🎡"}
            </button>
          </form>
        ) : (
          <div
            className="rounded-xl p-5 text-center"
            style={{
              background: "rgba(255,222,61,0.08)",
              border: "1px solid rgba(255,222,61,0.4)",
            }}
          >
            <p className="text-sm text-blue-200 mb-2">
              Email ini sudah pernah putar roda sebelumnya.
            </p>
            <p className="text-lg font-bold mb-3" style={{ color: "#FFDE3D" }}>
              Hasilmu: {alreadySpun}
            </p>
            <p className="text-xs text-blue-300">
              Hubungi tim RevoU untuk menggunakan bonusmu. ☪️
            </p>
            <button
              onClick={() => {
                setAlreadySpun(null);
                setEmail("");
              }}
              className="mt-4 text-sm underline text-blue-300 hover:text-white transition-colors"
            >
              Coba email lain
            </button>
          </div>
        )}

        {/* Divider with promo info */}
        <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,222,61,0.1)" }}>
          <p className="text-center text-xs text-blue-300">
            Setiap email hanya bisa putar <span className="text-white font-semibold">1 kali</span>.<br />
            Bonus berlaku untuk program tertentu. S&K berlaku.
          </p>
        </div>
      </div>

      {/* Bottom credit */}
      <p className="relative z-10 mt-6 text-xs text-blue-400 text-center">
        &copy; 2025 RevoU — Ramadan Mubarak 🌙
      </p>
    </main>
  );
}
