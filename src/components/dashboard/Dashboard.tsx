import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart as BarChartIcon,
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
  Crown,
  FileSearch,
  Lock,
  Upload,
  AlertTriangle,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

import { documentService, Project } from "../../services/documentService";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { OnboardingTour } from "../onboarding/OnboardingTour";
import { DocumentUploadModal } from "./DocumentUploadModal";
import AnalyticsService, { type DashboardData } from "../../services/analyticsService";
import { useAuth } from "../../hooks/useAuth";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useSubscriptionStore } from "../../stores/useSubscriptionStore";
import { extractTextFromContent } from "../../utils/documentUtils";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shouldShowTour, completeOnboarding, skipOnboarding, loading: onboardingLoading } = useOnboarding();
  // Use global subscription store for accurate plan status
  // Use global subscription store for accurate plan status
  const { plan, loading: subscriptionLoading, status: subscriptionStatus } = useSubscriptionStore();

  // const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [connectionError, setConnectionError] = useState(false); // New Error State
  const [isRetrying, setIsRetrying] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    originalityScore: undefined,
    citationStatus: undefined,
    authorshipVerified: undefined,
  });
  // const [loading, setLoading] = useState(true);
  // const [uploadingProject, setUploadingProject] = useState(false);
  const [latestProject, setLatestProject] = useState<Project | null>(null);


  // Memoize data to prevent re-renders
  const documentTrendData = React.useMemo(() => [
    { name: 'Jan', documents: 4 },
    { name: 'Feb', documents: 3 },
    { name: 'Mar', documents: 2 },
    { name: 'Apr', documents: 6 },
    { name: 'May', documents: 8 },
    { name: 'Jun', documents: 9 },
    { name: 'Jul', documents: 12 },
  ], []);

  // Helper to ensure consistency with sidebar logic
  const userPlan = plan || 'free';

  const handleUpgradeClick = () => {
    navigate("/pricing");
  };

  const fetchLatestProject = React.useCallback(async () => {
    if (!user) return;
    try {
      const response = await documentService.getProjects();
      if (response.success && response.data && response.data.length > 0) {
        // Sort by updated_at desc just in case, though API usually does it
        const sorted = [...response.data].sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setLatestProject(sorted[0]);
      }
    } catch (err) {
      console.error("Error fetching latest project", err);
    }
  }, [user]);

  const fetchDashboardData = React.useCallback(async () => {
    if (!user) return; // Don't fetch if no user

    try {
      setConnectionError(false);
      const data = await AnalyticsService.getDashboardData();

      // Only update state if data actually changed or is different (deep compare would be better but this helps)
      setDashboardData(prev => ({ ...prev, ...data }));

      await fetchLatestProject();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setConnectionError(true); // Trigger Error UI

      // Set default values if there's an error
      setDashboardData({
        originalityScore: undefined,
        citationStatus: undefined,
        authorshipVerified: undefined,
      });
    } finally {
      setIsRetrying(false);
    }
  }, [user, fetchLatestProject]); // Depend on user

  const handleRetry = () => {
    setIsRetrying(true);
    fetchDashboardData();
    // Also retry other fetches if needed
    // fetchLatestProject();
  };

  const handleContentReady = async (content: string, title: string, filename?: string) => {
    try {
      setShowUploadModal(false);
      const result = await documentService.createProject(title, "", content);

      if (result.success && result.data) {
        navigate(`/dashboard/editor/${result.data.id}`);
      } else {
        console.error("Failed to create project:", result.error);
        alert("Failed to create project: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, user]);

  if (subscriptionLoading || subscriptionStatus === 'unknown') {
    return (
      <div className="p-6 animate-pulse">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-4 w-96 bg-gray-100 rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="h-40 bg-gray-100 rounded-2xl"></div>
          <div className="h-40 bg-gray-100 rounded-2xl"></div>
          <div className="h-40 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // ... (fetchLatestProject and others) ...

  // Render Error State
  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Service Temporarily Unavailable
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            We're having trouble connecting to the database. Your documents are safe, but we can't load them right now.
          </p>

          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Retrying...
              </>
            ) : (
              "Retry Connection"
            )}
          </button>

          <p className="mt-6 text-xs text-gray-400">
            Error details: Network error - please check your connection and try again
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start gap-4">
          {/* Animated Logo Box */}

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome to your ColabWize dashboard. Access all your tools and
              documents from here.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            data-tour="upload-button"
            onClick={() => navigate("/dashboard/documents")}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload
          </button>
          {!['researcher', 'student'].some(p => userPlan.toLowerCase().includes(p)) && (
            <button
              onClick={handleUpgradeClick}
              className="flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-sm font-bold rounded-lg hover:from-amber-500 hover:to-amber-700 active:bg-amber-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Crown className="w-3.5 h-3.5 mr-1.5 text-amber-100" />
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Latest Activity Section - Professional Split Layout */}
      {latestProject && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden ring-1 ring-gray-50 flex flex-col lg:flex-row">

            {/* Left: Document Context & Visual Preview (65% width) */}
            <div className="lg:w-[65%] p-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gradient-to-br from-white to-gray-50/30 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Latest Activity
                  </span>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {new Date(latestProject.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  to={`/dashboard/editor/${latestProject.id}`}
                  className="group flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
                  Open in Editor
                  <BookOpen className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                  <FileSearch className="w-7 h-7 text-indigo-600 mr-3" />
                  <span className="truncate">{latestProject.title}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2 max-w-2xl">
                  {latestProject.description || "No description provided. Click to resume editing and add more details to your project analysis."}
                </p>
              </div>

              {/* Reduced Height Visual Page Preview */}
              <div className="relative mt-auto">
                <div className="bg-white p-6 rounded-t-xl shadow-sm border-x border-t border-gray-200 h-40 overflow-hidden relative mx-2">
                  <div className="text-sm text-gray-700 leading-relaxed font-serif opacity-80 whitespace-pre-wrap">
                    {extractTextFromContent(latestProject.content, 400) || (
                      <span className="italic text-gray-400">No content available for preview.</span>
                    )}
                  </div>
                  {/* Gradient Fade to connect with button area */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white"></div>
                </div>

                {/* Action Bar overlaying the bottom of preview */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
                  <Link
                    to={`/dashboard/editor/${latestProject.id}`}
                    className="inline-flex items-center px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Resume Editing
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Key Metrics Column (35% width) */}
            <div className="lg:w-[35%] bg-gray-50/50 p-6 flex flex-col justify-between border-l border-white/50">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Current Status</h3>

              <div className="space-y-3">
                {/* Word Count */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <FileSearch className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Words</span>
                  </div>
                  <span className="font-bold text-gray-900">{latestProject.word_count || 0}</span>
                </div>

                {/* Originality */}
                <div className={`bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between ${!['researcher', 'student'].some(p => userPlan.toLowerCase().includes(p)) ? 'opacity-90' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Originality</span>
                  </div>
                  {['researcher', 'student'].some(p => userPlan.toLowerCase().includes(p)) ? (
                    <span className="font-bold text-green-600">{Math.round(latestProject.originality_scans?.[0]?.overallScore || 0)}%</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded flex items-center pointer-events-none">
                      <Lock className="w-2.5 h-2.5 mr-1" /> Premium
                    </span>
                  )}
                </div>

                {/* Citations */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Citations</span>
                  </div>
                  {['researcher', 'student'].some(p => userPlan.toLowerCase().includes(p)) ? (
                    <span className="font-bold text-gray-900 capitalize">{dashboardData.citationStatus || "-"}</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded flex items-center pointer-events-none">
                      <Lock className="w-2.5 h-2.5 mr-1" /> Premium
                    </span>
                  )}
                </div>

                {/* Verification */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Authorship</span>
                  </div>
                  {['researcher', 'student'].some(p => userPlan.toLowerCase().includes(p)) ? (
                    <span className="font-bold text-gray-900">{dashboardData.authorshipVerified ? "Verified" : "-"}</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded flex items-center pointer-events-none">
                      <Lock className="w-2.5 h-2.5 mr-1" /> Premium
                    </span>
                  )}
                </div>
              </div>

              {/* Upgrade Promo (Small) using empty space efficiently */}
              {!['researcher', 'student'].some(p => userPlan.toLowerCase().includes(p)) && (
                <div className="mt-4 pt-4 border-t border-gray-200/60">
                  <button
                    onClick={handleUpgradeClick}
                    className="w-full py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center gap-2 group"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:animate-pulse" />
                    Unlock All Insights
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      {/* Advanced Document Analytics Section (Blurred for Free) */}
      <div className="mb-8 relative" data-tour="analytics">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            Advanced Document Analytics
            <span className="ml-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 text-xs font-bold flex items-center shadow-sm border border-amber-200">
              <Crown className="w-3.5 h-3.5 mr-1" />
              PREMIUM
            </span>
          </h2>
        </div>

        <div className="relative">
          {/* Content wrapping for blur effect */}
          <div className={`${!['researcher', 'student'].some(p => userPlan.toLowerCase().includes(p)) ? "filter blur-sm select-none pointer-events-none opacity-60 transition-all duration-500" : ""}`}>

            {/* Key Metrics Row - Redesigned Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Originality Overview */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheck className="w-24 h-24 text-indigo-600 transform rotate-12" />
                </div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-blue-500"></div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Safety Score</span>
                </div>

                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{dashboardData.originalityScore ? Math.round(dashboardData.originalityScore) : 0}%</span>
                  <span className="ml-2 text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Safe</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-1.5 rounded-full shadow-lg" style={{ width: `${dashboardData.originalityScore || 0}%` }}></div>
                </div>
              </div>

              {/* Citation Health */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BookOpen className="w-24 h-24 text-blue-600 transform -rotate-12" />
                </div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Citation Health</span>
                </div>

                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold text-gray-900 capitalize">{dashboardData.citationStatus || "Pending"}</span>
                </div>
                <div className="flex items-center mt-3 space-x-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full shadow-sm ${dashboardData.citationStatus === 'strong' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-xs font-bold text-gray-500">85/100</span>
                </div>
              </div>

              {/* Authorship Verification */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Award className="w-24 h-24 text-purple-600" />
                </div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Authorship</span>
                </div>

                <div className="flex items-center mt-1 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2 fill-green-50" />
                  <span className="text-2xl font-bold text-gray-900">Verified</span>
                </div>
                <p className="text-xs font-medium text-gray-500 mt-2 flex items-center bg-gray-50 py-1 px-2 rounded-lg inline-block">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Certificate Active
                </p>
              </div>
            </div>

            {/* Charts Row - Bar Chart & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Document Creation Activity - Bar Chart */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Document Creation Activity
                    </h3>
                    <p className="text-sm text-gray-500">
                      New documents created per month
                    </p>
                  </div>
                  <div className="p-1.5 bg-gray-50 rounded-lg">
                    <BarChartIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="h-72 w-full min-h-[300px]">
                  <ResponsiveContainer width="99%" height="100%">
                    <BarChart
                      data={documentTrendData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      barSize={40}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          borderRadius: '8px',
                          border: 'none',
                          color: '#fff',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#E5E7EB' }}
                        cursor={{ fill: '#F9FAFB' }}
                      />
                      <Bar
                        dataKey="documents"
                        name="Documents"
                        radius={[4, 4, 0, 0]}
                      >
                        {
                          documentTrendData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === documentTrendData.length - 1 ? '#4F46E5' : '#C7D2FE'} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Upcoming Deadlines & Progress - Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Upcoming Deadlines
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Track document completion status
                    </p>
                  </div>
                  <Link
                    to="/dashboard/analytics"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Document</th>
                        <th className="px-6 py-3 font-semibold">Due Date</th>
                        <th className="px-6 py-3 font-semibold">Progress</th>
                        <th className="px-6 py-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(latestProject ? [latestProject, { title: "Literature Review Draft", due_date: new Date(Date.now() + 86400000).toISOString(), word_count: 1200 }, { title: "Research Proposal", due_date: new Date(Date.now() + 172800000).toISOString(), word_count: 450 }] : []).map((doc: any, i) => {
                        const dueDate = doc.due_date ? new Date(doc.due_date) : null;
                        const isDueSoon = dueDate && (dueDate.getTime() - Date.now() < 172800000); // 2 days
                        // Mock progress
                        const progress = Math.min(100, Math.floor(((doc.word_count || 0) + (i * 200)) / 15));

                        return (
                          <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[140px]">
                              {doc.title}
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-medium">
                              {dueDate ? dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "--"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div className={`h-2 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-400">{progress}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isDueSoon ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                {isDueSoon ? "Urgent" : "On Track"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                      }
                      {!latestProject && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                            No active deadlines.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Overlay */}
          {!['researcher', 'student'].some(p => userPlan.toLowerCase().includes(p)) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
              {/* Simplified Overlay - No Box */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/90 backdrop-blur rounded-full mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-2 drop-shadow-sm">
                  {userPlan?.includes("student") ? "Upgrade to Researcher" : "Unlock Advanced Analytics"}
                </h3>
                <p className="text-gray-700 font-medium mb-8 max-w-md mx-auto drop-shadow-sm">
                  {userPlan?.includes("student")
                    ? "Get enhanced analytics, unlimited scans, and priority processing."
                    : "Get full visibility into your Originality, Citation Health, and Authorship Verification status."}
                </p>
                <button
                  onClick={handleUpgradeClick}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-500/40 transition-all duration-200 flex items-center justify-center mx-auto group ring-4 ring-white/30"
                >
                  <span>{userPlan?.includes("student") ? "Upgrade to Researcher" : "Unlock Premium Features"}</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-gray-600 font-semibold mt-4 bg-white/60 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                  {userPlan?.includes("student") ? "Starting at $12/mo" : "Starting at $4.99/mo"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onContentReady={(content, title, filename) => {
          handleContentReady(content, title, filename);
          if (shouldShowTour) {
            completeOnboarding();
          }
        }}
        onDocumentUploaded={(projectId, title) => {
          setShowUploadModal(false);
          if (shouldShowTour) {
            completeOnboarding();
          }
          navigate(`/dashboard/editor/${projectId}`);
        }}
      />

      {/* Onboarding Tour */}
      {!onboardingLoading && (
        <OnboardingTour
          run={shouldShowTour}
          onFinish={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </div>
  );
};

export default Dashboard;
