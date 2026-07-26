"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EyeOff, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { MyQuestion, MyAnswer, MyInsight } from "@/lib/types";

type Tab = "questions" | "answers" | "insights";

function AnonymousBadge() {
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#EDE7D8", color: "#4B4737" }}>
      <EyeOff size={10} /> Posted anonymously
    </span>
  );
}

function RemovedBadge() {
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F7EBE9", color: "#A8615A" }}>
      <ShieldAlert size={10} /> Removed by moderators
    </span>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("questions");
  const [questions, setQuestions] = useState<MyQuestion[]>([]);
  const [answers, setAnswers] = useState<MyAnswer[]>([]);
  const [insights, setInsights] = useState<MyInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    Promise.all([
      api.get<MyQuestion[]>("/questions/mine"),
      api.get<MyAnswer[]>("/questions/mine/answers"),
      api.get<MyInsight[]>("/insights/mine"),
    ])
      .then(([q, a, i]) => {
        setQuestions(q);
        setAnswers(a);
        setInsights(i);
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || !user) return null;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "questions", label: "Questions", count: questions.length },
    { key: "answers", label: "Answers", count: answers.length },
    { key: "insights", label: "Insights", count: insights.length },
  ];

  return (
    <div className="pt-2">
      <div className="rounded-xl p-5 mb-5" style={{ background: "#123832" }}>
        <p className="text-lg font-bold" style={{ fontFamily: "'Amiri', serif", color: "#F7F2E7" }}>
          {user.displayName}
        </p>
        <p className="text-xs" style={{ color: "#9FB3AC" }}>{user.email}</p>
        <p className="text-[11px] mt-2" style={{ color: "#7C9089" }}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
            style={{ background: tab === t.key ? "#123832" : "#EDE7D8", color: tab === t.key ? "#F7F2E7" : "#4B4737" }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {loading && <div className="rounded-xl p-5 animate-pulse" style={{ background: "#EFE9DB", height: 200 }} />}

      {!loading && tab === "questions" && (
        <div className="flex flex-col gap-3">
          {questions.length === 0 && <EmptyState label="You haven't asked anything yet." />}
          {questions.map((q) => (
            <Link key={q.id} href={`/community/${q.id}`} className="block rounded-xl p-4" style={cardStyle}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={statusStyle(q.status)}>
                  {q.status === "ANSWERED" ? "Answered" : q.status === "CLOSED" ? "Closed" : "Open"}
                </span>
                {q.isAnonymous && <AnonymousBadge />}
                {q.isRemoved && <RemovedBadge />}
              </div>
              <p className="text-sm font-semibold" style={{ color: "#1E2521" }}>{q.title}</p>
            </Link>
          ))}
        </div>
      )}

      {!loading && tab === "answers" && (
        <div className="flex flex-col gap-3">
          {answers.length === 0 && <EmptyState label="You haven't answered anything yet." />}
          {answers.map((a) => (
            <Link key={a.id} href={`/community/${a.question.id}`} className="block rounded-xl p-4" style={cardStyle}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {a.isAnonymous && <AnonymousBadge />}
                {a.isRemoved && <RemovedBadge />}
              </div>
              <p className="text-[11px] mb-1" style={{ color: "#9C9483" }}>On: {a.question.title}</p>
              <p className="text-sm line-clamp-2" style={{ color: "#1E2521" }}>{a.body}</p>
            </Link>
          ))}
        </div>
      )}

      {!loading && tab === "insights" && (
        <div className="flex flex-col gap-3">
          {insights.length === 0 && <EmptyState label="You haven't shared an insight yet." />}
          {insights.map((i) => (
            <Link key={i.id} href={`/insights/${i.id}`} className="block rounded-xl p-4" style={{ ...cardStyle, borderLeft: "3px solid #B8933D" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold" style={{ color: "#B8933D" }}>
                  {i.surahName} {i.ayahStart}{i.ayahEnd > i.ayahStart ? `–${i.ayahEnd}` : ""}
                </span>
                <span className="text-[11px]" style={{ color: "#9C9483" }}>{i.likes} likes · {i.commentsCount} replies</span>
              </div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {i.isAnonymous && <AnonymousBadge />}
                {i.isRemoved && <RemovedBadge />}
              </div>
              <p className="text-sm line-clamp-2" style={{ color: "#1E2521" }}>{i.insightText}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-center text-sm py-16" style={{ color: "#9C9483" }}>{label}</p>;
}

const cardStyle = { background: "#FFFCF5", border: "1px solid #EAE3D3" };

function statusStyle(status: string) {
  if (status === "ANSWERED") return { background: "#EEF3EE", color: "#5F7A63" };
  if (status === "CLOSED") return { background: "#EDE7D8", color: "#4B4737" };
  return { background: "#F7EBE9", color: "#A8615A" };
}