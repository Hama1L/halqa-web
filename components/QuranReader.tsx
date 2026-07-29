"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MessageSquareQuote, PenLine, ChevronLeft, ChevronRight } from "lucide-react";
import { SurahDetail, Insight, SurahMeta } from "@/lib/types";

export default function QuranReader({
  surah,
  insights,
  prevSurah,
  nextSurah,
}: {
  surah: SurahDetail;
  insights: Insight[];
  prevSurah?: SurahMeta | null;
  nextSurah?: SurahMeta | null;
}) {
  const [openAyah, setOpenAyah] = useState<number | null>(null);
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);

  useEffect(() => {
    const hash = window.location.hash; // e.g. "#ayah-153"
    const match = hash.match(/^#ayah-(\d+)$/);
    if (!match) return;

    const ayahNumber = parseInt(match[1], 10);
    const el = document.getElementById(`ayah-${ayahNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedAyah(ayahNumber);
      const timer = setTimeout(() => setHighlightedAyah(null), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 🔥 THE OPTIMIZATION:
  // Build a dictionary of insights grouped by Ayah number.
  // useMemo ensures this only runs once when the 'insights' prop changes, not on every render.
  const insightsByAyah = useMemo(() => {
    const map = new Map<number, Insight[]>();

    insights.forEach((insight) => {
      // Loop from ayahStart to ayahEnd in case an insight spans multiple verses
      for (let i = insight.ayahStart; i <= insight.ayahEnd; i++) {
        if (!map.has(i)) {
          map.set(i, []);
        }
        map.get(i)!.push(insight);
      }
    });

    return map;
  }, [insights]);

  return (
    <div className="pt-2">
      <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
        {surah.meta.englishName}
      </h2>
      <p className="text-xs mb-4" style={{ color: "#9C9483" }}>{surah.meta.numberOfAyahs} ayahs</p>

      <div className="flex flex-col">
        {surah.ayahs.map((a) => {
          
          // 🔥 FAST LOOKUP:
          // Instead of filtering the whole array, we instantly grab the pre-sorted list (or an empty array)
          const matches = insightsByAyah.get(a.number) || [];
          
          const isOpen = openAyah === a.number;
          const isHighlighted = highlightedAyah === a.number;
          
          return (
            <div
              key={a.number}
              id={`ayah-${a.number}`}
              className="px-4 py-3 transition-colors duration-700"
              style={{
                borderBottom: "1px solid #EFE9DB",
                background: isHighlighted ? "#FBF3E1" : "transparent",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold" style={{ color: "#B8933D" }}>
                  {surah.meta.number}:{a.number}
                </span>

                <div className="flex items-center gap-1">
                  {matches.length > 0 && (
                    <button
                      onClick={() => setOpenAyah(isOpen ? null : a.number)}
                      className="group flex items-center gap-1 rounded-full px-1.5 py-1"
                      style={{ background: isOpen ? "#EEF3EE" : "transparent", color: "#5F7A63" }}
                      title={`${matches.length} ${matches.length === 1 ? "insight" : "insights"}`}
                    >
                      <MessageSquareQuote size={13} />
                      <span className="text-[10px] font-medium">{matches.length}</span>
                    </button>
                  )}

                  <Link
                    href={`/insights/new?surah=${surah.meta.number}&ayah=${a.number}`}
                    className="group flex items-center gap-1 rounded-full px-1.5 py-1 overflow-hidden"
                    style={{ color: "#9C9483" }}
                    title="Add insight"
                  >
                    <PenLine size={13} className="shrink-0" />
                    <span className="max-w-0 group-hover:max-w-[70px] group-active:max-w-[70px] overflow-hidden whitespace-nowrap text-[10px] font-medium transition-[max-width] duration-200">
                      Add insight
                    </span>
                  </Link>
                </div>
              </div>

              <p dir="rtl" className="text-xl leading-relaxed mb-1.5" style={{ fontFamily: "'Amiri', serif", color: "#1E2521" }}>
                {a.arabic}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#7A7364" }}>{a.translation}</p>

              {isOpen && matches.length > 0 && (
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {matches.map((m) => (
                    <Link
                      key={m.id}
                      href={`/insights/${m.id}`}
                      className="rounded-lg p-2.5"
                      style={{ background: "#F7F2E7" }}
                    >
                      <span className="text-[11px] font-medium" style={{ color: m.author.isAnonymous ? "#9C9483" : "#123832" }}>
                        {m.author.displayName}
                      </span>
                      <p className="text-xs leading-relaxed line-clamp-2 mt-0.5" style={{ color: "#1E2521" }}>
                        {m.insightText}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* NEW NAVIGATION BUTTONS */}
      <div className="flex gap-2 mt-8 mb-6 px-4">
        {prevSurah ? (
          <Link
            href={`/quran/${prevSurah.number}`}
            className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2.5 bg-[#FFFCF5] border border-[#EAE3D3] hover:bg-[#F7F2E7] transition-colors duration-200"
          >
            <ChevronLeft size={16} className="text-[#9C9483]" />
            <div>
              <p className="text-[10px] text-[#9C9483] mb-0.5">Previous</p>
              <p className="text-xs font-semibold text-[#123832]">
                {prevSurah.englishName}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextSurah ? (
          <Link
            href={`/quran/${nextSurah.number}`}
            className="flex-1 flex items-center justify-end gap-2 rounded-lg px-3 py-2.5 bg-[#123832] hover:bg-[#0A221E] shadow-sm transition-colors duration-200 text-right"
          >
            <div>
              <p className="text-[10px] text-[#9FB3AC] mb-0.5">Continue reading</p>
              <p className="text-xs font-semibold text-[#F7F2E7]">
                {nextSurah.englishName}
              </p>
            </div>
            <ChevronRight size={16} className="text-[#D9C98A]" />
          </Link>
        ) : (
          <div className="flex-1 flex items-center justify-center rounded-lg px-3 py-2.5 bg-[#EEF3EE] border border-[#E1EAE1]">
            <p className="text-xs font-medium text-[#5F7A63]">
              You've reached the end — Al-Fatiha awaits 🌙
            </p>
          </div>
        )}
      </div>

    </div>
  );
}