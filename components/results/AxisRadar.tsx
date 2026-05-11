"use client";

import { useEffect, useMemo, useState } from "react";
import type { AxisId } from "@/lib/recommendation/types";

const AXIS_ORDER: AxisId[] = ["vascular", "neuro", "barrier", "lesion", "recovery", "damage"];
/** 결과 화면 블록 페이드인(≈0.46s 지연 + 1s) 이후에 그리기 애니메이션이 보이도록 */
const RADAR_DRAW_DELAY_MS = 1600;
const RADAR_DRAW_DURATION_MS = 920;

type SvgTextAnchor = "start" | "middle" | "end";

interface AxisRadarProps {
  scores: Record<AxisId, number>;
  labels: Record<AxisId, string>;
}

export function AxisRadar({ scores, labels }: AxisRadarProps) {
  const [progress, setProgress] = useState(0);
  const center = 150;
  const maxRadius = 72;
  const labelRadius = 112;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }

    let cancelled = false;
    let frameId = 0;

    const delayTimer = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      let startTime = 0;

      function animate(timestamp: number) {
        if (cancelled) {
          return;
        }

        if (!startTime) {
          startTime = timestamp;
        }

        const elapsed = timestamp - startTime;
        const ratio = Math.min(elapsed / RADAR_DRAW_DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - ratio, 3);
        setProgress(eased);

        if (ratio < 1) {
          frameId = window.requestAnimationFrame(animate);
        }
      }

      setProgress(0);
      frameId = window.requestAnimationFrame(animate);
    }, RADAR_DRAW_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(delayTimer);
      window.cancelAnimationFrame(frameId);
    };
  }, [scores]);

  const geometry = useMemo(
    () =>
      AXIS_ORDER.map((axis, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / AXIS_ORDER.length;
        const scoreRadius = (scores[axis] / 100) * maxRadius * progress;
        const x = center + Math.cos(angle) * scoreRadius;
        const y = center + Math.sin(angle) * scoreRadius;
        const labelX = center + Math.cos(angle) * labelRadius;
        const labelY = center + Math.sin(angle) * labelRadius;
        const anchor: SvgTextAnchor = Math.abs(labelX - center) < 8 ? "middle" : labelX > center ? "start" : "end";

        return {
          axis,
          angle,
          x,
          y,
          labelX,
          labelY,
          anchor,
          score: scores[axis],
          label: labels[axis],
        };
      }),
    [center, labelRadius, maxRadius, progress, scores, labels],
  );

  const points = geometry.map((point) => `${point.x},${point.y}`).join(" ");
  const grid = [0.35, 0.68, 1].map((ratio) =>
    AXIS_ORDER.map((_, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / AXIS_ORDER.length;
      const radius = maxRadius * ratio;
      return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
    }).join(" "),
  );

  return (
    <div className="radarWrap radarWrapLabeled">
      <svg viewBox="0 0 300 300" role="img" aria-label="6축 상태 점수 그래프">
        <g className="radarGridLayer">
          {grid.map((polygon) => (
            <polygon className="radarGrid" points={polygon} key={polygon} />
          ))}
          {geometry.map((point) => (
            <line
              className="radarLine"
              key={point.axis}
              x1={center}
              y1={center}
              x2={center + Math.cos(point.angle) * maxRadius}
              y2={center + Math.sin(point.angle) * maxRadius}
            />
          ))}
        </g>

        <polygon className="radarShape" points={points} />

        {geometry.map((point, index) => (
          <g
            className="radarVertex"
            key={point.axis}
            style={{ animationDelay: `${RADAR_DRAW_DELAY_MS + index * 70}ms` }}
          >
            <line className="radarValueLine" x1={center} y1={center} x2={point.x} y2={point.y} />
            <text
              className="radarLabel"
              x={point.labelX}
              y={point.labelY - 6}
              textAnchor={point.anchor}
            >
              {point.label}
            </text>
            <text
              className="radarScore"
              x={point.labelX}
              y={point.labelY + 11}
              textAnchor={point.anchor}
            >
              {point.score}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
