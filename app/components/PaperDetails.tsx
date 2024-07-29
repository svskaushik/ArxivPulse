import React from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaChartBar, FaBook, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import Timeline from './Timeline';
import SocialShareButtons from './SocialShareButtons';
import { EmbedPDF } from "@simplepdf/react-embed-pdf";
import ChatWithPDF from './ChatWithPDF';
import { CitationFormat } from '../types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Paper, CitationFormat } from '../types';
import Timeline from './Timeline';
import SocialShareButtons from './SocialShareButtons';
import { EmbedPDF } from "@simplepdf/react-embed-pdf";
import { FaBook, FaCode, FaChartBar, FaCalendarAlt, FaArrowLeft, FaQuoteLeft } from 'react-icons/fa';

interface PaperDetailsProps {
  paper: Paper;
  selectedCitationFormat: CitationFormat;
  onCitationFormatChange: (format: CitationFormat) => void;
  getCitation: (paper: Paper, format: CitationFormat) => string;
  onBack: () => void;
}

const PaperDetails: React.FC<PaperDetailsProps> = ({
  paper,
  selectedCitationFormat,
  onCitationFormatChange,
  getCitation,
  onBack,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
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
      className="glass rounded-lg shadow-lg p-6 relative"
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-3xl font-bold">{paper.title}</h2>
        <button
          onClick={onBack}
          className="glass text-white p-2 rounded-full shadow-lg hover:bg-opacity-20 transition-colors"
          aria-label="Return to list"
        >
          <FaArrowLeft />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <p className="mb-2 text-gray-300 text-lg">
            Authors: {paper.authors.map((author, index) => (
              <span key={index}>
                <a href={author.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {author.name}
                </a>
                {index < paper.authors.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
          <p className="mb-2 text-gray-300">
            <FaCalendarAlt className="inline mr-2" />
            Published: {formatDate(paper.published)}
          </p>
          <p className="mb-2 text-gray-300">Last Updated: {formatDate(paper.updated)}</p>
          <p className="mb-2 text-gray-300">
            Categories: {paper.categories.map((category, index) => (
              <span key={index} className="inline-flex items-center glass rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2 mb-2">
                {getCategoryIcon(category)}
                {category}
              </span>
            ))}
          </p>
          {/* <p className="mb-2 text-gray-300">
            <FaQuoteLeft className="inline mr-2" />
            Citations: {paper.citationCount}
          </p> */}
        </div>
        <div>
          <Timeline paper={paper} />
        </div>
      </div>
      <div className="mb-4">
        <a href={paper.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mr-4 transition-colors duration-200">
          View on arXiv
        </a>
        <a href={paper.pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline transition-colors duration-200">
          Download PDF
        </a>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Share</h3>
        <SocialShareButtons url={paper.link} title={paper.title} />
      </div>
      <div className="mb-4">
        <ul className="flex border-b">
          <li className="-mb-px mr-1">
            <a className="bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-700 font-semibold" href="#summary">Summary</a>
          </li>
          <li className="mr-1">
            <a className="bg-white inline-block py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold" href="#abstract">Abstract</a>
          </li>
          <li className="mr-1">
            <a className="bg-white inline-block py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold" href="#citation">Citation</a>
          </li>
          <li className="mr-1">
            <a className="bg-white inline-block py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold" href="#related">Related Papers</a>
          </li>
          <li className="mr-1">
            <a className="bg-white inline-block py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold" href="#chat">Chat with PDF</a>
          </li>
        </ul>
      </div>
      <div id="summary" className="mb-4">
        <h3 className="text-2xl font-semibold mb-2">Summary</h3>
        {paper.summary ? (
          <div className="text-gray-300">
            <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{
              p: ({node, ...props}) => <p className="mb-2" {...props} />,
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
              code: ({node, inline, ...props}) => 
                inline ? <code className="bg-gray-700 rounded px-1" {...props} /> : <pre className="bg-gray-700 p-2 rounded mb-2 whitespace-pre-wrap break-words"><code className="break-words" {...props} /></pre>,
            }}>
              {paper.summary}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-400">Generating summary...</p>
        )}
      </div>
      <div id="abstract" className="mb-4">
        <h3 className="text-2xl font-semibold mb-2">Abstract</h3>
        <p className="text-gray-300">{paper.abstract}</p>
      </div>
      <div id="citation" className="mb-4">
        <h3 className="text-2xl font-semibold mb-2">Citation</h3>
        <div className="mb-2">
          <label htmlFor="citationFormat" className="mr-2">Citation Format:</label>
          <select
            id="citationFormat"
            value={selectedCitationFormat}
            onChange={(e) => onCitationFormatChange(e.target.value as CitationFormat)}
            className="glass text-white rounded p-1"
          >
            {Object.values(CitationFormat).map((format) => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>
        <div className="glass p-2 rounded">
          {selectedCitationFormat === CitationFormat.BibTeX ? (
            <pre className="text-gray-300 whitespace-pre-wrap">{getCitation(paper, selectedCitationFormat)}</pre>
          ) : (
            <p className="text-gray-300">{getCitation(paper, selectedCitationFormat)}</p>
          )}
          <button
            onClick={() => navigator.clipboard.writeText(getCitation(paper, selectedCitationFormat))}
            className="mt-2 glass text-white px-2 py-1 rounded hover:bg-opacity-20 transition-colors"
          >
            Copy Citation
          </button>
        </div>
      </div>
      <div id="related" className="mb-4">
        <h3 className="text-2xl font-semibold mb-2">Related Papers</h3>
        {Array.isArray(paper.relatedPapers) && paper.relatedPapers.length > 0 ? (
          <ul className="list-disc list-inside">
            {paper.relatedPapers.map((relatedPaper, index) => (
              <li key={index} className="text-gray-300">
                <a href={relatedPaper.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {relatedPaper.title}
                </a>
                <p className="text-sm text-gray-400">
                  {relatedPaper.authors.map(author => author.name).join(', ')}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No related papers found.</p>
        )}
      </div>
      <div className="mb-4">
        <h3 className="text-2xl font-semibold mb-2">PDF Viewer</h3>
        <EmbedPDF>
          <iframe
            src={`/api/paper-pdf?url=${encodeURIComponent(paper.pdfLink)}`}
            width="100%"
            height="800px"
            style={{ border: 'none' }}
          />
        </EmbedPDF>
      </div>
      <div id="chat" className="mb-4">
        <h3 className="text-2xl font-semibold mb-2">Chat with PDF</h3>
        <ChatWithPDF paperId={paper.id} pdfUrl={paper.pdfLink} />
      </div>
    </motion.article>
  );
};

export default PaperDetails;
