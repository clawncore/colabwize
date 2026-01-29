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
                    <h2 className="text-xl font-bold mb-2 text-indigo-600">
                        Welcome to ColabWize! 🚀
                    </h2>
                    <p className="text-gray-700 text-sm">
                        This workspace is your command center for academic writing.
                        Let's quickly show you where the magic happens.
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
                    <h3 className="font-bold text-base mb-1">Your Files & Sources 🗂️</h3>
                    <p className="text-sm text-gray-600">
                        The <strong>Left Rail</strong> is for organization. Manage your documents, upload papers to the **Source Library**, and build your Outline here.
                    </p>
                </div>
            ),
            placement: "right",
        },
        {
            target: '[data-tour="ai-copilot"]', // Targeting one key item in the right rail usually highlights the area
            content: (
                <div>
                    <h3 className="font-bold text-base mb-1">Writing Assistants 🤖</h3>
                    <p className="text-sm text-gray-600">
                        The <strong>Right Rail</strong> is for assistance. Access the **AI Copilot**, run **Citation Audits**, and check **Originality** scores here.
                    </p>
                </div>
            ),
            placement: "left",
        },
        {
            target: '[data-tour="export-menu"]',
            content: (
                <div>
                    <h3 className="font-bold text-base mb-1">Export Your Work 💾</h3>
                    <p className="text-sm text-gray-600">
                        Ready to submit? Download your paper in PDF or Word format, complete with a verified **Authorship Certificate**.
                    </p>
                </div>
            ),
            placement: "bottom",
        },
        {
            target: "body",
            content: (
                <div>
                    <h2 className="text-xl font-bold mb-2 text-indigo-600">
                        You're Ready! ✍️
                    </h2>
                    <p className="text-gray-700 text-sm mb-3">
                        That's it. No more interruptions. Start writing your masterpiece!
                    </p>
                    <div className="bg-blue-50 p-2 rounded border border-blue-100">
                        <p className="text-xs text-blue-800">
                            <strong>Tip:</strong> Need help later? Click the <strong>?</strong> icon.
                        </p>
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
