import React, { useState, useEffect } from 'react';
import Select from 'react-select';

interface FilterOptionsProps {
  onFilter: (options: FilterOptions) => void;
  activeFilters: FilterOptions;
}

interface FilterOptions {
  dateRange: { start: string; end: string };
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ onFilter, activeFilters }) => {
  const [dateRange, setDateRange] = useState(activeFilters.dateRange);

  useEffect(() => {
    handleFilter();
  }, [dateRange]);

  const handleFilter = () => {
    onFilter({
      dateRange,
    });
  };

  const handleClearFilters = () => {
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="glass p-4 rounded-lg">
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Date Range:</label>
        <div className="flex space-x-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full p-2 glass text-white rounded"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full p-2 glass text-white rounded"
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={handleClearFilters}
          className="glass text-white px-4 py-2 rounded hover:bg-opacity-20 transition-colors"
        >
          Clear Date Filter
        </button>
        <span className="text-gray-300">
          Active Filters: {(dateRange.start || dateRange.end ? 1 : 0)}
        </span>
      </div>
    </div>
  );
};

export default FilterOptions;
