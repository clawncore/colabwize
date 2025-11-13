import { Helmet } from "react-helmet";
import { BookOpen, Check, ArrowRight } from "lucide-react";

interface CitationGeneratorProps {
    onWaitlistClick: () => void;
}

export default function CitationGenerator({ onWaitlistClick }: CitationGeneratorProps) {
  return (
    <div className="w-full">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Citation Generator - AI-Powered Academic Citation Tool</title>
        <meta name="description" content="Generate accurate citations in APA, MLA, Chicago, and other formats with ColabWize's AI-powered citation generator. Paste a DOI or URL and get perfectly formatted references instantly." />
        <meta name="keywords" content="citation generator, academic citations, apa citation, mla citation, chicago citation, doi citation" />
        <link rel="canonical" href="https://colabwize.com/citation-generator" />

        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ColabWize Citation Generator",
            "description": "AI-powered citation generator that auto-generates citations from DOI or URL in APA, MLA, Chicago, and other formats.",
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
            AI-Powered Citation Generator
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Generate accurate citations in APA, MLA, Chicago, and other formats instantly. Paste a DOI or URL and get perfectly formatted references.
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
          <h2 className="text-3xl font-bold mb-8 text-center">Say Goodbye to Manual Citation Formatting</h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl mb-6">
              ColabWize's Smart Citations feature eliminates the frustration of manual citation formatting. With our AI-powered citation generator, you can:
            </p>

            <ul className="space-y-4 mb-12">
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Auto-generate citations from DOI or URL in seconds</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Support for all major citation styles (APA, MLA, Chicago, and more)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Automatic bibliography and reference list formatting</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Journal-specific templates for precise formatting</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Real-time updates when source information changes</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-12 mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Paste Source</h3>
                <p>Copy and paste a DOI, URL, or other source identifier</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Auto-Generate</h3>
                <p>Our AI instantly fetches source metadata and creates the citation</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Format & Export</h3>
                <p>Choose your style and export directly to your document</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4">Supported Citation Styles</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  APA (7th Edition)
                </h3>
                <p>Perfect for social sciences, education, and psychology papers</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  MLA (9th Edition)
                </h3>
                <p>Ideal for humanities, literature, and language studies</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Chicago (17th Edition)
                </h3>
                <p>Great for history, arts, and business disciplines</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  And Many More
                </h3>
                <p>IEEE, AMA, ACS, and journal-specific formats supported</p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-12">
              <h3 className="text-xl font-bold mb-3">Launching Q1 2025</h3>
              <p className="mb-4">
                ColabWize's citation generator is currently in development and will launch in early 2025. Join our waitlist to be among the first to try it and get exclusive early access pricing.
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
          <h2 className="text-3xl font-bold mb-6">Ready to Save Hours on Citation Formatting?</h2>
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
