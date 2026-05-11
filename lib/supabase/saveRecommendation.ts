import type { RecommendationInput, RecommendationResult } from "@/lib/recommendation/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface SaveRecommendationPayload {
  input: RecommendationInput;
  result: RecommendationResult;
}

export interface SaveRecommendationState {
  ok: boolean;
  reason?: "missing-env" | "request-failed" | "network-error";
}

export async function saveRecommendationSession({
  input,
  result,
}: SaveRecommendationPayload): Promise<SaveRecommendationState> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { ok: false, reason: "missing-env" };
  }

  const body = {
    name: input.profile.name,
    contact: input.profile.contact,
    age_range: input.profile.ageRange,
    gender: input.profile.gender,
    privacy_consent: input.profile.privacyConsent,
    privacy_consented_at: input.profile.privacyConsentedAt,
    quick_check: input.quickAnswers,
    goals: input.goals,
    context: input.context,
    branch_answers: input.branchAnswers,
    selected_branches: input.selectedBranches,
    axis_scores: result.axisScores,
    recommendations: result.recommendations,
    confidence_score: result.confidenceScore,
    confidence_label: result.confidenceLabel,
    caution_modes: result.cautionModes,
    avoid_modes: result.avoidModes,
    recommend_single_mode_only: result.recommendSingleModeOnly,
    raw_result: result,
  };

  try {
    const { error } = await supabase.from("phase1_recommendation_sessions").insert(body);

    if (error) {
      return { ok: false, reason: "request-failed" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "network-error" };
  }
}
