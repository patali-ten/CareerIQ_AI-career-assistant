import { motion } from "framer-motion";

const NUM_BARS = 20;

export default function VoiceWaveform({ isRecording }) {
  return (
    <div className="flex items-center justify-center gap-0.75 h-10">
      {Array.from({ length: NUM_BARS }).map((_, i) => (
        <motion.div
          key={i}
          className="w-0.75 rounded-full bg-blue-400"
          animate={
            isRecording
              ? {
                  scaleY: [0.2, 1, 0.4, 0.8, 0.2],
                  opacity: [0.5, 1, 0.7, 1, 0.5],
                }
              : { scaleY: 0.15, opacity: 0.3 }
          }
          transition={
            isRecording
              ? {
                  duration: 0.8 + (i % 5) * 0.1,
                  repeat: Infinity,
                  delay: i * 0.04,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          style={{ height: 32, originY: 0.5 }}
        />
      ))}
    </div>
  );
}