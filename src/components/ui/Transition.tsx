// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface TransitionProps {
//   children: React.ReactNode;
// }

// export function Transition({ children }: TransitionProps) {
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         initial={{ opacity: 0, y: 5 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -5 }}
//         transition={{ duration: 0.3 }}
//       >
//         {children}
//       </motion.div>
//     </AnimatePresence>
//   );
// } 