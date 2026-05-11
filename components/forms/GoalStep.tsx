import { GOAL_OPTIONS } from "@/lib/recommendation/constants";
import type { GoalCode, GoalSelection } from "@/lib/recommendation/types";

interface GoalStepProps {
  goals: GoalSelection;
  canContinue: boolean;
  onToggleGoal: (code: GoalCode) => void;
  onBack: () => void;
  onNext: () => void;
}

export function GoalStep({ goals, canContinue, onToggleGoal, onBack, onNext }: GoalStepProps) {
  return (
    <section className="screen screenLight">
      <div className="topBar">
        <button className="iconButton" onClick={onBack} type="button" aria-label="이전">
          ‹
        </button>
      </div>

      <div className="screenHeader">
        <p className="stepEyebrow">GOALS</p>
        <h2>가장 신경 쓰이는 고민을 골라주세요</h2>
      </div>

      <div className="goalGrid">
        {GOAL_OPTIONS.map((goal) => {
          const rank = getRank(goals, goal.code);
          return (
            <button
              className={`goalItem ${rank ? "goalItemSelected" : ""}`}
              key={goal.code}
              onClick={() => onToggleGoal(goal.code)}
              type="button"
            >
              <span className="goalRank">{rank ? `${rank}순위` : goal.code}</span>
              <strong>{goal.title}</strong>
              <small>{goal.description}</small>
            </button>
          );
        })}
      </div>

      <button className="primaryButton dockedButton" disabled={!canContinue} onClick={onNext} type="button">
        컨텍스트 입력
      </button>
    </section>
  );
}

function getRank(goals: GoalSelection, code: GoalCode) {
  if (goals.primary === code) return 1;
  if (goals.secondary === code) return 2;
  if (goals.tertiary === code) return 3;
  return null;
}
