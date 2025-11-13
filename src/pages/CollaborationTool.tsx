import { Helmet } from "react-helmet";
import { Users, Check, ArrowRight } from "lucide-react";

interface CollaborationToolProps {
    onWaitlistClick: () => void;
}

export default function CollaborationTool({ onWaitlistClick }: CollaborationToolProps) {
  return (
    <div className="w-full">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Collaboration Tool - Real-time Academic Writing Platform</title>
        <meta name="description" content="Work together in real-time with ColabWize's collaboration tool. Share projects, add comments, and see who's editing with features built specifically for academic writing." />
        <meta name="keywords" content="academic collaboration, real-time collaboration, research collaboration, student collaboration, team writing tool" />
        <link rel="canonical" href="https://colabwize.com/collaboration-tool" />

        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ColabWize Collaboration Tool",
            "description": "Real-time collaboration platform for academic writing with live cursor tracking, inline comments, and role-based permissions.",
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
            Real-time Academic Collaboration
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Work together in real-time with classmates and advisors. Share projects, add comments, and see who's editing with features built specifically for academic writing.
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
          <h2 className="text-3xl font-bold mb-8 text-center">Collaborate Smarter, Not Harder</h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl mb-6">
              ColabWize's collaboration features are designed specifically for academic work, making it easy to work together on research papers, theses, and group projects without the limitations of general-purpose tools.
            </p>

            <ul className="space-y-4 mb-12">
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Live cursor tracking to see where teammates are working</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Inline comments and suggestions for detailed feedback</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Share via link or email with customizable permissions</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Role-based access control for advisors and collaborators</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span>Version history to track changes and revert when needed</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-12 mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Create Project</h3>
                <p>Start a new research project or upload existing work</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Invite Collaborators</h3>
                <p>Share via link or email with customizable permissions</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Collaborate in Real-time</h3>
                <p>Work together with live editing, comments, and tracking</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Live Editing
                </h3>
                <p>See changes in real-time as collaborators type and edit</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Comment System
                </h3>
                <p>Add inline comments and resolve discussions as you work</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Access Control
                </h3>
                <p>Set permissions for view-only, comment, or edit access</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Version History
                </h3>
                <p>Track all changes and revert to previous versions when needed</p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-12">
              <h3 className="text-xl font-bold mb-3">Launching Q1 2025</h3>
              <p className="mb-4">
                ColabWize's collaboration tool is currently in development and will launch in early 2025. Join our waitlist to be among the first to try it and get exclusive early access pricing.
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
          <h2 className="text-3xl font-bold mb-6">Transform How You Work with Others</h2>
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
