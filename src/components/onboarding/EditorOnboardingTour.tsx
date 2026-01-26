import React from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface EditorOnboardingTourProps {
    run: boolean;
    onFinish: () => void;
    onSkip: () => void;
}

export const EditorOnboardingTour: React.FC<EditorOnboardingTourProps> = ({
    run,
    onFinish,
    onSkip,
}) => {
    const steps: Step[] = [
        {
            target: "body",
            content: (
                <div>
                    <h2 className="text-2xl font-bold mb-3 text-indigo-600">
                        Welcome to Your Writing Workspace! ✍️
                    </h2>
                    <p className="text-gray-700 mb-2">
                        Let's take a quick tour of the powerful tools at your disposal to help you write with confidence and integrity.
                    </p>
                    <p className="text-sm text-gray-500">
                        This tour will only take 2 minutes. You can skip it anytime.
                    </p>
                </div>
            ),
            placement: "center",
            disableBeacon: true,
        },
        {
            target: '[data-tour="documents-panel"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">📄 My Documents</h3>
                    <p className="text-gray-700 mb-3">
                        Access all your projects here. Create new documents, switch between projects, and manage your work seamlessly.
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                            💡 <strong>Tip:</strong> All your work is auto-saved as you type!
                        </p>
                    </div>
                </div>
            ),
            placement: "right",
        },
        {
            target: '[data-tour="source-library"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">📚 Source Library</h3>
                    <p className="text-gray-700 mb-3">
                        Your research hub! Manage all your sources, citations, and references in one place.
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-3">
                        <li><strong>Sources:</strong> All papers you've added</li>
                        <li><strong>Collections:</strong> Organize sources by theme</li>
                        <li><strong>Matrix:</strong> Compare sources side-by-side</li>
                    </ul>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-green-900">
                            📖 <strong>Pro tip:</strong> Click any source to read and annotate PDFs!
                        </p>
                    </div>
                </div>
            ),
            placement: "right",
        },
        {
            target: '[data-tour="outline-builder"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">🗂️ Outline Builder</h3>
                    <p className="text-gray-700 mb-3">
                        Structure your thoughts before writing! Create hierarchical outlines and sync them directly to your document.
                    </p>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-900">
                            ⚡ <strong>Quick action:</strong> Click "Sync to Editor" to instantly add your outline as headings!
                        </p>
                    </div>
                </div>
            ),
            placement: "right",
        },
        {
            target: '[data-tour="editor-toolbar"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">🛠️ Editor Toolbar</h3>
                    <p className="text-gray-700 mb-3">
                        Rich text editing tools for formatting your document:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Text formatting (bold, italic, underline)</li>
                        <li>Headings and lists</li>
                        <li>Tables and images</li>
                        <li>Citations and footnotes</li>
                    </ul>
                </div>
            ),
            placement: "bottom",
        },
        {
            target: '[data-tour="find-papers"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">🔍 Find Papers</h3>
                    <p className="text-gray-700 mb-3">
                        Search academic databases for relevant sources! We search across:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-3">
                        <li><strong>Semantic Scholar:</strong> AI-powered search</li>
                        <li><strong>CrossRef:</strong> DOI lookup</li>
                        <li><strong>CORE:</strong> Open access papers</li>
                    </ul>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-900">
                            🎯 <strong>Smart search:</strong> Select text in your document and search for related papers instantly!
                        </p>
                    </div>
                </div>
            ),
            placement: "left",
        },
        {
            target: '[data-tour="ai-copilot"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">🤖 AI Copilot</h3>
                    <p className="text-gray-700 mb-3">
                        Your intelligent writing assistant! Ask questions, get suggestions, and improve your writing.
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Rephrase sentences for clarity</li>
                        <li>Get citation suggestions</li>
                        <li>Ask questions about your content</li>
                        <li>Generate summaries</li>
                    </ul>
                </div>
            ),
            placement: "left",
        },
        {
            target: '[data-tour="originality-check"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">✨ Originality Check</h3>
                    <p className="text-gray-700 mb-3">
                        Ensure your work is authentic and properly cited:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-3">
                        <li><strong>AI Detection:</strong> Identify AI-generated content</li>
                        <li><strong>Plagiarism Check:</strong> Compare against billions of sources</li>
                        <li><strong>Similarity Score:</strong> See overlap with existing work</li>
                    </ul>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <p className="text-sm text-red-900">
                            ⚠️ <strong>Important:</strong> Fix any issues before submitting your work!
                        </p>
                    </div>
                </div>
            ),
            placement: "left",
        },
        {
            target: '[data-tour="citation-audit"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">🎓 Citation Audit</h3>
                    <p className="text-gray-700 mb-3">
                        Verify your citations match your chosen style (APA, MLA, Chicago, etc.):
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-3">
                        <li>Detect formatting errors</li>
                        <li>Verify in-text citations</li>
                        <li>Check reference list completeness</li>
                        <li>Highlight missing citations</li>
                    </ul>
                    <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                        <p className="text-sm text-teal-900">
                            📋 <strong>Best practice:</strong> Run this before final submission!
                        </p>
                    </div>
                </div>
            ),
            placement: "right",
        },
        {
            target: '[data-tour="export-menu"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">💾 Export & Download</h3>
                    <p className="text-gray-700 mb-3">
                        Export your work in multiple formats:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li><strong>PDF:</strong> Professionally formatted</li>
                        <li><strong>Word (DOCX):</strong> Fully editable</li>
                        <li><strong>Originality Report:</strong> Complete analysis</li>
                        <li><strong>Citation List:</strong> References only</li>
                    </ul>
                </div>
            ),
            placement: "bottom",
        },
        {
            target: '[data-tour="focus-mode"]',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">🎯 Focus Mode</h3>
                    <p className="text-gray-700 mb-3">
                        Minimize distractions and focus on writing. Hide all sidebars and tools for a clean, distraction-free workspace.
                    </p>
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <p className="text-sm text-indigo-900">
                            🧘 <strong>Focus tip:</strong> Press <kbd className="px-2 py-1 bg-white border rounded">Esc</kbd> to exit anytime
                        </p>
                    </div>
                </div>
            ),
            placement: "bottom",
        },
        {
            target: "body",
            content: (
                <div>
                    <h2 className="text-2xl font-bold mb-3 text-indigo-600">
                        You're All Set! 🚀
                    </h2>
                    <p className="text-gray-700 mb-4">
                        You now know the essentials to write with confidence using ColabWize!
                    </p>
                    <div className="space-y-3">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                            <p className="font-semibold text-indigo-900 mb-2">Quick Start Checklist:</p>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>✅ Add sources to your library</li>
                                <li>✅ Create an outline</li>
                                <li>✅ Start writing</li>
                                <li>✅ Run citation audit</li>
                                <li>✅ Check originality</li>
                                <li>✅ Export your work</li>
                            </ul>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-900">
                                💡 <strong>Need help?</strong> Click the <strong>?</strong> icon anytime to replay this tour or access help resources.
                            </p>
                        </div>
                    </div>
                </div>
            ),
            placement: "center",
        },
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, action } = data;

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            if (status === STATUS.SKIPPED || action === "skip") {
                onSkip();
            } else {
                onFinish();
            }
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            scrollToFirstStep
            disableScrolling
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: "#fff",
                    backgroundColor: "#fff",
                    overlayColor: "rgba(0, 0, 0, 0.6)",
                    primaryColor: "#6366f1",
                    textColor: "#1f2937",
                    width: 420,
                    zIndex: 10000,
                },
                tooltip: {
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                },
                buttonNext: {
                    backgroundColor: "#6366f1",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                },
                buttonBack: {
                    color: "#6b7280",
                    marginRight: 10,
                    padding: "10px 16px",
                },
                buttonSkip: {
                    color: "#9ca3af",
                    fontSize: 14,
                },
            }}
            locale={{
                back: "Back",
                close: "Close",
                last: "Start Writing!",
                next: "Next",
                skip: "Skip Tour",
            }}
        />
    );
};
