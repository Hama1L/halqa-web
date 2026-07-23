"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { displayName, email, password });
      await refresh();
      router.push("/");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
        Join the circle
      </h2>
      <p className="text-xs mb-6" style={{ color: "#9C9483" }}>
        You can still post anonymously any time — this account is just how the space stays safe.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          required
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
          style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
        />
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
          minLength={8}
          placeholder="Password (min. 8 characters)"
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-xs text-center mt-4" style={{ color: "#9C9483" }}>
        Already have an account? <Link href="/login" style={{ color: "#123832", fontWeight: 600 }}>Log in</Link>
      </p>
    </div>
  );
}