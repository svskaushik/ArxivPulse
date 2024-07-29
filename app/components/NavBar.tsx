import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import FilterOptions from './FilterOptions';
import { FaSearch } from 'react-icons/fa';

interface FilterOptions {
  dateRange: { start: string; end: string };
  category: string;
}

interface NavBarProps {
  onSearch: (term: string) => void;
  onFilter: (options: FilterOptions) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSearch, onFilter }) => {
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

  return (
    <nav className={`bg-gray-800 p-4 mb-4 transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 shadow-md z-50' : ''}`}>
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold">arXiv Research Papers</h1>
        <div className="flex-grow flex items-center justify-center relative mx-4">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-pulse" />
          <SearchBar onSearch={onSearch} />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      {showFilters && (
        <div className="mt-4">
          <FilterOptions onFilter={onFilter} />
        </div>
      )}
    </nav>
  );
};

export default NavBar;
