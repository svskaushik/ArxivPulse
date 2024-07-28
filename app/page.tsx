"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Paper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  link: string;
}

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

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 pr-4">
        <h1 className="text-3xl font-bold mb-4">Recent AI Papers</h1>
        {loading ? (
          <p>Loading papers...</p>
        ) : (
          <ul>
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="cursor-pointer hover:bg-gray-700 p-2 rounded"
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
          <div className="card">
            <h2 className="text-2xl font-bold mb-2">{selectedPaper.title}</h2>
            <p className="mb-2">Authors: {selectedPaper.authors.join(', ')}</p>
            <a href={selectedPaper.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mb-4 inline-block">
              View on arXiv
            </a>
            <h3 className="text-xl font-semibold mb-2">Summary</h3>
            {selectedPaper.summary ? (
              <p>{selectedPaper.summary}</p>
            ) : (
              <p>Generating summary...</p>
            )}
          </div>
        ) : (
          <p>Select a paper to view its summary</p>
        )}
      </div>
    </div>
  );
}
