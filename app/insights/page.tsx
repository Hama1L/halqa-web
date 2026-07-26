import Link from "next/link";
import { Insight } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getInsights(): Promise<Insight[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/insights`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function InsightsPage() {
  const insights = await getInsights();

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
          Insights
        </h2>
        <Link
          href="/insights/new"
          className="text-xs font-medium px-3 py-1.5 rounded-full"
          style={{ background: "#123832", color: "#F7F2E7" }}
        >
          Share an insight
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {insights.length === 0 && (
          <p className="text-center text-sm py-16" style={{ color: "#9C9483" }}>
            No insights shared yet — be the first to reflect on an Ayah.
          </p>
        )}
        {insights.map((i) => (
          <Link
            key={i.id}
            href={`/insights/${i.id}`}
            className="block rounded-xl p-4"
            style={{ background: "#FFFCF5", border: "1px solid #EAE3D3", borderLeft: "3px solid #B8933D" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold" style={{ color: "#B8933D" }}>
                {i.surahName} {i.ayahStart}{i.ayahEnd > i.ayahStart ? `–${i.ayahEnd}` : ""}
              </span>
              <span className="text-[11px]" style={{ color: i.author.isAnonymous ? "#9C9483" : "#123832" }}>
                {i.author.displayName}
              </span>
            </div>
            {i.ayahs[0] && (
              <p dir="rtl" className="text-base leading-relaxed mb-1" style={{ fontFamily: "'Amiri', serif", color: "#1E2521" }}>
                {i.ayahs[0].arabic}
              </p>
            )}
            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "#7A7364" }}>
              {i.insightText}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}