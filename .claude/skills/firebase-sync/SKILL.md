# firebase-sync 스킬

## 트리거 조건
`src/firebase/`, `src/hooks/useFirebase*.js` 작성 시 이 스킬을 로드한다.

## RTDB 패턴

### 읽기 (실시간 구독)
```js
import { getDatabase, ref, onValue, off } from 'firebase/database'
// onValue로 구독, 컴포넌트 언마운트 시 off() 호출
```

### 쓰기 (트랜잭션)
```js
import { runTransaction, update } from 'firebase/database'
// 무브 실행은 runTransaction으로 동시성 보호
```

## 파일 역할
- `config.js`      — initializeApp (VITE_* env vars)
- `roomService.js` — createRoom(), joinRoom(), listenRoom()
- `moveService.js` — submitMove(), syncTimer(), voteTimer()

## 보안 규칙 (프로토타입)
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## 타이머 동기화
- 무브 실행 시점에 `lastTickAt` 갱신
- 재연결 시 Firebase 현재값 기준으로 재동기화
- 시간 초과: 로컬 틱 0 이하 → submitMove로 winner 기록

스키마 전체 → `references/data-schema.md`
