# Firebase 데이터 스키마 (PLAN.md §4 발췌)

```
/rooms/{roomId}/
├── meta/
│   ├── roomId: string          # 6자리 초대 코드
│   └── createdAt: number       # timestamp
│
├── players/
│   ├── white: { uid, name, connected: bool }
│   └── black: { uid, name, connected: bool }
│
├── timer/
│   ├── mode: "bullet"|"blitz"|"classical"|null
│   ├── votes: { white: string|null, black: string|null }
│   ├── whiteTimeMs: number
│   ├── blackTimeMs: number
│   └── lastTickAt: number|null
│
└── gameState/
    ├── status: "waiting"|"voting"|"playing"|"ended"
    ├── currentTurn: "white"|"black"
    ├── winner: "white"|"black"|"draw"|null
    ├── checkState: "none"|"white"|"black"
    ├── board: Array(64)         # null | { piece, color }
    ├── enPassantTarget: { file, rank }|null
    ├── castlingRights: { wK, wQ, bK, bQ }
    └── moveHistory: [{ from, to, piece, special, san }]
```

## 타이머 모드
| 모드 | 초기 시간 |
|------|-----------|
| bullet | 60,000ms |
| blitz | 300,000ms |
| classical | 600,000ms |
