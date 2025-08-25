import React from 'react';

interface ToolCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ name, description, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition space-y-2"
  >
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h4 className="text-md font-semibold text-gray-800 dark:text-white">{name}</h4>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-300">{description}</p>
  </div>
);

export default ToolCard;
