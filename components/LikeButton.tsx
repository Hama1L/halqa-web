"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function LikeButton({
  insightId,
  initialLikes,
  initialLikedByMe,
}: {
  insightId: string;
  initialLikes: number;
  initialLikedByMe: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [likedByMe, setLikedByMe] = useState(initialLikedByMe);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    if (pending) return;
    setPending(true);
    setError("");
    // Optimistic update, rolled back on failure
    const prev = { likes, likedByMe };
    setLikes(likedByMe ? likes - 1 : likes + 1);
    setLikedByMe(!likedByMe);
    try {
      const res = await api.post<{ likes: number; likedByMe: boolean }>(`/insights/${insightId}/like`);
      setLikes(res.likes);
      setLikedByMe(res.likedByMe);
    } catch (e) {
      setLikes(prev.likes);
      setLikedByMe(prev.likedByMe);
      setError(e instanceof ApiError && e.status === 401 ? "Log in to like this." : "Couldn't update — try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={pending}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
        style={{ background: likedByMe ? "#F7EBE9" : "#EDE7D8", color: likedByMe ? "#A8615A" : "#4B4737" }}
      >
        <Heart size={13} fill={likedByMe ? "#A8615A" : "none"} />
        {likes}
      </button>
      {error && <span className="text-[10px]" style={{ color: "#A8615A" }}>{error}</span>}
    </div>
  );
}