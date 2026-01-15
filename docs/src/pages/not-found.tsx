import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

/**
 * NotFoundPage Component
 * A detailed mapped 404 error page.
 */
function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="max-w-md w-full space-y-8">
        {/* Error Code & Graphic */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-100 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-900 bg-white px-4">
              Page Not Found
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-gray-600 text-lg">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or never existed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-4">
            Need help finding something?
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/help" className="text-blue-600 hover:underline">
              Help Center
            </Link>
            <Link
              to="/contact-support"
              className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
