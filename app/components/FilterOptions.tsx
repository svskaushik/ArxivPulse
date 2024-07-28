import React, { useState } from 'react';

interface FilterOptionsProps {
  onFilter: (options: any) => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ onFilter }) => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ dateRange, category });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <label className="block text-gray-300">Start Date:</label>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-gray-300">End Date:</label>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-gray-300">Category:</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., cs.AI"
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
        Apply Filters
      </button>
    </form>
  );
};

export default FilterOptions;
