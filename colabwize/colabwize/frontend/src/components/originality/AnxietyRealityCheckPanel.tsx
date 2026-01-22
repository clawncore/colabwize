import React from "react";
import { RealityCheckStats } from "../../services/originalityService";
import {
  ShieldCheck,
  Info,
  HelpingHand,
  Lightbulb,
  GraduationCap,
} from "lucide-react";

interface AnxietyRealityCheckPanelProps {
  stats: RealityCheckStats;
}

export const AnxietyRealityCheckPanel: React.FC<
  AnxietyRealityCheckPanelProps
> = ({ stats }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">
                Academic Reality Check
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                Reality Check
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Contextualizing your originality results
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {/* Reference Stat */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                From References
              </p>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {stats.referencePercent}%
            </span>
          </div>
          <p className="text-xs text-blue-600 font-medium">
            Expected in academic work
          </p>
        </div>

        {/* Common Phrase Stat */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Common Phrases
              </p>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {stats.commonPhrasePercent}%
            </span>
          </div>
          <p className="text-xs text-blue-600 font-medium">
            Normal academic language
          </p>
        </div>

        {/* Trust Score */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HelpingHand className="w-4 h-4 text-green-500" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Confidence
              </p>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {stats.trustScore}%
            </span>
          </div>
          <p className="text-xs text-green-600 font-medium">
            Safe content detected
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 mb-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-blue-900 mb-2">
              Academic Truth: Scores Don't Define Your Work
            </h4>
            <p className="text-sm text-blue-800 mb-3">{stats.message}</p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Similarity ≠ Plagiarism (Context matters more than
                  percentages)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  References & quotes <i>increase</i> similarity scores (this is
                  good!)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Common academic phrases are expected in scholarly writing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Professors evaluate substance, evidence, and critical thinking
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800 font-medium">
          <span className="font-bold">Remember:</span> Academic integrity is
          about proper attribution, critical thinking, and honest
          scholarship—not achieving 0% similarity.
        </p>
      </div>
    </div>
  );
};
