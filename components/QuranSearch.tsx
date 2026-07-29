"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, ArrowRight } from "lucide-react";
import Fuse from "fuse.js";
import { SurahMeta } from "@/lib/types";

export default function QuranSearch({ surahs }: { surahs: SurahMeta[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when search is opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // 1. Initialize Fuse.js for fuzzy searching
  // useMemo ensures we only build the index once, not on every render
  const fuse = useMemo(
    () =>
      new Fuse(surahs, {
        keys: [
          { name: "englishName", weight: 2 }, // Prioritize the English transliteration
          { name: "name", weight: 1 },        // Arabic name
          { name: "number", weight: 1 },      // Surah number
        ],
        threshold: 0.4, // 0.0 is perfect match, 1.0 matches anything. 0.3-0.4 is a sweet spot for typos.
        ignoreLocation: true, // Finds the match anywhere in the string
      }),
    [surahs]
  );

  const trimmed = query.trim().toLowerCase();
  
  // 2. Check if they are typing an Ayah format like "2:153"
  const ayahMatch = trimmed.match(/^(\d{1,3})\s*[:.]\s*(\d{1,3})$/);
  
  // 3. Get results
  // If no query, empty array. Otherwise, get fuzzy results and map them back to the original objects.
  const filteredSurahs = trimmed
    ? fuse.search(trimmed).map((result) => result.item)
    : [];

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(url);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full transition-transform hover:scale-105"
        style={{ background: "#EDE7D8", color: "#123832" }}
        title="Search the Qur'an"
      >
        <Search size={15} />
      </button>
    );
  }

  return (
    <div className="relative z-50">
      <div className="flex items-center gap-1.5">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 2:153, Yaseen, 36"
            className="text-xs rounded-full pl-8 pr-3 py-1.5 outline-none w-48 sm:w-64 transition-all"
            style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setQuery("");
          }}
          className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
          style={{ background: "#EDE7D8", color: "#4B4737" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Dynamic Results Dropdown */}
      {trimmed.length > 0 && (
        <div 
          className="absolute top-full mt-2 right-0 w-full min-w-[240px] rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[300px] overflow-y-auto"
          style={{ background: "#FFFCF5", border: "1px solid #EAE3D3" }}
        >
          {/* Handle Ayah Jump Link First */}
          {ayahMatch && (
            <button
              onClick={() => handleSelect(`/quran/${ayahMatch[1]}#ayah-${ayahMatch[2]}`)}
              className="flex items-center justify-between px-4 py-3 hover:bg-[#FBF3E1] transition-colors text-left"
              style={{ borderBottom: "1px solid #EAE3D3" }}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={14} style={{ color: "#B8933D" }} />
                <span className="text-xs font-semibold text-[#123832]">
                  Jump to {ayahMatch[1]}:{ayahMatch[2]}
                </span>
              </div>
              <ArrowRight size={14} style={{ color: "#9C9483" }} />
            </button>
          )}

          {/* Render Fuzzy Filtered Surahs */}
          {filteredSurahs.length > 0 ? (
            filteredSurahs.map((s) => (
              <button
                key={s.number}
                onClick={() => handleSelect(`/quran/${s.number}`)}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[#EEF3EE] transition-colors text-left"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#1E2521]">
                    {s.number}. {s.englishName}
                  </span>
                  <span className="text-[10px] text-[#9C9483]">
                    {s.numberOfAyahs} ayahs
                  </span>
                </div>
              </button>
            ))
          ) : (
            !ayahMatch && (
              <div className="px-4 py-4 text-center text-xs text-[#9C9483]">
                No matching Surahs found.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}