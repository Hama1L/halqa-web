"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      await refresh();
      router.push(searchParams.get("redirectTo") || "/");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
        Welcome back
      </h2>
      <p className="text-xs mb-6" style={{ color: "#9C9483" }}>Log in to ask, answer, and share insights.</p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
          style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
          style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
        />

        {error && <p className="text-xs" style={{ color: "#A8615A" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm font-medium px-4 py-2.5 rounded-full mt-2"
          style={{ background: "#123832", color: "#F7F2E7", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-xs text-center mt-4" style={{ color: "#9C9483" }}>
        New here? <Link href="/register" style={{ color: "#123832", fontWeight: 600 }}>Create an account</Link>
      </p>
    </div>
  );
}