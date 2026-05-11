export type ScoreValue = 0 | 1 | 2 | 3 | 4;

export type AxisId =
  | "vascular"
  | "neuro"
  | "barrier"
  | "lesion"
  | "recovery"
  | "damage";

export type ModeId =
  | "whitening"
  | "wrinkles"
  | "lifting"
  | "tightening"
  | "rejuvenation"
  | "sonophoresis"
  | "trouble"
  | "acne"
  | "redness"
  | "atopic"
  | "scarCare";

export type GoalCode =
  | "G1"
  | "G2"
  | "G3"
  | "G4"
  | "G5"
  | "G6"
  | "G7"
  | "G8"
  | "G9"
  | "G10"
  | "G11"
  | "G12";

export type Preference = "quick" | "balanced" | "gentle";

export interface ProfileInput {
  name: string;
  contact: string;
  ageRange: string;
  gender: string;
  privacyConsent: boolean;
  privacyConsentedAt?: string;
}

export interface ContextInput {
  sleepHours: number | "";
  stressLevel: ScoreValue;
  procedureType: string;
  procedureDate: string;
  currentProducts: string;
  lifestyleNote: string;
  drynessLevel: ScoreValue;
  outdoorLevel: ScoreValue;
  preference: Preference;
}

export interface GoalSelection {
  primary?: GoalCode;
  secondary?: GoalCode;
  tertiary?: GoalCode;
}

export type AnswerMap = Record<string, ScoreValue>;

export interface QuickQuestion {
  id: string;
  text: string;
  axes: Partial<Record<AxisId, number>>;
}

export interface BranchQuestion extends QuickQuestion {
  branchId: BranchId;
}

export type BranchId =
  | "vascular"
  | "neuroBarrier"
  | "lesion"
  | "pigmentDamage"
  | "agingFirmness"
  | "recoveryAbsorption";

export interface BranchDefinition {
  id: BranchId;
  title: string;
  description: string;
  questions: BranchQuestion[];
}

export interface ModeConfig {
  id: ModeId;
  english: string;
  labelKo: string;
  description: string;
  durationMinutes: number;
  baseLevel: 1 | 2 | 3 | 4 | 5;
  axisWeights: Partial<Record<AxisId, number>>;
}

export interface ModeRecommendation {
  modeId: ModeId;
  english: string;
  labelKo: string;
  description: string;
  durationMinutes: number;
  outputLevel: 1 | 2 | 3 | 4 | 5;
  outputLevelLabel: string;
  score: number;
  confidence: number;
  reasons: string[];
  caution: string | null;
}

export interface CautionMode {
  modeId: ModeId;
  english: string;
  labelKo: string;
  reason: string;
  blocked: boolean;
}

export interface RecommendationInput {
  profile: ProfileInput;
  quickAnswers: AnswerMap;
  goals: GoalSelection;
  context: ContextInput;
  branchAnswers: AnswerMap;
  selectedBranches: BranchId[];
}

export interface RecommendationResult {
  axisScores: Record<AxisId, number>;
  axisLabels: Record<AxisId, string>;
  recommendations: ModeRecommendation[];
  cautionModes: CautionMode[];
  avoidModes: CautionMode[];
  confidenceScore: number;
  confidenceLabel: string;
  recommendSingleModeOnly: boolean;
  savedAt: string;
}
