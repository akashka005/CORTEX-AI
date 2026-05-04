import React from 'react';
import { motion } from 'motion/react';

interface NeuralPulseProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const NeuralPulse: React.FC<NeuralPulseProps> = ({ size = 'md', color = 'indigo' }) => {
  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }[size];

  const colorMap: Record<string, string> = {
    indigo: '#6366f1',
    purple: '#a855f7',
    pink: '#ec4899',
    emerald: '#10b981',
    amber: '#f59e0b'
  };

  const activeColor = colorMap[color] || colorMap.indigo;

  return (
    <div className={`relative flex items-center justify-center ${dimensions}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-20"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z"
            fill="none"
            stroke={activeColor}
            strokeWidth="2"
            strokeDasharray="10 5"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[20%]"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: `drop-shadow(0 0 8px ${activeColor})` }}>
          <path
            d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z"
            fill={activeColor}
            opacity="0.6"
          />
        </svg>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
              x: [0, (i - 1) * 10, 0],
              y: [0, (i - 1) * -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
          />
        ))}
      </div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-10%] border border-dashed border-white/30 rounded-full"
      />
    </div>
  );
};

export default NeuralPulse;