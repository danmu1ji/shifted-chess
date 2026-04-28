# 어긋난 경계 체스 (Shifted Chess) — 구현 에이전트 지침

## 1. 프로젝트 개요

rank 4–5 경계가 1칸 우측으로 어긋난 변형 체스 게임.
React + Vite + Firebase Realtime Database. GitHub Pages 배포.

## 2. 변형 규칙 요약

- 하단 하프(rank 1–4)가 상단 하프(rank 5–8)보다 절대 그리드 기준 **1칸 우측** 배치
- 폰이 rank 4 ↔ rank 5 경계를 캡처로 건널 때 비대칭 규칙 적용 (→ chess-logic 스킬)
- 경계 횡단 직선 전진 불가 — 반드시 캡처로만 넘어감

좌표 시스템 전체 규칙 → `.claude/skills/chess-logic/SKILL.md` 로드

## 3. 구현 순서

Step 1 ✅ 프로젝트 초기화 (완료)
Step 2 ✅ 체스 로직 — `src/logic/` (chess-logic 스킬 참조)
Step 3 ✅ Firebase 연동 — `src/firebase/` (firebase-sync 스킬 참조)
Step 4 ✅ 훅 레이어 — `src/hooks/`
Step 5 ✅ UI 컴포넌트 — `src/components/Board/` (board-renderer 스킬 참조)
Step 6   게임 흐름 UI — `src/components/Lobby/`, `src/components/Game/`
Step 7   통합 테스트
Step 8   배포

## 4. Firebase 설정

환경변수는 `.env.example` 참조. 로컬은 `.env` 파일, CI는 GitHub Secrets 사용.

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Firebase 연동 패턴 → `.claude/skills/firebase-sync/SKILL.md` 로드

## 5. 배포

```bash
npm run build          # dist/ 생성
# main 브랜치 push → GitHub Actions 자동 배포
# vite.config.js base: '/shifted-chess/'
```

GitHub Actions → `.github/workflows/deploy.yml`
배포 URL → `https://{github-username}.github.io/shifted-chess/`
