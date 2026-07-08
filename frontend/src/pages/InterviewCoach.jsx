import { useSpeechToText, useTextToSpeech } from '../hooks/useVoice'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
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

// FeedbackBubble now receives speak/stop/speaking from parent
function FeedbackBubble({ feedback, score, tips, onSpeak, onStop, speaking }) {
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

      {/* Voice controls */}
      <div className="flex items-center gap-2 mt-1 pt-3" style={{ borderTop: '1px solid #1F2937' }}>
        {speaking ? (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: '#EF444420', color: '#EF4444', border: '1px solid #EF444440' }}>
            <VolumeX size={12} /> Stop voice
          </button>
        ) : (
          <button
            onClick={onSpeak}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: '#3B82F620', color: '#3B82F6', border: '1px solid #3B82F640' }}>
            <Volume2 size={12} /> Play again
          </button>
        )}
        <span className="text-xs" style={{ color: '#4B5563' }}>
          {speaking ? 'Reading feedback aloud...' : 'Voice finished'}
        </span>
      </div>
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
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', color: 'white' }}>
          Start New Analysis
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

  // Voice hooks
  const { listening, startListening, stopListening } = useSpeechToText(
    (transcript) => setAnswer(transcript)
  )
  const { speaking, speak, stop } = useTextToSpeech()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // Track which feedback message is currently being spoken
  // so only that bubble shows "Stop voice" / "Play again" correctly
  const [speakingMsgId, setSpeakingMsgId] = useState(null)

  const bottomRef = useRef(null)
  const hasStartedRef = useRef(false)

  const addMessage = (content, side) => {
    const id = Date.now() + Math.random()
    setMessages(prev => [...prev, { content, side, id }])
    return id
  }

  useEffect(() => {
    if (!cvText || !jobDescription) {
      setError('No session data found. Please go back and run an analysis first.')
      setLoading(false)
      return
    }

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
            You can <span style={{ color: '#3B82F6' }}>speak your answer</span> using the mic button, or type it.
          </p>,
          'left'
        )
        addMessage(
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>
              Question 1 of {qs.length}
            </p>
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

  const handleSpeak = (text, msgId) => {
    setSpeakingMsgId(msgId)
    speak(text)
  }

  const handleStop = () => {
    stop()
    setSpeakingMsgId(null)
  }

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return

    // Stop mic if still listening when user submits
    if (listening) stopListening()

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

      // Add feedback bubble — store the msgId so voice controls work per-bubble
      const feedbackMsgId = Date.now() + Math.random()
      const feedbackText = result.feedback

      setMessages(prev => [...prev, {
        id: feedbackMsgId,
        side: 'left',
        content: null, // will be rendered separately below
        isFeedback: true,
        feedbackData: { feedback: feedbackText, score: result.score, tips: result.tips },
      }])

      // Auto-play feedback voice
      setSpeakingMsgId(feedbackMsgId)
      speak(feedbackText)

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
        <button onClick={() => { stop(); navigate('/') }}
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
              <button onClick={() => navigate('/')} className="text-sm" style={{ color: '#3B82F6' }}>
                ← Go back home
              </button>
            </div>
          )}

          <AnimatePresence>
            {messages.map(msg => {
              // Feedback messages render with voice controls
              if (msg.isFeedback) {
                const isThisSpeaking = speakingMsgId === msg.id && speaking
                return (
                  <motion.div key={msg.id} className="flex justify-start mb-4"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}>
                    <div className="max-w-[80%] rounded-2xl px-5 py-4"
                      style={{ background: '#111827', border: '1px solid #1F2937', borderBottomLeftRadius: 4 }}>
                      <FeedbackBubble
                        feedback={msg.feedbackData.feedback}
                        score={msg.feedbackData.score}
                        tips={msg.feedbackData.tips}
                        speaking={isThisSpeaking}
                        onSpeak={() => handleSpeak(msg.feedbackData.feedback, msg.id)}
                        onStop={handleStop}
                      />
                    </div>
                  </motion.div>
                )
              }
              // Regular messages
              return <ChatBubble key={msg.id} message={msg.content} side={msg.side} />
            })}
          </AnimatePresence>

          {done && <SummaryCard totalQuestions={questions.length} />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      {!loading && !error && !done && (
        <div className="px-4 py-4 md:px-8 shrink-0"
          style={{ borderTop: '1px solid #1F2937', background: '#0D1117' }}>
          <div className="max-w-2xl mx-auto flex flex-col gap-2">

            {/* Textarea with mic button inside */}
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  placeholder={listening
                    ? '🎤 Listening… speak your answer'
                    : 'Type your answer or click the mic to speak… (Ctrl+Enter to submit)'}
                  className="w-full resize-none rounded-xl px-4 py-3 pr-12 text-sm outline-none"
                  style={{
                    background: '#111827',
                    border: `2px solid ${listening ? '#EF4444' : '#1F2937'}`,
                    color: '#F9FAFB',
                    lineHeight: '1.6',
                    transition: 'border-color 0.2s',
                  }}
                />

                {/* Mic button inside textarea */}
                <button
                  onClick={listening ? stopListening : startListening}
                  className="absolute bottom-3 right-3 p-2 rounded-lg transition-all"
                  style={{
                    background: listening ? '#EF444420' : '#1F2937',
                    border: `1px solid ${listening ? '#EF4444' : '#374151'}`,
                  }}
                  title={listening ? 'Stop recording' : 'Speak your answer'}>
                  {listening
                    ? <MicOff size={15} style={{ color: '#EF4444' }} />
                    : <Mic size={15} style={{ color: '#3B82F6' }} />}
                </button>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || submitting}
                className="px-4 rounded-xl flex items-center justify-center transition-all self-stretch"
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

            {/* Recording indicator */}
            {listening && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs" style={{ color: '#EF4444' }}>
                  Recording… click mic again to stop
                </span>
              </motion.div>
            )}

            <p className="text-center text-xs" style={{ color: '#374151' }}>
              Ctrl+Enter to submit • Your answers are not stored
            </p>
          </div>
        </div>
      )}
    </div>
  )
}