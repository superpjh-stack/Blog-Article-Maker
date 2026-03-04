# 기획 2: 사용자 스토리 & 콘텐츠 워크플로우

작성일: 2026-03-04
담당: 기획 에이전트 2

---

## 1. 사용자 여정 맵 (User Journey Map)

### 전체 흐름
주제 입력 → 옵션 설정 → 생성 시작 → 로딩 → 결과 확인 → 편집 → 저장/발행

---

### 단계별 상세

#### Step 1: 주제 입력 (Topic Input)

| 항목 | 내용 |
|------|------|
| **사용자 행동** | 메인 페이지의 검색창에 블로그 주제를 텍스트로 입력 (예: "2024년 AI 트렌드") |
| **시스템 반응** | 실시간 입력 유효성 검사, 최소 5자 / 최대 200자 제한 안내, 관련 주제 자동완성 제안 (선택적) |
| **감정 상태** | 기대감, 약간의 불확실성 ("어떤 결과가 나올까?") |
| **잠재적 이탈 지점** | 검색창이 눈에 띄지 않을 경우, 예시 주제가 없어 막막할 경우 |

#### Step 2: 옵션 설정 (Options Configuration)

| 항목 | 내용 |
|------|------|
| **사용자 행동** | 글 길이(짧게/보통/길게), 톤(전문적/캐주얼/교육적), 언어(한국어/영어), 이미지 포함 여부, 참고자료 포함 여부 선택 |
| **시스템 반응** | 선택값에 따른 예상 생성 시간 표시 (예: "약 30초 소요"), 기본값(보통 길이 / 전문적 톤 / 한국어) 미리 설정 |
| **감정 상태** | 통제감, 맞춤화에 대한 만족 |
| **잠재적 이탈 지점** | 옵션이 너무 많아 복잡하게 느껴질 경우 |

#### Step 3: 생성 시작 (Generation Start)

| 항목 | 내용 |
|------|------|
| **사용자 행동** | "블로그 생성" 버튼 클릭 |
| **시스템 반응** | 버튼 비활성화 및 로딩 상태 전환, API 요청 시작 (Claude + Unsplash + Tavily 병렬 호출), 진행률 표시 시작 |
| **감정 상태** | 긴장감, 기대감 |
| **잠재적 이탈 지점** | 피드백 없이 버튼이 반응하지 않는 것처럼 보일 경우 |

#### Step 4: 로딩 (Loading / Generation)

| 항목 | 내용 |
|------|------|
| **사용자 행동** | 대기, 진행 상황 관찰 |
| **시스템 반응** | 단계별 진행 메시지 표시 ("주제 분석 중...", "아티클 작성 중...", "이미지 검색 중...", "참고자료 수집 중..."), 스트리밍으로 텍스트 생성 실시간 표시 (가능 시), 예상 남은 시간 표시 |
| **감정 상태** | 인내심, 흥미 (진행 상황이 보일 경우), 초조함 (진행이 보이지 않을 경우) |
| **잠재적 이탈 지점** | 30초 이상 아무 변화가 없을 경우 |

#### Step 5: 결과 확인 (Result Review)

| 항목 | 내용 |
|------|------|
| **사용자 행동** | 생성된 블로그 전체 검토, 이미지 위치 및 참고자료 확인 |
| **시스템 반응** | 완성된 블로그 미리보기 렌더링, 복사/편집/저장/재생성 버튼 표시, 생성 요약 정보 표시 (단어 수, 읽기 시간, 이미지 수) |
| **감정 상태** | 만족 또는 실망 (결과 품질에 따라), 세부 수정 욕구 |
| **잠재적 이탈 지점** | 결과가 기대와 크게 다를 경우 |

#### Step 6: 편집 (Edit)

| 항목 | 내용 |
|------|------|
| **사용자 행동** | 인라인 텍스트 편집, 섹션 순서 변경, 이미지 교체, 제목 수정, AI에게 특정 섹션 재작성 요청 |
| **시스템 반응** | WYSIWYG 편집기 제공, 변경사항 자동 임시저장, "이 섹션 다시 쓰기" 기능으로 Claude API 재호출 |
| **감정 상태** | 창의적 통제감, 협업하는 느낌 |
| **잠재적 이탈 지점** | 편집 기능이 복잡하거나 변경사항이 저장되지 않을 경우 |

#### Step 7: 저장/발행 (Save / Publish)

| 항목 | 내용 |
|------|------|
| **사용자 행동** | 임시저장 또는 발행, 링크 복사, 소셜 공유 |
| **시스템 반응** | 고유 URL 생성, 클립보드 복사 확인 토스트, 소셜 미리보기(OG 태그) 자동 생성, 발행 목록에 추가 |
| **감정 상태** | 성취감, 공유 욕구 |
| **잠재적 이탈 지점** | 회원가입을 강제할 경우 (게스트 저장 미지원 시) |

---

## 2. LLM 프롬프트 전략

### 2.1 시스템 프롬프트 구조

```
SYSTEM PROMPT:
You are an expert blog writer specializing in creating high-quality, engaging articles.
Your task is to write a comprehensive blog post on the given topic.

ARTICLE REQUIREMENTS:
- Language: {language} (Korean or English)
- Tone: {tone} (professional / casual / educational)
- Length: {length} (short: ~500 words / medium: ~1000 words / long: ~2000 words)
- Format: Markdown

STRUCTURE (strictly follow this order):
1. Title: Compelling H1 title that includes the main keyword
2. Introduction (2-3 paragraphs): Hook the reader, state the problem/opportunity, preview what will be covered
3. Main Sections (3-5 sections): Each section with H2 heading, 2-4 paragraphs, bullet points where appropriate
4. Conclusion (1-2 paragraphs): Summarize key takeaways, call to action
5. References placeholder: Output "[REFERENCES_PLACEHOLDER]" at the end — do NOT fabricate URLs

QUALITY RULES:
- Do not include fabricated statistics without a source
- Write in active voice where possible
- Include at least one practical example or use case per main section
- Add [IMAGE: descriptive query] tags at natural image insertion points (max 3)

OUTPUT FORMAT:
Return only the Markdown content. Do not add any preamble or explanation.
```

### 2.2 사용자 프롬프트 구조

```
USER PROMPT:
Topic: {user_topic}
Tone: {tone}
Length: {length}
Language: {language}
Additional instructions: {optional_custom_instructions}

Write the blog post now.
```

### 2.3 섹션 구성 전략

| 섹션 | 역할 | 분량 비율 |
|------|------|-----------|
| 제목 (H1) | 클릭율 최적화, 핵심 키워드 포함 | — |
| 서론 | 독자 훅, 문제 제기, 본문 예고 | 10% |
| 본문 섹션 1 | 핵심 개념 정의/배경 | 15% |
| 본문 섹션 2 | 주요 내용 A | 20% |
| 본문 섹션 3 | 주요 내용 B | 20% |
| 본문 섹션 4 (선택) | 심화 내용 또는 사례 | 15% |
| 본문 섹션 5 (선택) | 실용 팁 또는 비교 | 10% |
| 결론 | 요약, 행동 촉구 | 10% |
| 참고자료 | Tavily/Serper 검색 결과로 채움 | — |

### 2.4 톤/스타일 옵션별 프롬프트 지시어

| 톤 | 프롬프트 지시어 |
|----|----------------|
| **전문적 (Professional)** | "Use formal language, cite concepts precisely, avoid colloquialisms. Suitable for industry professionals." |
| **캐주얼 (Casual)** | "Write in a friendly, conversational tone. Use contractions, simple sentences, and relatable examples. Suitable for general audience." |
| **교육적 (Educational)** | "Explain concepts step by step. Define technical terms when first used. Include analogies. Suitable for beginners and learners." |

### 2.5 이미지 삽입 전략

LLM이 `[IMAGE: {descriptive query}]` 태그를 자연스러운 위치에 삽입하면,
백엔드가 해당 태그를 파싱하여 Unsplash/Pexels API로 검색 후 실제 이미지 URL로 교체한다.

```
예시 LLM 출력:
[IMAGE: artificial intelligence robot working in office]
## AI가 업무를 바꾸는 방법
AI 기술이 현대 직장 환경을 ...
```

### 2.6 참고자료 처리 전략

1. LLM 출력에서 `[REFERENCES_PLACEHOLDER]` 위치 파악
2. Tavily/Serper API로 주제 관련 상위 5개 웹페이지 검색
3. 결과를 Markdown 링크 형식으로 포맷팅
4. `[REFERENCES_PLACEHOLDER]`를 실제 참고자료 목록으로 교체

---

## 3. 주요 사용자 스토리 (10개)

### US-01: 빠른 블로그 초안 작성
> **콘텐츠 마케터로서**, 마케팅 캠페인에 필요한 블로그 초안을 빠르게 작성하기 위해,
> **주제와 톤만 입력하면 즉시 완성도 높은 초안을 생성해주는 기능**을 원한다.

**수용 기준:**
- 30초 내에 1,000단어 수준의 초안 생성
- 마케팅 톤(전문적/캐주얼) 선택 가능

---

### US-02: 다국어 콘텐츠 생성
> **글로벌 스타트업 창업자로서**, 한국어와 영어 두 시장을 동시에 타겟팅하기 위해,
> **같은 주제로 언어를 선택하여 블로그를 생성하는 기능**을 원한다.

**수용 기준:**
- 한국어 / 영어 생성 지원
- 단순 번역이 아닌 해당 언어 문화에 맞는 표현 사용

---

### US-03: 이미지가 포함된 완성형 포스트
> **개인 블로거로서**, 글만 쓰면 이미지 찾는 데 시간이 너무 걸리기 때문에,
> **AI가 관련 이미지까지 자동으로 찾아 본문에 삽입해주는 기능**을 원한다.

**수용 기준:**
- 본문 흐름에 맞는 위치에 최대 3개 이미지 자동 삽입
- 라이선스 무료(Unsplash/Pexels) 이미지 사용

---

### US-04: 신뢰도 있는 참고자료 포함
> **교육 콘텐츠 제작자로서**, 독자에게 신뢰를 주기 위해,
> **검색 API를 통해 실제 존재하는 최신 참고자료가 자동으로 포함된 글**을 원한다.

**수용 기준:**
- 최소 3개 이상의 실제 URL 참고자료 포함
- 가짜 URL 또는 할루시네이션된 링크 미포함

---

### US-05: 글 길이 커스터마이징
> **SNS 운영자로서**, 플랫폼마다 적합한 글 길이가 다르기 때문에,
> **짧은 요약형(500자)부터 심층 분석형(2000자)까지 길이를 선택하는 기능**을 원한다.

**수용 기준:**
- 짧게(~500단어) / 보통(~1000단어) / 길게(~2000단어) 3단계 선택 가능

---

### US-06: 특정 섹션 재생성
> **편집자로서**, 전체 글을 다시 쓰는 것은 낭비이기 때문에,
> **마음에 들지 않는 특정 섹션만 선택하여 AI에게 재작성을 요청하는 기능**을 원한다.

**수용 기준:**
- 각 섹션 옆에 "재작성" 버튼 제공
- 재작성 시 나머지 섹션은 유지

---

### US-07: 생성 결과 링크 공유
> **팀 리더로서**, 팀원들과 협업하기 위해,
> **생성된 블로그 포스트의 고유 링크를 복사하여 공유하는 기능**을 원한다.

**수용 기준:**
- 발행 후 고유 URL 즉시 생성
- 링크 접근 시 별도 로그인 없이 읽기 가능

---

### US-08: 히스토리 관리
> **파워 유저로서**, 이전에 생성한 글들을 관리하기 위해,
> **내가 생성한 블로그 목록을 확인하고 다시 열어 편집하는 기능**을 원한다.

**수용 기준:**
- 로그인 후 생성 히스토리 목록 표시
- 제목, 날짜, 주제로 정렬/검색 가능

---

### US-09: 클립보드 복사
> **워드프레스 블로거로서**, 생성한 글을 내 CMS에 붙여넣기 위해,
> **Markdown 또는 HTML 형식으로 전체 내용을 클립보드에 복사하는 기능**을 원한다.

**수용 기준:**
- "Markdown 복사" / "HTML 복사" 버튼 각각 제공
- 복사 완료 토스트 메시지 표시

---

### US-10: 비로그인 즉시 사용
> **처음 방문한 사용자로서**, 회원가입 없이 서비스를 먼저 경험해보기 위해,
> **로그인 없이도 1회 블로그 생성을 무료로 시도할 수 있는 기능**을 원한다.

**수용 기준:**
- 비로그인 상태에서 1회 생성 허용
- 저장/발행 시 로그인 유도 (강제 아님)

---

## 4. 에러 & 엣지 케이스 (5가지)

### EC-01: Claude API 타임아웃 / 실패

**상황:** 아티클 생성 중 Claude API가 30초 이상 응답하지 않거나 오류를 반환

**처리 방법:**
1. 프론트엔드에서 30초 후 타임아웃 감지 → 사용자에게 토스트 알림 표시
2. 오류 메시지: "아티클 생성 중 문제가 발생했습니다. 다시 시도해주세요."
3. "다시 시도" 버튼 제공 (동일 옵션으로 재요청)
4. 백엔드 로그에 에러 기록 (Sentry 등)
5. 3회 연속 실패 시 "잠시 후 다시 시도해주세요" 안내

---

### EC-02: 이미지 검색 결과 없음

**상황:** 매우 틈새 주제(예: "특정 지역의 방언 보존 운동")로 Unsplash/Pexels 검색 결과가 없음

**처리 방법:**
1. 검색어를 더 일반적인 키워드로 자동 재시도 (예: "culture preservation")
2. 재시도 후에도 결과 없으면 기본 플레이스홀더 이미지 사용
3. 사용자에게 "일부 이미지를 찾지 못했습니다. 직접 이미지를 업로드할 수 있습니다." 안내
4. 이미지 없이도 글 자체는 완성 제공

---

### EC-03: 부적절한 주제 입력

**상황:** 사용자가 욕설, 불법 콘텐츠, 성인물, 혐오 표현 관련 주제를 입력

**처리 방법:**
1. 프론트엔드: 금지 키워드 기본 필터링 (1차 방어)
2. 백엔드: Claude API 호출 전 Anthropic의 안전 정책 적용 (Claude 자체 거절)
3. Claude가 콘텐츠 정책 위반으로 거절 시, 에러 메시지로 변환:
   "해당 주제로는 블로그를 생성할 수 없습니다. 다른 주제를 입력해주세요."
4. 반복 위반 시 IP 기반 임시 차단 (서버 레벨)

---

### EC-04: 너무 짧거나 모호한 주제 입력

**상황:** 사용자가 "AI", "음식", "여행" 같이 지나치게 광범위한 단어만 입력

**처리 방법:**
1. 최소 5자 제한으로 너무 짧은 입력 방지 (프론트엔드 유효성 검사)
2. 주제가 광범위하다고 판단되면 생성 전 경고:
   "주제가 너무 넓을 수 있습니다. 더 구체적인 주제를 입력하면 더 좋은 결과를 얻을 수 있어요."
3. 구체화 제안 예시 제공 ("AI" → "2025년 AI 기술이 의료 분야에 미치는 영향")
4. 사용자가 계속 진행하면 그대로 생성 허용 (강제 차단 아님)

---

### EC-05: 참고자료 검색 API (Tavily/Serper) 실패

**상황:** 참고자료 검색 API가 오류를 반환하거나 관련 결과를 못 찾음

**처리 방법:**
1. 참고자료 섹션을 완전히 제거하지 않고, 빈 참고자료 섹션 대신 안내 문구 삽입:
   "자동 참고자료 검색에 실패했습니다. 아래에 직접 참고자료를 추가해주세요."
2. 사용자가 편집 모드에서 수동으로 참고자료 URL 추가 가능
3. 아티클 본문은 정상 완성 — 참고자료 실패가 전체 생성을 막지 않음
4. 다른 검색 API로 폴백 (Tavily 실패 → Serper 시도)
5. 모두 실패 시 로그 기록 후 사용자에게 투명하게 안내

---

*문서 끝 — 기획 에이전트 2 작성*
