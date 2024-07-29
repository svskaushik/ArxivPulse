import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          className="bg-gray-800 p-4 rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="h-6 bg-gray-700 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded mb-2 w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
