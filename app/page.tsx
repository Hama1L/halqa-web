"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { 
  Wind, CloudRain, Heart, Flame, Compass, Mountain, 
  RefreshCw, CloudOff, BookOpen, Quote, Calendar, 
  ShieldCheck, Clock, Sparkles, ChevronRight, MessageSquare 
} from "lucide-react";

// --- MOOD CONFIGURATION ---
const MOODS = [
  { key: "daily", label: "Daily Reminder", icon: Calendar, color: "#123832", tint: "#E3ECE8", description: "Today's assigned Ayah & Hadith" },
  { key: "anxious", label: "Anxious", icon: Wind, color: "#3D5A73", tint: "#EAEFF3", quranKeyword: "fear", hadithKeyword: "fear" },
  { key: "sad", label: "Sad", icon: CloudRain, color: "#6B5670", tint: "#F0EBF1", quranKeyword: "grief", hadithKeyword: "grief" },
  { key: "grateful", label: "Grateful", icon: Heart, color: "#B8933D", tint: "#FBF3E1", quranKeyword: "grateful", hadithKeyword: "thank" },
  { key: "angry", label: "Angry", icon: Flame, color: "#A8615A", tint: "#F7EBE9", quranKeyword: "anger", hadithKeyword: "angry" },
  { key: "guidance", label: "Seeking guidance", icon: Compass, color: "#5F7A63", tint: "#EEF3EE", quranKeyword: "guidance", hadithKeyword: "guidance" },
  { key: "struggling", label: "Struggling", icon: Mountain, color: "#8C5A2B", tint: "#F5EDE2", quranKeyword: "hardship", hadithKeyword: "patience" },
];

const FALLBACK_AYAHS = [
  { arabic: "وَبَشِّرِ الصَّابِرِينَ", text: "And give good tidings to the patient.", ref: "Al-Baqarah 2:155" },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", text: "So remember Me; I will remember you.", ref: "Al-Baqarah 2:152" },
  { arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", text: "And He is with you wherever you are.", ref: "Al-Hadid 57:4" },
];

const FALLBACK_HADITH = [
  { text: "The best of you are those who are best to their families.", ref: "At-Tirmidhi" },
  { text: "Smiling in your brother's face is charity.", ref: "At-Tirmidhi" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", ref: "Bukhari & Muslim" },
];

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

// --- API HELPERS ---
async function searchQuranByKeyword(keyword: string) {
  const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(keyword)}/all/en.sahih`);
  if (!res.ok) throw new Error("quran search failed");
  const json = await res.json();
  const matches = json.data?.matches || [];
  if (!matches.length) throw new Error("no quran matches");
  const m = matches[Math.floor(Math.random() * matches.length)];

  const arRes = await fetch(`https://api.alquran.cloud/v1/ayah/${m.surah.number}:${m.numberInSurah}/quran-uthmani`);
  if (!arRes.ok) throw new Error("arabic fetch failed");
  const arJson = await arRes.json();

  return {
    arabic: arJson.data.text,
    text: m.text,
    ref: `${m.surah.englishName} ${m.surah.number}:${m.numberInSurah}`,
  };
}

async function fetchDailyAyah() {
  const n = (dayOfYear() % 6236) + 1;
  const res = await fetch(`https://api.alquran.cloud/v1/ayah/${n}/editions/quran-uthmani,en.sahih`);
  if (!res.ok) throw new Error("ayah fetch failed");
  const json = await res.json();
  const arabicEd = json.data.find((d: any) => d.edition.identifier === "quran-uthmani");
  const enEd = json.data.find((d: any) => d.edition.identifier === "en.sahih");
  return { arabic: arabicEd.text, text: enEd.text, ref: `${arabicEd.surah.englishName} ${arabicEd.surah.number}:${arabicEd.numberInSurah}` };
}

async function fetchHadithBook() {
  const res = await fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari.min.json");
  if (!res.ok) throw new Error("hadith book fetch failed");
  const json = await res.json();
  return json.hadiths || [];
}

async function searchHadithByKeyword(book: any[], keyword: string) {
  const matches = book.filter((h) => h.text && h.text.toLowerCase().includes(keyword.toLowerCase()));
  if (!matches.length) throw new Error("no hadith matches");
  const m = matches[Math.floor(Math.random() * matches.length)];
  return { text: m.text, ref: `Sahih al-Bukhari ${m.hadithnumber}` };
}

async function fetchDailyHadith(book: any[]) {
  const n = (dayOfYear() % Math.max(book.length, 1));
  const h = book[n];
  return { text: h.text, ref: `Sahih al-Bukhari ${h.hadithnumber}` };
}

function LatticeDivider() {
  return (
    <svg viewBox="0 0 200 8" className="w-full h-2 opacity-40 my-3" preserveAspectRatio="none">
      <defs>
        <pattern id="lattice" width="16" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 L4 0 L8 4 L4 8 Z" fill="none" stroke="#B8933D" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="200" height="8" fill="url(#lattice)" />
    </svg>
  );
}

// --- PIXEL CAT SPRITE (curled sleeping cat, VS Code Pets style) ---
// Each row is a 16-char string. Legend:
// '.' transparent  'k' outline  'b' body fur  'e' closed eye  'p' inner ear (pink)  'w' belly patch
const CAT_SPRITE: string[] = [
 "................",
  "...kk...kk......",
  "..kpkk.kpkk.....",
  ".kbbbbkbbbbk....",
  "kbbbbbbbbbbbk...",
  "kbbebbbpebbbk...", 
  "kbbbbbbbbbbbbkk.", 
  ".kbbbbwwbbbbbbbk", 
  "..kkkkkkkkkkbbbk", 
  "...........kbk..", 
  "............kbk.", 
  "............kwk.", 
  "............kk..", 
  "................",
  "................",
  "................",
];

type PixelCatPalette = {
  body: string;
  outline: string;
  ear: string;
  belly: string;
};

const CAT_PALETTES: Record<string, PixelCatPalette> = {
  tabby: { body: "#D98E4A", outline: "#5A3A1E", ear: "#F3B7A0", belly: "#FBF3E1" },
  cream: { body: "#EDE0C4", outline: "#8A7250", ear: "#F0C9C0", belly: "#FFFCF5" },
  smoke: { body: "#8B8F94", outline: "#3A3D40", ear: "#D9AFC0", belly: "#EFEFEF" },
  moonlight: { body: "#D9C98A", outline: "#4B4331", ear: "#F0DFC0", belly: "#F7F2E7" },
};

type PixelCatProps = {
  palette?: keyof typeof CAT_PALETTES;
  size?: number;
  flip?: boolean;
  delay?: number;
  style?: React.CSSProperties;
};

function PixelCat({ palette = "tabby", size = 56, flip = false, delay = 0, style }: PixelCatProps) {
  const colors = CAT_PALETTES[palette];
  const cell = 1; // grid unit
  const cols = CAT_SPRITE[0].length;
  const rows = CAT_SPRITE.length;

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size * (rows / cols),
        transform: flip ? "scaleX(-1)" : undefined,
        pointerEvents: "none",
        zIndex: 5,
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${cols} ${rows}`}
        width={size}
        height={size * (rows / cols)}
        shapeRendering="crispEdges"
        style={{
          display: "block",
          overflow: "visible",
          animation: "pixelCatBreathe 3.2s ease-in-out infinite",
          animationDelay: `${delay}s`,
          transformOrigin: "50% 85%",
        }}
      >
        {CAT_SPRITE.map((row, y) =>
          row.split("").map((ch, x) => {
            if (ch === ".") return null;
            const fill =
              ch === "k" ? colors.outline :
              ch === "b" ? colors.body :
              ch === "e" ? colors.outline :
              ch === "p" ? colors.ear :
              ch === "w" ? colors.belly : "transparent";
            return (
              <rect
                key={`${x}-${y}`}
                x={x * cell}
                y={y * cell}
                width={cell}
                height={cell}
                fill={fill}
              />
            );
          })
        )}
      </svg>

      <span className="cat-zzz cat-zzz-1" style={{ color: colors.outline }}>z</span>
      <span className="cat-zzz cat-zzz-2" style={{ color: colors.outline }}>Z</span>
    </div>
  );
}

function CatStyles() {
  return (
    <style>{`
     @keyframes walkToEdge {
  /* Start at the left edge (16px padding to match your layout) */
  0% { left: 16px; transform: scaleX(-1); }
  
  /* Walk exactly to the right edge of the card */
  45% { left: calc(100% - 56px); transform: scaleX(-1); } 
  
  /* Turn around */
  50% { left: calc(100% - 56px); transform: scaleX(1); } 
  
  /* Walk back to the start */
  95% { left: 16px; transform: scaleX(1); } 
  
  /* Ready to go again */
  100% { left: 16px; transform: scaleX(-1); } 
}

.animate-crab {
  animation: walkToEdge 12s linear infinite;
  will-change: left, transform;
}
      @keyframes pixelCatBreathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes zzzFloat {
        0% { opacity: 0; transform: translate(0, 4px) scale(0.7); }
        25% { opacity: 1; }
        100% { opacity: 0; transform: translate(6px, -18px) scale(1.15); }
      }
      .cat-zzz {
        position: absolute;
        top: -8px;
        right: 4px;
        font-family: 'Amiri', serif;
        font-weight: 700;
        font-size: 12px;
        line-height: 1;
        opacity: 0;
      }
      .cat-zzz-1 { animation: zzzFloat 2.6s ease-in-out infinite; }
      .cat-zzz-2 {
        top: -12px;
        right: -4px;
        font-size: 9px;
        animation: zzzFloat 2.6s ease-in-out infinite;
        animation-delay: 0.9s;
      }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    `}</style>
  );
}

function VersesResultCard({ mood, ayah, hadith, status, onReset }: any) {
  const Icon = mood.icon;
  return (
    <div className="mt-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} color={mood.color} />
        <span className="text-sm font-semibold" style={{ color: "#1E2521" }}>
          {mood.key === "daily" ? "Today's Daily Reflection" : `Verses for feeling ${mood.label.toLowerCase()}`}
        </span>
        {status === "offline" && (
          <span className="flex items-center gap-1 text-[10px] ml-auto text-amber-700">
            <CloudOff size={11} /> offline copy
          </span>
        )}
      </div>

      {!ayah || !hadith ? (
        <div className="rounded-xl p-5 mb-3 animate-pulse" style={{ background: "#EFE9DB", height: 180 }} />
      ) : (
        <>
          <div className="rounded-xl p-5 mb-3 transition-all" style={{ background: "#FFFCF5", border: `1px solid ${mood.color}33`, borderLeft: `4px solid ${mood.color}` }}>
            <div className="flex items-center gap-1.5 mb-3">
              <BookOpen size={14} color={mood.color} />
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: mood.color }}>Qur'an</span>
            </div>
            <p dir="rtl" className="text-xl leading-relaxed mb-3 font-serif" style={{ fontFamily: "'Amiri', serif", color: "#1E2521" }}>{ayah.arabic}</p>
            <p className="text-sm leading-relaxed mb-1" style={{ color: "#1E2521" }}>{ayah.text}</p>
            <p className="text-xs text-right font-medium" style={{ color: "#9C9483" }}>— {ayah.ref}</p>
          </div>

          <div className="rounded-xl p-5 mb-4 transition-all" style={{ background: "#FFFCF5", border: `1px solid ${mood.color}33`, borderLeft: `4px solid ${mood.color}` }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Quote size={14} color={mood.color} />
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: mood.color }}>Hadith</span>
            </div>
            <p className="text-sm leading-relaxed mb-1 italic" style={{ color: "#1E2521" }}>"{hadith.text}"</p>
            <p className="text-xs text-right font-medium" style={{ color: "#9C9483" }}>— {hadith.ref}</p>
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onReset(null)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-3 rounded-full transition-opacity hover:opacity-90"
          style={{ background: "#123832", color: "#F7F2E7" }}
        >
          Choose another state
        </button>
        {mood.key !== "daily" && (
          <button
            onClick={() => onReset(mood)}
            className="flex items-center justify-center gap-1.5 text-xs font-medium px-4 py-3 rounded-full transition-colors"
            style={{ background: "#EDE7D8", color: "#4B4737" }}
            title="Get another reflection for this mood"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [ayah, setAyah] = useState<any>(null);
  const [hadith, setHadith] = useState<any>(null);
  const [status, setStatus] = useState("loading");
  const hadithBookRef = useRef<any[] | null>(null);

  const runMood = useCallback(async (mood: any) => {
    setSelectedMood(mood);
    setAyah(null);
    setHadith(null);
    setStatus("loading");

    try {
      if (!hadithBookRef.current) hadithBookRef.current = await fetchHadithBook();
    } catch {
      hadithBookRef.current = hadithBookRef.current || [];
    }

    if (mood.key === "daily") {
      try {
        const [a, h] = await Promise.all([fetchDailyAyah(), fetchDailyHadith(hadithBookRef.current ?? [])]);
        setAyah(a);
        setHadith(h);
        setStatus("live");
      } catch {
        setAyah(FALLBACK_AYAHS[dayOfYear() % FALLBACK_AYAHS.length]);
        setHadith(FALLBACK_HADITH[dayOfYear() % FALLBACK_HADITH.length]);
        setStatus("offline");
      }
      return;
    }

    const [qRes, hRes] = await Promise.allSettled([
      searchQuranByKeyword(mood.quranKeyword),
      (hadithBookRef.current ?? []).length ? searchHadithByKeyword(hadithBookRef.current ?? [], mood.hadithKeyword) : Promise.reject(),
    ]);

    const a = qRes.status === "fulfilled" ? qRes.value : FALLBACK_AYAHS[Math.floor(Math.random() * FALLBACK_AYAHS.length)];
    const h = hRes.status === "fulfilled" ? hRes.value : FALLBACK_HADITH[Math.floor(Math.random() * FALLBACK_HADITH.length)];
    setAyah(a);
    setHadith(h);
    setStatus(qRes.status === "fulfilled" && hRes.status === "fulfilled" ? "live" : "offline");
  }, []);

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#F7F2E7" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <CatStyles />

      <div className="w-full max-w-md pb-12" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

        <main className="px-4 space-y-6">

          {/* Hero Section — no cat here, kept clean */}
          <section className="relative text-center pt-2 pb-1">
             
            <h2 className="text-xl font-semibold mb-1" style={{ color: "#123832", fontFamily: "'Amiri', serif" }}>
              Reflect, Seek & Pray Without Judgment
            </h2>
            <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: "#6E6859" }}>
              Find solace in Quranic wisdom, connect with emotional clarity, and keep up with your daily Namaaz.
            </p>
          </section>

          {/* Interactive Mood & Daily Selection — tabby cat curled on the corner */}
          <section className="rounded-2xl p-4" style={{ background: "#FFFCF5", border: "1px solid #EAE3D3", position: "relative", overflow: "visible" }}>
            
            <img 
    src="/Cat.gif" 
    alt="Resting Cat" 
    className="pointer-events-none"
    style={{ 
      position: "absolute", 
      top: -30,   // Negative value pulls it up onto the border
      left: -1,   // Distance from the left edge
      width: 80,  // Size of the cat
      zIndex: 10,
      filter: "drop-shadow(0px 4px 2px rgba(0,0,0,0.08))" // Optional: adds a soft shadow
    }} 
  />
            <img 
    src="/cat_butter.gif" 
    alt="Resting Cat" 
    className="pointer-events-none"
    style={{ 
      position: "absolute", 
      top: -66,   // Negative value pulls it up onto the border
      right: 5,   // Distance from the left edge
      width: 70,  // Size of the cat
      zIndex: 10,
      filter: "drop-shadow(0px 4px 2px rgba(0,0,0,0.08))" // Optional: adds a soft shadow
    }} 
  />
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#123832" }}>
                  How is your heart today?
                </span>
                <Sparkles size={14} color="#B8933D" />
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: "#8A7E68" }}>
                Select a state or view today's daily reminder.
              </p>
            </div>

            {!selectedMood ? (
              <div className="grid grid-cols-2 gap-2.5">
                {MOODS.map((mood) => {
                  const Icon = mood.icon;
                  const isDaily = mood.key === "daily";
                  return (
                    <button
                      key={mood.key}
                      onClick={() => runMood(mood)}
                      className={`flex flex-col items-start p-3.5 rounded-xl text-left transition-all hover:scale-[1.02] ${
                        isDaily ? "col-span-2 flex-row items-center justify-between" : ""
                      }`}
                      style={{ 
                        background: mood.tint, 
                        border: `1px solid ${mood.color}${isDaily ? '40' : '22'}` 
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg" style={{ background: `${mood.color}1A` }}>
                          <Icon size={18} color={mood.color} strokeWidth={2} />
                        </div>
                        <div>
                          <span className="text-xs font-bold block" style={{ color: mood.color }}>
                            {mood.label}
                          </span>
                          {isDaily && (
                            <span className="text-[10px] block opacity-80" style={{ color: mood.color }}>
                              {mood.description}
                            </span>
                          )}
                        </div>
                      </div>
                      {isDaily && <ChevronRight size={16} color={mood.color} />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <VersesResultCard
                mood={selectedMood}
                ayah={ayah}
                hadith={hadith}
                status={status}
                onReset={(m: any) => (m ? runMood(m) : setSelectedMood(null))}
              />
            )}
          </section>

          {/* Feature Navigation Cards */}
          <section className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider block px-1" style={{ color: "#8A7E68" }}>
              Explore Halqa
            </span>

            {/* Namaaz Guidance Card — smoke-grey cat napping on the corner */}
            <div className="rounded-xl p-4 flex items-center justify-between transition-shadow hover:shadow-sm" style={{ background: "#FFFCF5", border: "1px solid #EAE3D3", position: "relative", overflow: "visible" }}>
              <img 
    src="/cat_walk.gif" 
    alt="Cat Walking" 
    className="pointer-events-none animate-crab"
    style={{ 
      position: "absolute", 
      top: -37,  // This will now perfectly overlap the top of this section
        // Adjusted to align with the left edge
width: 40, 
      zIndex: 10
    }} 
  />
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: "#EEF3EE", color: "#5F7A63" }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold" style={{ color: "#123832" }}>Namaaz & Prayer Timings</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: "#8A7E68" }}>Step-by-step guides and accurate prayer schedules.</p>
                </div>
              </div>
              <Link href="/namaaz" className="p-1.5 rounded-full" style={{ background: "#EDE7D8", color: "#123832" }}>
                <ChevronRight size={16} />
              </Link>
            </div>
           {/* The Qur'an Card — Walking crab on the top edge */}
<div className="rounded-xl p-4 mt-4 flex items-center justify-between transition-shadow hover:shadow-sm" style={{ background: "#FFFCF5", border: "1px solid #EAE3D3", position: "relative", overflow: "visible" }}>
  
  {/* 
    Ensure your file is named exactly like this in your public folder. 
    The 'animate-crab' class applies the walking movement.
  */}
 

  <div className="flex items-center gap-3">
    <div className="p-2.5 rounded-xl z-10" style={{ background: "#FBF3E1", color: "#B8933D" }}>
      <BookOpen size={20} />
    </div>
    <div className="z-10">
      <h3 className="text-xs font-bold" style={{ color: "#123832" }}>The Qur'an</h3>
      <p className="text-[11px] mt-0.5" style={{ color: "#8A7E68" }}>Read with translation, and see insights shared on each Ayah.</p>
    </div>
  </div>
  <Link href="/quran" className="p-1.5 rounded-full z-10 relative" style={{ background: "#EDE7D8", color: "#123832" }}>
    <ChevronRight size={16} />
  </Link>
</div>

            {/* Community & Insights Card */}
            <div className="rounded-xl p-4 flex items-center justify-between transition-shadow hover:shadow-sm" style={{ background: "#FFFCF5", border: "1px solid #EAE3D3" }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: "#FBF3E1", color: "#B8933D" }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold" style={{ color: "#123832" }}>Quranic Insights & Community</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: "#8A7E68" }}>Ask questions & share reflections anonymously.</p>
                </div>
              </div>
              <Link href="/insights" className="p-1.5 rounded-full" style={{ background: "#EDE7D8", color: "#123832" }}>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Safe Space Banner — moonlight cat dozing in the corner */}
            <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#123832", color: "#F7F2E7", position: "relative", overflow: "visible" }}>
              <PixelCat palette="moonlight" size={40} flip delay={1.2} style={{ top: -12, left: -6 }} />
              <ShieldCheck size={22} className="shrink-0 mt-0.5 text-[#D9C98A]" />
              <div>
                <h4 className="text-xs font-bold text-[#F0E4BE]">A Safe & Gentle Circle</h4>
                <p className="text-[11px] leading-relaxed mt-1 text-[#C4D3CD]">
                  Halqa protects user privacy and fosters non-judgmental discussion. Post questions or reflections with total anonymity whenever you wish.
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}