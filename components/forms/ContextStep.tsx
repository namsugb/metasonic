import { ScoreRadioGroup } from "@/components/forms/ScoreRadioGroup";
import { PREFERENCE_LABELS } from "@/lib/recommendation/constants";
import type { ContextInput, Preference, ScoreValue } from "@/lib/recommendation/types";

interface ContextStepProps {
  context: ContextInput;
  updateContext: <Key extends keyof ContextInput>(key: Key, value: ContextInput[Key]) => void;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
}

const PREFERENCES: Preference[] = ["quick", "balanced", "gentle"];

export function ContextStep({ context, updateContext, canContinue, onBack, onNext }: ContextStepProps) {
  return (
    <section className="screen screenLight contextScreen">
      <div className="topBar">
        <button className="iconButton" onClick={onBack} type="button" aria-label="이전">
          ‹
        </button>
      </div>

      <div className="screenHeader">
        <p className="stepEyebrow">CONTEXT</p>
        <h2>오늘의 생활 패턴을 반영할게요</h2>
      </div>

      <div className="formStack">
        <div className="field sleepHoursField">
          <div className="sleepHoursFieldHeader">
            <span className="sleepHoursFieldLabel" id="sleep-hours-label">
              C1 수면 시간
            </span>
            <span className="sleepHoursValue" aria-live="polite">
              {typeof context.sleepHours === "number" ? context.sleepHours : 7}시간
            </span>
          </div>
          <input
            id="sleep-hours-slider"
            className="sleepHoursSlider"
            type="range"
            min={0}
            max={24}
            step={0.5}
            value={typeof context.sleepHours === "number" ? context.sleepHours : 7}
            onChange={(event) => updateContext("sleepHours", Number(event.target.value))}
            aria-labelledby="sleep-hours-label"
            aria-valuemin={0}
            aria-valuemax={24}
            aria-valuetext={`${typeof context.sleepHours === "number" ? context.sleepHours : 7}시간`}
          />
          <div className="sleepHoursScale" aria-hidden="true">
            <span>0</span>
            <span>24</span>
          </div>
        </div>

        <div className="field">
          <span>C2 최근 스트레스 체감</span>
          <ScoreRadioGroup
            name="stressLevel"
            value={context.stressLevel}
            onChange={(value: ScoreValue) => updateContext("stressLevel", value)}
          />
        </div>

        <div className="fieldGrid">
          <label className="field">
            <span>C3 최근 시술 종류</span>
            <input
              value={context.procedureType}
              onChange={(event) => updateContext("procedureType", event.target.value)}
              placeholder="없으면 비워두세요"
            />
          </label>

          <label className="field">
            <span>시술일</span>
            <input
              type="date"
              value={context.procedureDate}
              onChange={(event) => updateContext("procedureDate", event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>C4 현재 사용 중인 제품·관리</span>
          <input
            value={context.currentProducts}
            onChange={(event) => updateContext("currentProducts", event.target.value)}
            placeholder="앰플, 크림, 진정팩 등"
          />
        </label>

        <label className="field">
          <span>C5 생활 메모</span>
          <input
            value={context.lifestyleNote}
            onChange={(event) => updateContext("lifestyleNote", event.target.value)}
            placeholder="마스크 착용, 야외 활동, 수면 변화 등"
          />
        </label>

        <div className="field">
          <span>C6 건조·당김 체감</span>
          <ScoreRadioGroup
            name="drynessLevel"
            value={context.drynessLevel}
            onChange={(value: ScoreValue) => updateContext("drynessLevel", value)}
          />
        </div>

        <div className="field">
          <span>C7 야외 활동·자외선 노출</span>
          <ScoreRadioGroup
            name="outdoorLevel"
            value={context.outdoorLevel}
            onChange={(value: ScoreValue) => updateContext("outdoorLevel", value)}
          />
        </div>

        <div className="field">
          <span>C8 선호감</span>
          <div className="scoreRadioGroup preferenceRadioGroup" role="radiogroup" aria-label="선호감">
            {PREFERENCES.map((preference) => (
              <label
                className={`scoreRadio ${context.preference === preference ? "scoreRadioSelected" : ""}`}
                key={preference}
              >
                <input
                  type="radio"
                  name="preference"
                  value={preference}
                  checked={context.preference === preference}
                  onChange={() => updateContext("preference", preference)}
                />
                <span>{PREFERENCE_LABELS[preference]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button className="primaryButton dockedButton" disabled={!canContinue} onClick={onNext} type="button">
        추가 분석
      </button>
    </section>
  );
}
