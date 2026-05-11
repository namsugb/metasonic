# Frontend Agent Guide

이 폴더는 ESTELLA MAX Phase 1 추천 웹의 Next.js 프론트엔드 작업 영역이다.


## Project Scope

- Next.js + TypeScript 기반 모바일 우선 웹으로 구현한다.
- 인증, 피드백, 개인화, 주간 리포트, 관리자 화면, Phase 2 기능은 범위에서 제외한다.
- 사용자는 엑스포 부스 태블릿 또는 QR을 통해 1회성으로 문진하고 추천 결과를 확인한다.

## Suggested Structure

Next.js 프로젝트가 생성되면 다음 구조를 우선한다.

- `app/`: route, page, layout, server action 또는 route handler composition
- `components/`: 재사용 가능한 presentation 컴포넌트
- `components/forms/`: 프로필, 문진, 고민 선택, 컨텍스트 입력 UI
- `components/results/`: 6축 그래프, 추천 카드, 주의 모드, 확신도 UI
- `hooks/`: 화면 단위 상태 흐름과 step orchestration
- `lib/`: 추천 엔진, Supabase client, 저장 service, formatting utilities
- `lib/recommendation/`: 질문/모드/축/가중치 상수와 순수 추천 함수
- `lib/supabase/`: Supabase client와 저장 API
- `types/`: 문진 답변, 추천 결과, DB payload 타입

## Architecture Rules

- 기본 흐름은 `page/component -> hook -> lib service -> Supabase/API`를 따른다.
- `app/`과 UI 컴포넌트에서 Supabase query를 직접 작성하지 않는다.
- Supabase 접근은 `lib/supabase/`의 service 함수로 감싼다.
- 추천 계산은 `lib/recommendation/`의 TypeScript 상수와 순수 함수로 구현한다.
- route/page 파일은 composition layer로 유지한다. 복잡한 문진 step 상태, 검증, submit 흐름은 hook이나 feature component로 분리한다.
- UI는 추천 계산 결과를 표시하고 저장을 요청할 뿐, 점수 계산 규칙을 JSX 안에 흩뿌리지 않는다.
- GPT나 외부 AI 호출로 핵심 추천 점수를 계산하지 않는다.

## Screen Rules

확정 화면 흐름은 다음과 같다.

1. 시작/프로필
2. Quick Check
3. 고민 선택
4. 컨텍스트 입력
5. 추가 분기 문진
6. 추천 결과

Quick Check는 12문항을 4문항씩 3단계로 보여준다. 답변 UI는 0~4 라디오를 사용한다.

분기 문진은 최대 2개 branch, 전체 20문항 이하 규칙을 따른다. 분기 문진으로 넘어갈 때는 로딩 컴포넌트와 추가 질문 설명을 넣어 전문적인 분석 과정처럼 느껴지게 한다.

결과 화면에는 다음을 포함한다.

- 6축 점수 그래프
- 추천 모드
- 권장 사용 시간
- 출력 레벨
- 모드별 추천 이유 2~3문장
- 주의/피해야 할 모드
- 추천 확신도 점수와 라벨
- 의료 진단이 아니며 추천 보정용이라는 고지
- 처음으로 돌아가기 버튼

## Async Data UI Rules

- 저장 중, 저장 성공, 저장 실패 상태를 명확히 처리한다.
- Supabase 저장 실패는 추천 결과 표시를 막지 않는다.
- 저장 실패 시 사용자에게 과도하게 기술적인 오류를 보여주지 않는다. 필요한 경우 조용한 안내나 내부 상태로만 처리한다.
- 데이터 기반 영역을 빈 화면으로 방치하지 않는다.
- 로딩 상태는 최종 콘텐츠의 형태와 톤에 맞는 skeleton, progress, 또는 분석 중 UI를 사용한다.

## Interaction Rules

- 모든 주요 버튼, 카드, 라디오, 선택 행은 명확한 hover/focus/pressed 상태를 가진다.
- 모바일 터치를 기준으로 탭 영역을 충분히 크게 만든다.
- 비활성, 로딩, 제출 중 상태는 시각적으로 구분한다.
- 키보드 접근성과 focus-visible 상태를 유지한다.
- 텍스트가 작은 화면에서 겹치거나 잘리지 않도록 반응형 제약을 둔다.

## Design Rules

UI 작업 시 `design-system/estella-max-image-extract.md`를 따른다.

- Premium, calm, personal, warm clinical, AI-assisted 톤
- 모바일 우선
- 다크 시네마틱 시작/결과 화면과 warm ivory 폼 화면 조합
- rose-gold/copper accent 사용
- 귀엽거나 장난스러운 톤 금지
- 차갑고 병원적인 블루 중심 UI 금지
- 의료 진단 앱보다 프리미엄 뷰티 테크 코치처럼 보이게 한다

주요 색상:

- Obsidian: `#0E0C0A`
- Charcoal: `#1A1512`
- Ivory: `#FFF7F1`
- Cream: `#F7EDE4`
- Rose Gold: `#D4A287`
- Copper: `#B98064`
- Blush: `#F29C8E`
- Sky: `#8FB7D4`
- Sage: `#AFC8A5`

## Copy Rules

- 의료 진단처럼 보이는 표현을 피한다.
- 피부 질환명 표현은 줄이고 `민감 경향`, `장벽 불안정`, `회복 지연 경향`, `홍조 경향`처럼 완화된 표현을 쓴다.
- "의료 진단이 아니며 추천 보정용"이라는 고지를 결과 또는 주요 흐름에 포함한다.
- 질문 문구는 UX에 맞게 다듬을 수 있지만, 측정하려는 의미는 바꾸지 않는다.

## Testing And Verification

- 추천 엔진 순수 함수는 단위 테스트를 우선 고려한다.
- 화면 변경은 모바일 viewport에서 직접 확인한다.
- 검증 시 최소 흐름을 확인한다: 프로필 입력, Quick Check, 고민 선택, 컨텍스트, 분기 문진, 결과 표시, 처음으로 돌아가기.
- Supabase 환경변수가 없거나 저장 실패가 발생해도 결과 화면이 표시되는지 확인한다.
