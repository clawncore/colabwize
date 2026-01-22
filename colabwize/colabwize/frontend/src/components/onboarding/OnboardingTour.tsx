import React from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface OnboardingTourProps {
  run: boolean;
  onFinish: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  run,
  onFinish,
  onSkip,
}) => {
  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">
            Welcome to ColabWize! 🎉
          </h2>
          <p>
            Let's take a quick tour to help you get started with your academic
            writing journey.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="upload-button"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Upload Your First Document</h3>
          <p>
            Click here to upload a document for analysis. We support PDFs, Word
            documents, and more!
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: '[data-tour="feature-cards"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Powerful Analysis Features</h3>
          <p>
            <strong>Originality Scan:</strong> Check for plagiarism and
            similarity
            <br />
            <strong>Citation Confidence:</strong> Verify citation quality
            <br />
            <strong>AI Detection:</strong> Identify AI-generated content
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[data-tour="analytics"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Track Your Progress</h3>
          <p>
            Monitor your document analysis history, trends, and productivity
            with our comprehensive analytics.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[data-tour="upload-button"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Ready to Get Started?</h3>
          <p className="mb-3">
            Upload your first document now to unlock the full power of
            ColabWize!
          </p>
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-900">
              💡 <strong>Tip:</strong> Your first scan is on us! Explore all
              features risk-free.
          </p>
          </div>
        </div>
      ),
      placement: "bottom",
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
      disableScrolling
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: "#fff",
          backgroundColor: "#fff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          primaryColor: "#6366f1",
          textColor: "#1f2937",
          width: 380,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: "#6366f1",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 14,
          fontWeight: 600,
        },
        buttonBack: {
          color: "#6b7280",
          marginRight: 8,
        },
        buttonSkip: {
          color: "#9ca3af",
          fontSize: 14,
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
};
