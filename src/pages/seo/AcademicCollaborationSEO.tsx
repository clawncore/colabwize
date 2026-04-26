import React from "react";
import {
  Users,
  MessageSquare,
  LayoutDashboard,
  Share2,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

const AcademicCollaborationSEO = () => {
  return (
    <>
      <div className="bg-white min-h-screen">
        {/* Feature Hero */}
        <section className="bg-purple-50/30 py-24 border-b border-purple-100">
          <div className="container-custom relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-6">
                <Users className="h-4 w-4" /> Feature: Academic Collaboration
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
                Built for{" "}
                <span className="text-purple-600">Research Teams</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                Stop fighting with version control and fragmented feedback.
                ColabWize provides a unified workspace where teams can write,
                cite, and defend their work together in real-time.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-7 rounded-xl font-bold shadow-xl shadow-purple-500/20"
                  asChild>
                  <Link to="/signup">Start Your Team Workspace</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="section-padding py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <Share2 className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-xl mb-3">Live Co-Authoring</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Experience zero-latency editing with peers. See every change
                  as it happens.
                </p>
              </div>

              <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                  <LayoutDashboard className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-bold text-xl mb-3">Unified Dashboard</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Manage multiple research projects and teams from a single,
                  intuitive interface.
                </p>
              </div>

              <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="font-bold text-xl mb-3">In-Editor Chat</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Keep project discussions where they belong—right next to the
                  content.
                </p>
              </div>

              <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-xl mb-3">Contribution Logs</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Automatically track who wrote what, ensuring full transparency
                  in group submissions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 bg-gray-900 text-white rounded-t-[4rem]">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              The Future of Research is Collaborative.
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
              ColabWize is the complete toolkit for integrity-first academic
              collaboration. Start your first project in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                className="bg-white text-black hover:bg-gray-100 px-12 py-8 rounded-full font-black text-xl"
                asChild>
                <Link to="/signup">CREATE YOUR TEAM</Link>
              </Button>
              <Link
                to="/academic-integrity-platform"
                className="text-blue-400 font-bold hover:underline inline-flex items-center gap-2">
                Learn about Integrity Assets <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AcademicCollaborationSEO;
