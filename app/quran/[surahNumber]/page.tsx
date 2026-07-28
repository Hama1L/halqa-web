import QuranReader from "@/components/QuranReader";
import { SurahDetail, Insight } from "@/lib/types";

async function getSurahDetail(number: string): Promise<SurahDetail | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quran/surah/${number}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getInsightsForSurah(number: string): Promise<Insight[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/insights?surahNumber=${number}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function SurahPage({ params }: { params: Promise<{ surahNumber: string }> }) {
  const { surahNumber } = await params;
  const [surah, insights] = await Promise.all([getSurahDetail(surahNumber), getInsightsForSurah(surahNumber)]);

  if (!surah) return <p className="pt-6 text-sm" style={{ color: "#9C9483" }}>Couldn't load this Surah.</p>;

  return <QuranReader surah={surah} insights={insights} />;
}