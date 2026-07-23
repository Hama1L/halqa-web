import AnswerForm from "./AnswerForm";
import { Question } from "@/lib/types";

async function getQuestion(id: string): Promise<Question | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function QuestionDetailPage({ params }: { params: { questionId: string } }) {
  const question = await getQuestion(params.questionId);
  if (!question) return <p className="pt-6 text-sm" style={{ color: "#9C9483" }}>Question not found.</p>;

  return (
    <div className="pt-2">
      <div className="rounded-xl p-5 mb-4" style={{ background: "#FFFCF5", border: "1px solid #EAE3D3" }}>
        <span className="text-[11px] font-medium" style={{ color: question.author.isAnonymous ? "#9C9483" : "#123832" }}>
          {question.author.displayName}
        </span>
        <h2 className="text-lg font-bold mt-1 mb-2" style={{ color: "#1E2521" }}>{question.title}</h2>
        <p className="text-sm leading-relaxed" style={{ color: "#1E2521" }}>{question.body}</p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9C9483" }}>
        {question.answers?.length ?? 0} replies
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {question.answers?.map((a) => (
          <div key={a.id} className="rounded-xl p-4" style={{ background: "#FFFCF5", border: "1px solid #EFE9DB" }}>
            <span className="text-[11px] font-medium" style={{ color: a.author.isAnonymous ? "#9C9483" : "#123832" }}>
              {a.author.displayName}
            </span>
            <p className="text-sm leading-relaxed mt-1" style={{ color: "#1E2521" }}>{a.body}</p>
          </div>
        ))}
      </div>

      <AnswerForm questionId={question.id} />
    </div>
  );
}