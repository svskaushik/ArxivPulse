import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import FilterOptions from './FilterOptions';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOptions {
  dateRange: { start: string; end: string };
  categories: string[];
}

interface NavBarProps {
  onSearch: (term: string) => void;
  onFilter: (options: FilterOptions) => void;
  activeFilters: FilterOptions;
}

const NavBar: React.FC<NavBarProps> = ({ onSearch, onFilter, activeFilters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const hasActiveFilters = activeFilters.categories.length > 0 || activeFilters.dateRange.start || activeFilters.dateRange.end;

  return (
    <nav className={`glass p-4 mb-4 transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 shadow-lg z-50' : ''}`}>
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold">arXiv Research Papers</h1>
        <div className="flex-grow flex items-center justify-center relative mx-4">
          <SearchBar onSearch={onSearch} />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center ${hasActiveFilters ? 'ring-2 ring-yellow-400' : ''}`}
        >
          <FaFilter className="mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="ml-2 bg-yellow-400 text-blue-800 text-xs font-bold rounded-full px-2 py-1">
              {activeFilters.categories.length + (activeFilters.dateRange.start || activeFilters.dateRange.end ? 1 : 0)}
            </span>
          )}
        </button>
      </div>
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <FilterOptions onFilter={onFilter} activeFilters={activeFilters} />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;
