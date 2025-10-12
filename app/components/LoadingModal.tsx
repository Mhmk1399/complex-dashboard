"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface LoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function LoadingModal({ isOpen, onComplete }: LoadingModalProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const phases = [
    { title: "اتصال به سرور", subtitle: "برقراری ارتباط امن..." },
    { title: "انتقال فایل‌ها", subtitle: "کپی کردن قالب فروشگاه..." },
    { title: "پردازش داده‌ها", subtitle: "تنظیم پایگاه داده..." },
    { title: "تکمیل فرآیند", subtitle: "فروشگاه شما آماده است!" }
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentPhase(0);
      return;
    }

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          // Auto-navigate after completion
          setTimeout(() => {
            onComplete();
            router.push("/");
          }, 1500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    const phaseTimer = setInterval(() => {
      setCurrentPhase(prev => {
        if (prev < phases.length - 1) {
          return prev + 1;
        }
        clearInterval(phaseTimer);
        return prev;
      });
    }, 2000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(phaseTimer);
    };
  }, [isOpen, phases.length, onComplete, router]);



  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed min-h-[80vh] inset-0 bg-slate-300/20 backdrop-blur-md flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4 border border-white/20"
            dir="rtl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ساخت فروشگاه</h2>
              <p className="text-gray-600">در حال آماده‌سازی فروشگاه آنلاین شما</p>
            </div>

            {/* File Transfer Animation */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                {/* Server */}
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4zm0-10h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" opacity="0.3"/>
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 6h16v2H4V6zm0 4h16v2H4v-2zm0 4h16v2H4v-2z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">سرور</span>
                </motion.div>

                {/* Transfer Animation */}
                <div className="flex-1 mx-4 relative">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  {/* Moving File Icon */}
                  <motion.div
                    className="absolute -top-3 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg"
                    initial={{ right: "0%" }}
                    animate={{ right: `${ progress}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ transform: "translateX(50%)" }}
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                </div>

                {/* Database */}
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4z" opacity="0.3"/>
                      <path d="M4 9v3c0 2.21 3.58 4 8 4s8-1.79 8-4V9c0 2.21-3.58 4-8 4s-8-1.79-8-4z" opacity="0.6"/>
                      <path d="M4 14v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">پایگاه داده</span>
                </motion.div>
              </div>
            </div>

            {/* Progress Info */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{phases[currentPhase]?.title}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{phases[currentPhase]?.subtitle}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Completion */}
            {progress === 100 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">فروشگاه شما آماده است!</h3>
                <p className="text-gray-600 mb-4">در حال انتقال به پنل مدیریت...</p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}