import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } : {}}
      className={`bg-white rounded-xl shadow-soft border border-gray-100 p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
