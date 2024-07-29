"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Paper, CitationFormat, Comment } from './types';
import NavBar from './components/NavBar';
import PaperList from './components/PaperList';
import PaperDetails from './components/PaperDetails';
import { FaArrowUp } from 'react-icons/fa';

const PAPERS_PER_PAGE = 20;

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingList, setReadingList] = useState<Paper[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    dateRange: { start: '', end: '' },
    category: '',
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPaperElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
    setPapers([]);
    setHasMore(true);
  };

  const handleFilter = (options: any) => {
    setFilterOptions(options);
    setPage(1);
    setPapers([]);
    setHasMore(true);
  };

  const toggleReadingList = (paper: Paper) => {
    const updatedPaper = { ...paper, inReadingList: !paper.inReadingList };
    setPapers(prevPapers =>
      prevPapers.map(p => p.id === paper.id ? updatedPaper : p)
    );
    if (updatedPaper.inReadingList) {
      setReadingList(prevList => [...prevList, updatedPaper]);
    } else {
      setReadingList(prevList => prevList.filter(p => p.id !== paper.id));
    }
  };

  const ratePaper = (paper: Paper, rating: number) => {
    const updatedPaper = { ...paper, userRating: rating };
    setPapers(prevPapers =>
      prevPapers.map(p => p.id === paper.id ? updatedPaper : p)
    );
  };

  const addComment = (paper: Paper, comment: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: 'user123', // Replace with actual user ID
      text: comment,
      createdAt: new Date().toISOString(),
    };
    const updatedPaper = {
      ...paper,
      comments: [...(paper.comments || []), newComment],
    };
    setPapers(prevPapers =>
      prevPapers.map(p => p.id === paper.id ? updatedPaper : p)
    );
  };

  useEffect(() => {
    fetchPapers();
  }, [page, searchTerm, filterOptions]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fetch-papers?page=${page}&search=${searchTerm}&startDate=${filterOptions.dateRange.start}&endDate=${filterOptions.dateRange.end}&category=${filterOptions.category}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setPapers(prevPapers => [...prevPapers, ...data]);
        setHasMore(data.length === PAPERS_PER_PAGE);
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
        // First, fetch the full PDF text
        const pdfTextResponse = await axios.get<{ text: string }>(`/api/fetch-pdf-text?url=${encodeURIComponent(paper.pdfLink)}`);
        const fullPdfText = pdfTextResponse.data.text;
        console.log('Full PDF text:', typeof(fullPdfText));

        // Then, use the full PDF text for summarization
        const summaryResponse = await axios.post<{ summary: string }>('/api/summarize', { text: fullPdfText });
        const updatedPaper = { ...paper, summary: summaryResponse.data.summary };
        setSelectedPaper(updatedPaper);
        setPapers(prevPapers => prevPapers.map(p => p.id === paper.id ? updatedPaper : p));
      } catch (error) {
        console.error('Error generating summary:', error);
      }
    }
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

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar onSearch={handleSearch} onFilter={handleFilter} />
      <div className="flex flex-grow p-4">
        {selectedPaper ? (
          <>
            <div className="w-1/3 pr-4 overflow-y-auto">
              <PaperList
                papers={papers}
                selectedPaperId={selectedPaper.id}
                onPaperClick={handlePaperClick}
                lastPaperElementRef={lastPaperElementRef}
              />
              {loading && <p className="mt-4">Loading more papers...</p>}
            </div>
            <div className="w-2/3 pl-4">
              <PaperDetails
                paper={selectedPaper}
                selectedCitationFormat={selectedCitationFormat}
                onCitationFormatChange={setSelectedCitationFormat}
                getCitation={getCitation}
              />
            </div>
          </>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((paper, index) => (
                <div
                  key={`${paper.id}-${index}`}
                  ref={index === papers.length - 1 ? lastPaperElementRef : null}
                  className="cursor-pointer bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => handlePaperClick(paper)}
                >
                  <h3 className="text-lg font-semibold mb-2">{paper.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{paper.authors.map(author => author.name).join(', ')}</p>
                  <p className="text-sm text-gray-500">{paper.abstract.substring(0, 150)}...</p>
                </div>
              ))}
            </div>
            {loading && <p className="mt-4">Loading papers...</p>}
          </div>
        )}
      </div>
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}
