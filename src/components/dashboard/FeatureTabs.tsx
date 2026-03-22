import React from "react";

interface FeatureTabsProps {
  activeTab: "originality" | "citations" | "ai-detection" | "authorship";
  onTabChange: (tab: "originality" | "citations" | "ai-detection" | "authorship") => void;
}

export const FeatureTabs: React.FC<FeatureTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [

    { id: "originality" as const, label: "🗺️ Originality Map", icon: "🗺️" },
    { id: "citations" as const, label: "📚 Citations", icon: "📚" },
    { id: "ai-detection" as const, label: "🤖 AI Detection", icon: "🤖" },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.id
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
