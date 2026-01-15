import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Layout from "../components/Layout";

interface ChangelogItem {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  changes: {
    improvements: string[];
    fixes: string[];
    patches: string[];
  };
}

const changelogData: ChangelogItem[] = [
  {
    id: "1",
    version: "2.1.0",
    date: "Jan 14, 2026",
    title: "Draft Comparison & Researcher Plan",
    description:
      "Introduced the new Researcher plan with exclusive access to Draft Comparison tools, allowing users to track evolution between different document versions.",
    changes: {
      improvements: [
        "Added Draft Comparison feature for side-by-side text analysis",
        "Launched Researcher subscription plan",
        "Updated Pricing page with new tier details",
      ],
      fixes: [
        "Fixed plan limit enforcement for Citations",
        "Resolved UI glitch in monthly/yearly toggle",
      ],
      patches: [],
    },
  },
  {
    id: "2",
    version: "2.0.0",
    date: "Jan 05, 2026",
    title: "Originality Map 2.0",
    description:
      "A complete overhaul of our Originality Map visualization, featuring granular heatmaps and improved safety score algorithms.",
    changes: {
      improvements: [
        "New color-coded confidence heatmap (Green/Yellow/Red)",
        "Enhanced reality check algorithms",
        "Added export options for analysis reports",
      ],
      fixes: [
        "Improved accuracy of source linking",
        "Fixed character count calculation for large docs",
      ],
      patches: ["Performance patch for high-traffic scanning"],
    },
  },
  {
    id: "3",
    version: "1.5.0",
    date: "Dec 15, 2025",
    title: "Core Platform Launch",
    description:
      "The official release of the ColabWize platform, bringing integrated academic integrity tools to students and researchers.",
    changes: {
      improvements: [
        "Launched Citation Confidence Auditor",
        "Released Authorship Certificate generation",
        "Integrated AI Detection Shield",
      ],
      fixes: [],
      patches: [],
    },
  },
];

const ChangeSection = ({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (count === 0) {
    return (
      <div className="border-t border-gray-100 py-3 px-4 flex justify-between items-center text-gray-400 cursor-not-allowed">
        <span className="text-sm font-medium">
          {title} ({count})
        </span>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 px-4 flex justify-between items-center text-gray-600 hover:bg-gray-50 transition-colors text-left">
        <span className="text-sm font-medium">
          {title} ({count})
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <ul className="py-2 px-4 bg-gray-50 space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-600 flex items-start">
              <span className="mr-2 text-gray-400">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function ChangelogPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-white section-padding">
        <div className="container-custom max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-gray-100 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-3">
                <span className="text-sm font-medium text-gray-500">
                  Version
                </span>
              </div>
              <div className="md:col-span-9">
                <span className="text-sm font-medium text-gray-500">
                  Description
                </span>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-16">
            {changelogData.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 group">
                {/* Version Column */}
                <div className="md:col-span-3 pt-2">
                  <div className="font-medium text-gray-900 mb-1">
                    {item.version}
                  </div>
                  <div className="text-gray-500 text-sm">{item.date}</div>
                </div>

                {/* Content Column */}
                <div className="md:col-span-9">
                  <div className="bg-gray-50/50 hover:bg-gray-50 rounded-3xl transition-colors duration-300 overflow-hidden">
                    <div className="p-8">
                      <div className="grid md:grid-cols-2 gap-8 mb-4">
                        <h2 className="text-xl font-medium text-gray-900">
                          {item.title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm">
                      <ChangeSection
                        title="Improvements"
                        count={item.changes.improvements.length}
                        items={item.changes.improvements}
                      />
                      <ChangeSection
                        title="Fixes"
                        count={item.changes.fixes.length}
                        items={item.changes.fixes}
                      />
                      <ChangeSection
                        title="Patches"
                        count={item.changes.patches.length}
                        items={item.changes.patches}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
