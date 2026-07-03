import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import Home from './pages/Home'
import Results from './pages/Results'
import InterviewCoach from './pages/InterviewCoach'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/results" element={<><Navbar /><Results /></>} />
        <Route path="/interview" element={<InterviewCoach />} />
      </Routes>
    </BrowserRouter>
  )
}