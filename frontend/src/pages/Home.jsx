import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import CVUploader from '../components/upload/CVUploader'
import JDInput from '../components/upload/JDInput'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { uploadCV, analyzeCareer, saveSession } from '../services/api'

// /crew-analyze returns { resume_review, skill_gaps, job_match, career_advice,
// learning_path, interview_prep } — reshape it into the flat result shape
// (match_score, matched_skills, missing_skills, skill_gaps, roadmap, summary)
// that the Results page's Overview/Skill Gaps/Learning Path tabs expect.
function mapCrewResult(raw) {
  const skillGaps = raw.skill_gaps || {}
  const jobMatch = raw.job_match || {}
  const learningPath = raw.learning_path || {}

  return {
    match_score: skillGaps.match_score ?? jobMatch.match_score ?? 0,
    matched_skills: skillGaps.matched_skills || [],
    missing_skills: skillGaps.missing_skills || [],
    skill_gaps: (skillGaps.skill_gaps || []).map(gap => ({
      skill: gap.skill,
      importance: gap.importance,
      resources: gap.resources || [],
    })),
    roadmap: (learningPath.roadmap || []).map(step =>
      typeof step === 'string' ? step : `${step.week}: ${step.focus} — ${step.action}`
    ),
    summary: jobMatch.summary || '',
  }
}

export default function Home() {
  const navigate = useNavigate()
  const [cvText, setCvText] = useState('')
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  const handleCVUpload = async (file) => {
    try {
      setError('')
      const text = await uploadCV(file)
      setCvText(text)
    } catch (err) {
      setError('Failed to extract text from your CV. Please try a different file format.')
    }
  }

  const handleAnalyze = async () => {
    if (!cvText) { setError('Please upload your CV first.'); return }
    if (jdText.trim().split(/\s+/).length < 20) { setError('Please add a more detailed job description.'); return }
    
    setError('')
    setLoading(true)
    setStep(0)

    // Simulate step progression smooth UI shifts matching backend console logs
    const interval = setInterval(() => {
      setStep(s => Math.min(s + 1, 4))
    }, 3500)

    try {
      const raw = await analyzeCareer(cvText, jdText)
      const result = mapCrewResult(raw)
      clearInterval(interval)
      setLoading(false)
      saveSession(cvText, jdText)
      navigate('/results', { state: { result, crewData: raw } })
    } catch (err) {
      clearInterval(interval)
      setLoading(false)
      setStep(0)
      
      const serverDetail = err.response?.data?.detail
      if (serverDetail) {
        setError(`Analysis Error: ${typeof serverDetail === 'string' ? serverDetail : JSON.stringify(serverDetail)}`)
      } else {
        setError('Analysis failed. Check your browser DevTools Console (F12) for network/CORS blocks.')
      }
    }
  }

  if (loading) return <LoadingSpinner currentStep={step} />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
      
      {/* Hero */}
      <motion.div className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6"
          style={{ background: '#3B82F620', border: '1px solid #3B82F640', color: '#3B82F6' }}>
          <Sparkles size={12} />
          Powered by Gemini AI + RAG
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
          style={{ fontFamily: 'Syne', background: 'linear-gradient(135deg, #F9FAFB, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Know Your Gap.<br />Close It Fast.
        </h1>

        <p className="text-lg max-w-lg mx-auto" style={{ color: '#9CA3AF' }}>
          Upload your CV, paste a job description, and get a personalized skill gap analysis with a learning roadmap in under 30 seconds.
        </p>
      </motion.div>

      {/* Input card */}
      <motion.div className="w-full max-w-2xl rounded-3xl p-8 flex flex-col gap-6"
        style={{ background: '#111827', border: '1px solid #1F2937' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        
        <CVUploader onUpload={handleCVUpload} />
        <JDInput value={jdText} onChange={setJdText} />

        {error && (
          <p className="text-sm text-center font-medium bg-red-950/40 border border-red-900/50 p-3 rounded-xl" style={{ color: '#EF4444' }}>{error}</p>
        )}

        <motion.button
          onClick={handleAnalyze}
          disabled={!cvText || !jdText}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base transition-all"
          style={{
            background: cvText && jdText ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : '#1F2937',
            color: cvText && jdText ? 'white' : '#4B5563',
            cursor: cvText && jdText ? 'pointer' : 'not-allowed'
          }}
          whileHover={cvText && jdText ? { scale: 1.02 } : {}}
          whileTap={cvText && jdText ? { scale: 0.98 } : {}}
        >
          <Sparkles size={18} />
          Analyze My Career Fit
          <ArrowRight size={18} />
        </motion.button>

        <p className="text-center text-xs" style={{ color: '#4B5563' }}>
          Your data is processed locally and never stored.
        </p>
      </motion.div>
    </div>
  )
}