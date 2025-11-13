import { Helmet } from "react-helmet";
import { Shield, Check, ArrowRight } from "lucide-react";

interface PlagiarismCheckerProps {
    onWaitlistClick: () => void;
}

export default function PlagiarismChecker({ onWaitlistClick }: PlagiarismCheckerProps) {
  return (
    <div className="w-full">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Plagiarism Checker - AI-Powered Originality Detection</title>
        <meta name="description" content="Ensure academic integrity with ColabWize's AI-powered plagiarism checker. Scan your work against billions of sources and get detailed originality reports before submission." />
        <meta name="keywords" content="plagiarism checker, originality detection, academic integrity, plagiarism detection, ai plagiarism checker" />
        <link rel="canonical" href="https://colabwize.com/plagiarism-checker" />

        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ColabWize Plagiarism Checker",
            "description": "AI-powered plagiarism detection that scans your work against billions of sources and provides detailed originality reports.",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI-Powered Plagiarism Checker
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Ensure academic integrity with comprehensive originality detection. Scan your work against billions of sources and get detailed reports before submission.
          </p>
          <button
            onClick={onWaitlistClick}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold inline-flex items-center space-x-2"
          >
            <span>Join Waitlist</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Submit with Confidence</h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl mb-6">
              ColabWize's advanced plagiarism detection system helps you maintain academic integrity by scanning your work against billions of sources and providing comprehensive originality reports.
            </p>

            <ul className="space-y-4 mb-12">
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Scan against billions of web sources, academic papers, and publications</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Clear originality percentage with detailed source attribution</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Highlighted similar text passages for quick identification</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Comprehensive reports with citation suggestions</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Multi-language support for international research</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-12 mb-4">How Our Plagiarism Detection Works</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Upload Document</h3>
                <p>Paste or upload your academic work directly to the platform</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Deep Scan</h3>
                <p>Our AI compares your text against billions of sources in real-time</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Detailed Report</h3>
                <p>Receive a comprehensive originality report with actionable insights</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Comprehensive Database
                </h3>
                <p>Access to billions of web pages, academic journals, and publications</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Real-time Scanning
                </h3>
                <p>Instant results as you write with our live document monitoring</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Detailed Reports
                </h3>
                <p>Visual similarity reports with source attribution and citation suggestions</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Multi-format Support
                </h3>
                <p>Works with DOCX, PDF, TXT, and other common academic formats</p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-12">
              <h3 className="text-xl font-bold mb-3">Launching Q1 2025</h3>
              <p className="mb-4">
                ColabWize's plagiarism checker is currently in development and will launch in early 2025. Join our waitlist to be among the first to try it and get exclusive early access pricing.
              </p>
              <button
                onClick={onWaitlistClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ensure Academic Integrity with Confidence</h2>
          <p className="text-xl text-gray-700 mb-8">
            Join thousands of students and researchers preparing for launch.
          </p>
          <button
            onClick={onWaitlistClick}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg inline-flex items-center space-x-2"
          >
            <span>Join Waitlist</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
