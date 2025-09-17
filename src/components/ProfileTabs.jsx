import React from 'react';

const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'nemas', label: 'My Nemas' },
    { id: 'personal', label: 'Personal Info' }
  ];

  return (
    <div className="border-b border-gray-600 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-300 hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;