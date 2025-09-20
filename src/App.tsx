import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import DecisionHistoryPage from './pages/DecisionHistoryPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/history" element={<DecisionHistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
