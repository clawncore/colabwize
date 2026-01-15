import { Link } from "react-router-dom";
import { ArrowLeft, LayoutTemplate, CheckCircle, Bell } from "lucide-react";

/**
 * TemplatesPage Component
 *
 * A "Coming Soon" page for the upcoming Templates Marketplace feature.
 */
const TemplatesPage = () => {
  const features = [
    "Academic paper formats (APA, MLA, Chicago)",
    "Thesis & Dissertation structures",
    "Grant proposal frameworks",
    "CV & Resume builders",
    "Community-contributed templates",
  ];

  return (
    <div className="min-h-screen px-8">
      {/* Header */}
      <div className="mb-8 pt-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documentation
        </Link>
      </div>

      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800 mb-6">
          <LayoutTemplate className="h-4 w-4 mr-2" />
          Coming Soon
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Templates Marketplace
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Jumpstart your writing with thousands of professionally designed
          templates for research papers, essays, proposals, and more.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              window.open("https://discord.gg/kg9T6v9e", "_blank");
            }}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20">
            <Bell className="h-5 w-5 mr-2" />
            Notify Me When It Launches
          </button>
          <Link
            to="/roadmap"
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
            View on Roadmap
          </Link>
        </div>
      </div>

      {/* Preview Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">Planned Capabilities</h2>
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-pink-500 rounded-2xl opacity-5 blur-2xl transform rotate-3"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8 h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutTemplate className="h-10 w-10 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Interactive Demo
              </h3>
              <p className="text-gray-500">Preview coming shortly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
