import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Paper, CitationFormat } from '../types';
import Timeline from './Timeline';
import SocialShareButtons from './SocialShareButtons';
import PdfViewer from './PdfViewer';

interface PaperDetailsProps {
  paper: Paper;
  selectedCitationFormat: CitationFormat;
  onCitationFormatChange: (format: CitationFormat) => void;
  getCitation: (paper: Paper, format: CitationFormat) => string;
}

const PaperDetails: React.FC<PaperDetailsProps> = ({
  paper,
  selectedCitationFormat,
  onCitationFormatChange,
  getCitation,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'computer science':
        return <FaCode className="inline mr-1" />;
      case 'mathematics':
        return <FaChartBar className="inline mr-1" />;
      default:
        return <FaBook className="inline mr-1" />;
    }
  };

  return (
    <motion.article
      key={paper.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-lg shadow-lg p-6"
    >
      {/* Paper details content */}
      {/* ... (include all the content from the original file, but replace the hardcoded paper with the prop) */}
    </motion.article>
  );
};

export default PaperDetails;
