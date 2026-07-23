"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import AnonToggle from "@/components/AnonToggle";
import { InsightComment } from "@/lib/types";

export default function InsightComments({
  insightId,
  initialComments,
}: {
  insightId: string;
  initialComments: InsightComment[];
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const comment = await api.post<InsightComment>(`/insights/${insightId}/comments`, { body, isAnonymous });
      setComments((c) => [...c, comment]);
      setBody("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? (e.status === 401 ? "Log in to comment." : e.message) : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9C9483" }}>
        {comments.length} {comments.length === 1 ? "reply" : "replies"}
      </p>

      <div className="flex flex-col gap-3 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl p-3.5" style={{ background: "#FFFCF5", border: "1px solid #EFE9DB" }}>
            <span className="text-[11px] font-medium" style={{ color: c.author.isAnonymous ? "#9C9483" : "#123832" }}>
              {c.author.displayName}
            </span>
            <p className="text-sm leading-relaxed mt-1" style={{ color: "#1E2521" }}>{c.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2">
        <AnonToggle isAnonymous={isAnonymous} onChange={setIsAnonymous} />
        <textarea
          required
          rows={3}
          placeholder="Add your own reflection…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none"
          style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
        />
        {error && <p className="text-xs" style={{ color: "#A8615A" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="text-sm font-medium px-4 py-2 rounded-full self-start"
          style={{ background: "#123832", color: "#F7F2E7", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Posting…" : "Reply"}
        </button>
      </form>
    </div>
  );
}