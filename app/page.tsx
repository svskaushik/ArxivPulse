"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Paper, CitationFormat, Comment } from './types';
import NavBar from './components/NavBar';
import PaperList from './components/PaperList';
import PaperDetails from './components/PaperDetails';
import SkeletonLoader from './components/SkeletonLoader';
import { FaArrowUp, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_PAPERS_COUNT = 15;
const PAPERS_PER_PAGE = 12;

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
    fetchInitialPapers();
  };

  const handleFilter = (options: any) => {
    setFilterOptions(options);
    setPage(1);
    setPapers([]);
    setHasMore(true);
    fetchInitialPapers();
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

  const fetchInitialPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fetch-papers?page=1&perPage=${INITIAL_PAPERS_COUNT}&search=${searchTerm}&startDate=${filterOptions.dateRange.start}&endDate=${filterOptions.dateRange.end}&category=${filterOptions.category}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setPapers(data);
        setHasMore(data.length === INITIAL_PAPERS_COUNT);
      } else {
        console.error('Unexpected data format:', data);
        setPapers([]);
      }
    } catch (error) {
      console.error('Error fetching initial papers:', error);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fetch-papers?page=${page}&perPage=${PAPERS_PER_PAGE}&search=${searchTerm}&startDate=${filterOptions.dateRange.start}&endDate=${filterOptions.dateRange.end}&category=${filterOptions.category}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setPapers(prevPapers => page === 1 ? data : [...prevPapers, ...data]);
        setHasMore(data.length === PAPERS_PER_PAGE);
      } else {
        console.error('Unexpected data format:', data);
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = (paper: Paper) => {
    setSelectedPaper(paper);
    if (!paper.summary) {
      // Generate summary using the abstract instead of full PDF text
      axios.post<{ summary: string }>('/api/summarize', { text: paper.abstract })
        .then(response => {
          const updatedPaper = { ...paper, summary: response.data.summary };
          setSelectedPaper(updatedPaper);
          setPapers(prevPapers => prevPapers.map(p => p.id === paper.id ? updatedPaper : p));
        })
        .catch(error => {
          console.error('Error generating summary:', error);
        });
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
    <div className="flex flex-col h-screen overflow-hidden">
      <NavBar onSearch={handleSearch} onFilter={handleFilter} />
      <div className="flex flex-grow p-4 h-[calc(100vh-64px)]"> {/* Adjust 64px if your NavBar height is different */}
        <AnimatePresence mode="wait">
          {selectedPaper ? (
            <motion.div
              key="paper-details"
              className="flex w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-1/3 pr-4 overflow-y-auto h-full">
                <PaperList
                  papers={papers}
                  selectedPaperId={selectedPaper.id}
                  onPaperClick={handlePaperClick}
                  lastPaperElementRef={lastPaperElementRef}
                  isDetailView={true}
                />
                {loading && <p className="mt-4">Loading more papers...</p>}
              </div>
              <div className="w-2/3 pl-4 overflow-y-auto h-full relative">
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  aria-label="Return to list"
                >
                  <FaArrowLeft />
                </button>
                <PaperDetails
                  paper={selectedPaper}
                  selectedCitationFormat={selectedCitationFormat}
                  onCitationFormatChange={setSelectedCitationFormat}
                  getCitation={getCitation}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="paper-list"
              className="w-full overflow-y-auto h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loading && papers.length === 0 ? (
                <SkeletonLoader />
              ) : (
                <PaperList
                  papers={papers}
                  selectedPaperId={null}
                  onPaperClick={handlePaperClick}
                  lastPaperElementRef={lastPaperElementRef}
                  isDetailView={false}
                />
              )}
              {loading && papers.length > 0 && <p className="mt-4">Loading more papers...</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
