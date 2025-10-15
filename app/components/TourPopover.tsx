import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TourPopoverProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export const TourPopover: React.FC<TourPopoverProps> = ({
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onClose,
  position,
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    setAdjustedPosition(position);
  }, [position]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed z-[9999] w-[90vw] sm:w-[400px] max-w-[400px]"
        style={{
          top: `${adjustedPosition.top}px`,
          left: `${adjustedPosition.left}px`,
        }}
        dir="rtl"
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,119,182,0.35)] border-2 border-blue-400/30 p-4 sm:p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 sm:top-5 sm:left-5 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-bold text-base sm:text-lg border-0 cursor-pointer transition-all duration-300 bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-110 hover:rotate-90 shadow-lg hover:shadow-xl active:scale-90"
          >
            ×
          </button>

          {/* Title */}
          <div className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#00b4d8] bg-clip-text text-transparent mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 leading-tight">
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl sm:text-3xl"
            >
              🎯
            </motion.span>
            {title}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-sm leading-relaxed sm:leading-loose text-gray-700 mb-4 sm:mb-6 font-medium">
            {description}
          </p>

          {/* Footer */}
          <div className="flex justify-between items-center gap-2 sm:gap-3 mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-blue-100">
            <button
              onClick={onNext}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base border-0 cursor-pointer shadow-lg transition-all duration-300 bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#00b4d8] text-white hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1 hover:scale-105 active:scale-95"
            >
              {currentStep === totalSteps ? "✓ پایان" : "بعدی"}
            </button>
            {currentStep > 1 && (
              <button
                onClick={onPrevious}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base border-0 cursor-pointer shadow-md transition-all duration-300 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:-translate-y-1 hover:shadow-lg active:scale-95"
              >
                ← قبلی
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
