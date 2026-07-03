import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Star, ChevronRight, Loader2 } from 'lucide-react'
import { getSession, startInterview, submitAnswer } from '../services/api'

const BUBBLE_AGENT = { side: 'left', color: '#3B82F6' }
const BUBBLE_USER = { side: 'right', color: '#1F2937' }

function ChatBubble({ message, side }) {
  const isLeft = side === 'left'
  return (
    <motion.div
      className={`flex ${isLeft ? 'justify-start' : 'justify-end'} mb-4`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      <div className="max-w-[80%] rounded-2xl px-5 py-4"
        style={{
          background: isLeft ? '#111827' : '#1E3A5F',
          border: `1px solid ${isLeft ? '#1F2937' : '#2563EB40'}`,
          borderBottomLeftRadius: isLeft ? 4 : undefined,
          borderBottomRightRadius: !isLeft ? 4 : undefined,
        }}>
        {message}
      </div>
    </motion.div>
  )
}

function FeedbackBubble({ feedback, score, tips }) {
  const [num] = score.split('/')
  const scoreVal = parseInt(num, 10) || 0
  const scoreColor = scoreVal >= 4 ? '#10B981' : scoreVal >= 3 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: `${scoreColor}20`, color: scoreColor }}>
          Score: {score}
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>{feedback}</p>
      {tips.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#9CA3AF' }}>
              <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: '#3B82F6' }} />
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SummaryCard({ totalQuestions }) {
  const navigate = useNavigate()
  return (
    <motion.div className="mx-auto max-w-md text-center p-8 rounded-2xl"
      style={{ background: 'linear-gradient(135deg, #3B82F610, #06B6D410)', border: '1px solid #3B82F630' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}>
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne' }}>
        Interview Complete!
      </h2>
      <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
        You answered all {totalQuestions} questions. Review the feedback above to prepare for your real interview.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate('/results')}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: 'white' }}>
          Back to Results
        </button>
        <button onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: '#1F2937', color: '#9CA3AF' }}>
          Retry
        </button>
      </div>
    </motion.div>
  )
}

export default function InterviewCoach() {
  const navigate = useNavigate()
  const { cvText, jobDescription } = getSession()

  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [messages, setMessages] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const bottomRef = useRef(null)
  const hasStartedRef = useRef(false)

  const addMessage = (content, side) => {
    setMessages(prev => [...prev, { content, side, id: Date.now() + Math.random() }])
  }

  useEffect(() => {
    if (!cvText || !jobDescription) {
      setError('No session data found. Please go back and run an analysis first.')
      setLoading(false)
      return
    }

    // Guard against React StrictMode's dev-only double effect invocation,
    // which would otherwise start two sessions and duplicate the welcome/Q1 bubbles.
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    startInterview(cvText, jobDescription)
      .then(({ questions: qs, session_id }) => {
        setSessionId(session_id)
        setQuestions(qs)
        addMessage(
          <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
            <span className="font-semibold" style={{ color: '#3B82F6' }}>Interview Coach: </span>
            Welcome! I've prepared {qs.length} questions tailored to this role. Take your time with each answer.
          </p>,
          'left'
        )
        addMessage(
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Question 1 of {qs.length}</p>
            <p className="text-sm leading-relaxed font-medium" style={{ color: '#F9FAFB' }}>{qs[0]}</p>
          </div>,
          'left'
        )
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to start interview session. ' + (err.response?.data?.detail || err.message))
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return

    const question = questions[currentQ]
    const userAnswer = answer.trim()
    setAnswer('')

    addMessage(
      <p className="text-sm leading-relaxed" style={{ color: '#E5E7EB' }}>{userAnswer}</p>,
      'right'
    )

    setSubmitting(true)
    try {
      const result = await submitAnswer(sessionId, question, userAnswer, jobDescription)
      addMessage(
        <FeedbackBubble feedback={result.feedback} score={result.score} tips={result.tips} />,
        'left'
      )

      const nextIndex = currentQ + 1
      if (result.next_question) {
        setTimeout(() => {
          addMessage(
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
                Question {nextIndex + 1} of {questions.length}
              </p>
              <p className="text-sm leading-relaxed font-medium" style={{ color: '#F9FAFB' }}>
                {result.next_question}
              </p>
            </div>,
            'left'
          )
          setCurrentQ(nextIndex)
        }, 600)
      } else {
        setTimeout(() => setDone(true), 600)
      }
    } catch (err) {
      addMessage(
        <p className="text-sm" style={{ color: '#EF4444' }}>
          Error evaluating your answer. Please try again.
        </p>,
        'left'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0A0F1E' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: '1px solid #1F2937', background: '#0D1117' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
            <Star size={14} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 className="font-bold text-sm" style={{ fontFamily: 'Syne', color: '#F9FAFB' }}>
              Interview Coach
            </h1>
            {questions.length > 0 && !done && (
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Question {currentQ + 1} of {questions.length}
              </p>
            )}
          </div>
        </div>
        <button onClick={() => navigate('/results')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: '#9CA3AF', background: '#1F2937' }}>
          <X size={12} /> Exit Interview
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="max-w-2xl mx-auto">

          {loading && (
            <div className="flex justify-center items-center gap-3 py-20">
              <Loader2 size={20} className="animate-spin" style={{ color: '#3B82F6' }} />
              <span className="text-sm" style={{ color: '#6B7280' }}>Preparing your interview questions…</span>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-sm mb-4" style={{ color: '#EF4444' }}>{error}</p>
              <button onClick={() => navigate('/')}
                className="text-sm" style={{ color: '#3B82F6' }}>← Go back home</button>
            </div>
          )}

          <AnimatePresence>
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg.content} side={msg.side} />
            ))}
          </AnimatePresence>

          {done && <SummaryCard totalQuestions={questions.length} />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      {!loading && !error && !done && (
        <div className="px-4 py-4 md:px-8 shrink-0"
          style={{ borderTop: '1px solid #1F2937', background: '#0D1117' }}>
          <div className="max-w-2xl mx-auto flex gap-3">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Type your answer here… (Ctrl+Enter to submit)"
              className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              style={{
                background: '#111827',
                border: '1px solid #1F2937',
                color: '#F9FAFB',
                lineHeight: '1.6',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
              className="px-4 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: answer.trim() && !submitting
                  ? 'linear-gradient(135deg, #3B82F6, #06B6D4)'
                  : '#1F2937',
                color: answer.trim() && !submitting ? 'white' : '#4B5563',
                cursor: answer.trim() && !submitting ? 'pointer' : 'not-allowed',
                minWidth: 48,
              }}>
              {submitting
                ? <Loader2 size={18} className="animate-spin" />
                : <Send size={18} />}
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: '#374151' }}>
            Ctrl+Enter to submit • Your answers are not stored
          </p>
        </div>
      )}
    </div>
  )
}
