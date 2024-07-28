"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper } from './types';

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await axios.get('/api/fetch-papers');
      setPapers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching papers:', error);
      setLoading(false);
    }
  };

  const handlePaperClick = async (paper: Paper) => {
    setSelectedPaper(paper);
    if (!paper.summary) {
      try {
        const response = await axios.post('/api/summarize', { text: paper.title });
        const updatedPaper = { ...paper, summary: response.data.summary };
        setSelectedPaper(updatedPaper);
        setPapers(papers.map(p => p.id === paper.id ? updatedPaper : p));
      } catch (error) {
        console.error('Error generating summary:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCitation = (paper: Paper) => {
    const authors = paper.authors.join(', ');
    const year = new Date(paper.published).getFullYear();
    return `${authors} (${year}). ${paper.title}. arXiv preprint arXiv:${paper.id.split('/').pop()}`;
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 pr-4">
        <h1 className="text-3xl font-bold mb-4">Recent AI Papers</h1>
        {loading ? (
          <p>Loading papers...</p>
        ) : (
          <ul className="space-y-2">
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="cursor-pointer hover:bg-gray-700 p-2 rounded transition-colors duration-200"
                onClick={() => handlePaperClick(paper)}
              >
                {paper.title}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="w-full md:w-2/3 mt-4 md:mt-0">
        {selectedPaper ? (
          <article className="card bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-2">{selectedPaper.title}</h2>
            <p className="mb-2 text-gray-300">Authors: {selectedPaper.authors.join(', ')}</p>
            <p className="mb-2 text-gray-300">Published: {formatDate(selectedPaper.published)}</p>
            <p className="mb-2 text-gray-300">Last Updated: {formatDate(selectedPaper.updated)}</p>
            <p className="mb-2 text-gray-300">Categories: {selectedPaper.categories.join(', ')}</p>
            <a href={selectedPaper.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mb-4 inline-block transition-colors duration-200">
              View on arXiv
            </a>
            <h3 className="text-xl font-semibold mb-2 mt-4">Abstract</h3>
            <p className="text-gray-300 mb-4">{selectedPaper.abstract}</p>
            <h3 className="text-xl font-semibold mb-2">Summary</h3>
            {selectedPaper.summary ? (
              <p className="text-gray-300 mb-4">{selectedPaper.summary}</p>
            ) : (
              <p className="text-gray-400 mb-4">Generating summary...</p>
            )}
            <h3 className="text-xl font-semibold mb-2">Citation</h3>
            <p className="text-gray-300">{getCitation(selectedPaper)}</p>
          </article>
        ) : (
          <p className="text-gray-400">Select a paper to view its details</p>
        )}
      </div>
    </div>
  );
}
