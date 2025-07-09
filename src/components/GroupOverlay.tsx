import React from 'react';

interface GroupOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupOverlay: React.FC<GroupOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 m-4 flex flex-col min-h-[80vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Close group overlay"
        >
          <span className="text-xl">&times;</span>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Group Planner</h2>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Task Placeholder */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold mb-2">Add Task (Group)</span>
            <span className="text-gray-400">[Add Task UI here]</span>
          </div>
          {/* Manage Categories Placeholder */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold mb-2">Manage Categories (Group)</span>
            <span className="text-gray-400">[Manage Categories UI here]</span>
          </div>
          {/* Calendar Placeholder */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold mb-2">Calendar (Group)</span>
            <span className="text-gray-400">[Calendar UI here]</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupOverlay; 