import {
  AXIS_LABELS,
  BRANCH_DEFINITIONS,
  GOAL_OPTIONS,
  MODE_CONFIGS,
  OUTPUT_LEVEL_LABELS,
  QUICK_QUESTIONS,
} from "./constants";
import type {
  AnswerMap,
  AxisId,
  BranchId,
  ContextInput,
  GoalCode,
  GoalSelection,
  ModeConfig,
  ModeId,
  ModeRecommendation,
  RecommendationInput,
  RecommendationResult,
} from "./types";

const AXES = Object.keys(AXIS_LABELS) as AxisId[];
const INTENSE_MODES: ModeId[] = ["lifting", "tightening", "wrinkles", "scarCare", "acne"];
const ACTIVE_MODES: ModeId[] = ["acne", "trouble", "scarCare"];
const GENTLE_MODES: ModeId[] = ["redness", "atopic", "sonophoresis", "rejuvenation"];

export function selectBranches(quickAnswers: AnswerMap, goals: GoalSelection): BranchId[] {
  const goalValues = Object.values(goals).filter(Boolean) as GoalCode[];
  const scoreByBranch: Record<BranchId, number> = {
    vascular:
      Math.max(valueOf(quickAnswers.Q1), valueOf(quickAnswers.Q2)) +
      (hasGoal(goalValues, ["G1", "G2"]) ? 4 : 0),
    neuroBarrier:
      Math.max(valueOf(quickAnswers.Q3), valueOf(quickAnswers.Q4), valueOf(quickAnswers.Q5)) +
      (hasGoal(goalValues, ["G2", "G3", "G4"]) ? 4 : 0),
    lesion:
      Math.max(valueOf(quickAnswers.Q6), valueOf(quickAnswers.Q7), valueOf(quickAnswers.Q8)) +
      (hasGoal(goalValues, ["G5", "G6"]) ? 4 : 0),
    pigmentDamage:
      Math.max(valueOf(quickAnswers.Q8), valueOf(quickAnswers.Q10)) +
      (hasGoal(goalValues, ["G7", "G11"]) ? 4 : 0),
    agingFirmness:
      Math.max(valueOf(quickAnswers.Q9), valueOf(quickAnswers.Q10)) +
      (hasGoal(goalValues, ["G8", "G9", "G10"]) ? 4 : 0),
    recoveryAbsorption:
      Math.max(valueOf(quickAnswers.Q9), valueOf(quickAnswers.Q11), valueOf(quickAnswers.Q12)) +
      (hasGoal(goalValues, ["G3", "G4", "G12"]) ? 4 : 0),
  };

  const ranked = Object.entries(scoreByBranch)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score >= 3)
    .map(([branch]) => branch as BranchId);

  if (ranked.length > 0) {
    return ranked.slice(0, 2);
  }

  if (goals.primary) {
    return [fallbackBranchForGoal(goals.primary)];
  }

  return ["recoveryAbsorption"];
}

export function calculateRecommendation(input: RecommendationInput): RecommendationResult {
  const axisScores = calculateAxisScores(input);
  const recentProcedureDays = getRecentProcedureDays(input.context.procedureDate);
  const recommendSingleModeOnly =
    (recentProcedureDays !== null && recentProcedureDays <= 7) ||
    average([axisScores.vascular, axisScores.neuro, axisScores.barrier]) >= 78;

  const scored = MODE_CONFIGS.map((mode) => {
    const safety = evaluateSafety(mode.id, axisScores, recentProcedureDays);
    const ruleScore = scoreRuleFit(mode, axisScores);
    const goalScore = scoreGoalFit(mode.id, input.goals);
    const contextScore = scoreContextFit(mode.id, input.context, recentProcedureDays);
    const weightedScore =
      ruleScore * 0.45 + goalScore * 0.3 + contextScore * 0.15 + safety.score * 0.1;

    return {
      mode,
      score: clamp(Math.round(weightedScore), 0, 100),
      safety,
    };
  });

  const avoidModes = scored
    .filter((item) => item.safety.blocked)
    .map((item) => ({
      modeId: item.mode.id,
      english: item.mode.english,
      labelKo: item.mode.labelKo,
      reason: item.safety.reason,
      blocked: true,
    }));

  const cautionModes = scored
    .filter((item) => item.safety.reason)
    .map((item) => ({
      modeId: item.mode.id,
      english: item.mode.english,
      labelKo: item.mode.labelKo,
      reason: item.safety.reason,
      blocked: item.safety.blocked,
    }));

  const eligible = scored
    .filter((item) => !item.safety.blocked)
    .sort((a, b) => b.score - a.score);

  const recommendationCount = recommendSingleModeOnly ? 1 : 3;
  const recommendations = eligible.slice(0, recommendationCount).map((item) =>
    buildRecommendation(item.mode, item.score, item.safety.reason, axisScores, input, recentProcedureDays),
  );

  const confidenceScore = calculateConfidence(eligible, axisScores, avoidModes.length);

  return {
    axisScores,
    axisLabels: AXIS_LABELS,
    recommendations,
    cautionModes,
    avoidModes,
    confidenceScore,
    confidenceLabel: confidenceLabel(confidenceScore),
    recommendSingleModeOnly,
    savedAt: new Date().toISOString(),
  };
}

function calculateAxisScores(input: RecommendationInput): Record<AxisId, number> {
  const totals = emptyAxisRecord();
  const weights = emptyAxisRecord();
  const selectedBranchQuestions = BRANCH_DEFINITIONS.filter((branch) =>
    input.selectedBranches.includes(branch.id),
  ).flatMap((branch) => branch.questions);
  const allQuestions = [...QUICK_QUESTIONS, ...selectedBranchQuestions];

  for (const question of allQuestions) {
    const answer = input.quickAnswers[question.id] ?? input.branchAnswers[question.id];

    if (answer === undefined) {
      continue;
    }

    for (const axis of Object.keys(question.axes) as AxisId[]) {
      const weight = question.axes[axis] ?? 0;
      totals[axis] += answer * 25 * weight;
      weights[axis] += weight;
    }
  }

  const axisScores = emptyAxisRecord();
  for (const axis of AXES) {
    axisScores[axis] = weights[axis] > 0 ? totals[axis] / weights[axis] : 35;
  }

  applyContextModifiers(axisScores, input.context);

  for (const axis of AXES) {
    axisScores[axis] = clamp(Math.round(axisScores[axis]), 0, 100);
  }

  return axisScores;
}

function applyContextModifiers(axisScores: Record<AxisId, number>, context: ContextInput) {
  const sleepHours = typeof context.sleepHours === "number" ? context.sleepHours : 0;
  const recentProcedureDays = getRecentProcedureDays(context.procedureDate);

  axisScores.neuro += context.stressLevel * 4;
  axisScores.recovery += context.stressLevel * 3;
  axisScores.vascular += context.stressLevel * 2;
  axisScores.barrier += context.drynessLevel * 5;
  axisScores.neuro += context.drynessLevel * 2;
  axisScores.damage += context.outdoorLevel * 5;
  axisScores.vascular += context.outdoorLevel * 2;

  if (sleepHours > 0 && sleepHours < 5) {
    axisScores.recovery += 18;
    axisScores.barrier += 8;
  } else if (sleepHours > 0 && sleepHours < 6.5) {
    axisScores.recovery += 10;
    axisScores.barrier += 4;
  } else if (sleepHours >= 7.5) {
    axisScores.recovery -= 4;
  }

  if (recentProcedureDays !== null && recentProcedureDays <= 14) {
    axisScores.recovery += 15;
    axisScores.neuro += 8;
    axisScores.barrier += 8;
  }

  if (context.preference === "gentle") {
    axisScores.neuro += 3;
  }
}

function scoreRuleFit(mode: ModeConfig, axisScores: Record<AxisId, number>) {
  let total = 0;
  let weightTotal = 0;

  for (const axis of Object.keys(mode.axisWeights) as AxisId[]) {
    const weight = mode.axisWeights[axis] ?? 0;
    total += axisScores[axis] * weight;
    weightTotal += weight;
  }

  return weightTotal > 0 ? total / weightTotal : 45;
}

function scoreGoalFit(modeId: ModeId, goals: GoalSelection) {
  const rankedGoals: { code?: GoalCode; score: number }[] = [
    { code: goals.primary, score: 100 },
    { code: goals.secondary, score: 72 },
    { code: goals.tertiary, score: 54 },
  ];

  let best = 28;
  for (const rankedGoal of rankedGoals) {
    if (!rankedGoal.code) {
      continue;
    }

    const option = GOAL_OPTIONS.find((goal) => goal.code === rankedGoal.code);
    if (option?.modes.includes(modeId)) {
      best = Math.max(best, rankedGoal.score);
    }
  }

  return best;
}

function scoreContextFit(modeId: ModeId, context: ContextInput, recentProcedureDays: number | null) {
  let score = context.preference === "balanced" ? 66 : 55;

  if (context.preference === "quick") {
    if (["redness", "trouble", "acne", "lifting", "tightening"].includes(modeId)) {
      score += 22;
    } else if (["wrinkles", "whitening"].includes(modeId)) {
      score += 10;
    }
  }

  if (context.preference === "gentle") {
    score += GENTLE_MODES.includes(modeId) ? 24 : -10;
  }

  if (typeof context.sleepHours === "number" && context.sleepHours < 6) {
    score += ["rejuvenation", "sonophoresis", "atopic", "redness"].includes(modeId) ? 12 : 2;
  }

  if (context.drynessLevel >= 3) {
    score += ["atopic", "sonophoresis", "rejuvenation"].includes(modeId) ? 12 : 0;
  }

  if (context.stressLevel >= 3) {
    score += ["redness", "atopic", "rejuvenation"].includes(modeId) ? 8 : 0;
  }

  if (recentProcedureDays !== null && recentProcedureDays <= 14) {
    score += GENTLE_MODES.includes(modeId) ? 16 : -16;
  }

  return clamp(score, 0, 100);
}

function evaluateSafety(
  modeId: ModeId,
  axisScores: Record<AxisId, number>,
  recentProcedureDays: number | null,
) {
  let score = 100;
  let blocked = false;
  let reason = "";
  const sensitivity = average([axisScores.neuro, axisScores.barrier, axisScores.vascular]);

  if (recentProcedureDays !== null && recentProcedureDays <= 14 && INTENSE_MODES.includes(modeId)) {
    blocked = true;
    score = 0;
    reason = "최근 시술 정보가 있어 이번 추천 상위에서 제외했어요.";
  }

  if (!blocked && recentProcedureDays !== null && recentProcedureDays <= 7 && modeId === "trouble") {
    score -= 35;
    reason = "최근 시술 직후에는 트러블 계열도 부드럽게 접근하는 편이 좋아요.";
  }

  if (!blocked && sensitivity >= 72 && INTENSE_MODES.includes(modeId)) {
    score -= 32;
    reason = "민감·장벽 점수가 높아 강한 체감 계열은 낮은 출력부터 권장해요.";
  }

  if (!blocked && axisScores.vascular >= 72 && ["lifting", "tightening", "wrinkles", "acne"].includes(modeId)) {
    score -= 24;
    reason = "붉음 반응성이 높아 열감이 커질 수 있는 계열은 조심스럽게 접근해야 해요.";
  }

  if (!blocked && axisScores.neuro >= 84 && ACTIVE_MODES.includes(modeId)) {
    blocked = modeId === "acne" || modeId === "scarCare";
    score = blocked ? 0 : score - 30;
    reason = blocked
      ? "민감 반응성이 매우 높아 이번 추천 상위에서는 제외했어요."
      : "민감 반응성이 높아 트러블 계열은 낮은 출력부터 확인이 필요해요.";
  }

  return {
    score: clamp(score, 0, 100),
    blocked,
    reason,
  };
}

function buildRecommendation(
  mode: ModeConfig,
  score: number,
  caution: string,
  axisScores: Record<AxisId, number>,
  input: RecommendationInput,
  recentProcedureDays: number | null,
): ModeRecommendation {
  const sensitivity = average([axisScores.neuro, axisScores.barrier, axisScores.vascular]);
  let outputLevel = mode.baseLevel;

  if (
    sensitivity >= 72 ||
    (recentProcedureDays !== null && recentProcedureDays <= 14) ||
    input.context.preference === "gentle"
  ) {
    outputLevel = Math.min(outputLevel, sensitivity >= 82 ? 1 : 2) as 1 | 2 | 3 | 4 | 5;
  } else if (input.context.preference === "quick" && sensitivity < 52 && mode.baseLevel >= 3) {
    outputLevel = Math.min(mode.baseLevel + 1, 5) as 1 | 2 | 3 | 4 | 5;
  }

  return {
    modeId: mode.id,
    english: mode.english,
    labelKo: mode.labelKo,
    description: mode.description,
    durationMinutes: mode.durationMinutes,
    outputLevel,
    outputLevelLabel: OUTPUT_LEVEL_LABELS[outputLevel],
    score,
    confidence: score,
    reasons: buildReasons(mode, axisScores, input, recentProcedureDays),
    caution: caution || null,
  };
}

function buildReasons(
  mode: ModeConfig,
  axisScores: Record<AxisId, number>,
  input: RecommendationInput,
  recentProcedureDays: number | null,
) {
  const dominantAxis = (Object.keys(mode.axisWeights) as AxisId[]).sort(
    (a, b) => (axisScores[b] * (mode.axisWeights[b] ?? 0)) - (axisScores[a] * (mode.axisWeights[a] ?? 0)),
  )[0];
  const selectedGoal = findSelectedGoalForMode(mode.id, input.goals);
  const reasons = [
    `${AXIS_LABELS[dominantAxis]} 점수가 두드러져 ${mode.labelKo}가 현재 고민과 잘 맞습니다.`,
  ];

  if (selectedGoal) {
    reasons.push(`선택한 '${selectedGoal.title}' 고민을 우선 반영해 ${mode.english} 적합도를 높였어요.`);
  } else {
    reasons.push("Quick Check와 추가 질문의 균형을 기준으로 무리가 적은 관리 방향을 골랐어요.");
  }

  if (recentProcedureDays !== null && recentProcedureDays <= 14) {
    reasons.push("최근 시술 정보를 고려해 권장 출력은 부드러운 단계로 제안합니다.");
  } else if (input.context.preference === "gentle") {
    reasons.push("부드러운 케어 선호를 반영해 편안한 체감의 모드를 우선했습니다.");
  } else if (input.context.preference === "quick") {
    reasons.push("빠른 체감 선호를 반영하되, 안전 점수와 균형을 함께 맞췄습니다.");
  } else {
    reasons.push("균형 선호를 반영해 효과와 편안함이 과하게 치우치지 않도록 조정했습니다.");
  }

  return reasons;
}

function calculateConfidence(
  eligible: { score: number }[],
  axisScores: Record<AxisId, number>,
  avoidCount: number,
) {
  const top = eligible[0]?.score ?? 40;
  const second = eligible[1]?.score ?? top - 8;
  const gap = Math.max(0, top - second);
  const axisSpread = Math.max(...Object.values(axisScores)) - Math.min(...Object.values(axisScores));
  const confidence = 52 + (top - 45) * 0.48 + gap * 0.55 + Math.min(axisSpread, 35) * 0.12 - avoidCount * 2;

  return clamp(Math.round(confidence), 0, 100);
}

function confidenceLabel(score: number) {
  if (score >= 80) {
    return "강추천";
  }

  if (score >= 60) {
    return "추천";
  }

  if (score >= 40) {
    return "테스트 추천";
  }

  return "안전 모드 우선";
}

function findSelectedGoalForMode(modeId: ModeId, goals: GoalSelection) {
  const ranked = [goals.primary, goals.secondary, goals.tertiary].filter(Boolean) as GoalCode[];
  return GOAL_OPTIONS.find((goal) => ranked.includes(goal.code) && goal.modes.includes(modeId));
}

function fallbackBranchForGoal(goal: GoalCode): BranchId {
  if (["G1", "G2"].includes(goal)) {
    return "vascular";
  }

  if (["G3", "G4", "G12"].includes(goal)) {
    return "recoveryAbsorption";
  }

  if (["G5", "G6"].includes(goal)) {
    return "lesion";
  }

  if (["G7", "G11"].includes(goal)) {
    return "pigmentDamage";
  }

  return "agingFirmness";
}

function getRecentProcedureDays(procedureDate: string): number | null {
  if (!procedureDate) {
    return null;
  }

  const timestamp = new Date(`${procedureDate}T00:00:00`).getTime();
  if (Number.isNaN(timestamp)) {
    return null;
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diff = Math.floor((todayStart - timestamp) / 86_400_000);

  return diff >= 0 ? diff : null;
}

function emptyAxisRecord(): Record<AxisId, number> {
  return {
    vascular: 0,
    neuro: 0,
    barrier: 0,
    lesion: 0,
    recovery: 0,
    damage: 0,
  };
}

function hasGoal(goals: GoalCode[], candidates: GoalCode[]) {
  return goals.some((goal) => candidates.includes(goal));
}

function valueOf(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
