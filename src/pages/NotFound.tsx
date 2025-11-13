import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

interface NotFoundProps {
    onWaitlistClick: () => void;
}

export default function NotFound({ onWaitlistClick }: NotFoundProps) {
  return (
    <div className="w-full bg-white">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Page Not Found - ColabWize</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to our homepage or join our waitlist for updates." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-9xl font-bold text-blue-600 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>

            <button
              onClick={onWaitlistClick}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Join Waitlist
            </button>
          </div>

          <div className="mt-8">
            <Link
              to="/help"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Visit our Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
