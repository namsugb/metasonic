import { describe, expect, it } from "vitest";
import { calculateRecommendation, selectBranches } from "./engine";
import type { AnswerMap, RecommendationInput } from "./types";

function answers(ids: string[], value: 0 | 1 | 2 | 3 | 4): AnswerMap {
  return Object.fromEntries(ids.map((id) => [id, value])) as AnswerMap;
}

const baseQuick = {
  ...answers(["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12"], 1),
};

const baseInput: RecommendationInput = {
  profile: {
    name: "테스트",
    contact: "010-0000-0000",
    ageRange: "30대",
    gender: "여성",
    privacyConsent: true,
    privacyConsentedAt: "2026-05-03T00:00:00.000Z",
  },
  quickAnswers: baseQuick,
  goals: { primary: "G1" },
  context: {
    sleepHours: 7,
    stressLevel: 1,
    procedureType: "",
    procedureDate: "",
    currentProducts: "",
    lifestyleNote: "",
    drynessLevel: 1,
    outdoorLevel: 1,
    preference: "balanced",
  },
  branchAnswers: {},
  selectedBranches: ["vascular"],
};

describe("recommendation engine", () => {
  it("selects at most two adaptive branches from quick answers and goals", () => {
    const selected = selectBranches(
      {
        ...baseQuick,
        Q1: 4,
        Q2: 3,
        Q7: 4,
      },
      { primary: "G1", secondary: "G5" },
    );

    expect(selected).toHaveLength(2);
    expect(selected).toContain("vascular");
    expect(selected).toContain("lesion");
  });

  it("prioritizes redness care for vascular concerns", () => {
    const result = calculateRecommendation({
      ...baseInput,
      quickAnswers: {
        ...baseQuick,
        Q1: 4,
        Q2: 4,
      },
      branchAnswers: answers(["A1", "A2", "A3", "A4"], 4),
    });

    expect(result.recommendations[0].modeId).toBe("redness");
    expect(result.axisScores.vascular).toBeGreaterThan(80);
    expect(result.confidenceLabel).toMatch(/추천/);
  });

  it("blocks intense modes after a recent procedure but still returns a result", () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = calculateRecommendation({
      ...baseInput,
      goals: { primary: "G10" },
      context: {
        ...baseInput.context,
        procedureType: "RF",
        procedureDate: today,
        preference: "gentle",
      },
      selectedBranches: ["agingFirmness"],
      branchAnswers: answers(["E1", "E2", "E3", "E4"], 3),
    });

    expect(result.recommendSingleModeOnly).toBe(true);
    expect(result.recommendations).toHaveLength(1);
    expect(result.avoidModes.some((mode) => mode.modeId === "lifting")).toBe(true);
    expect(result.recommendations[0].outputLevel).toBeLessThanOrEqual(2);
  });
});
