import React from "react";
import PageMetadata from "../../../components/PageMetadata";
import { Button } from "../../../components/ui/button";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  FileCheck,
  ArrowRight,
} from "lucide-react";

const ResearchOrganizer = () => {
  return (
    <>
      <PageMetadata
        title="Research Paper Organizer & Management Tool"
        description="Organize your research papers, notes, and citations in one powerful workspace. Collaborate with teams and manage your academic bibliography seamlessly."
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-emerald-50/30">
          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Research Paper{" "}
                <span className="text-emerald-600">Organizer</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                The centralized hub for your academic journey. Manage sources,
                collaborate with peers, and build your bibliography in one
                unified workspace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-8 text-lg font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all">
                  <Link to="/signup" className="flex items-center">
                    Get Organized <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button className="h-14 px-8 text-lg font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all">
                  <Link to="/features">Tour the Workspace</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-100/10 -skew-x-12 translate-x-1/4 hidden lg:block" />
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Designed for Researchers, by Researchers
                </h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <LayoutDashboard className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Central Library
                      </h3>
                      <p className="text-slate-600">
                        Store all your PDFs and sources in one searchable vault
                        with automatic metadata extraction.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Team Collaboration
                      </h3>
                      <p className="text-slate-600">
                        Share libraries with teammates, leave comments, and
                        co-author papers in real-time.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Timeline Tracking
                      </h3>
                      <p className="text-slate-600">
                        View the history of your research edits to provide proof
                        of human authorship.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Audit Trail</h3>
                      <p className="text-slate-600">
                        Generate a defensibility report that validates the
                        integrity of your entire project.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-100 rounded-3xl aspect-square flex items-center justify-center p-12 border border-slate-200 shadow-inner">
                <div className="text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-slate-500 font-medium">
                    Visual Workspace Preview
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Manage thousands of papers effortlessly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Section */}
        <section className="py-24 border-t border-slate-100">
          <div className="container-custom rounded-[3rem] bg-slate-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent" />
            <div className="relative z-10 p-12 md:p-20 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Start Organizing Today
              </h2>
              <p className="text-emerald-100/70 text-lg mb-10 max-w-2xl mx-auto">
                No more scattered folders or lost citations. Bring order to your
                research with the world's first defensible academic workspace.
              </p>
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-white h-14 px-10 text-lg font-bold rounded-xl transition-all">
                <Link to="/signup">Build My Library</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ResearchOrganizer;
