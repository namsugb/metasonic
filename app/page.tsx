"use client";

import { useEffect, useRef } from "react";
import { BranchIntro } from "@/components/forms/BranchIntro";
import { BranchStep } from "@/components/forms/BranchStep";
import { ContextStep } from "@/components/forms/ContextStep";
import { GoalStep } from "@/components/forms/GoalStep";
import { ProfileStep } from "@/components/forms/ProfileStep";
import { QuickCheckStep } from "@/components/forms/QuickCheckStep";
import { StartHero } from "@/components/forms/StartHero";
import { ResultsScreen } from "@/components/results/ResultsScreen";
import { useRecommendationFlow } from "@/hooks/useRecommendationFlow";

export default function Home() {
  const flow = useRecommendationFlow();
  const shellRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      shellRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      shellRef.current?.querySelector<HTMLElement>(".screen")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [flow.step]);

  return (
    <main ref={shellRef} className={`appShell${flow.step === "start" ? " startShell" : ""}`}>
      <div className="devStepControls" aria-label="개발용 단계 이동">
        <button type="button" onClick={flow.devGoPrevious}>
          이전 단계
        </button>
        <span>{flow.step}</span>
        <button type="button" onClick={flow.devGoNext}>
          다음 단계
        </button>
      </div>

      {flow.step === "start" ? <StartHero onStart={() => flow.setStep("profile")} /> : null}

      {flow.step === "profile" ? (
        <ProfileStep
          profile={flow.profile}
          updateProfile={flow.updateProfile}
          canContinue={flow.canContinueProfile}
          onNext={() => flow.setStep("quick")}
        />
      ) : null}

      {flow.step === "quick" ? (
        <QuickCheckStep
          page={flow.quickPage}
          question={flow.quickPageQuestions[0]}
          totalQuestions={12}
          answers={flow.quickAnswers}
          onAnswer={flow.setQuickAnswer}
          onBack={flow.previousQuickPage}
        />
      ) : null}

      {flow.step === "goals" ? (
        <GoalStep
          goals={flow.goals}
          canContinue={flow.canContinueGoals}
          onToggleGoal={flow.toggleGoal}
          onBack={() => flow.setStep("quick")}
          onNext={() => flow.setStep("context")}
        />
      ) : null}

      {flow.step === "context" ? (
        <ContextStep
          context={flow.context}
          updateContext={flow.updateContext}
          canContinue={flow.canContinueContext}
          onBack={() => flow.setStep("goals")}
          onNext={flow.startBranchAnalysis}
        />
      ) : null}

      {flow.step === "branchIntro" ? <BranchIntro /> : null}

      {flow.step === "resultIntro" ? <BranchIntro variant="result" /> : null}

      {flow.step === "branch" ? (
        <BranchStep
          definitions={flow.branchDefinitions}
          page={flow.branchPage}
          question={flow.branchPageQuestions[0]}
          totalQuestions={flow.branchQuestions.length}
          answers={flow.branchAnswers}
          onAnswer={flow.setBranchAnswer}
          onBack={() => flow.setStep("context")}
        />
      ) : null}

      {flow.step === "result" && flow.result ? (
        <ResultsScreen result={flow.result} saveState={flow.saveState} onReset={flow.reset} />
      ) : null}
    </main>
  );
}
