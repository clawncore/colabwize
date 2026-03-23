import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import { useState } from "react";
import WaitlistService from "../../lib/utils/waitlistService";

const AdvancedAnalyticsPage = () => {
  // Mock plan styling classes
  const planDocContentClasses = {
    container: "prose prose-gray max-w-none",
    heading: "text-2xl font-bold text-gray-900 mb-4",
    subheading: "text-xl font-semibold text-gray-800 mb-3",
    paragraph: "text-gray-700 mb-4",
    listItem: "text-gray-700 mb-2",
  };

  const planDocHeadingClasses = "text-3xl font-bold text-gray-900 mb-6";
  const planDocLinkClasses = "text-blue-600 hover:text-blue-800 underline";
  const planCardClasses =
    "bg-white rounded-lg shadow-md p-6 border border-gray-200";

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Send email to backend waitlist service using the proper service
      // Send email to backend waitlist service using the proper service
      const result = await WaitlistService.addToWaitlist({
        featureInterest: ["advanced-analytics"],
        email,
      });

      if (result && result.id) {
        setSubmitStatus({
          type: "success",
          message:
            "Thank you! You have been added to the waitlist. We will notify you when Advanced Analytics launches.",
        });
        setEmail(""); // Clear the email input
      }
    } catch (error) {
      console.error("Error joining waitlist:", error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "There was an error joining the waitlist. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen px-8 ${planDocContentClasses}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <Link
            to="/"
            className={`inline-flex items-center ${planDocLinkClasses} mb-4`}>
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Documentation
          </Link>
          <div className="text-center">
            <h1 className={`text-3xl font-bold mb-2 ${planDocHeadingClasses}`}>
              Advanced Analytics Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Track your writing productivity and improvement over time with
              detailed insights
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 rounded-2xl p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-4">
                Coming Soon
              </div>
              <h1
                className={`text-3xl md:text-4xl font-bold mb-4 ${planDocHeadingClasses}`}>
                Advanced Analytics Dashboard
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Track your writing productivity and improvement over time with
                detailed insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    window.location.href = "#waitlist";
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center">
                  Join Waitlist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  View Demo
                </button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className={`${planCardClasses} p-4 shadow-lg`}>
                <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                <p className="text-center text-sm text-gray-600">
                  Dashboard Preview
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Section */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${planDocHeadingClasses}`}>
            The Challenge
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${planCardClasses} p-6`}>
              <TrendingUp className="h-8 w-8 text-red-500 mb-4" />
              <h3
                className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                No Visibility
              </h3>
              <p className="text-gray-600">
                You don't know if you're improving as a writer or researcher
                because you can't track your progress over time.
              </p>
            </div>
            <div className={`${planCardClasses} p-6`}>
              <Clock className="h-8 w-8 text-red-500 mb-4" />
              <h3
                className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                Time Management
              </h3>
              <p className="text-gray-600">
                Hard to identify your most productive hours and optimize your
                writing schedule for maximum efficiency.
              </p>
            </div>
            <div className={`${planCardClasses} p-6`}>
              <Target className="h-8 w-8 text-red-500 mb-4" />
              <h3
                className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                Goal Tracking
              </h3>
              <p className="text-gray-600">
                No way to set writing goals and track your progress toward
                achieving them consistently.
              </p>
            </div>
          </div>
        </div>

        {/* Solution Section */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${planDocHeadingClasses}`}>
            Our Solution
          </h2>
          <div
            className={`${planCardClasses} p-8 bg-gradient-to-br from-green-50 to-emerald-50`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3
                  className={`text-xl font-semibold mb-4 ${planDocHeadingClasses}`}>
                  Track Your Progress
                </h3>
                <p className="text-gray-600 mb-6">
                  See your writing improvement over time with detailed metrics
                  and visualizations. Identify trends and patterns in your
                  writing habits.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      Daily, weekly, and monthly progress tracking
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      Writing quality improvement metrics
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      Personalized insights and recommendations
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500">
                    Progress Chart Visualization
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${planDocHeadingClasses}`}>
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${planCardClasses} p-6`}>
              <div className="flex items-start">
                <TrendingUp className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                    Writing Velocity
                  </h3>
                  <p className="text-gray-600">
                    Track words per day/week/month with trend analysis to
                    identify your most productive periods.
                  </p>
                </div>
              </div>
            </div>
            <div className={`${planCardClasses} p-6`}>
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                    Productivity Insights
                  </h3>
                  <p className="text-gray-600">
                    Discover your peak writing hours and days to optimize your
                    schedule for maximum output.
                  </p>
                </div>
              </div>
            </div>
            <div className={`${planCardClasses} p-6`}>
              <div className="flex items-start">
                <Target className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                    Quality Metrics
                  </h3>
                  <p className="text-gray-600">
                    Monitor readability scores, citation quality, and
                    originality trends over time.
                  </p>
                </div>
              </div>
            </div>
            <div className={`${planCardClasses} p-6`}>
              <div className="flex items-start">
                <Users className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                    Goal Setting
                  </h3>
                  <p className="text-gray-600">
                    Set personalized writing goals and track your progress with
                    milestone celebrations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${planDocHeadingClasses}`}>
            How It Works
          </h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                  Connect Your Documents
                </h3>
                <p className="text-gray-600">
                  Automatically analyze your existing and new documents to start
                  tracking your writing patterns.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                  AI Analysis
                </h3>
                <p className="text-gray-600">
                  Our AI examines your writing velocity, quality metrics, and
                  productivity patterns.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                  Dashboard Insights
                </h3>
                <p className="text-gray-600">
                  View comprehensive analytics on your personalized dashboard
                  with actionable insights.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">
                4
              </div>
              <div id="waitlist">
                <h3
                  className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                  Set Goals & Improve
                </h3>
                <p className="text-gray-600">
                  Set writing goals and receive personalized recommendations to
                  enhance your skills.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Waitlist Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h2 className={`text-2xl font-bold mb-2 ${planDocHeadingClasses}`}>
              Be Among the First to Try It
            </h2>
            <p className="text-gray-600 mb-6">
              Join our waitlist to get early access to Advanced Analytics when
              it launches in Q1 2025.
            </p>

            {/* Status Message */}
            {submitStatus.type && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  submitStatus.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                {submitStatus.message}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className={`px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}>
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </button>
            </form>

            <p className="text-sm text-gray-500">
              Join 2,341 others on the waitlist
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${planDocHeadingClasses}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3
                className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                Will this work with my existing documents?
              </h3>
              <p className="text-gray-600">
                Yes! Advanced Analytics will automatically analyze your existing
                documents in ColabWize and start tracking your progress from day
                one.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3
                className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                Is this included in my plan?
              </h3>
              <p className="text-gray-600">
                Advanced Analytics is{" "}
                <strong>ONLY available for Researcher plan subscribers</strong>.
                Student and Free users do not have access to this feature.
                Upgrade to Researcher plan to unlock Advanced Analytics.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3
                className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                When exactly will this launch?
              </h3>
              <p className="text-gray-600">
                We're aiming for January 2025. Join the waitlist to get updates
                on our progress and be notified as soon as it's available.
              </p>
            </div>
            <div>
              <h3
                className={`text-lg font-semibold mb-2 ${planDocHeadingClasses}`}>
                Can I export my analytics data?
              </h3>
              <p className="text-gray-600">
                Yes, you'll be able to export your analytics data in CSV format
                for your records or to share with advisors and mentors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsPage;
