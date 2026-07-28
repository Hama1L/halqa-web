"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquareQuote, PenLine } from "lucide-react";
import { SurahDetail, Insight } from "@/lib/types";

export default function QuranReader({ surah, insights }: { surah: SurahDetail; insights: Insight[] }) {
  const [openAyah, setOpenAyah] = useState<number | null>(null);

  const insightsForAyah = (ayahNumber: number) =>
    insights.filter((i) => ayahNumber >= i.ayahStart && ayahNumber <= i.ayahEnd);

  return (
    <div className="pt-2">
      <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
        {surah.meta.englishName}
      </h2>
      <p className="text-xs mb-4" style={{ color: "#9C9483" }}>{surah.meta.numberOfAyahs} ayahs</p>

      <div className="flex flex-col">
        {surah.ayahs.map((a) => {
          const matches = insightsForAyah(a.number);
          const isOpen = openAyah === a.number;
          return (
            <div
              key={a.number}
              className="px-4 py-3"
              style={{ borderBottom: "1px solid #EFE9DB" }}
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
    </div>
  );
}