interface BranchIntroProps {
  variant?: "branch" | "result";
}

export function BranchIntro({ variant = "branch" }: BranchIntroProps) {
  const isResult = variant === "result";

  return (
    <section className="screen screenDark analysisScreen">
      <div className="analysisOrb" aria-hidden="true">
        <span />
      </div>
      <p className="stepEyebrow">AI ANALYSIS</p>
      <h2>{isResult ? "추천 결과를 정리하고 있어요" : "추가 질문을 구성하고 있어요"}</h2>
      <p>
        {isResult
          ? "추가 답변과 안전 조건을 함께 계산해 오늘 가장 적합한 ESTELLA MAX 모드를 선별합니다."
          : "Quick Check와 선택한 고민을 바탕으로 현재 피부 경향에 필요한 분기만 선별합니다."}
      </p>
      <div className="analysisBars" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
