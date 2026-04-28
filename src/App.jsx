import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LobbyPage from './components/Lobby/LobbyPage.jsx'
import GameRoom from './components/Game/GameRoom.jsx'

export default function App() {
  return (
    <BrowserRouter basename="/shifted-chess">
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/room/:roomId" element={<GameRoom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
