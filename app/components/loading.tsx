// const WebsiteGeneratorLoading = () => {
//   const [currentStep, setCurrentStep] = useState(0);

//   const steps = [
//     { id: 1, label: 'تجزیه و تحلیل نیازمندی‌ها', icon: '📊', color: '#3B82F6' },
//     { id: 2, label: 'طراحی رابط کاربری', icon: '🎨', color: '#8B5CF6' },
//     { id: 3, label: 'ساخت ساختار', icon: '🏗️', color: '#EC4899' },
//     { id: 4, label: 'بهینه‌سازی', icon: '⚡', color: '#10B981' },
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentStep((prev) => (prev + 1) % steps.length);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//       <div className="text-center px-4">
        
//         {/* Main Animation Container */}
//         <motion.div
//           className="relative w-80 h-80 mx-auto mb-8"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           {/* Browser Window SVG */}
//           <svg
//             viewBox="0 0 300 300"
//             className="w-full h-full"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             {/* Browser Window */}
//             <motion.g
//               initial={{ y: 20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ duration: 0.6 }}
//             >
//               {/* Window Frame */}
//               <rect
//                 x="20"
//                 y="40"
//                 width="260"
//                 height="220"
//                 rx="8"
//                 fill="white"
//                 stroke="#E5E7EB"
//                 strokeWidth="2"
//               />
              
//               {/* Browser Header */}
//               <rect x="20" y="40" width="260" height="30" rx="8" fill="#F3F4F6" />
//               <circle cx="38" cy="55" r="4" fill="#EF4444" />
//               <circle cx="52" cy="55" r="4" fill="#F59E0B" />
//               <circle cx="66" cy="55" r="4" fill="#10B981" />
              
//               {/* URL Bar */}
//               <rect x="85" y="48" width="180" height="14" rx="7" fill="white" stroke="#E5E7EB" strokeWidth="1" />
//             </motion.g>

//             {/* Building Blocks Animation */}
//             <motion.g>
//               {[0, 1, 2].map((row) =>
//                 [0, 1, 2].map((col) => (
//                   <motion.rect
//                     key={`${row}-${col}`}
//                     x={50 + col * 70}
//                     y={100 + row * 50}
//                     width={50}
//                     height={30}
//                     rx="4"
//                     fill={steps[currentStep]?.color || '#3B82F6'}
//                     initial={{ scale: 0, opacity: 0 }}
//                     animate={{
//                       scale: [0, 1.1, 1],
//                       opacity: [0, 1, 0.8],
//                     }}
//                     transition={{
//                       duration: 0.8,
//                       delay: (row * 3 + col) * 0.1,
//                       repeat: Infinity,
//                       repeatDelay: 1.5,
//                     }}
//                   />
//                 ))
//               )}
//             </motion.g>

//             {/* Code Lines Animation */}
//             <motion.g>
//               {[0, 1, 2, 3].map((i) => (
//                 <motion.line
//                   key={i}
//                   x1="40"
//                   y1={95 + i * 20}
//                   x2="140"
//                   y2={95 + i * 20}
//                   stroke={steps[currentStep]?.color || '#3B82F6'}
//                   strokeWidth="3"
//                   strokeLinecap="round"
//                   initial={{ pathLength: 0, opacity: 0 }}
//                   animate={{ pathLength: 1, opacity: 0.6 }}
//                   transition={{
//                     duration: 0.8,
//                     delay: i * 0.15,
//                     repeat: Infinity,
//                     repeatDelay: 1.2,
//                   }}
//                 />
//               ))}
//             </motion.g>

//             {/* Orbiting Particles */}
//             {[0, 1, 2, 3, 4, 5].map((i) => (
//               <motion.circle
//                 key={i}
//                 cx="150"
//                 cy="150"
//                 r="4"
//                 fill={steps[currentStep]?.color || '#3B82F6'}
//                 initial={{ opacity: 0 }}
//                 animate={{
//                   opacity: [0, 1, 0],
//                   scale: [0, 1.5, 0],
//                   x: [0, Math.cos((i * Math.PI) / 3) * 100],
//                   y: [0, Math.sin((i * Math.PI) / 3) * 100],
//                 }}
//                 transition={{
//                   duration: 2,
//                   delay: i * 0.2,
//                   repeat: Infinity,
//                   ease: "easeOut",
//                 }}
//               />
//             ))}
//           </svg>

//           {/* Center Icon */}
//           <motion.div
//             className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl"
//             animate={{
//               scale: [1, 1.2, 1],
//               rotate: [0, 360],
//             }}
//             transition={{
//               duration: 2,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           >
//             {steps[currentStep]?.icon}
//           </motion.div>
//         </motion.div>

//         {/* Progress Steps */}
//         <div className="max-w-2xl mx-auto mb-8">
//           <div className="flex justify-between items-center mb-4">
//             {steps.map((step, index) => (
//               <motion.div
//                 key={step.id}
//                 className="flex flex-col items-center flex-1"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <motion.div
//                   className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
//                     index === currentStep
//                       ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
//                       : 'bg-gray-200 text-gray-400'
//                   }`}
//                   animate={{
//                     scale: index === currentStep ? [1, 1.1, 1] : 1,
//                   }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   <span className="text-xl">{step.icon}</span>
//                 </motion.div>
//                 <motion.p
//                   className={`text-xs font-medium text-center ${
//                     index === currentStep ? 'text-gray-800' : 'text-gray-400'
//                   }`}
//                   animate={{
//                     scale: index === currentStep ? 1.05 : 1,
//                   }}
//                 >
//                   {step.label}
//                 </motion.p>
//               </motion.div>
//             ))}
//           </div>

//           {/* Progress Bar */}
//           <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//             <motion.div
//               className="h-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500"
//               initial={{ width: '0%' }}
//               animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
//               transition={{ duration: 0.5 }}
//             />
//           </div>
//         </div>

//         {/* Loading Text */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <motion.h2
//             className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
//             animate={{
//               backgroundPosition: ['0%', '100%'],
//             }}
//             transition={{
//               duration: 3,
//               repeat: Infinity,
//               repeatType: 'reverse',
//             }}
//           >
//             در حال ساخت وب‌سایت شما...
//           </motion.h2>
          
//           <AnimatePresence mode="wait">
//             <motion.p
//               key={currentStep}
//               className="text-gray-600 font-medium"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.3 }}
//             >
//               {steps[currentStep]?.label}
//             </motion.p>
//           </AnimatePresence>

//           {/* Fun Facts */}
//           <motion.p
//             className="text-sm text-gray-400 mt-4 italic"
//             animate={{ opacity: [0.5, 1, 0.5] }}
//             transition={{ duration: 2, repeat: Infinity }}
//           >
//             "خلاقیت در حال جاری شدن است..."
//           </motion.p>
//         </motion.div>

//         {/* Floating Dots */}
//         <div className="flex justify-center gap-2 mt-6">
//           {[0, 1, 2].map((i) => (
//             <motion.div
//               key={i}
//               className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
//               animate={{
//                 y: [0, -10, 0],
//                 opacity: [0.5, 1, 0.5],
//               }}
//               transition={{
//                 duration: 0.8,
//                 delay: i * 0.2,
//                 repeat: Infinity,
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };



// import { motion, AnimatePresence } from 'framer-motion';
// import { useState, useEffect } from 'react';

// const WebsiteGeneratorLoading = () => {
//   const [currentStep, setCurrentStep] = useState(0);

//   const steps = [
//     { id: 1, label: 'تجزیه و تحلیل نیازمندی‌ها', icon: '📊', color: '#3B82F6' },
//     { id: 2, label: 'طراحی رابط کاربری', icon: '🎨', color: '#8B5CF6' },
//     { id: 3, label: 'ساخت ساختار', icon: '🏗️', color: '#EC4899' },
//     { id: 4, label: 'بهینه‌سازی', icon: '⚡', color: '#10B981' },
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentStep((prev) => (prev + 1) % steps.length);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//       <div className="text-center px-4">
        
//         {/* Main Animation Container */}
//         <motion.div
//           className="relative w-80 h-80 mx-auto mb-8"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           {/* Browser Window SVG */}
//           <svg
//             viewBox="0 0 300 300"
//             className="w-full h-full"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             {/* Browser Window */}
//             <motion.g
//               initial={{ y: 20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ duration: 0.6 }}
//             >
//               {/* Window Frame */}
//               <rect
//                 x="20"
//                 y="40"
//                 width="260"
//                 height="220"
//                 rx="8"
//                 fill="white"
//                 stroke="#E5E7EB"
//                 strokeWidth="2"
//               />
              
//               {/* Browser Header */}
//               <rect x="20" y="40" width="260" height="30" rx="8" fill="#F3F4F6" />
//               <circle cx="38" cy="55" r="4" fill="#EF4444" />
//               <circle cx="52" cy="55" r="4" fill="#F59E0B" />
//               <circle cx="66" cy="55" r="4" fill="#10B981" />
              
//               {/* URL Bar */}
//               <rect x="85" y="48" width="180" height="14" rx="7" fill="white" stroke="#E5E7EB" strokeWidth="1" />
//             </motion.g>

//             {/* Building Blocks Animation */}
//             <motion.g>
//               {[0, 1, 2].map((row) =>
//                 [0, 1, 2].map((col) => (
//                   <motion.rect
//                     key={`${row}-${col}`}
//                     x={50 + col * 70}
//                     y={100 + row * 50}
//                     width={50}
//                     height={30}
//                     rx="4"
//                     fill={steps[currentStep]?.color || '#3B82F6'}
//                     initial={{ scale: 0, opacity: 0 }}
//                     animate={{
//                       scale: [0, 1.1, 1],
//                       opacity: [0, 1, 0.8],
//                     }}
//                     transition={{
//                       duration: 0.8,
//                       delay: (row * 3 + col) * 0.1,
//                       repeat: Infinity,
//                       repeatDelay: 1.5,
//                     }}
//                   />
//                 ))
//               )}
//             </motion.g>

//             {/* Code Lines Animation */}
//             <motion.g>
//               {[0, 1, 2, 3].map((i) => (
//                 <motion.line
//                   key={i}
//                   x1="40"
//                   y1={95 + i * 20}
//                   x2="140"
//                   y2={95 + i * 20}
//                   stroke={steps[currentStep]?.color || '#3B82F6'}
//                   strokeWidth="3"
//                   strokeLinecap="round"
//                   initial={{ pathLength: 0, opacity: 0 }}
//                   animate={{ pathLength: 1, opacity: 0.6 }}
//                   transition={{
//                     duration: 0.8,
//                     delay: i * 0.15,
//                     repeat: Infinity,
//                     repeatDelay: 1.2,
//                   }}
//                 />
//               ))}
//             </motion.g>

//             {/* Orbiting Particles */}
//             {[0, 1, 2, 3, 4, 5].map((i) => (
//               <motion.circle
//                 key={i}
//                 cx="150"
//                 cy="150"
//                 r="4"
//                 fill={steps[currentStep]?.color || '#3B82F6'}
//                 initial={{ opacity: 0 }}
//                 animate={{
//                   opacity: [0, 1, 0],
//                   scale: [0, 1.5, 0],
//                   x: [0, Math.cos((i * Math.PI) / 3) * 100],
//                   y: [0, Math.sin((i * Math.PI) / 3) * 100],
//                 }}
//                 transition={{
//                   duration: 2,
//                   delay: i * 0.2,
//                   repeat: Infinity,
//                   ease: "easeOut",
//                 }}
//               />
//             ))}
//           </svg>

//           {/* Center Icon */}
//           <motion.div
//             className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl"
//             animate={{
//               scale: [1, 1.2, 1],
//               rotate: [0, 360],
//             }}
//             transition={{
//               duration: 2,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           >
//             {steps[currentStep]?.icon}
//           </motion.div>
//         </motion.div>

//         {/* Progress Steps */}
//         <div className="max-w-2xl mx-auto mb-8">
//           <div className="flex justify-between items-center mb-4">
//             {steps.map((step, index) => (
//               <motion.div
//                 key={step.id}
//                 className="flex flex-col items-center flex-1"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <motion.div
//                   className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
//                     index === currentStep
//                       ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
//                       : 'bg-gray-200 text-gray-400'
//                   }`}
//                   animate={{
//                     scale: index === currentStep ? [1, 1.1, 1] : 1,
//                   }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   <span className="text-xl">{step.icon}</span>
//                 </motion.div>
//                 <motion.p
//                   className={`text-xs font-medium text-center ${
//                     index === currentStep ? 'text-gray-800' : 'text-gray-400'
//                   }`}
//                   animate={{
//                     scale: index === currentStep ? 1.05 : 1,
//                   }}
//                 >
//                   {step.label}
//                 </motion.p>
//               </motion.div>
//             ))}
//           </div>

//           {/* Progress Bar */}
//           <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//             <motion.div
//               className="h-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500"
//               initial={{ width: '0%' }}
//               animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
//               transition={{ duration: 0.5 }}
//             />
//           </div>
//         </div>

//         {/* Loading Text */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <motion.h2
//             className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
//             animate={{
//               backgroundPosition: ['0%', '100%'],
//             }}
//             transition={{
//               duration: 3,
//               repeat: Infinity,
//               repeatType: 'reverse',
//             }}
//           >
//             در حال ساخت وب‌سایت شما...
//           </motion.h2>
          
//           <AnimatePresence mode="wait">
//             <motion.p
//               key={currentStep}
//               className="text-gray-600 font-medium"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.3 }}
//             >
//               {steps[currentStep]?.label}
//             </motion.p>
//           </AnimatePresence>

//           {/* Fun Facts */}
//           <motion.p
//             className="text-sm text-gray-400 mt-4 italic"
//             animate={{ opacity: [0.5, 1, 0.5] }}
//             transition={{ duration: 2, repeat: Infinity }}
//           >
//             "خلاقیت در حال جاری شدن است..."
//           </motion.p>
//         </motion.div>

//         {/* Floating Dots */}
//         <div className="flex justify-center gap-2 mt-6">
//           {[0, 1, 2].map((i) => (
//             <motion.div
//               key={i}
//               className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
//               animate={{
//                 y: [0, -10, 0],
//                 opacity: [0.5, 1, 0.5],
//               }}
//               transition={{
//                 duration: 0.8,
//                 delay: i * 0.2,
//                 repeat: Infinity,
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WebsiteGeneratorLoading;

