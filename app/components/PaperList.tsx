import React from 'react';
import { Paper } from '../types';
import { motion } from 'framer-motion';

interface PaperListProps {
  papers: Paper[];
  selectedPaperId: string | null;
  onPaperClick: (paper: Paper) => void;
  lastPaperElementRef: (node: HTMLDivElement | null) => void;
}

const PaperList: React.FC<PaperListProps> = ({ papers, selectedPaperId, onPaperClick, lastPaperElementRef, isDetailView }) => {
  return (
    <div className={`${isDetailView ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
      {papers.map((paper, index) => (
        <motion.div
          key={`${paper.id}-${index}`}
          ref={index === papers.length - 1 ? lastPaperElementRef : null}
          className={`cursor-pointer p-4 rounded-lg shadow-md transition-all duration-200 ${
            paper.id === selectedPaperId ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          onClick={() => onPaperClick(paper)}
          whileHover={{ backgroundColor: isDetailView ? 'inherit' : '#4a5568' }}
        >
          <h3 className="text-lg font-semibold mb-2">{paper.title}</h3>
          <p className="text-sm text-gray-400 mb-2">{paper.authors.map(author => author.name).join(', ')}</p>
          <p className="text-sm text-gray-500">{paper.abstract.substring(0, 100)}...</p>
        </motion.div>
      ))}
    </div>
  );
};

export default PaperList;
