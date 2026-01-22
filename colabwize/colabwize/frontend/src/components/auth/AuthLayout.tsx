import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Shield,
  Sparkles,
  FileText,
  CheckCircle,
  Search,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showSidebar?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showSidebar = true,
}) => {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="flex min-h-screen">
        {/* Left Sidebar - Desktop Only */}
        {showSidebar && (
          <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop')",
              }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-purple-900/90 backdrop-blur-sm" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between p-12 text-white">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="/images/Colabwize-logo.png"
                  alt="ColabWize Logo"
                  className="h-12 w-auto"
                />
                <span className="text-xl font-bold text-white">ColabWize</span>
              </Link>

              {/* Main Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold leading-tight text-white">
                    Your Academic Success, Defended.
                  </h1>
                  <p className="text-xl text-blue-200">
                    Transform anxiety into confidence with a platform designed
                    for academic integrity and defensibility.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-green-400" />
                    <span className="text-lg text-gray-200">
                      Trusted by 10,000+ students
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-lg text-gray-200">
                      Academic integrity guaranteed
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-5 w-5 text-green-400" />
                    <span className="text-lg text-gray-200">
                      Prove your work is original
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-green-400" />
                    <span className="text-lg text-gray-200">
                      Citation confidence auditing
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Search className="h-5 w-5 text-green-400" />
                    <span className="text-lg text-gray-200">
                      AI detection protection
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-lg text-gray-200">
                      Authorship certificates
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-blue-200">
                <p className="text-sm">
                  © 2026 ColabWize. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Right Content */}
        <div
          className={cn(
            "flex-1 flex items-center justify-center p-8",
            showSidebar ? "lg:w-3/5 xl:w-1/2" : "w-full"
          )}>
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <Link
                to="/"
                className="inline-flex items-center space-x-3 text-gray-900">
                <img
                  src="/images/Colabwize-logo.png"
                  alt="ColabWize Logo"
                  className="h-8 w-auto text-blue-600"
                />
                <span className="text-xl font-bold">ColabWize</span>
              </Link>
            </div>

            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-500">{title}</h2>
              <p className="text-gray-800 font-medium">{subtitle}</p>
            </div>

            {/* Form Content */}
            <div className="space-y-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
