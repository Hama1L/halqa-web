"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import AnonToggle from "@/components/AnonToggle";
import { Question } from "@/lib/types";

export const dynamic = "force-dynamic";
export default function AskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const q = await api.post<Question>("/questions", {
        title,
        body,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        isAnonymous,
      });
      router.push(`/community/${q.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>
        Ask the circle
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <AnonToggle isAnonymous={isAnonymous} onChange={setIsAnonymous} />

        <input
          required
          placeholder="What's your question, in a sentence?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
          style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
        />
        <textarea
          required
          rows={6}
          placeholder="Add any context that would help someone answer well."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none"
          style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
        />
        <input
          placeholder="Tags, comma separated (e.g. fiqh, salah)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
          style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
        />

        {error && <p className="text-xs" style={{ color: "#A8615A" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm font-medium px-4 py-2.5 rounded-full mt-1"
          style={{ background: "#123832", color: "#F7F2E7", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Posting…" : "Post question"}
        </button>
      </form>
    </div>
  );
}