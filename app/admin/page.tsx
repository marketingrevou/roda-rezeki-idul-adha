"use client";

import { useState } from "react";
import { LogIn, RefreshCw, Download } from "lucide-react";

interface Spin {
  id: string;
  email: string;
  result: string;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function downloadCsv(spins: Spin[]) {
  const header = "No,Email,Hasil,Waktu\n";
  const rows = spins
    .map(
      (s, i) =>
        `${i + 1},"${s.email}","${s.result}","${formatDate(s.created_at)}"`
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "roda-rezeki-results.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchData(secretKey: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      if (res.status === 401) {
        setError("Akses ditolak. Secret salah.");
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        setError("Terjadi kesalahan saat mengambil data.");
        return;
      }
      const data = await res.json();
      setSpins(data.spins || []);
      setAuthed(true);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!secret.trim()) return;
    fetchData(secret.trim());
  }

  const resultCounts = spins.reduce<Record<string, number>>((acc, s) => {
    acc[s.result] = (acc[s.result] || 0) + 1;
    return acc;
  }, {});

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "linear-gradient(180deg, #0f0a2e 0%, #0a0520 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-extrabold mb-1"
            style={{
              background: "linear-gradient(135deg, #FFDE3D, #FFB800)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Admin — Roda Rezeki RevoU
          </h1>
          <p className="text-blue-300 text-sm">Semua hasil spin peserta Ramadan 2025</p>
        </div>

        {/* Auth form */}
        {!authed ? (
          <div className="max-w-sm mx-auto">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,222,61,0.25)",
              }}
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <LogIn size={20} style={{ color: "#FFDE3D" }} /> Login Admin
              </h2>
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Admin secret"
                  className="w-full px-4 py-2.5 rounded-xl text-white placeholder-blue-400 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,222,61,0.3)",
                  }}
                />
                {error && (
                  <p className="text-sm text-red-400">⚠️ {error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold transition-all"
                  style={{
                    background: "linear-gradient(135deg, #FFDE3D, #FFB800)",
                    color: "#0f0a2e",
                  }}
                >
                  {loading ? "Memuat..." : "Masuk"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                className="rounded-xl p-4 text-center"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,222,61,0.2)",
                }}
              >
                <p className="text-3xl font-bold" style={{ color: "#FFDE3D" }}>
                  {spins.length}
                </p>
                <p className="text-xs text-blue-300 mt-1">Total Spin</p>
              </div>
              {Object.entries(resultCounts).map(([label, count]) => (
                <div
                  key={label}
                  className="rounded-xl p-4 text-center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,222,61,0.1)",
                  }}
                >
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-xs text-blue-300 mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Action bar */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-300">
                {spins.length} peserta telah putar roda
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchData(secret)}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,222,61,0.3)",
                    color: "#FFDE3D",
                  }}
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  onClick={() => downloadCsv(spins)}
                  disabled={spins.length === 0}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: "linear-gradient(135deg, #FFDE3D, #FFB800)",
                    color: "#0f0a2e",
                  }}
                >
                  <Download size={14} />
                  CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,222,61,0.2)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "rgba(255,222,61,0.1)" }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider"
                        style={{ color: "#FFDE3D" }}>No</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider"
                        style={{ color: "#FFDE3D" }}>Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider"
                        style={{ color: "#FFDE3D" }}>Hasil</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider"
                        style={{ color: "#FFDE3D" }}>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spins.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-blue-300"
                        >
                          Belum ada data spin.
                        </td>
                      </tr>
                    ) : (
                      spins.map((spin, i) => (
                        <tr
                          key={spin.id}
                          style={{
                            background:
                              i % 2 === 0
                                ? "rgba(255,255,255,0.02)"
                                : "rgba(255,255,255,0.04)",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <td className="px-4 py-3 text-blue-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 text-white font-medium">{spin.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-1 rounded-lg text-xs font-semibold"
                              style={{
                                background: "rgba(255,222,61,0.15)",
                                color: "#FFDE3D",
                                border: "1px solid rgba(255,222,61,0.3)",
                              }}
                            >
                              {spin.result}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-blue-300 text-xs whitespace-nowrap">
                            {formatDate(spin.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 text-center">⚠️ {error}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
