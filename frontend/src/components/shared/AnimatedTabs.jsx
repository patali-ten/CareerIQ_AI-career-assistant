import { motion } from "framer-motion";

export default function AnimatedTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="relative flex gap-1 bg-white/5 rounded-xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 px-5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            activeTab === tab.id
              ? "text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-lg bg-linear-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30"
              style={{ zIndex: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}