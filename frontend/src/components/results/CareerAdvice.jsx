import { motion } from 'framer-motion'
import { Lightbulb, Quote } from 'lucide-react'

export default function CareerAdvice({ data }) {
  if (!data) return null

  const { positioning_statement = '', advice = [] } = data

  return (
    <div className="flex flex-col gap-6">

      {/* Positioning statement */}
      {positioning_statement && (
        <motion.div
          className="p-6 rounded-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #3B82F610, #06B6D410)', border: '1px solid #3B82F630' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}>
          <Quote size={32} className="absolute top-4 right-4 opacity-10" style={{ color: '#3B82F6' }} />
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>
            Your Positioning Statement
          </p>
          <p className="text-base font-medium leading-relaxed italic" style={{ color: '#E5E7EB' }}>
            "{positioning_statement}"
          </p>
        </motion.div>
      )}

      {/* Advice bullets */}
      {advice.length > 0 && (
        <div className="p-6 rounded-2xl flex flex-col gap-4"
          style={{ background: '#111827', border: '1px solid #1F2937' }}>
          <h3 className="font-bold text-base" style={{ fontFamily: 'Syne', color: '#F9FAFB' }}>
            Strategic Advice
          </h3>
          <ul className="flex flex-col gap-4">
            {advice.map((tip, i) => (
              <motion.li key={i} className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}>
                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: '#3B82F620' }}>
                  <Lightbulb size={14} style={{ color: '#3B82F6' }} />
                </div>
                <span className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
