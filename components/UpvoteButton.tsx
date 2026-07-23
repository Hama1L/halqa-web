"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigUp } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function UpvoteButton({
  answerId,
  initialUpvotes,
  initialUpvotedByMe,
}: {
  answerId: string;
  initialUpvotes: number;
  initialUpvotedByMe: boolean;
}) {
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [upvotedByMe, setUpvotedByMe] = useState(initialUpvotedByMe);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    if (pending) return;
    setPending(true);
    const prev = { upvotes, upvotedByMe };
    setUpvotes(upvotedByMe ? upvotes - 1 : upvotes + 1);
    setUpvotedByMe(!upvotedByMe);
    try {
      const res = await api.post<{ upvotes: number; upvotedByMe: boolean }>(
        `/questions/answers/${answerId}/upvote`
      );
      setUpvotes(res.upvotes);
      setUpvotedByMe(res.upvotedByMe);
    } catch (e) {
      setUpvotes(prev.upvotes);
      setUpvotedByMe(prev.upvotedByMe);
      if (e instanceof ApiError && e.status === 401) router.push("/login");
    } finally {
      setPending(false);
      router.refresh();
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: upvotedByMe ? "#EEF3EE" : "#EDE7D8", color: upvotedByMe ? "#5F7A63" : "#4B4737" }}
    >
      <ArrowBigUp size={14} fill={upvotedByMe ? "#5F7A63" : "none"} />
      {upvotes}
    </button>
  );
}