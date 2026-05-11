interface StartHeroProps {
  onStart: () => void;
}

export function StartHero({ onStart }: StartHeroProps) {
  return (
    <section className="screen startHeroScreen" aria-labelledby="start-hero-title">
      <img className="startHeroImage" src="/estella-reference.png" alt="" aria-hidden="true" />
      <div className="startHeroScrim" aria-hidden="true" />

      <div className="startHeroContent">
        <p className="startHeroKicker">AI PERSONAL SKIN COACH</p>
        <h1 id="start-hero-title" className="startHeroBrand">
          ESTELLA
          <span>MAX</span>
        </h1>
        <p className="startHeroCopy" style={{ whiteSpace: "nowrap" }}>
          오늘의 피부 컨디션에 맞춘 에스테라 맥스 추천을 <br />시작합니다.
        </p>

        <button className="primaryButton startHeroButton" type="button" onClick={onStart}>
          진단시작하기
        </button>
      </div>
    </section>
  );
}
