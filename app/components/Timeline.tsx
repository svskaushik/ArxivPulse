import React from 'react';
import { Paper } from '../types';
import { FaCalendarAlt } from 'react-icons/fa';

interface TimelineProps {
  paper: Paper;
}

const Timeline: React.FC<TimelineProps> = ({ paper }) => {
  const events = [
    { date: new Date(paper.published), label: 'Published' },
    { date: new Date(paper.updated), label: 'Last Updated' },
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="relative">
      <div className="absolute h-full w-0.5 bg-gray-600 left-2"></div>
      {events.map((event, index) => (
        <div key={index} className="mb-4 flex items-center">
          <div className="bg-blue-500 rounded-full w-4 h-4 absolute left-0"></div>
          <div className="ml-8">
            <p className="text-sm text-gray-400">
              <FaCalendarAlt className="inline mr-2" />
              {event.date.toLocaleDateString()}
            </p>
            <p className="text-gray-300">{event.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
