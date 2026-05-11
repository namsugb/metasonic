import { ScoreRadioGroup } from "@/components/forms/ScoreRadioGroup";
import type { AnswerMap, QuickQuestion, ScoreValue } from "@/lib/recommendation/types";

interface QuickCheckStepProps {
  page: number;
  question: QuickQuestion;
  totalQuestions: number;
  answers: AnswerMap;
  onAnswer: (id: string, value: ScoreValue) => void;
  onBack: () => void;
}

const PROGRESS_STEPS = [
  { label: "핵심 신호 확인" },
  { label: "선호 케어 설정" },
  { label: "생활 습관 체크" },
] as const;

export function QuickCheckStep({
  page,
  question,
  totalQuestions,
  answers,
  onAnswer,
  onBack,
}: QuickCheckStepProps) {
  const progressPercent = totalQuestions > 1 ? (page / (totalQuestions - 1)) * 100 : 0;

  return (
    <section className="screen screenLight quickCheckScreen">
      <div className="topBar quickTopBar">
        <button className="iconButton" onClick={onBack} type="button" aria-label="이전">
          ←
        </button>
      </div>

      <div className="screenHeader quickHeader">
        <p className="stepEyebrow">QUICK CHECK</p>
        <h2>최근 피부 신호를 알려주세요</h2>
      </div>

      <div className="quickProgress" aria-label="추천 문답 진행 단계">
        <div className="quickProgressTrack">
          <span className="quickProgressFill" style={{ width: `${progressPercent}%` }} />
        </div>

      </div>

      <article className="questionBlock quickQuestionCard" key={question.id}>
        <div className="quickQuestionHead">
          <span>{question.id.replace("Q", "Q").padStart(2, "0")}</span>
          <div>
            <h3>{question.text}</h3>

          </div>
        </div>
        <ScoreRadioGroup
          name={question.id}
          value={answers[question.id]}
          onChange={(value) => onAnswer(question.id, value)}
          variant="signal"
        />
      </article>
    </section>
  );
}
