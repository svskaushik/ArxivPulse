import React, { useState } from 'react';
import SearchBar from './SearchBar';
import FilterOptions from './FilterOptions';

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

  return (
    <nav className="bg-gray-800 p-4 mb-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold">arXiv Research Papers</h1>
        <div className="flex items-center">
          <SearchBar onSearch={onSearch} />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
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
