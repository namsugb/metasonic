import type {
  AxisId,
  BranchDefinition,
  GoalCode,
  ModeConfig,
  ModeId,
  Preference,
  QuickQuestion,
} from "./types";

export const SCALE_LABELS = ["없음", "낮음", "보통", "높음", "매우 높음"] as const;

export const AGE_RANGES = ["10대", "20대", "30대", "40대", "50대 이상"] as const;

export const GENDERS = ["여성", "남성", "응답 안 함"] as const;

export const AXIS_LABELS: Record<AxisId, string> = {
  vascular: "붉음 반응",
  neuro: "민감 반응",
  barrier: "장벽 불안정",
  lesion: "트러블 활성",
  recovery: "회복 지연",
  damage: "누적 흔적",
};

export const OUTPUT_LEVEL_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Level 1 · 매우 부드럽게",
  2: "Level 2 · 부드럽게",
  3: "Level 3 · 기본",
  4: "Level 4 · 강화",
  5: "Level 5 · 집중",
};

export const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: "Q1", text: "최근 72시간 안에 붉어짐이나 열감이 쉽게 올라왔나요?", axes: { vascular: 1 } },
  { id: "Q2", text: "세안, 마스크, 온도 변화 후 붉은기가 오래 남았나요?", axes: { vascular: 0.65, neuro: 0.35 } },
  { id: "Q3", text: "따가움, 화끈거림, 간지러움 같은 민감 반응이 있었나요?", axes: { neuro: 0.65, barrier: 0.35 } },
  { id: "Q4", text: "평소 쓰던 제품도 오늘은 부담스럽게 느껴졌나요?", axes: { neuro: 0.75, vascular: 0.25 } },
  { id: "Q5", text: "당김, 건조감, 거친 표면이 자주 느껴졌나요?", axes: { barrier: 1 } },
  { id: "Q6", text: "유분과 건조감이 동시에 느껴져 균형이 흔들렸나요?", axes: { barrier: 0.7, lesion: 0.3 } },
  { id: "Q7", text: "트러블이 새로 올라오는 부위가 최근에 있었나요?", axes: { lesion: 1 } },
  { id: "Q8", text: "반복되는 자국이나 같은 부위의 트러블이 신경 쓰이나요?", axes: { lesion: 0.6, damage: 0.4 } },
  { id: "Q9", text: "피부 컨디션 회복이 평소보다 느리다고 느꼈나요?", axes: { recovery: 1 } },
  { id: "Q10", text: "칙칙함, 잡티, 결처럼 누적된 흔적이 신경 쓰이나요?", axes: { damage: 1 } },
  { id: "Q11", text: "수면, 스트레스, 주기 변화에 피부가 민감하게 반응했나요?", axes: { neuro: 0.3, barrier: 0.3, recovery: 0.4 } },
  { id: "Q12", text: "오늘 전반적인 피부 컨디션이 불안정하다고 느껴지나요?", axes: { vascular: 0.2, neuro: 0.2, barrier: 0.2, lesion: 0.2, recovery: 0.2 } },
];

export const GOAL_OPTIONS: {
  code: GoalCode;
  title: string;
  description: string;
  modes: ModeId[];
}[] = [
  { code: "G1", title: "붉은기·열감", description: "붉음 경향과 달아오름을 차분하게", modes: ["redness"] },
  { code: "G2", title: "민감·장벽", description: "예민함과 장벽 불안정 케어", modes: ["redness", "atopic"] },
  { code: "G3", title: "건조·당김", description: "수분감과 회복 리듬 보정", modes: ["atopic", "rejuvenation"] },
  { code: "G4", title: "흡수·결", description: "유효 성분 흡수와 결 정돈", modes: ["atopic", "sonophoresis"] },
  { code: "G5", title: "트러블", description: "올라오는 부위의 불균형 완화", modes: ["acne", "trouble"] },
  { code: "G6", title: "유분·번들거림", description: "유분 균형과 반복 트러블 케어", modes: ["trouble", "acne"] },
  { code: "G7", title: "잡티·자국", description: "색소와 흉터 흔적 케어", modes: ["whitening", "scarCare"] },
  { code: "G8", title: "생기", description: "칙칙함과 생기 저하 보정", modes: ["rejuvenation", "redness"] },
  { code: "G9", title: "주름·노화", description: "피부결과 탄력 저하 케어", modes: ["wrinkles", "rejuvenation"] },
  { code: "G10", title: "탄력·리프팅", description: "처짐과 탄탄함 저하 케어", modes: ["tightening", "lifting"] },
  { code: "G11", title: "흔적·결", description: "오래 남은 자국과 피부결 정돈", modes: ["scarCare", "rejuvenation"] },
  { code: "G12", title: "영양 흡수", description: "제품 흡수와 윤기 강화", modes: ["sonophoresis"] },
];

export const MODE_CONFIGS: ModeConfig[] = [
  { id: "whitening", english: "WHITENING", labelKo: "미백 케어", description: "칙칙함과 잡티 경향을 부드럽게 정돈", durationMinutes: 12, baseLevel: 3, axisWeights: { damage: 0.55, recovery: 0.2, barrier: 0.15, vascular: 0.1 } },
  { id: "wrinkles", english: "WRINKLES", labelKo: "주름 케어", description: "피부결과 탄력 저하 경향을 집중 관리", durationMinutes: 12, baseLevel: 3, axisWeights: { damage: 0.38, recovery: 0.28, barrier: 0.14, neuro: 0.1, vascular: 0.1 } },
  { id: "lifting", english: "LIFTING", labelKo: "리프팅 케어", description: "처짐과 탄력 저하 경향을 탄탄하게 보정", durationMinutes: 15, baseLevel: 4, axisWeights: { damage: 0.36, recovery: 0.28, barrier: 0.16, neuro: 0.1, vascular: 0.1 } },
  { id: "tightening", english: "TIGHTENING", labelKo: "탄력 케어", description: "느슨한 결감과 탄력 저하를 정돈", durationMinutes: 12, baseLevel: 4, axisWeights: { damage: 0.34, recovery: 0.26, barrier: 0.18, neuro: 0.12, vascular: 0.1 } },
  { id: "rejuvenation", english: "REJUVENATION", labelKo: "피부 재생 케어", description: "회복 리듬과 생기 저하를 차분히 보정", durationMinutes: 12, baseLevel: 3, axisWeights: { recovery: 0.4, damage: 0.24, barrier: 0.2, vascular: 0.08, neuro: 0.08 } },
  { id: "sonophoresis", english: "SONOPHORESIS", labelKo: "유효성분 흡수 케어", description: "건조감과 흡수 저하 경향을 부드럽게 지원", durationMinutes: 12, baseLevel: 2, axisWeights: { barrier: 0.38, recovery: 0.28, neuro: 0.14, damage: 0.12, vascular: 0.08 } },
  { id: "trouble", english: "TROUBLE", labelKo: "트러블 케어", description: "유분 균형과 올라오는 부위를 정돈", durationMinutes: 12, baseLevel: 3, axisWeights: { lesion: 0.52, barrier: 0.2, recovery: 0.12, neuro: 0.08, vascular: 0.08 } },
  { id: "acne", english: "ACNE", labelKo: "트러블 집중 케어", description: "반복되는 트러블 경향을 집중 관리", durationMinutes: 10, baseLevel: 3, axisWeights: { lesion: 0.58, barrier: 0.18, neuro: 0.1, recovery: 0.08, vascular: 0.06 } },
  { id: "redness", english: "REDNESS CARE", labelKo: "붉음 진정 케어", description: "붉은기와 열감 반응을 차분하게 케어", durationMinutes: 10, baseLevel: 2, axisWeights: { vascular: 0.56, neuro: 0.18, barrier: 0.14, recovery: 0.08, lesion: 0.04 } },
  { id: "atopic", english: "ATOPIC CARE", labelKo: "민감 장벽 케어", description: "예민함과 장벽 불안정을 부드러운 방향으로 관리", durationMinutes: 10, baseLevel: 2, axisWeights: { barrier: 0.38, neuro: 0.28, vascular: 0.16, recovery: 0.12, lesion: 0.06 } },
  { id: "scarCare", english: "SCAR CARE", labelKo: "자국·결 케어", description: "오래 남은 흔적과 피부결을 단계적으로 정돈", durationMinutes: 15, baseLevel: 3, axisWeights: { damage: 0.48, recovery: 0.22, lesion: 0.14, barrier: 0.1, neuro: 0.06 } },
];

export const BRANCH_DEFINITIONS: BranchDefinition[] = [
  {
    id: "vascular",
    title: "붉음 반응 정밀 확인",
    description: "열감과 붉은기 패턴을 더 확인해 진정 중심 추천을 보정합니다.",
    questions: [
      { branchId: "vascular", id: "A1", text: "온도 변화에 얼굴이 빠르게 달아오르나요?", axes: { vascular: 1 } },
      { branchId: "vascular", id: "A2", text: "붉은기가 30분 이상 남는 편인가요?", axes: { vascular: 0.75, recovery: 0.25 } },
      { branchId: "vascular", id: "A3", text: "매운 음식, 음주, 운동 후 붉은기가 도드라지나요?", axes: { vascular: 0.85, neuro: 0.15 } },
      { branchId: "vascular", id: "A4", text: "붉은 부위가 건조하거나 당기는 느낌이 있나요?", axes: { vascular: 0.45, barrier: 0.35, neuro: 0.2 } },
    ],
  },
  {
    id: "neuroBarrier",
    title: "민감·장벽 정밀 확인",
    description: "예민함과 장벽 흔들림을 확인해 출력 레벨과 케어 방향을 조정합니다.",
    questions: [
      { branchId: "neuroBarrier", id: "B1", text: "새 제품이나 향이 있는 제품에 쉽게 반응하나요?", axes: { neuro: 0.75, barrier: 0.25 } },
      { branchId: "neuroBarrier", id: "B2", text: "세안 직후 당김이 오래 지속되나요?", axes: { barrier: 0.8, recovery: 0.2 } },
      { branchId: "neuroBarrier", id: "B3", text: "피부 표면이 얇고 예민해진 느낌이 있나요?", axes: { neuro: 0.45, barrier: 0.45, vascular: 0.1 } },
      { branchId: "neuroBarrier", id: "B4", text: "컨디션이 나쁜 날 회복까지 시간이 걸리나요?", axes: { recovery: 0.65, barrier: 0.25, neuro: 0.1 } },
    ],
  },
  {
    id: "lesion",
    title: "트러블 활성 정밀 확인",
    description: "올라오는 부위와 유분 균형을 확인해 트러블 계열 추천을 세밀하게 보정합니다.",
    questions: [
      { branchId: "lesion", id: "C1", text: "최근 일주일 안에 새로 올라온 트러블이 있나요?", axes: { lesion: 1 } },
      { branchId: "lesion", id: "C2", text: "특정 부위에 반복적으로 올라오는 편인가요?", axes: { lesion: 0.75, damage: 0.25 } },
      { branchId: "lesion", id: "C3", text: "유분이나 번들거림이 오후에 도드라지나요?", axes: { lesion: 0.75, barrier: 0.25 } },
      { branchId: "lesion", id: "C4", text: "트러블 후 자국이 오래 남는 편인가요?", axes: { lesion: 0.4, damage: 0.45, recovery: 0.15 } },
    ],
  },
  {
    id: "pigmentDamage",
    title: "색소·흔적 정밀 확인",
    description: "칙칙함, 잡티, 흉터 흔적의 우선순위를 확인해 결 케어 추천을 보정합니다.",
    questions: [
      { branchId: "pigmentDamage", id: "D1", text: "칙칙함이나 불균일한 톤이 가장 먼저 보이나요?", axes: { damage: 0.8, recovery: 0.2 } },
      { branchId: "pigmentDamage", id: "D2", text: "옅은 잡티나 붉은 자국이 진해 보이나요?", axes: { damage: 0.65, vascular: 0.25, recovery: 0.1 } },
      { branchId: "pigmentDamage", id: "D3", text: "오래 남은 자국이 메이크업으로도 가리기 어렵나요?", axes: { damage: 0.85, recovery: 0.15 } },
      { branchId: "pigmentDamage", id: "D4", text: "피부결이 거칠고 빛 반사가 고르지 않나요?", axes: { damage: 0.55, barrier: 0.25, recovery: 0.2 } },
    ],
  },
  {
    id: "agingFirmness",
    title: "탄력·피부결 정밀 확인",
    description: "탄력 저하와 피부결 상태를 확인해 강화 계열 추천의 적합도를 조정합니다.",
    questions: [
      { branchId: "agingFirmness", id: "E1", text: "보이는 선이나 처짐이 이전보다 늘었다고 느끼나요?", axes: { damage: 0.5, recovery: 0.35, barrier: 0.15 } },
      { branchId: "agingFirmness", id: "E2", text: "눈가나 입가 피부결이 건조하고 힘이 없어 보이나요?", axes: { damage: 0.45, barrier: 0.35, recovery: 0.2 } },
      { branchId: "agingFirmness", id: "E3", text: "피부가 쉽게 지쳐 보이고 생기가 떨어지나요?", axes: { recovery: 0.55, damage: 0.35, vascular: 0.1 } },
      { branchId: "agingFirmness", id: "E4", text: "탄력 케어보다 부드러운 관리가 더 편하게 느껴지나요?", axes: { neuro: 0.4, barrier: 0.35, recovery: 0.25 } },
    ],
  },
  {
    id: "recoveryAbsorption",
    title: "회복·흡수 정밀 확인",
    description: "제품 흡수감과 회복 리듬을 확인해 부드러운 보정 케어를 찾습니다.",
    questions: [
      { branchId: "recoveryAbsorption", id: "F1", text: "스킨케어를 해도 금방 건조함이 돌아오나요?", axes: { barrier: 0.55, recovery: 0.35, neuro: 0.1 } },
      { branchId: "recoveryAbsorption", id: "F2", text: "제품이 겉도는 느낌이 자주 있나요?", axes: { barrier: 0.45, recovery: 0.35, damage: 0.2 } },
      { branchId: "recoveryAbsorption", id: "F3", text: "피부가 피곤해 보이는 날이 많나요?", axes: { recovery: 0.65, damage: 0.25, vascular: 0.1 } },
      { branchId: "recoveryAbsorption", id: "F4", text: "오늘은 강한 관리보다 편안한 관리가 더 끌리나요?", axes: { neuro: 0.4, barrier: 0.3, recovery: 0.3 } },
    ],
  },
];

export const PREFERENCE_LABELS: Record<Preference, string> = {
  quick: "빠른 효과",
  balanced: "균형",
  gentle: "부드럽게",
};
