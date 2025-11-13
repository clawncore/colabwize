import { Helmet } from "react-helmet";
import { ArrowRight } from "lucide-react";

interface WhatIsColabWizeProps {
    onWaitlistClick: () => void;
}

export default function WhatIsColabWize({ onWaitlistClick }: WhatIsColabWizeProps) {
  return (
    <div className="w-full">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>What is ColabWize - Academic Writing Platform</title>
        <meta name="description" content="ColabWize is an academic platform offering AI citation generation, plagiarism checking, and team collaboration. Learn how it helps students and researchers write smarter, cite faster, and check originality." />
        <meta name="keywords" content="what is ColabWize, academic writing platform, citation tool, plagiarism checker, collaboration tool" />
        <link rel="canonical" href="https://colabwize.com/what-is-colabwize" />

        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ColabWize",
            "description": "An academic platform offering AI citation generation, plagiarism checking, and team collaboration.",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ColabWize",
            "url": "https://colabwize.com/",
            "logo": "https://colabwize.com/logo.png",
            "description": "An academic platform offering AI citation generation, plagiarism checking, and team collaboration."
          })}
        </script>
      </Helmet>

      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            What is ColabWize?
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            An academic platform offering AI citation generation, plagiarism checking, and team collaboration.
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
          <h2 className="text-3xl font-bold mb-8 text-center">Academic Writing, Simplified</h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl mb-6">
              ColabWize is an all-in-one academic writing platform designed to help students and researchers write smarter, cite faster, and check originality — all in one beautiful workspace.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
            <p className="mb-6">
              We believe great ideas shouldn't be blocked by tool overload, high costs, or limited access. That's why ColabWize is designed to be affordable, accessible, and AI-powered — leveling the academic playing field for everyone.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">Key Features</h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>AI Writing Assistant:</strong> Write like a pro with instant grammar fixes, tone improvements, and idea expansion.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>Plagiarism Detection:</strong> Scan your work against billions of sources and get a clear originality score.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>Smart Citations:</strong> Auto-generate citations from DOI or URL in APA, MLA, Chicago, or journal-specific formats.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>Real-time Collaboration:</strong> Work together with classmates in real-time with live cursor tracking and inline comments.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>Project Dashboard:</strong> Keep deadlines under control with visual project organization and word count goals.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span><strong>Export Anywhere:</strong> Turn your work into polished outputs in DOCX, PDF, LaTeX, or journal-ready templates.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-12 mb-4">Who Is It For?</h2>
            <p className="mb-6">
              ColabWize is built for students, researchers, and academics who want to:
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span>Save time on formatting and citations</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span>Ensure academic integrity with plagiarism checking</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span>Collaborate effectively with peers and advisors</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <span>Focus on ideas rather than tool switching</span>
              </li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-12">
              <h3 className="text-xl font-bold mb-3">Launching Q1 2025</h3>
              <p className="mb-4">
                ColabWize is currently in development and will launch in early 2025. Join our waitlist to be among the first to try it and get exclusive early access pricing.
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
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Academic Writing?</h2>
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
