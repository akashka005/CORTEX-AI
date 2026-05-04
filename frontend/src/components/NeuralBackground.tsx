import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NeuralBackgroundProps {
  mood: string;
}

const NeuralBackground: React.FC<NeuralBackgroundProps> = ({ mood }) => {
  const getMoodColors = (currentMood: string) => {
    switch (currentMood) {
      case 'happy':
        return {
          primary: 'rgba(255, 215, 0, 0.25)',
          secondary: 'rgba(255, 165, 0, 0.2)',
          accent: 'rgba(255, 255, 255, 0.4)'
        };
      case 'sad':
        return {
          primary: 'rgba(30, 144, 255, 0.2)',
          secondary: 'rgba(0, 191, 255, 0.15)',
          accent: 'rgba(176, 224, 230, 0.3)'
        };
      case 'angry':
        return {
          primary: 'rgba(255, 69, 0, 0.2)',
          secondary: 'rgba(220, 20, 60, 0.15)',
          accent: 'rgba(255, 127, 80, 0.3)'
        };
      case 'anxious':
        return {
          primary: 'rgba(147, 112, 219, 0.25)',
          secondary: 'rgba(186, 85, 211, 0.2)',
          accent: 'rgba(230, 230, 250, 0.4)'
        };
      default:
        return {
          primary: 'rgba(99, 102, 241, 0.15)',
          secondary: 'rgba(168, 85, 247, 0.12)',
          accent: 'rgba(255, 255, 255, 0.3)'
        };
    }
  };

  const colors = getMoodColors(mood);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#f8fafc]">
      <div
        className="absolute inset-0 transition-colors duration-1000 animate-mesh"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${colors.primary} 0%, transparent 40%),
                       radial-gradient(circle at 80% 70%, ${colors.secondary} 0%, transparent 40%),
                       radial-gradient(circle at 50% 50%, ${colors.accent} 0%, transparent 60%)`
        }}
      />

      <AnimatePresence>
        <motion.div
          key={`${mood}-blob-1`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-float"
          style={{ background: colors.primary }}
        />
        <motion.div
          key={`${mood}-blob-2`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.5 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-float"
          style={{ background: colors.secondary, animationDelay: '-2s' }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};

export default NeuralBackground;