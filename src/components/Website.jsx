// src/components/NetflixTextIntro.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function NetflixTextIntro({
  text = "ANDHITO & DINI",
  onComplete,
}) {
  useEffect(() => {
    // Optional: play Netflix “ta-da” sound
    const audio = new Audio("/netflix-sound.mp3");
    audio.play().catch(() => {});
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black flex items-center justify-center z-50"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, delay: 2 }}
        onAnimationComplete={onComplete}
      >
        <motion.h1
          className="font-netflix text-6xl md:text-8xl text-netflix-red"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{
            scale: [0.6, 1.2, 1],    // keyframes: mulai kecil → overshoot → settle
            opacity: [0, 1, 1],      // fade-in seiring overshoot
          }}
          transition={{
            duration: 1.8,
            times: [0, 0.7, 1],      // 70% waktu untuk overshoot, sisanya untuk settle
            ease: ["easeIn", "easeOut", "easeOut"],
          }}
        >
          {text}
        </motion.h1>
      </motion.div>
    </AnimatePresence>
  );
}
