import React, { useState, useEffect } from 'react';
import Select from 'react-select';

interface FilterOptionsProps {
  onFilter: (options: FilterOptions) => void;
  activeFilters: FilterOptions;
}

interface FilterOptions {
  dateRange: { start: string; end: string };
  category: string;
}

const categoryOptions = [
  { value: 'cs.AI', label: 'Artificial Intelligence' },
  { value: 'cs.CL', label: 'Computation and Language' },
  { value: 'cs.CV', label: 'Computer Vision' },
  { value: 'cs.LG', label: 'Machine Learning' },
  { value: 'cs.NE', label: 'Neural and Evolutionary Computing' },
];

const FilterOptions: React.FC<FilterOptionsProps> = ({ onFilter, activeFilters }) => {
  const [dateRange, setDateRange] = useState(activeFilters.dateRange);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryOptions.find(option => option.value === activeFilters.category) || null
  );

  useEffect(() => {
    handleFilter();
  }, [dateRange, selectedCategories]);

  const handleFilter = () => {
    onFilter({
      dateRange,
      category: selectedCategory ? selectedCategory.value : '',
    });
  };

  const handleClearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSelectedCategories([]);
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
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Category:</label>
        <Select
          options={categoryOptions}
          value={selectedCategory}
          onChange={(selected) => setSelectedCategory(selected as any)}
          className="text-black"
          classNamePrefix="select"
          isClearable
        />
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={handleClearFilters}
          className="glass text-white px-4 py-2 rounded hover:bg-opacity-20 transition-colors"
        >
          Clear All Filters
        </button>
        <span className="text-gray-300">
          Active Filters: {(selectedCategory ? 1 : 0) + (dateRange.start || dateRange.end ? 1 : 0)}
        </span>
      </div>
    </div>
  );
};

export default FilterOptions;
