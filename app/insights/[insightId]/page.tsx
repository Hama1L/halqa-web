import LikeButton from "@/components/LikeButton";
import InsightComments from "@/components/InsightComments";
import { Insight } from "@/lib/types";

async function getInsight(id: string): Promise<Insight | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/insights/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function InsightDetailPage({ params }:  {
  params: Promise<{ insightId: string }>;
} ) {
   const { insightId } = await params;
   const insight = await getInsight(insightId);
  if (!insight) return <p className="pt-6 text-sm" style={{ color: "#9C9483" }}>Insight not found.</p>;

  return (
    <div className="pt-2">
      <div className="rounded-xl p-5 mb-3" style={{ background: "#FFFCF5", border: "1px solid #EAE3D3", borderLeft: "3px solid #B8933D" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold" style={{ color: "#B8933D" }}>
            {insight.surahName} {insight.ayahStart}{insight.ayahEnd > insight.ayahStart ? `–${insight.ayahEnd}` : ""}
          </span>
          <span className="text-[11px]" style={{ color: insight.author.isAnonymous ? "#9C9483" : "#123832" }}>
            {insight.author.displayName}
          </span>
        </div>

        {insight.ayahs.map((a) => (
          <div key={a.number} className="mb-3 last:mb-0">
            <p dir="rtl" className="text-xl leading-relaxed mb-1" style={{ fontFamily: "'Amiri', serif", color: "#1E2521" }}>
              {a.arabic}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#7A7364" }}>{a.translation}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5 mb-3" style={{ background: "#FFFCF5", border: "1px solid #EFE9DB" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: "#9C9483" }}>Reflection</p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "#1E2521" }}>{insight.insightText}</p>
        <LikeButton insightId={insight.id} initialLikes={insight.likes} initialLikedByMe={insight.likedByMe} />
      </div>

      <InsightComments insightId={insight.id} initialComments={insight.comments ?? []} />
    </div>
  );
}