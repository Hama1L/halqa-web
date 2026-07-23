"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { AyahSnapshot } from "@/lib/types";

interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface AyahPickerProps {
  onChange: (value: { surahNumber: number; ayahStart: number; ayahEnd: number; surahName: string } | null) => void;
}

const MAX_RANGE = 10;

export default function AyahPicker({ onChange }: AyahPickerProps) {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [surahNumber, setSurahNumber] = useState<number | null>(null);
  const [ayahStart, setAyahStart] = useState<number>(1);
  const [ayahEnd, setAyahEnd] = useState<number>(1);
  const [preview, setPreview] = useState<AyahSnapshot[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    api.get<SurahMeta[]>("/quran/surahs").then(setSurahs).catch(() => setError("Couldn't load the Surah list."));
  }, []);

  const selectedSurah = surahs.find((s) => s.number === surahNumber) ?? null;

  // Debounced live preview fetch whenever the selection settles
  useEffect(() => {
    if (!surahNumber || !ayahStart || !ayahEnd || ayahEnd < ayahStart) {
      setPreview([]);
      onChange(null);
      return;
    }
    if (ayahEnd - ayahStart + 1 > MAX_RANGE) {
      setError(`Keep it to ${MAX_RANGE} ayahs or fewer.`);
      setPreview([]);
      onChange(null);
      return;
    }
    setError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingPreview(true);
      try {
        const ayahs = await api.get<AyahSnapshot[]>(
          `/quran/ayahs?surahNumber=${surahNumber}&ayahStart=${ayahStart}&ayahEnd=${ayahEnd}`
        );
        setPreview(ayahs);
        onChange({ surahNumber, ayahStart, ayahEnd, surahName: selectedSurah?.englishName ?? "" });
      } catch {
        setError("Couldn't fetch that range — try again.");
        setPreview([]);
        onChange(null);
      } finally {
        setLoadingPreview(false);
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahNumber, ayahStart, ayahEnd]);

  const maxAyah = selectedSurah?.numberOfAyahs ?? 1;

  return (
    <div className="rounded-xl p-4" style={{ background: "#FFFCF5", border: "1px solid #EAE3D3" }}>
      <p className="text-xs font-semibold mb-3" style={{ color: "#1E2521" }}>
        Which Ayah are you reflecting on?
      </p>

      <div className="grid grid-cols-3 gap-2 mb-1">
        <select
          value={surahNumber ?? ""}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            setSurahNumber(n || null);
            setAyahStart(1);
            setAyahEnd(1);
          }}
          className="col-span-3 rounded-lg px-2.5 py-2 text-sm outline-none"
          style={{ background: "#F7F2E7", border: "1px solid #DCD3BC", color: "#1E2521" }}
        >
          <option value="">Select a Surah…</option>
          {surahs.map((s) => (
            <option key={s.number} value={s.number}>
              {s.number}. {s.englishName} ({s.numberOfAyahs} ayahs)
            </option>
          ))}
        </select>

        <select
          value={ayahStart}
          disabled={!selectedSurah}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setAyahStart(v);
            if (ayahEnd < v) setAyahEnd(v);
          }}
          className="rounded-lg px-2.5 py-2 text-sm outline-none"
          style={{ background: "#F7F2E7", border: "1px solid #DCD3BC", color: "#1E2521" }}
        >
          {Array.from({ length: maxAyah }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>Ayah {n}</option>
          ))}
        </select>

        <span className="flex items-center justify-center text-xs" style={{ color: "#9C9483" }}>to</span>

        <select
          value={ayahEnd}
          disabled={!selectedSurah}
          onChange={(e) => setAyahEnd(parseInt(e.target.value, 10))}
          className="rounded-lg px-2.5 py-2 text-sm outline-none"
          style={{ background: "#F7F2E7", border: "1px solid #DCD3BC", color: "#1E2521" }}
        >
          {Array.from({ length: maxAyah }, (_, i) => i + 1)
            .filter((n) => n >= ayahStart)
            .map((n) => (
              <option key={n} value={n}>Ayah {n}</option>
            ))}
        </select>
      </div>

      {error && <p className="text-xs mt-2" style={{ color: "#A8615A" }}>{error}</p>}

      {loadingPreview && (
        <div className="rounded-lg mt-3 animate-pulse" style={{ background: "#EFE9DB", height: 80 }} />
      )}

      {!loadingPreview && preview.length > 0 && (
        <div className="mt-3 rounded-lg p-3" style={{ background: "#F7F2E7" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: "#9C9483" }}>
            Preview — {selectedSurah?.englishName} {ayahStart}{ayahEnd > ayahStart ? `–${ayahEnd}` : ""}
          </p>
          {preview.map((a) => (
            <div key={a.number} className="mb-2 last:mb-0">
              <p dir="rtl" className="text-lg leading-relaxed" style={{ fontFamily: "'Amiri', serif", color: "#1E2521" }}>
                {a.arabic}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#7A7364" }}>{a.translation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}