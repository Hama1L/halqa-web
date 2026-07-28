"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import AnonToggle from "@/components/AnonToggle";
import AyahPicker from "@/components/AyahPicker";
import { Insight } from "@/lib/types";

export const dynamic = "force-dynamic";

function NewInsightForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const prefillSurah = searchParams.get("surah");
  const prefillAyah = searchParams.get("ayah");
  const initialSurahNumber = prefillSurah ? parseInt(prefillSurah, 10) : undefined;
  const initialAyahStart = prefillAyah ? parseInt(prefillAyah, 10) : undefined;

  const [selection, setSelection] = useState<{ surahNumber: number; ayahStart: number; ayahEnd: number } | null>(null);
  const [insightText, setInsightText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      const query = searchParams.toString();
      const redirectTo = query ? `${pathname}?${query}` : pathname;
      router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    }
  }, [authLoading, user, router, pathname, searchParams]);

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

  if (authLoading || !user) return null;

  return (
    <div className="pt-2">
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
        Share an insight
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <AnonToggle isAnonymous={isAnonymous} onChange={setIsAnonymous} />

        <AyahPicker
          onChange={setSelection}
          initialSurahNumber={initialSurahNumber}
          initialAyahStart={initialAyahStart}
          initialAyahEnd={initialAyahStart}
        />

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

export default function NewInsightPage() {
  return (
    <Suspense fallback={null}>
      <NewInsightForm />
    </Suspense>
  );
}