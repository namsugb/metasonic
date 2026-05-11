import { AGE_RANGES, GENDERS } from "@/lib/recommendation/constants";
import type { ProfileInput } from "@/lib/recommendation/types";

interface ProfileStepProps {
  profile: ProfileInput;
  updateProfile: <Key extends keyof ProfileInput>(key: Key, value: ProfileInput[Key]) => void;
  canContinue: boolean;
  onNext: () => void;
}

export function ProfileStep({ profile, updateProfile, canContinue, onNext }: ProfileStepProps) {
  return (
    <section className="screen screenLight profileScreen">
      <div className="lightSheet profileForm">
        <div>
          <p className="stepEyebrow">START</p>
          <h2>프로필 입력</h2>
          <p className="sheetHint">결과 저장과 이벤트 상담을 위한 필수 정보입니다.</p>
        </div>

        <label className="field">
          <span>이름</span>
          <input
            value={profile.name}
            onChange={(event) => updateProfile("name", event.target.value)}
            placeholder="이름을 입력해주세요"
            autoComplete="name"
          />
        </label>

        <label className="field">
          <span>연락처</span>
          <input
            value={profile.contact}
            onChange={(event) => updateProfile("contact", event.target.value)}
            placeholder="010-0000-0000"
            autoComplete="tel"
          />
        </label>

        <div className="fieldGrid">
          <label className="field">
            <span>연령대</span>
            <select
              value={profile.ageRange}
              onChange={(event) => updateProfile("ageRange", event.target.value)}
            >
              <option value="">선택</option>
              {AGE_RANGES.map((ageRange) => (
                <option value={ageRange} key={ageRange}>
                  {ageRange}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>성별</span>
            <select
              value={profile.gender}
              onChange={(event) => updateProfile("gender", event.target.value)}
            >
              <option value="">선택</option>
              {GENDERS.map((gender) => (
                <option value={gender} key={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="consentBox">
          <input
            type="checkbox"
            checked={profile.privacyConsent}
            onChange={(event) => updateProfile("privacyConsent", event.target.checked)}
          />
          <span>이벤트 상담 및 결과 저장 목적의 개인정보 수집에 동의합니다.</span>
        </label>

        <button className="primaryButton" disabled={!canContinue} onClick={onNext} type="button">
          Quick Check 시작
        </button>
      </div>
    </section>
  );
}
