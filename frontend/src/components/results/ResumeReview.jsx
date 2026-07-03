import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Star } from 'lucide-react'

export default function ResumeReview({ data }) {
  if (!data) return null

  const { strengths = [], improvements = [], overall_rating = '' } = data

  const [ratingNum] = overall_rating.split('/')
  const ratingValue = parseInt(ratingNum, 10) || 0
  const ratingPercent = (ratingValue / 10) * 100

  const ratingColor = ratingValue >= 7 ? '#10B981' : ratingValue >= 5 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col gap-6">

      {/* Rating bar */}
      <div className="p-6 rounded-2xl flex flex-col gap-4"
        style={{ background: '#111827', border: '1px solid #1F2937' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={18} style={{ color: ratingColor }} />
            <span className="font-semibold text-sm uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
              Overall CV Rating
            </span>
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: ratingColor }}>
            {overall_rating}
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: '#1F2937' }}>
          <motion.div
            className="h-2 rounded-full"
            style={{ background: ratingColor }}
            initial={{ width: 0 }}
            animate={{ width: `${ratingPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Strengths */}
        <div className="p-6 rounded-2xl flex flex-col gap-4"
          style={{ background: '#111827', border: '1px solid #10B98130' }}>
          <h3 className="font-bold text-base" style={{ fontFamily: 'Syne', color: '#10B981' }}>
            Strengths
          </h3>
          <ul className="flex flex-col gap-3">
            {strengths.map((s, i) => (
              <motion.li key={i} className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}>
                <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                <span className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>{s}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="p-6 rounded-2xl flex flex-col gap-4"
          style={{ background: '#111827', border: '1px solid #F59E0B30' }}>
          <h3 className="font-bold text-base" style={{ fontFamily: 'Syne', color: '#F59E0B' }}>
            Areas to Improve
          </h3>
          <ul className="flex flex-col gap-3">
            {improvements.map((s, i) => (
              <motion.li key={i} className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}>
                <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: '#F59E0B' }} />
                <span className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>{s}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
