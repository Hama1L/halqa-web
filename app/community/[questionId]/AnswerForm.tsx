"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import AnonToggle from "@/components/AnonToggle";
import { useAuth } from "@/lib/auth-context";

export default function AnswerForm({ questionId }: { questionId: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirectTo=/community/" + questionId);
    }
  }, [authLoading, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post(`/questions/${questionId}/answers`, { body, isAnonymous });
      setBody("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? (e.status === 401 ? "Log in to answer." : e.message) : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  if (authLoading || !user) return null;
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <AnonToggle isAnonymous={isAnonymous} onChange={setIsAnonymous} />
      <textarea
        required
        rows={4}
        placeholder="Share what you know, gently."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none"
        style={{ background: "#FFFCF5", border: "1px solid #DCD3BC", color: "#1E2521" }}
      />
      {error && <p className="text-xs" style={{ color: "#A8615A" }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full text-sm font-medium px-4 py-2.5 rounded-full"
        style={{ background: "#123832", color: "#F7F2E7", opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Posting…" : "Post answer"}
      </button>
    </form>
  );
}