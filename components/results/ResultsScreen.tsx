"use client";

import { useState } from "react";
import { AxisRadar } from "@/components/results/AxisRadar";
import type { ModeId, RecommendationResult } from "@/lib/recommendation/types";
import type { SaveRecommendationState } from "@/lib/supabase/saveRecommendation";

interface ResultsScreenProps {
  result: RecommendationResult;
  saveState: SaveRecommendationState | "idle" | "saving";
  onReset: () => void;
}

const RESULT_SUMMARY_BY_MODE: Record<ModeId, string> = {
  whitening: "칙칙함과 색소 흔적이 눈에 띄는 상태입니다. Whitening 모드를 사용하세요.",
  wrinkles: "피부 결이 건조하고 잔주름 케어가 필요한 상태입니다. Wrinkles 모드를 사용하세요.",
  lifting: "탄력 저하와 처짐 신호가 함께 보이는 상태입니다. Lifting 모드를 사용하세요.",
  tightening: "모공과 탄력 균형을 단단하게 잡아야 하는 상태입니다. Tightening 모드를 사용하세요.",
  rejuvenation: "회복 리듬과 생기 보정이 필요한 상태입니다. Rejuvenation 모드를 사용하세요.",
  sonophoresis: "건조함과 흡수 저하 신호가 있는 상태입니다. Sonophoresis 모드를 사용하세요.",
  trouble: "유분 균형과 트러블 신호를 정돈해야 하는 상태입니다. Trouble 모드를 사용하세요.",
  acne: "반복되는 트러블을 집중적으로 관리해야 하는 상태입니다. Acne 모드를 사용하세요.",
  redness: "붉어짐과 열감 반응을 차분히 낮춰야 하는 상태입니다. Redness Care 모드를 사용하세요.",
  atopic: "민감함과 장벽 불안정이 함께 느껴지는 상태입니다. Atopic Care 모드를 사용하세요.",
  scarCare: "오래 남은 자국과 피부 흔적을 정리해야 하는 상태입니다. Scar Care 모드를 사용하세요.",
};

export function ResultsScreen({ result, saveState, onReset }: ResultsScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const axisEntries = Object.entries(result.axisScores).sort(([, a], [, b]) => b - a).slice(0, 3);
  const canCarousel = result.recommendations.length > 1;
  const firstRecommendation = result.recommendations[0];

  function moveRecommendation(direction: -1 | 1) {
    setActiveIndex((current) => {
      const total = result.recommendations.length;
      return total > 0 ? (current + direction + total) % total : 0;
    });
  }

  return (
    <section className="resultDesktop">
      <main className="resultMain">
        <header className="resultTopbar">
          <div>
            <h2>오늘의 피부 컨디션</h2>
          </div>
        </header>

        <section className="todaySummary">
          <p>
            {firstRecommendation
              ? RESULT_SUMMARY_BY_MODE[firstRecommendation.modeId]
              : "현재 답변을 바탕으로 추천 모드를 정리하고 있어요."}
          </p>
        </section>

        <section className="heroCarousel" aria-label="추천 모드 카드">
          <div className="heroCarouselViewport">
            <div
              className="heroCarouselTrack"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {result.recommendations.map((recommendation, index) => (
                <article
                  className={`heroRecommendation modeVisual-${recommendation.modeId}`}
                  data-mode-id={recommendation.modeId}
                  key={recommendation.modeId}
                  aria-hidden={index !== activeIndex}
                >
                  <div className="heroCopy">
                    <div className="heroCarouselHeader">
                      <p>오늘의 추천 모드</p>
                      <span>{index + 1}/{result.recommendations.length}</span>
                    </div>
                    <h1>{recommendation.english}</h1>
                    <span>{recommendation.labelKo}</span>
                    <div className="heroMeta">
                      <span>추천 시간 {recommendation.durationMinutes} min</span>
                      <span>{recommendation.outputLevelLabel}</span>
                    </div>
                  </div>
                  <div className="modeImageSlot" aria-hidden="true">
                    <div className="cosmeticDish">
                      <div />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {canCarousel ? (
            <div className="heroCarouselNav">
              <div className="carouselDots" aria-label="추천 모드 선택">
                {result.recommendations.map((recommendation, index) => (
                  <button
                    className={index === activeIndex ? "active" : ""}
                    key={recommendation.modeId}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                    aria-label={`${index + 1}번 추천 보기`}
                  />
                ))}
              </div>
              <div className="carouselControls" aria-label="추천 모드 넘기기">
                <button type="button" onClick={() => moveRecommendation(-1)} aria-label="이전 추천">
                  ‹
                </button>
                <button type="button" onClick={() => moveRecommendation(1)} aria-label="다음 추천">
                  ›
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="resultSection">
          <div className="panelHeader">
            <h3>분석 요약</h3>
            {/* <span>{result.confidenceLabel}</span> */}
          </div>
          <div className="summaryGrid">
            {axisEntries.map(([axis, score]) => (
              <div className="summaryItem" key={axis}>
                <span>{result.axisLabels[axis as keyof typeof result.axisLabels]}</span>
                <strong>{score}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>

      <aside className="resultInsight">
        <section className="lightResultPanel">
          <div className="panelHeader">
            <h3>피부 상태 6축 분석</h3>
            {/* <span>{result.confidenceScore}</span> */}
          </div>
          <AxisRadar scores={result.axisScores} labels={result.axisLabels} />
        </section>



        <section className="lightResultPanel">
          <div className="panelHeader">
            <h3>주의/제외 모드</h3>
            <span>{result.cautionModes.length}</span>
          </div>
          {result.cautionModes.length > 0 ? (
            <div className="avoidList">
              {result.cautionModes.slice(0, 3).map((mode) => (
                <div key={`${mode.modeId}-${mode.reason}`}>
                  <strong>{mode.english}</strong>
                  <span>{mode.blocked ? "제외" : "주의"} · {mode.reason}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>명시적으로 제외된 모드는 없습니다. <br />권장 출력부터 천천히 확인해주세요.</p>
          )}
        </section>
      </aside>

      <footer className="resultFooter resultFooterEnd">
        <div className="saveState" aria-live="polite">{saveMessage(saveState)}</div>
        <button className="primaryButton" onClick={onReset} type="button">
          처음으로 돌아가기
        </button>
      </footer>
    </section>
  );
}

function saveMessage(saveState: SaveRecommendationState | "idle" | "saving") {
  if (saveState === "saving") return "결과 저장 중";
  if (typeof saveState === "object" && saveState.ok) return "결과 저장 완료";
  if (typeof saveState === "object" && !saveState.ok) {
    return "저장 연결이 원활하지 않아 화면에만 결과를 표시합니다.";
  }
  return "";
}
