"use client";

import { useMemo, useState } from "react";
import {
  BRANCH_DEFINITIONS,
  QUICK_QUESTIONS,
} from "@/lib/recommendation/constants";
import {
  calculateRecommendation,
  selectBranches,
} from "@/lib/recommendation/engine";
import type {
  AnswerMap,
  BranchId,
  ContextInput,
  GoalCode,
  GoalSelection,
  ProfileInput,
  RecommendationInput,
  RecommendationResult,
  ScoreValue,
} from "@/lib/recommendation/types";
import { saveRecommendationSession, type SaveRecommendationState } from "@/lib/supabase/saveRecommendation";

export type FlowStep =
  | "start"
  | "profile"
  | "quick"
  | "goals"
  | "context"
  | "branchIntro"
  | "branch"
  | "resultIntro"
  | "result";

const DEV_STEP_ORDER: FlowStep[] = [
  "start",
  "profile",
  "quick",
  "goals",
  "context",
  "branchIntro",
  "branch",
  "resultIntro",
  "result",
];

const EMPTY_PROFILE: ProfileInput = {
  name: "",
  contact: "",
  ageRange: "",
  gender: "",
  privacyConsent: false,
};

const EMPTY_CONTEXT: ContextInput = {
  sleepHours: 7,
  stressLevel: 2,
  procedureType: "",
  procedureDate: "",
  currentProducts: "",
  lifestyleNote: "",
  drynessLevel: 2,
  outdoorLevel: 2,
  preference: "balanced",
};

export function useRecommendationFlow() {
  const [step, setStep] = useState<FlowStep>("start");
  const [profile, setProfile] = useState<ProfileInput>(EMPTY_PROFILE);
  const [quickAnswers, setQuickAnswers] = useState<AnswerMap>({});
  const [quickPage, setQuickPage] = useState(0);
  const [goals, setGoals] = useState<GoalSelection>({});
  const [context, setContext] = useState<ContextInput>(EMPTY_CONTEXT);
  const [selectedBranches, setSelectedBranches] = useState<BranchId[]>([]);
  const [branchAnswers, setBranchAnswers] = useState<AnswerMap>({});
  const [branchPage, setBranchPage] = useState(0);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [saveState, setSaveState] = useState<SaveRecommendationState | "idle" | "saving">("idle");

  const quickPageQuestions = useMemo(
    () => QUICK_QUESTIONS.slice(quickPage, quickPage + 1),
    [quickPage],
  );

  const branchDefinitions = useMemo(
    () => BRANCH_DEFINITIONS.filter((branch) => selectedBranches.includes(branch.id)),
    [selectedBranches],
  );

  const branchQuestions = useMemo(
    () => branchDefinitions.flatMap((branch) => branch.questions),
    [branchDefinitions],
  );

  const branchPageQuestions = useMemo(
    () => branchQuestions.slice(branchPage, branchPage + 1),
    [branchPage, branchQuestions],
  );

  const canContinueProfile =
    profile.name.trim().length > 1 &&
    profile.contact.trim().length > 4 &&
    Boolean(profile.ageRange) &&
    Boolean(profile.gender) &&
    profile.privacyConsent;
  const canContinueQuick = quickPageQuestions.every((question) => quickAnswers[question.id] !== undefined);
  const canContinueGoals = Boolean(goals.primary);
  const canContinueContext =
    typeof context.sleepHours === "number" &&
    context.sleepHours >= 0 &&
    context.sleepHours <= 24 &&
    Boolean(context.preference);
  const canFinishBranch = branchQuestions.every((question) => branchAnswers[question.id] !== undefined);

  function updateProfile<Key extends keyof ProfileInput>(key: Key, value: ProfileInput[Key]) {
    setProfile((current) => ({
      ...current,
      [key]: value,
      privacyConsentedAt:
        key === "privacyConsent" && value === true
          ? new Date().toISOString()
          : key === "privacyConsent"
            ? undefined
            : current.privacyConsentedAt,
    }));
  }

  function updateContext<Key extends keyof ContextInput>(key: Key, value: ContextInput[Key]) {
    setContext((current) => ({ ...current, [key]: value }));
  }

  function setQuickAnswer(id: string, value: ScoreValue) {
    setQuickAnswers((current) => ({ ...current, [id]: value }));

    window.setTimeout(() => {
      if (quickPage < QUICK_QUESTIONS.length - 1) {
        setQuickPage((page) => Math.min(page + 1, QUICK_QUESTIONS.length - 1));
        return;
      }

      setStep("goals");
    }, 220);
  }

  function setBranchAnswer(id: string, value: ScoreValue) {
    const nextAnswers = { ...branchAnswers, [id]: value };
    setBranchAnswers(nextAnswers);

    window.setTimeout(() => {
      if (branchPage < branchQuestions.length - 1) {
        setBranchPage((page) => Math.min(page + 1, Math.max(branchQuestions.length - 1, 0)));
        return;
      }

      void finish(nextAnswers);
    }, 220);
  }

  function nextQuickPage() {
    if (!canContinueQuick) {
      return;
    }

    if (quickPage < QUICK_QUESTIONS.length - 1) {
      setQuickPage((page) => page + 1);
      return;
    }

    setStep("goals");
  }

  function previousQuickPage() {
    if (quickPage > 0) {
      setQuickPage((page) => page - 1);
      return;
    }

    setStep("profile");
  }

  function toggleGoal(code: GoalCode) {
    setGoals((current) => {
      const selected = [current.primary, current.secondary, current.tertiary].filter(Boolean) as GoalCode[];
      const nextSelected = selected.includes(code)
        ? selected.filter((selectedCode) => selectedCode !== code)
        : [...selected, code].slice(0, 3);

      return {
        primary: nextSelected[0],
        secondary: nextSelected[1],
        tertiary: nextSelected[2],
      };
    });
  }

  function startBranchAnalysis() {
    if (!canContinueContext) {
      return;
    }

    const branches = selectBranches(quickAnswers, goals);
    setSelectedBranches(branches);
    setBranchPage(0);
    setStep("branchIntro");

    window.setTimeout(() => {
      setStep("branch");
    }, 3000);
  }

  async function finish(nextBranchAnswers = branchAnswers) {
    const hasAllBranchAnswers = branchQuestions.every((question) => nextBranchAnswers[question.id] !== undefined);

    if (!hasAllBranchAnswers) {
      return;
    }

    setStep("resultIntro");

    const input: RecommendationInput = {
      profile,
      quickAnswers,
      goals,
      context,
      branchAnswers: nextBranchAnswers,
      selectedBranches,
    };

    window.setTimeout(async () => {
      const nextResult = calculateRecommendation(input);
      setResult(nextResult);
      setStep("result");
      setSaveState("saving");
      const nextSaveState = await saveRecommendationSession({ input, result: nextResult });
      setSaveState(nextSaveState);
    }, 3000);
  }

  function reset() {
    setStep("start");
    setProfile(EMPTY_PROFILE);
    setQuickAnswers({});
    setQuickPage(0);
    setGoals({});
    setContext(EMPTY_CONTEXT);
    setSelectedBranches([]);
    setBranchAnswers({});
    setBranchPage(0);
    setResult(null);
    setSaveState("idle");
  }

  function devGoToStep(nextStep: FlowStep) {
    if (nextStep === "branch" && selectedBranches.length === 0) {
      setSelectedBranches(["vascular", "neuroBarrier"]);
    }

    if (nextStep === "result") {
      ensureDevResult();
    }

    setStep(nextStep);
  }

  function devGoNext() {
    const currentIndex = DEV_STEP_ORDER.indexOf(step);
    const nextStep = DEV_STEP_ORDER[Math.min(currentIndex + 1, DEV_STEP_ORDER.length - 1)];
    devGoToStep(nextStep);
  }

  function devGoPrevious() {
    const currentIndex = DEV_STEP_ORDER.indexOf(step);
    const nextStep = DEV_STEP_ORDER[Math.max(currentIndex - 1, 0)];
    devGoToStep(nextStep);
  }

  function ensureDevResult() {
    const devBranches: BranchId[] = selectedBranches.length > 0 ? selectedBranches : ["vascular", "neuroBarrier"];
    const selectedBranchQuestions = BRANCH_DEFINITIONS.filter((branch) => devBranches.includes(branch.id)).flatMap(
      (branch) => branch.questions,
    );
    const devQuickAnswers = Object.fromEntries(
      QUICK_QUESTIONS.map((question, index) => [question.id, ((index % 3) + 1) as ScoreValue]),
    );
    const devBranchAnswers = Object.fromEntries(
      selectedBranchQuestions.map((question, index) => [question.id, ((index % 2) + 2) as ScoreValue]),
    );
    const devInput: RecommendationInput = {
      profile: {
        name: profile.name || "테스트",
        contact: profile.contact || "01012345678",
        ageRange: profile.ageRange || "30대",
        gender: profile.gender || "여성",
        privacyConsent: true,
        privacyConsentedAt: profile.privacyConsentedAt || new Date().toISOString(),
      },
      quickAnswers: Object.keys(quickAnswers).length > 0 ? quickAnswers : devQuickAnswers,
      goals: goals.primary ? goals : { primary: "G1", secondary: "G2", tertiary: "G8" },
      context: {
        ...context,
        sleepHours: typeof context.sleepHours === "number" ? context.sleepHours : 6,
      },
      branchAnswers: Object.keys(branchAnswers).length > 0 ? branchAnswers : devBranchAnswers,
      selectedBranches: devBranches,
    };

    setSelectedBranches(devBranches);
    setBranchPage(0);
    setResult(calculateRecommendation(devInput));
    setSaveState("idle");
  }

  return {
    step,
    setStep,
    profile,
    updateProfile,
    quickAnswers,
    quickPage,
    quickPageQuestions,
    setQuickAnswer,
    nextQuickPage,
    previousQuickPage,
    goals,
    toggleGoal,
    context,
    updateContext,
    selectedBranches,
    branchDefinitions,
    branchQuestions,
    branchPage,
    branchPageQuestions,
    branchAnswers,
    setBranchAnswer,
    result,
    saveState,
    finish,
    reset,
    devGoNext,
    devGoPrevious,
    startBranchAnalysis,
    canContinueProfile,
    canContinueQuick,
    canContinueGoals,
    canContinueContext,
    canFinishBranch,
  };
}
