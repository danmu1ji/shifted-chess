# 어긋난 보드 시각화 규칙 (PLAN.md §2.1 기반)

## 그리드 배치

```
absCol: 0   1   2   3   4   5   6   7   8
        ↑
        빈 셀 (하단 하프 좌측 오프셋)

rank 8: [a] [b] [c] [d] [e] [f] [g] [h]  ← grid-col 1~8
rank 7: [a] [b] [c] [d] [e] [f] [g] [h]
rank 6: [a] [b] [c] [d] [e] [f] [g] [h]
rank 5: [a] [b] [c] [d] [e] [f] [g] [h]
        ─────────────────────────────────  ← 경계선
rank 4:    [a] [b] [c] [d] [e] [f] [g] [h]  ← grid-col 2~9
rank 3:    [a] [b] [c] [d] [e] [f] [g] [h]
rank 2:    [a] [b] [c] [d] [e] [f] [g] [h]
rank 1:    [a] [b] [c] [d] [e] [f] [g] [h]
```

## 칸 색상 규칙
- absCol + rank이 짝수 → 라이트 칸
- absCol + rank이 홀수 → 다크 칸

## 경계선 시각화
- rank 4와 rank 5 사이에 구분선 또는 배경색 차이로 경계 표시 권장
