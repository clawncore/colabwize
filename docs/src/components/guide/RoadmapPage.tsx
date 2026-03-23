import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Calendar,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";

const RoadmapPage = () => {
  const [votedFeatures, setVotedFeatures] = useState<string[]>([]);

  const handleVote = (featureId: string) => {
    if (votedFeatures.includes(featureId)) {
      setVotedFeatures(votedFeatures.filter((id) => id !== featureId));
    } else {
      setVotedFeatures([...votedFeatures, featureId]);
    }
  };

  const roadmapFeatures = [
    {
      id: "advanced-analytics",
      title: "Advanced Analytics Dashboard",
      description:
        "Track your writing progress, productivity trends, and improvement over time",
      status: "in-progress",
      progress: 75,
      expectedLaunch: "Q1 2025",
      votes: 456,
      category: "Productivity",
      features: [
        "Writing velocity tracking",
        "Productivity insights",
        "Quality metrics",
        "Goal setting",
      ],
    },
    {
      id: "templates-marketplace",
      title: "Templates Marketplace",
      description:
        "Browse thousands of templates for research papers, essays, and more",
      status: "planned",
      progress: 10,
      expectedLaunch: "Q1 2025",
      votes: 1234,
      category: "Content",
      features: [
        "Template library",
        "Free and premium options",
        "Community submissions",
        "Custom template creation",
      ],
    },
    {
      id: "study-groups",
      title: "Study Groups",
      description:
        "Create study groups, share notes, and collaborate with classmates",
      status: "planned",
      progress: 5,
      expectedLaunch: "Q2 2025",
      votes: 678,
      category: "Collaboration",
      features: [
        "Group scheduling",
        "Shared note libraries",
        "Group chat",
        "Task assignments",
      ],
    },
    {
      id: "mobile-apps",
      title: "Mobile Apps",
      description: "Native iOS and Android apps for writing on the go",
      status: "consideration",
      progress: 0,
      expectedLaunch: "Q2 2025",
      votes: 2156,
      category: "Platform",
      features: [
        "Native iOS app",
        "Native Android app",
        "Offline editing",
        "Push notifications",
      ],
    },
    {
      id: "advanced-ai",
      title: "Advanced AI Features",
      description: "More sophisticated AI writing and research tools",
      status: "consideration",
      progress: 0,
      expectedLaunch: "Q2 2025",
      votes: 1843,
      category: "AI Features",
      features: [
        "AI outline generator",
        "Research question generator",
        "Hypothesis formulation",
        "Methodology suggestions",
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            In Progress
          </span>
        );
      case "planned":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Planned
          </span>
        );
      case "consideration":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Under Consideration
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen px-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documentation
        </Link>
      </div>
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Roadmap</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          See what we're working on, what's coming next, and help us prioritize
          upcoming features by voting on what matters most to you.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">2,341</div>
          <div className="text-gray-600">Community Members</div>
        </div>
        <div className="rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
          <div className="text-gray-600">Features Building</div>
        </div>
        <div className="rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">45</div>
          <div className="text-gray-600">Feature Requests</div>
        </div>
        <div className="rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">89%</div>
          <div className="text-gray-600">Satisfaction Rate</div>
        </div>
      </div>

      {/* Feature Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Upcoming Features</h2>

        <div className="space-y-6">
          {roadmapFeatures.map((feature) => (
            <div key={feature.id} className="rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    {getStatusBadge(feature.status)}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {feature.category}
                    </span>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {feature.votes} votes
                  </div>
                  <button
                    onClick={() => handleVote(feature.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                      votedFeatures.includes(feature.id)
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}>
                    <Star
                      className={`h-4 w-4 mr-2 ${
                        votedFeatures.includes(feature.id) ? "fill-current" : ""
                      }`}
                    />
                    {votedFeatures.includes(feature.id) ? "Voted" : "Vote"}
                  </button>
                </div>
              </div>

              {feature.status === "in-progress" && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{feature.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${feature.progress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Expected: {feature.expectedLaunch}
                </div>

                <div className="flex flex-wrap gap-2">
                  {feature.features.slice(0, 3).map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      {item}
                    </span>
                  ))}
                  {feature.features.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      +{feature.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Feature */}
      <div className="bg-white border-b border-gray-200 rounded-xl p-8 mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Have an idea?</h2>
          <p className="text-gray-600 mb-6">
            Don't see what you're looking for? Tell us about the features you'd
            like to see in ColabWize.
          </p>
          <Link
            to="/feature-request"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
            Request a Feature
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Beta Program */}
      <div className="rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-16 h-16 rounded-xl flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Beta Program</h3>
            <p className="text-gray-600 mb-4">
              Get early access to new features and help shape the future of
              ColabWize. Beta testers get priority access and direct input on
              feature development.
            </p>
            <Link
              to="/beta-program"
              className="hover:text-blue-700 font-medium">
              Learn more about the Beta Program
            </Link>
          </div>
          <div>
            <Link
              to="/beta-program"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
              Join Beta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
