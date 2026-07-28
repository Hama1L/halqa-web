import Link from "next/link";
import { SurahMeta } from "@/lib/types";

async function getSurahs(): Promise<SurahMeta[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quran/surahs`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function QuranPage() {
  const surahs = await getSurahs();

  return (
    <div className="pt-2">
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
        The Qur'an
      </h2>
      <div className="flex flex-col gap-2">
        {surahs.map((s) => (
          <Link
            key={s.number}
            href={`/quran/${s.number}`}
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: "#FFFCF5", border: "1px solid #EAE3D3" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold w-6 text-center" style={{ color: "#B8933D" }}>{s.number}</span>
              <span className="text-sm font-medium" style={{ color: "#1E2521" }}>{s.englishName}</span>
            </div>
            <span className="text-xs" style={{ color: "#9C9483" }}>{s.numberOfAyahs} ayahs</span>
          </Link>
        ))}
      </div>
    </div>
  );
}