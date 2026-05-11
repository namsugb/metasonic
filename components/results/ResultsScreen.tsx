"use client";

import { useState } from "react";
import { AxisRadar } from "@/components/results/AxisRadar";
import type { RecommendationResult } from "@/lib/recommendation/types";
import type { SaveRecommendationState } from "@/lib/supabase/saveRecommendation";

interface ResultsScreenProps {
  result: RecommendationResult;
  saveState: SaveRecommendationState | "idle" | "saving";
  onReset: () => void;
}

export function ResultsScreen({ result, saveState, onReset }: ResultsScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const axisEntries = Object.entries(result.axisScores).sort(([, a], [, b]) => b - a).slice(0, 3);
  const canCarousel = result.recommendations.length > 1;

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
            유난히 피부는 열감과 회복 지연 신호가 감지되었어요.
            강한 관리보다는 <strong>진정과 회복 중심의 케어</strong>가 필요해요.
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
            <span>{result.confidenceScore}</span>
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
            <p>명시적으로 제외된 모드는 없습니다. 권장 출력부터 천천히 확인해주세요.</p>
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
