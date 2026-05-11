import { SCALE_LABELS } from "@/lib/recommendation/constants";
import type { ScoreValue } from "@/lib/recommendation/types";

const SCORES: ScoreValue[] = [0, 1, 2, 3, 4];

const SIGNAL_LABELS: Record<ScoreValue, { label: string; helper: string; face: "Smile" | "Neutral" | "Sad" }> = {
  0: { label: "없어요", helper: "거의 느껴지지 않아요", face: "Smile" },
  1: { label: "조금 느껴져요", helper: "가끔 느껴져요", face: "Neutral" },
  2: { label: "보통이에요", helper: "보통 수준이에요", face: "Neutral" },
  3: { label: "꽤 느껴져요", helper: "자주 느껴져요", face: "Sad" },
  4: { label: "강하게 느껴져요", helper: "매우 자주 / 심해요", face: "Sad" },
};

interface ScoreRadioGroupProps {
  name: string;
  value?: ScoreValue;
  onChange: (value: ScoreValue) => void;
  variant?: "default" | "signal";
}

export function ScoreRadioGroup({ name, value, onChange, variant = "default" }: ScoreRadioGroupProps) {
  if (variant === "signal") {
    return (
      <div className="scoreRadioGroup signalScoreGroup" role="radiogroup" aria-label={name}>
        {SCORES.map((score) => {
          const label = SIGNAL_LABELS[score];

          return (
            <label className={`signalScore ${value === score ? "signalScoreSelected" : ""}`} key={score}>
              <input
                type="radio"
                name={name}
                value={score}
                checked={value === score}
                onChange={() => onChange(score)}
              />
              <span className="signalScoreIcon" aria-hidden="true">
                <span className={`signalFace signalFace${label.face}`} />
              </span>
              <strong>{label.label}</strong>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div className="scoreRadioGroup" role="radiogroup" aria-label={name}>
      {SCORES.map((score) => (
        <label className={`scoreRadio ${value === score ? "scoreRadioSelected" : ""}`} key={score}>
          <input
            type="radio"
            name={name}
            value={score}
            checked={value === score}
            onChange={() => onChange(score)}
          />
          <span className="scoreNumber">{score}</span>
          <span>{SCALE_LABELS[score]}</span>
        </label>
      ))}
    </div>
  );
}
