import Link from "next/link";
import { Question } from "@/lib/types";

export const dynamic = "force-dynamic";
async function getQuestions(): Promise<Question[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function CommunityPage() {
  const questions = await getQuestions();

  return (
    <div className="pt-2 relative">
      
      {/* 
        The Owl GIF 
        Make sure to update the src to your exact file name, e.g., "/owl.gif" 
      */}
      <img 
        src="/owl.gif" 
        alt="Wise Owl" 
        className="pointer-events-none"
        style={{ 
          position: "absolute",
          top: -5,    // Adjust to perch it perfectly on the header
          left: 120,  // Placed just to the left of the "Ask something" button
          width: 36,   // Adjust based on your GIF's actual size
          zIndex: 10,
          filter: "drop-shadow(0px 4px 2px rgba(0,0,0,0.06))" // Optional cozy shadow
        }} 
      />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
          Community
        </h2>
        <Link
          href="/community/ask"
          className="text-xs font-medium px-3 py-1.5 rounded-full"
          style={{ background: "#123832", color: "#F7F2E7" }}
        >
          Ask something
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {questions.length === 0 && (
          <p className="text-center text-sm py-16" style={{ color: "#9C9483" }}>
            No questions yet — be the first to ask.
          </p>
        )}
        {questions.map((q) => (
          <Link
            key={q.id}
            href={`/community/${q.id}`}
            className="block rounded-xl p-4"
            style={{ background: "#FFFCF5", border: "1px solid #EAE3D3" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium" style={{ color: q.author.isAnonymous ? "#9C9483" : "#123832" }}>
                {q.author.displayName}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: q.status === "ANSWERED" ? "#EEF3EE" : "#F7EBE9", color: q.status === "ANSWERED" ? "#5F7A63" : "#A8615A" }}
              >
                {q.status === "ANSWERED" ? "Answered" : "Open"}
              </span>
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#1E2521" }}>{q.title}</p>
            <p className="text-xs" style={{ color: "#9C9483" }}>{q.answersCount ?? 0} replies</p>
          </Link>
        ))}
      </div>
    </div>
  );
}