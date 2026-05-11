import { ScoreRadioGroup } from "@/components/forms/ScoreRadioGroup";
import type {
  AnswerMap,
  BranchDefinition,
  BranchQuestion,
  ScoreValue,
} from "@/lib/recommendation/types";

interface BranchStepProps {
  definitions: BranchDefinition[];
  page: number;
  question: BranchQuestion;
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

export function BranchStep({
  definitions,
  page,
  question,
  totalQuestions,
  answers,
  onAnswer,
  onBack,
}: BranchStepProps) {
  const progressPercent = totalQuestions > 1 ? (page / (totalQuestions - 1)) * 100 : 100;

  return (
    <section className="screen screenLight quickCheckScreen detailCheckScreen">
      <div className="topBar quickTopBar">
        <button className="iconButton" onClick={onBack} type="button" aria-label="이전">
          ←
        </button>
      </div>

      <div className="screenHeader quickHeader">
        <p className="stepEyebrow">DETAIL CHECK</p>
        <h2>필요한 부분만 더 확인할게요</h2>
      </div>

      <div className="quickProgress" aria-label="추천 문답 진행 단계">
        <div className="quickProgressTrack">
          <span className="quickProgressFill" style={{ width: `${progressPercent}%` }} />
        </div>

      </div>

      {definitions.length > 0 ? (
        <div className="detailBranchPills" aria-label="선별된 추가 확인 영역">
          {definitions.map((definition) => (
            <span key={definition.id}>{definition.title}</span>
          ))}
        </div>
      ) : null}

      <article className="questionBlock quickQuestionCard" key={question.id}>
        <div className="quickQuestionHead">
          <span>{question.id}</span>
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
