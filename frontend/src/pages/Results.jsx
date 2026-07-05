import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mic } from 'lucide-react'
import MatchScore from '../components/results/MatchScore'
import SkillsGrid from '../components/results/SkillsGrid'
import GapAnalysis from '../components/results/GapAnalysis'
import RoadmapTimeline from '../components/results/RoadmapTimeline'
import ResumeReview from '../components/results/ResumeReview'
import CareerAdvice from '../components/results/CareerAdvice'

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'resume-review',   label: 'Resume Review' },
  { id: 'skill-gaps',      label: 'Skill Gaps' },
  { id: 'learning-path',   label: 'Learning Path' },
  { id: 'interview-coach', label: 'Interview Coach' },
]

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result
  const crewData = state?.crewData

  const [activeTab, setActiveTab] = useState('overview')

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: '#9CA3AF' }}>No results found.</p>
        <button onClick={() => navigate('/')} style={{ color: '#3B82F6' }}>← Go back</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0F1E' }}>

      {/* Page header */}
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-4">
        <motion.div className="flex items-center justify-between mb-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm transition-colors hover:text-white"
            style={{ color: '#9CA3AF' }}>
            <ArrowLeft size={16} /> New Analysis
          </button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne' }}>Your Career Analysis</h1>
          <div />
        </motion.div>

        {/* Summary banner */}
        <motion.div className="p-5 rounded-2xl mb-0 text-center"
          style={{ background: 'linear-gradient(135deg, #3B82F620, #06B6D420)', border: '1px solid #3B82F640' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p style={{ color: '#D1D5DB' }}>{result.summary}</p>
        </motion.div>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 px-4 py-3"
        style={{ background: '#0A0F1EE6', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1F2937' }}>
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg"
                style={{ color: isActive ? '#F9FAFB' : '#6B7280' }}>
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #3B82F6, #06B6D4)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <AnimatePresence mode="wait">

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                  <MatchScore score={result.match_score} />
                </div>
                <div className="lg:col-span-2">
                  <SkillsGrid matched={result.matched_skills} missing={result.missing_skills} />
                </div>
              </div>
              <div className="mt-8 text-center">
                <button onClick={() => navigate('/')}
                  className="px-8 py-3 rounded-xl font-semibold"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: 'white' }}>
                  Analyze Another Job
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Resume Review ── */}
          {activeTab === 'resume-review' && (
            <motion.div key="resume-review"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {!crewData && (
                <div className="text-center py-16">
                  <p className="text-sm" style={{ color: '#EF4444' }}>
                    Deep analysis data not available. Please run a new analysis.
                  </p>
                </div>
              )}
              {crewData && (
                <div className="flex flex-col gap-10">
                  <div>
                    <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Syne' }}>Resume Review</h2>
                    <ResumeReview data={crewData.resume_review} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Syne' }}>Career Strategy</h2>
                    <CareerAdvice data={crewData.career_advice} />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Skill Gaps ── */}
          {activeTab === 'skill-gaps' && (
            <motion.div key="skill-gaps"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GapAnalysis gaps={result.skill_gaps} />
            </motion.div>
          )}

          {/* ── Learning Path ── */}
          {activeTab === 'learning-path' && (
            <motion.div key="learning-path"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <RoadmapTimeline roadmap={result.roadmap} />
            </motion.div>
          )}

          {/* ── Interview Coach ── */}
          {activeTab === 'interview-coach' && (
            <motion.div key="interview-coach"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-12 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3B82F620, #06B6D420)', border: '1px solid #3B82F640' }}>
                <Mic size={32} style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne' }}>
                  Practice Your Interview
                </h2>
                <p className="text-sm max-w-md" style={{ color: '#9CA3AF' }}>
                  Get 5 tailored interview questions based on this job description and your CV.
                  The AI coach evaluates each answer and gives instant feedback.
                </p>
              </div>
              <button onClick={() => navigate('/interview')}
                className="px-8 py-3 rounded-xl font-semibold text-base"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: 'white' }}>
                Start Mock Interview →
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Floating Practice Interview button */}
      <motion.button
        onClick={() => navigate('/interview')}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm shadow-lg z-50"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: 'white' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}>
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }} />
        <Mic size={16} />
        Practice Interview
      </motion.button>
    </div>
  )
}
