"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import AnonToggle from "@/components/AnonToggle";
import AyahPicker from "@/components/AyahPicker";
import { Insight } from "@/lib/types";

export default function NewInsightPage() {
  const router = useRouter();
  const [selection, setSelection] = useState<{ surahNumber: number; ayahStart: number; ayahEnd: number } | null>(null);
  const [insightText, setInsightText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = selection && insightText.trim().length >= 10;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection) return;
    setError("");
    setLoading(true);
    try {
      const insight = await api.post<Insight>("/insights", {
        surahNumber: selection.surahNumber,
        ayahStart: selection.ayahStart,
        ayahEnd: selection.ayahEnd,
        insightText: insightText.trim(),
        isAnonymous,
      });
      router.push(`/insights/${insight.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
        Share an insight
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <AnonToggle isAnonymous={isAnonymous} onChange={setIsAnonymous} />

        <AyahPicker onChange={setSelection} />

        <textarea
          required
          minLength={10}
          rows={6}
          placeholder="What does this Ayah mean to you? What made you stop and think?"
          value={insightText}
          onChange={(e) => setInsightText(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none"
          style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
        />

        {error && <p className="text-xs" style={{ color: "#A8615A" }}>{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="w-full text-sm font-medium px-4 py-2.5 rounded-full mt-1"
          style={{
            background: canSubmit ? "#123832" : "#DCD3BC",
            color: "#F7F2E7",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Posting…" : "Share insight"}
        </button>
      </form>
    </div>
  );
}