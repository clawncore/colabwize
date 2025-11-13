import {
  ThumbsUp,
  ArrowRight,
  Check,
  Download,
  PenTool,
  Shield,
  Users,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FEATURES } from "../lib/mockData";
import { supabase } from "../lib/supabaseClient";

interface FeaturesProps {
  onWaitlistClick: () => void;
}

export default function Features({ onWaitlistClick }: FeaturesProps) {
  const [votes, setVotes] = useState<Record<string, number>>(
    FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: f.votes }), {})
  );
  const [votedFeatures, setVotedFeatures] = useState<Set<string>>(new Set());
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const { count, error } = await supabase
          .from("waitlist")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching waitlist count:", error);
          return;
        }

        setWaitlistCount(count || 0);
      } catch (err) {
        console.error("Unexpected error fetching waitlist count:", err);
      }
    };

    fetchWaitlistCount();
  }, []);

  const handleVote = async (featureId: string) => {
    const email = prompt("Please enter your email to vote for this feature:");
    if (!email) return;

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (votedFeatures.has(featureId)) {
      alert("You have already voted for this feature!");
      return;
    }

    try {
      // Simulate API call to record vote
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update vote count
      setVotes(prev => ({
        ...prev,
        [featureId]: (prev[featureId] || 0) + 1
      }));

      // Add to voted features set
      const newVotedFeatures = new Set(votedFeatures);
      newVotedFeatures.add(featureId);
      setVotedFeatures(newVotedFeatures);

      alert("Thank you for your vote!");
    } catch (err) {
      console.error("Unexpected error during voting:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>ColabWize Features - Academic Writing Tools</title>
        <meta name="description" content="Explore powerful features coming to ColabWize: AI Writing Assistant, Plagiarism Detection, Smart Citations, Real-time Collaboration, Project Dashboard, and Export Anywhere." />
        <meta name="keywords" content="academic writing features, AI writing assistant, plagiarism detection, citation tool, collaboration tool, research tools" />
        <link rel="canonical" href="https://colabwize.com/features" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://colabwize.com/features" />
        <meta property="og:title" content="ColabWize Features - Academic Writing Tools" />
        <meta property="og:description" content="Explore powerful features coming to ColabWize: AI Writing Assistant, Plagiarism Detection, Smart Citations, Real-time Collaboration, Project Dashboard, and Export Anywhere." />
        <meta property="og:image" content="https://colabwize.com/preview.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://colabwize.com/features" />
        <meta property="twitter:title" content="ColabWize Features - Academic Writing Tools" />
        <meta property="twitter:description" content="Explore powerful features coming to ColabWize: AI Writing Assistant, Plagiarism Detection, Smart Citations, Real-time Collaboration, Project Dashboard, and Export Anywhere." />
        <meta property="twitter:image" content="https://colabwize.com/preview.jpg" />

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
      </Helmet>

      <section className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-purple-50 py-20 overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop')",
            zIndex: 0,
          }}
        ></div>

        <div
          className="absolute inset-0 bg-black/20"
          style={{ zIndex: 1 }}
        ></div>

        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ zIndex: 2 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Everything You Need to Write Smarter, Not Harder
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              ColabWize is more than a tool—it's your personal academic
              co-pilot. From brainstorming ideas to polishing citations, every
              feature is designed to save you time, reduce stress, and boost
              confidence in your work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onWaitlistClick}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold inline-flex items-center justify-center space-x-2"
              >
                <span>Join Waitlist to Try These Features First</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("features-list")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                Explore All Features
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="features-list" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Coming Q1 2025
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-5xl">
                    <PenTool size={32} />
                  </div>
                  <h2 className="text-4xl font-bold">AI Writing Assistant</h2>
                </div>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  Write like a pro with instant grammar fixes, tone
                  improvements, and idea expansion—all inside your editor. No
                  more switching between tabs.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time grammar and spelling corrections</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Tone and style suggestions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Sentence restructuring recommendations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Academic vocabulary enhancement</span>
                  </li>
                </ul>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote("ai-writing")}
                    disabled={votedFeatures.has("ai-writing")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${votedFeatures.has("ai-writing")
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>
                      {votedFeatures.has("ai-writing")
                        ? "Voted"
                        : "Vote for Priority"}
                    </span>
                  </button>
                  <span className="text-gray-600">
                    {votes["ai-writing"]} people want this first
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 h-80 flex items-center justify-center overflow-hidden">
                <img
                  src="https://typli.ai/_next/image?url=https%3A%2F%2Fa-us.storyblok.com%2Ff%2F1016756%2F1248x600%2F05bdb40c99%2Ftypli-2.jpg&w=1200&q=75"
                  alt="AI Writing Assistant in action"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-white rounded-2xl p-4 h-80 flex items-center justify-center overflow-hidden">
                <img
                  src="https://cdn.prod.website-files.com/60ef088dd8fef99352abb434/665f13d2aea32bb283d3c589_Top%2011%20Best%20Plagiarism%20Checkers%20For%20AI-Generated%20Content.webp"
                  alt="Plagiarism Detection in action"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Coming Q1 2025
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-5xl">
                    <Shield size={32} />
                  </div>
                  <h2 className="text-4xl font-bold">Plagiarism Detection</h2>
                </div>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  Submit with confidence. Scan your work against billions of
                  sources and get a clear originality score before your
                  professor does.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Scan against billions of web sources</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Clear originality percentage</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Highlighted similar text passages</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Detailed source attribution</span>
                  </li>
                </ul>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote("plagiarism")}
                    disabled={votedFeatures.has("plagiarism")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${votedFeatures.has("plagiarism")
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                      }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>
                      {votedFeatures.has("plagiarism")
                        ? "Voted"
                        : "Vote for Priority"}
                    </span>
                  </button>
                  <span className="text-gray-600">
                    {votes["plagiarism"]} people want this first
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Coming Q1 2025
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-5xl">
                    <BookOpen size={32} />
                  </div>
                  <h2 className="text-4xl font-bold">Smart Citations</h2>
                </div>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  No more formatting headaches. Paste a DOI or link and get
                  perfectly styled references—APA, MLA, Chicago, or even
                  journal-specific formats.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Auto-generate citations from DOI or URL</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Support for all major citation styles</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automatic bibliography formatting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Journal-specific templates</span>
                  </li>
                </ul>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote("citations")}
                    disabled={votedFeatures.has("citations")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${votedFeatures.has("citations")
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>
                      {votedFeatures.has("citations")
                        ? "Voted"
                        : "Vote for Priority"}
                    </span>
                  </button>
                  <span className="text-gray-600">
                    {votes["citations"]} people want this first
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 h-80 flex items-center justify-center overflow-hidden">
                <img
                  src="https://blog.f1000.com/wp-content/uploads/2017/12/F1000_work_smartcitations-1.jpg"
                  alt="Smart Citations in action"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-white rounded-2xl p-4 h-80 flex items-center justify-center overflow-hidden">
                <img
                  src="https://i.ytimg.com/vi/nMzPvQqISyw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLA5ZTyF0ypgbA1f3oXmJ7dn4_VLXw"
                  alt="Real-time Collaboration in action"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Coming Q1 2025
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-5xl">
                    <Users size={32} />
                  </div>
                  <h2 className="text-4xl font-bold">
                    Real-time Collaboration
                  </h2>
                </div>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  Work together in real time. Share projects, add comments, and
                  see who's editing—just like Google Docs, but built for
                  academics.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Live cursor tracking</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Inline comments and suggestions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Share via link or email</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Role-based permissions</span>
                  </li>
                </ul>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote("collaboration")}
                    disabled={votedFeatures.has("collaboration")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${votedFeatures.has("collaboration")
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                      }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>
                      {votedFeatures.has("collaboration")
                        ? "Voted"
                        : "Vote for Priority"}
                    </span>
                  </button>
                  <span className="text-gray-600">
                    {votes["collaboration"]} people want this first
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Coming Q1 2025
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-5xl">
                    <BarChart3 size={32} />
                  </div>
                  <h2 className="text-4xl font-bold">Project Dashboard</h2>
                </div>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  Keep deadlines under control. Manage projects, track word
                  count, and hit milestones with a dashboard built for students
                  and researchers.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Visual project organization</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Deadline tracking and reminders</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Word count goals and progress</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Activity history</span>
                  </li>
                </ul>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote("dashboard")}
                    disabled={votedFeatures.has("dashboard")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${votedFeatures.has("dashboard")
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                      }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>
                      {votedFeatures.has("dashboard")
                        ? "Voted"
                        : "Vote for Priority"}
                    </span>
                  </button>
                  <span className="text-gray-600">
                    {votes["dashboard"]} people want this first
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 h-80 flex items-center justify-center overflow-hidden">
                <img
                  src="https://www.projectmanager.com/wp-content/uploads/2023/10/Project-Dashboard-Template-Excel-image.png"
                  alt="Project Dashboard in action"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-white rounded-2xl p-4 h-80 flex items-center justify-center overflow-hidden">
                <img
                  src="https://etimg.etb2bimg.com/photo/123882794.cms"
                  alt="Export Anywhere in action"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Coming Q1 2025
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-5xl">
                    <Download size={32} />
                  </div>
                  <h2 className="text-4xl font-bold">Export Anywhere</h2>
                </div>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  Turn your hard work into polished outputs. Export to Word,
                  PDF, LaTeX, or journal-ready templates with one click.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Export to DOCX, PDF, LaTeX</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Journal-specific templates</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Preserve formatting and citations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Batch export multiple documents</span>
                  </li>
                </ul>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote("export")}
                    disabled={votedFeatures.has("export")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${votedFeatures.has("export")
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-teal-100 text-teal-600 hover:bg-teal-200"
                      }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>
                      {votedFeatures.has("export")
                        ? "Voted"
                        : "Vote for Priority"}
                    </span>
                  </button>
                  <span className="text-gray-600">
                    {votes["export"]} people want this first
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Built to Help You Succeed at Every Stage
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            From your first essay to your final thesis, ColabWize grows
            with you. Simple enough for students. Powerful enough for
            researchers. <Link to="/pricing" className="text-blue-600 hover:underline">See our pricing plans</Link> or
            <Link to="/what-is-colabwize" className="text-blue-600 hover:underline ml-1">learn more about ColabWize</Link>.
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
