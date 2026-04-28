# chess-logic 스킬

## 트리거 조건
`src/logic/` 파일 작성 또는 수정 시 이 스킬을 로드한다.

## 좌표 시스템

### 절대 컬럼(absCol) 변환
```js
// 상단 하프 (rank 5–8)
absCol = file;        // a=0 … h=7

// 하단 하프 (rank 1–4)
absCol = file + 1;    // a=1 … h=8
```

### 경계 횡단 폰 캡처

**백 폰 (rank 4 → rank 5)**
- 좌측 캡처: bottom file F → top file F     (absCol F+1 → F)
- 우측 캡처: bottom file F → top file F+2   (absCol F+1 → F+2)
- 엣지: F=7이면 우측 불가

**흑 폰 (rank 5 → rank 4)**
- 좌측 캡처: top file F → bottom file F-2   (absCol F → F-1)
- 우측 캡처: top file F → bottom file F     (absCol F → F+1)
- 엣지: F=0이면 좌측 불가

### 경계 횡단 직선 전진 금지
- 백 폰 rank 4 → rank 5 직선 전진 불가
- 흑 폰 rank 5 → rank 4 직선 전진 불가

## 파일 구조
- `coordinates.js`   — absCol 변환, isUpperHalf(), isBoundary()
- `moveGenerator.js` — 기물별 pseudo-legal 무브 배열
- `boundaryMoves.js` — 경계 횡단 폰 캡처 전용
- `specialMoves.js`  — 캐슬링, 앙 파상, 프로모션, 2칸 전진
- `checkDetection.js`— isInCheck(), isCheckmate(), isStalemate()
- `boardUtils.js`    — 보드 초기화, 클론, 직렬화

## 핵심 원칙
- 모든 함수는 순수 함수 (Firebase 의존 없음)
- legal move = pseudo-legal 에서 "자기 킹 체크" 무브 제거
- 가상 실행(applyMoveToBoard) 후 isInCheck() 로 필터링

전체 규칙 → `references/coordinate-rules.md`
