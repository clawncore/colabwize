import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-gray-600 to-green-600"
            onClick={() => window.history.back()}>
            <button>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </button>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Looking for something? Try these:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/features"
              className="text-blue-600 hover:text-blue-700 hover:underline">
              Features
            </Link>
            <Link
              to="/solutions/originality-map"
              className="text-blue-600 hover:text-blue-700 hover:underline">
              Originality Map
            </Link>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-700 hover:underline">
              Contact Us
            </Link>
            <Link
              to="/company/faq"
              className="text-blue-600 hover:text-blue-700 hover:underline">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
