import React, { memo, useState } from 'react';
import { Paper } from '../types';
import { motion } from 'framer-motion';

interface PaperItemProps {
  paper: Paper;
  onClick: (paper: Paper) => void;
  isLast: boolean;
  lastPaperElementRef: (node: HTMLDivElement | null) => void;
}

const PaperItem: React.FC<PaperItemProps> = memo(({ paper, onClick, isLast, lastPaperElementRef }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={isLast ? lastPaperElementRef : null}
      className="cursor-pointer bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200 relative"
      onClick={() => onClick(paper)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ backgroundColor: '#4a5568' }}
    >
      <h3 className="text-lg font-semibold mb-2">{paper.title}</h3>
      <p className="text-sm text-gray-400 mb-2">{paper.authors.map(author => author.name).join(', ')}</p>
      <p className="text-sm text-gray-500">{paper.abstract.substring(0, 150)}...</p>
      
      {isHovered && (
        <div className="absolute z-10 bg-gray-900 p-4 rounded-lg shadow-lg left-0 right-0 mt-2">
          <h4 className="text-md font-semibold mb-2">Abstract</h4>
          <p className="text-sm text-gray-300">{paper.abstract}</p>
        </div>
      )}
    </motion.div>
  );
});

PaperItem.displayName = 'PaperItem';

export default PaperItem;
