# board-renderer 스킬

## 트리거 조건
`src/components/Board/` 작성 시 이 스킬을 로드한다.

## 9칸 CSS Grid 레이아웃

```css
.board-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(8, 1fr);
}
```

- 상단 하프(rank 5–8): col 1–8 (grid-column 1~8)
- 하단 하프(rank 1–4): col 2–9 (grid-column 2~9), col 1은 빈 셀

## 흑 플레이어 시점
```css
.board-container.black-view {
  transform: rotate(180deg);
}
.piece.black-view {
  transform: rotate(180deg);
}
```

## 기물 SVG
- Lichess 오픈소스 기물 SVG 사용
- `public/pieces/{color}{piece}.svg` 형식 (예: wK.svg, bQ.svg)
- ChessPiece 컴포넌트에서 `<img src>` 또는 인라인 SVG로 렌더링

## 컴포넌트 계층
- ShiftedBoard  — 9×8 그리드 루트, 전체 보드 상태 수신
- BoardSquare   — 개별 칸, 색상(라이트/다크), 좌표 레이블, 클릭 핸들러
- ChessPiece    — SVG 기물, 드래그 미지원(클릭만)
- MoveIndicator — legal move 점(빈 칸) / 링(상대 기물) 표시
- PromotionModal— 프로모션 선택 모달 (Q/R/B/N)
- CheckIndicator— 체크 시 킹 칸 강조

시각 레이아웃 규칙 → `references/visual-layout.md`
