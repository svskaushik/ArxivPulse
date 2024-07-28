"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, CitationFormat } from './types';

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fetch-papers');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setPapers(data);
      } else {
        console.error('Unexpected data format:', data);
        setPapers([]);
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = async (paper: Paper) => {
    setSelectedPaper(paper);
    if (!paper.summary) {
      try {
        const response = await axios.post<{ summary: string }>('/api/summarize', { text: paper.title });
        const updatedPaper = { ...paper, summary: response.data.summary };
        setSelectedPaper(updatedPaper);
        setPapers(prevPapers => prevPapers.map(p => p.id === paper.id ? updatedPaper : p));
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

  const getCitation = (paper: Paper, format: CitationFormat): string => {
    const authors = paper.authors.map(author => author.name);
    const year = new Date(paper.published).getFullYear();
    const arxivId = paper.id.split('/').pop();

    switch (format) {
      case CitationFormat.APA:
        return `${authors.join(', ')}. (${year}). ${paper.title}. arXiv preprint arXiv:${arxivId}.`;
      case CitationFormat.MLA:
        return `${authors[0].split(' ').pop()}, ${authors[0].split(' ')[0]}${authors.length > 1 ? ', et al.' : ''}. "${paper.title}." arXiv, ${year}, arXiv:${arxivId}.`;
      case CitationFormat.Chicago:
        return `${authors.join(', ')}. "${paper.title}." arXiv preprint arXiv:${arxivId} (${year}).`;
      case CitationFormat.Harvard:
        return `${authors.join(', ')}, ${year}. ${paper.title}. arXiv preprint arXiv:${arxivId}.`;
      case CitationFormat.IEEE:
        return `${authors.map(author => author.split(' ').pop() + ', ' + author.split(' ')[0][0] + '.').join(', ')}, "${paper.title}," arXiv preprint arXiv:${arxivId}, ${year}.`;
      default:
        return `${authors.join(', ')} (${year}). ${paper.title}. arXiv preprint arXiv:${arxivId}.`;
    }
  };

  const [selectedCitationFormat, setSelectedCitationFormat] = useState<CitationFormat>(CitationFormat.APA);

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
            <p className="mb-2 text-gray-300">
              Authors: {selectedPaper.authors.map((author, index) => (
                <span key={index}>
                  <a href={author.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {author.name}
                  </a>
                  {index < selectedPaper.authors.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
            <p className="mb-2 text-gray-300">Published: {formatDate(selectedPaper.published)}</p>
            <p className="mb-2 text-gray-300">Last Updated: {formatDate(selectedPaper.updated)}</p>
            <p className="mb-2 text-gray-300">Categories: {selectedPaper.categories.join(', ')}</p>
            <div className="mb-4">
              <a href={selectedPaper.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mr-4 transition-colors duration-200">
                View on arXiv
              </a>
              <a href={selectedPaper.pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline transition-colors duration-200">
                Download PDF
              </a>
            </div>
            <div className="mb-4">
              <span className="mr-4">Citations: {selectedPaper.citationCount}</span>
              <span>Altmetric: {selectedPaper.altmetric}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 mt-4">Abstract</h3>
            <p className="text-gray-300 mb-4">{selectedPaper.abstract}</p>
            <h3 className="text-xl font-semibold mb-2">Summary</h3>
            {selectedPaper.summary ? (
              <p className="text-gray-300 mb-4">{selectedPaper.summary}</p>
            ) : (
              <p className="text-gray-400 mb-4">Generating summary...</p>
            )}
            <h3 className="text-xl font-semibold mb-2">Citation</h3>
            <div className="mb-2">
              <label htmlFor="citationFormat" className="mr-2">Citation Format:</label>
              <select
                id="citationFormat"
                value={selectedCitationFormat}
                onChange={(e) => setSelectedCitationFormat(e.target.value as CitationFormat)}
                className="bg-gray-700 text-white rounded p-1"
              >
                {Object.values(CitationFormat).map((format) => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>
            <div className="bg-gray-700 p-2 rounded mb-4">
              <p className="text-gray-300">{getCitation(selectedPaper, selectedCitationFormat)}</p>
              <button
                onClick={() => navigator.clipboard.writeText(getCitation(selectedPaper, selectedCitationFormat))}
                className="mt-2 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Copy Citation
              </button>
            </div>
            <h3 className="text-xl font-semibold mb-2">Related Papers</h3>
            {selectedPaper.relatedPapers.length > 0 ? (
              <ul className="list-disc list-inside">
                {selectedPaper.relatedPapers.map((paper, index) => (
                  <li key={index} className="text-gray-300">
                    <a href={paper.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      {paper.title}
                    </a>
                    <p className="text-sm text-gray-400">
                      {paper.authors.map(author => author.name).join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No related papers found.</p>
            )}
          </article>
        ) : (
          <p className="text-gray-400">Select a paper to view its details</p>
        )}
      </div>
    </div>
  );
}
