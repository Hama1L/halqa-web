"use client";

export default function AnonToggle({
  isAnonymous,
  onChange,
}: {
  isAnonymous: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "#EDE7D8" }}>
      <div>
        <p className="text-xs font-medium" style={{ color: "#1E2521" }}>
          {isAnonymous ? "Posting anonymously" : "Posting as yourself"}
        </p>
        <p className="text-[11px]" style={{ color: "#9C9483" }}>
          {isAnonymous
            ? "Others will see a random circle number, not your name."
            : "Your display name will be visible on this post."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!isAnonymous)}
        className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
        style={{ background: isAnonymous ? "#123832" : "#FFFCF5", color: isAnonymous ? "#F7F2E7" : "#4B4737" }}
      >
        {isAnonymous ? "Anonymous" : "Public"}
      </button>
    </div>
  );
}