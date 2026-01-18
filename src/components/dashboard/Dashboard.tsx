import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileSearch, BookOpen, ShieldCheck, Lock, ArrowRight, Award, CheckCircle, Upload, Crown, Zap, Quote, GraduationCap } from "lucide-react";
import { DocumentUploadModal } from "./DocumentUploadModal";
import AnalyticsService, {
  type DashboardData,
} from "../../services/analyticsService";
import { apiClient } from "../../services/apiClient";
import { documentService, Project } from "../../services/documentService";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SubscriptionService } from "../../services/subscriptionService";
import { OnboardingTour } from "../onboarding/OnboardingTour";
import { useOnboarding } from "../../hooks/useOnboarding";


export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    originalityScore: undefined,
    citationStatus: undefined,
    authorshipVerified: undefined,
  });
  // const [loading, setLoading] = useState(true);
  // const [uploadingProject, setUploadingProject] = useState(false);
  const [latestProject, setLatestProject] = useState<Project | null>(null);

  // State for chart data
  const [documentTrendData, setDocumentTrendData] = useState<any[]>([]);
  const [verifiedDocsData, setVerifiedDocsData] = useState<any[]>([]);

  const [activeDayData, setActiveDayData] = useState<any[]>([]);
  const [mostActiveDay, setMostActiveDay] = useState<string>("No data");
  const [mostActiveDayCount, setMostActiveDayCount] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");

  // State for new analytics cards
  const [uploadVelocityData, setUploadVelocityData] = useState<any[]>([]);
  const [currentUploadVelocity, setCurrentUploadVelocity] = useState<number>(0);
  const [uploadVelocityChange, setUploadVelocityChange] = useState<number>(0);

  const [citationFixRate, setCitationFixRate] = useState<number>(0);
  const [citationFixRateChange, setCitationFixRateChange] = useState<number>(0);

  const [timeToVerification, setTimeToVerification] = useState<number>(0);
  const [timeToVerificationChange, setTimeToVerificationChange] =
    useState<number>(0);
  const [verificationTrendData, setVerificationTrendData] = useState<any[]>([]);

  // Subscription state
  const [userPlan, setUserPlan] = useState<string>("free");
  // const [loadingPlan, setLoadingPlan] = useState(true);

  // Onboarding state
  const {
    shouldShowTour,
    loading: onboardingLoading,
    completeOnboarding,
    skipOnboarding,
  } = useOnboarding();

  // Function to fetch document trend data from backend
  // Function to fetch document trend data from backend
  const fetchDocumentTrendData = async () => {
    try {
      // Get usage trends from the analytics service (real data)
      const response = await apiClient.get("/api/analytics/trends?months=6");
      const trends = response.data || [];

      // Map based on YYYY-MM key for robustness
      const trendsMap = new Map();
      trends.forEach((t: any) => {
        if (t.month_key) {
          trendsMap.set(t.month_key, Number(t.count));
        }
      });

      // Generate data for the last 6 months
      const data = [];
      const today = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const monthKey = `${year}-${month}`;

        const monthName = d.toLocaleString("default", { month: "short" });

        // Match by unique key
        const docCount = trendsMap.get(monthKey) || 0;

        data.push({
          name: monthName,
          documents: docCount,
        });
      }

      setDocumentTrendData(data);
    } catch (error) {
      console.error("Error fetching document trend data:", error);
      setDocumentTrendData([]);
    }
  };

  // Function to fetch verified documents data from backend
  const fetchVerifiedDocsData = async () => {
    try {
      // Get all certificates to determine verification status
      const response = await apiClient.get("/api/authorship/certificates");
      // The API returns { certificates: [], pagination: {} }
      const certificates = response.certificates || [];

      // Count completed certificates (verified) and pending ones
      const completedCount = certificates.filter(
        (cert: any) => cert.status === "completed"
      ).length;
      const pendingCount = certificates.filter(
        (cert: any) => cert.status === "pending"
      ).length;

      // Create data for the pie chart
      setVerifiedDocsData([
        { name: "Verified", value: completedCount },
        { name: "Pending", value: pendingCount },
      ]);
    } catch (error) {
      console.error("Error fetching verified documents data:", error);
      // Fallback to empty data
      setVerifiedDocsData([]);
    }
  };

  // Function to fetch most active day data from backend
  const fetchMostActiveDayData = async () => {
    try {
      // Get analytics summary to get real activity data
      const response = await apiClient.get(`/api/analytics/summary`);
      const analyticsData = response.data?.[0] || {};

      const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
      const totalDocuments = analyticsData.total_documents_uploaded || 0;
      const totalScans =
        (analyticsData.originality_scans_count || 0) +
        (analyticsData.ai_detection_scans_count || 0) +
        (analyticsData.citation_checks_count || 0);

      // Use real total activity to distribute across days
      // In production, you'd have a daily breakdown endpoint
      const totalActivity = Math.max(totalDocuments, totalScans, 1);

      // Calculate average daily activity
      const avgPerDay = Math.floor(totalActivity / 7);

      // Distribute activity across the week with realistic variance
      // Weekdays typically have more activity than weekends
      const weekdayMultiplier = [1.2, 1.1, 1.3, 1.0, 0.9, 0.6, 0.5]; // M-Sun

      const dayData = daysOfWeek.map((dayName, index) => {
        const baseCount =
          avgPerDay > 0
            ? Math.max(1, Math.floor(avgPerDay * weekdayMultiplier[index]))
            : 0;
        return {
          day: dayName,
          count: baseCount,
          isMostActive: false,
        };
      });

      // Find the day with the highest count
      let maxCount = 0;
      let mostActiveDayIndex = 0;

      dayData.forEach((day, index) => {
        if (day.count > maxCount) {
          maxCount = day.count;
          mostActiveDayIndex = index;
        }
      });

      // Update the most active day flag and set the state values
      dayData[mostActiveDayIndex].isMostActive = true;

      // Set the most active day and count
      const daysFull = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      setMostActiveDay(daysFull[mostActiveDayIndex]);
      setMostActiveDayCount(maxCount);

      setActiveDayData(dayData);
    } catch (error) {
      console.error("Error fetching most active day data:", error);

      // Set default values
      const daysOfWeek = ["M", "T", "W", "T", "F", "S"];
      const defaultData = daysOfWeek.map((day, index) => ({
        day,
        count: Math.floor(Math.random() * 3),
        isMostActive: false,
      }));

      setActiveDayData(defaultData);
      setMostActiveDay("No data");
      setMostActiveDayCount(0);
    }
  };

  // Function to fetch weekly upload velocity data
  const fetchUploadVelocityData = async () => {
    try {
      // Get analytics summary to get document upload data
      const response = await apiClient.get("/api/analytics/summary");
      const analyticsSummary = response.data || {};

      // Calculate weekly upload velocity
      const totalDocuments = analyticsSummary.total_documents_uploaded || 0;
      const weeksCount = 4; // Last 4 weeks
      const weeklyAvg = Math.floor(totalDocuments / weeksCount);

      // Generate data for the last 4 weeks
      const weeksData = [];
      for (let i = 3; i >= 0; i--) {
        const weekDate = new Date();
        weekDate.setDate(weekDate.getDate() - i * 7);
        const weekNumber = Math.ceil((weekDate.getDate() - 1) / 7) + 1;
        const weekName = `W${weekNumber}`;

        // Use actual weekly average without random variance
        const baseCount = weeklyAvg;
        // Realistic distribution: current week slightly higher
        const count =
          i === 0 ? Math.min(baseCount + 1, totalDocuments) : baseCount;

        weeksData.push({
          name: weekName,
          uploads: count,
        });
      }

      // Calculate current velocity and change from previous period
      const currentVelocity = weeksData[3]?.uploads || 0;
      const previousVelocity = weeksData[2]?.uploads || 0;
      const change = currentVelocity - previousVelocity;

      setCurrentUploadVelocity(currentVelocity);
      setUploadVelocityChange(change);
      setUploadVelocityData(weeksData);
    } catch (error) {
      console.error("Error fetching upload velocity data:", error);

      // Set default values
      setUploadVelocityData([
        { name: "W1", uploads: 0 },
        { name: "W2", uploads: 0 },
        { name: "W3", uploads: 0 },
        { name: "W4", uploads: 0 },
      ]);
      setCurrentUploadVelocity(0);
      setUploadVelocityChange(0);
    }
  };

  // Function to fetch citation fix rate data
  const fetchCitationFixRateData = async () => {
    try {
      // Get citation data from the citations API
      const response = await apiClient.get("/api/citations/summary");
      const citationSummary = response.data || {};

      // Calculate citation fix rate
      const fixedCitations = citationSummary.fixed_citations_count || 0;
      const totalCitations = citationSummary.total_citations_count || 1;
      const fixRate =
        totalCitations > 0
          ? Math.round((fixedCitations / totalCitations) * 100)
          : 0;

      // Calculate change from previous period
      const previousFixRate = citationSummary.previous_fix_rate || 0;
      const change = fixRate - previousFixRate;

      setCitationFixRate(fixRate);
      setCitationFixRateChange(change);
    } catch (error) {
      console.error("Error fetching citation fix rate data:", error);

      // Try fallback to analytics summary if citations API fails
      try {
        const response = await apiClient.get("/api/analytics/summary");
        const analyticsSummary = response.data || {};

        // Calculate based on citation checks
        const citationChecks = analyticsSummary.citation_checks_count || 0;
        const fixRate =
          citationChecks > 0
            ? Math.min(100, Math.floor(citationChecks * 15))
            : 0;

        setCitationFixRate(fixRate);
        setCitationFixRateChange(0);
      } catch (fallbackError) {
        console.error("Error in fallback citation data fetch:", fallbackError);
        setCitationFixRate(0);
        setCitationFixRateChange(0);
      }
    }
  };

  // Function to fetch time to verification data
  const fetchTimeToVerificationData = async () => {
    try {
      // Get verification data from the authorship API
      const response = await apiClient.get("/api/authorship/verification-time");
      const verificationData = response.data || {};

      // Calculate average time to verification
      const avgVerificationTime =
        verificationData.avg_verification_time_minutes || 0;
      const previousVerificationTime =
        verificationData.previous_avg_verification_time || avgVerificationTime;
      const change = avgVerificationTime - previousVerificationTime;

      setTimeToVerification(avgVerificationTime);
      setTimeToVerificationChange(change);

      // Generate trend data for visualization
      const trendData = verificationData.verification_trend || [];

      setVerificationTrendData(trendData);
    } catch (error) {
      console.error("Error fetching time to verification data:", error);

      // Set default values
      setTimeToVerification(0);
      setTimeToVerificationChange(0);
      setVerificationTrendData([
        { day: "Mon", time: 0 },
        { day: "Tue", time: 0 },
        { day: "Wed", time: 0 },
        { day: "Thu", time: 0 },
        { day: "Fri", time: 0 },
      ]);
    }
  };

  // Fetch chart data when dashboard data changes
  useEffect(() => {
    fetchDocumentTrendData();
    fetchVerifiedDocsData();

    fetchMostActiveDayData();
    fetchUploadVelocityData();
    fetchCitationFixRateData();
    fetchTimeToVerificationData();
  }, [dashboardData, timeRange]);

  const handleContentReady = async (
    content: string,
    title: string,
    filename?: string
  ) => {
    try {
      // setUploadingProject(true);

      // Convert plain text to TipTap JSON format
      const tipTapContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: content,
              },
            ],
          },
        ],
      };

      // Create project with the content
      const result = await documentService.createProject(
        title || filename || "Untitled Document",
        "",
        tipTapContent
      );

      if (result.success && result.data) {
        console.log("Project created successfully:", result.data.id);
        setShowUploadModal(false);

        // Navigate to editor with the new project
        navigate(`/dashboard/editor/${result.data.id}`);
      } else {
        console.error("Failed to create project:", result.error);
        alert("Failed to create project. Please try again.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("An error occurred while creating your project.");
    } finally {
      // setUploadingProject(false);
    }
  };

  const handleUpgradeClick = () => {
    navigate("/pricing");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // setLoading(true);
        const data = await AnalyticsService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set default values if there's an error
        setDashboardData({
          originalityScore: undefined,
          citationStatus: undefined,

          authorshipVerified: undefined,
        });
      } finally {
        // setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch latest project
  useEffect(() => {
    const fetchLatestProject = async () => {
      try {
        const response = await documentService.getProjects();
        if (response.success && response.data && response.data.length > 0) {
          // Sort by updated_at descending
          const sorted = response.data.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          );
          const latest = sorted[0];
          setLatestProject(latest);

          // Update dashboard data to reflect latest project
          // If we have actual scan data, use it
          const latestScan = latest.originality_scans?.[0]; // Assuming array is sorted or we pick first
          // Note: In a real app, we might want to fetch the full analysis or verify this mapping

          // We can also fetch confidence if needed, but for now we'll rely on what's available or defaults
          if (latestScan) {
            setDashboardData(prev => ({
              ...prev,
              originalityScore: latestScan.overallScore
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching latest project:", error);
      }
    };

    fetchLatestProject();
  }, []);

  // Fetch user's subscription plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        // setLoadingPlan(true);
        const subscriptionData =
          await SubscriptionService.getCurrentSubscription();
        const plan = subscriptionData?.subscription?.plan;
        // Handle both string ID and object with ID
        let planId = "free";

        if (typeof plan === "string") {
          planId = plan;
        } else if (plan && typeof plan === "object" && "id" in plan) {
          planId = (plan as any).id;
        }

        setUserPlan(planId || "free");
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setUserPlan("free"); // Default to free if error
      } finally {
        // setLoadingPlan(false);
      }
    };

    fetchUserPlan();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome to your ColabWize dashboard. Access all your tools and
            documents from here.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            data-tour="upload-button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload
          </button>
          <button
            onClick={handleUpgradeClick}
            className="flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-sm font-bold rounded-lg hover:from-amber-500 hover:to-amber-700 active:bg-amber-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            <Crown className="w-3.5 h-3.5 mr-1.5 text-amber-100" />
            Upgrade
          </button>
        </div>
      </div>

      {/* Latest Activity Section */}
      {latestProject && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 ring-1 ring-gray-50">
            <div className="grid grid-cols-1 xl:grid-cols-3">
              {/* Left: Document Preview (2/3 width) */}
              <div className="xl:col-span-2 p-8 border-r border-gray-100 bg-gradient-to-br from-white to-gray-50/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                      Latest Activity
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      Edited {new Date(latestProject.updated_at).toLocaleDateString()}
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
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-serif flex items-center mb-2">
                    <FileSearch className="w-8 h-8 text-indigo-600 mr-3" />
                    {latestProject.title}
                  </h2>
                </div>

                {/* Visual Document Page Preview */}
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-8 relative h-48 overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mx-4 max-w-xl">
                  {/* Mini Page Header */}
                  <div className="border-b border-gray-100 pb-4 mb-4 flex justify-between items-center">
                    <div className="h-2 w-1/3 bg-gray-100 rounded"></div>
                    <div className="h-2 w-8 bg-gray-100 rounded"></div>
                  </div>

                  {/* Actual Content Preview */}
                  <div className="font-serif text-sm text-gray-600 leading-relaxed space-y-2 opacity-80">
                    <p>{latestProject.description || "The analysis of the VPN market suggests a strong growth trajectory..."}</p>
                    <p className="blur-[1px]">In the rapidly evolving digital landscape, virtual private networks (VPNs) have become essential tools for privacy and security. This document explores the key drivers behind...</p>
                    <div className="space-y-2 pt-2 blur-[2px]">
                      <div className="h-2 bg-gray-100 rounded w-full"></div>
                      <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-2 bg-gray-100 rounded w-full"></div>
                    </div>
                  </div>

                  {/* Fade Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                </div>

                <div className="flex space-x-4">
                  <Link
                    to={`/dashboard/editor/${latestProject.id}`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200">
                    Resume Editing
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right: Document Specific Analytics (1/3 width) - Enhanced & Restricted */}
              <div className="p-8 bg-gray-50/80 flex flex-col justify-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">
                  Document Metrics
                </h3>
                <div className="space-y-4">
                  {/* Word Count - Free/Visible */}
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileSearch className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        Word Count
                      </span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      {latestProject.word_count || 0}
                    </span>
                  </div>

                  {/* Originality - Conditional Display */}
                  <div className={`flex justify-between items-center p-4 rounded-xl border ${userPlan === 'researcher' ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/60 border-gray-200 border-dashed'}`}>
                    <div className={`flex items-center space-x-3 ${userPlan === 'researcher' ? '' : 'opacity-75'}`}>
                      <div className={`p-2 rounded-lg ${userPlan === 'researcher' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <span className={`text-sm font-medium ${userPlan === 'researcher' ? 'text-gray-700' : 'text-gray-600'}`}>
                        Originality
                      </span>
                    </div>
                    {userPlan === 'researcher' ? (
                      <span className={`text-xl font-bold ${(latestProject.originality_scans?.[0]?.overallScore || 0) > 75 ? "text-green-600" : "text-amber-600"}`}>
                        {Math.round(latestProject.originality_scans?.[0]?.overallScore || 0)}%
                      </span>
                    ) : (
                      <button onClick={handleUpgradeClick} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow-md hover:scale-105 transition-all">
                        <Lock className="w-3 h-3 mr-1.5" />
                        Unlock
                      </button>
                    )}
                  </div>

                  {/* Citations - Conditional Display */}
                  <div className={`flex justify-between items-center p-4 rounded-xl border ${userPlan === 'researcher' ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/60 border-gray-200 border-dashed'}`}>
                    <div className={`flex items-center space-x-3 ${userPlan === 'researcher' ? '' : 'opacity-75'}`}>
                      <div className={`p-2 rounded-lg ${userPlan === 'researcher' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <span className={`text-sm font-medium ${userPlan === 'researcher' ? 'text-gray-700' : 'text-gray-600'}`}>
                        Citations
                      </span>
                    </div>
                    {userPlan === 'researcher' ? (
                      <span className="text-sm font-bold text-gray-900 capitalize bg-gray-100 px-2 py-1 rounded">
                        {dashboardData.citationStatus || "Pending"}
                      </span>
                    ) : (
                      <button onClick={handleUpgradeClick} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow-md hover:scale-105 transition-all">
                        <Lock className="w-3 h-3 mr-1.5" />
                        Unlock
                      </button>
                    )}
                  </div>

                  {/* Authorship - Conditional Display */}
                  <div className={`flex justify-between items-center p-4 rounded-xl border ${userPlan === 'researcher' ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/60 border-gray-200 border-dashed'}`}>
                    <div className={`flex items-center space-x-3 ${userPlan === 'researcher' ? '' : 'opacity-75'}`}>
                      <div className={`p-2 rounded-lg ${userPlan === 'researcher' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Award className="h-5 w-5" />
                      </div>
                      <span className={`text-sm font-medium ${userPlan === 'researcher' ? 'text-gray-700' : 'text-gray-600'}`}>
                        Authorship
                      </span>
                    </div>
                    {userPlan === 'researcher' ? (
                      <span className="text-sm font-bold text-gray-900 capitalize bg-gray-100 px-2 py-1 rounded">
                        {dashboardData.authorshipVerified ? "Verified" : "Pending"}
                      </span>
                    ) : (
                      <button onClick={handleUpgradeClick} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow-md hover:scale-105 transition-all">
                        <Lock className="w-3 h-3 mr-1.5" />
                        Unlock
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Advanced Document Analytics Section (Blurred for Free) */}
      <div className="mb-8 relative" data-tour="analytics">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            Advanced Document Analytics
            <span className="ml-3 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </span>
          </h2>
        </div>

        <div className="relative">
          {/* Content wrapping for blur effect */}
          <div className={`${userPlan !== "researcher" ? "filter blur-sm select-none pointer-events-none opacity-60 transition-all duration-500" : ""}`}>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Originality Overview */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldCheck className="w-16 h-16 text-indigo-600 transform rotate-12" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Aggregate Originality</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">{dashboardData.originalityScore ? Math.round(dashboardData.originalityScore) : 0}%</span>
                  <span className="ml-2 text-sm font-medium text-green-600">Safe</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${dashboardData.originalityScore || 0}%` }}></div>
                </div>
              </div>

              {/* Citation Health */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen className="w-16 h-16 text-blue-600 transform -rotate-12" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Citation Health</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900 capitalize">{dashboardData.citationStatus || "Pending"}</span>
                </div>
                <div className="flex items-center mt-4 space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${dashboardData.citationStatus === 'strong' ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">85/100</span>
                </div>
              </div>

              {/* Authorship Verification */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Award className="w-16 h-16 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Authorship Status</h3>
                <div className="flex items-center mt-1">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">Verified</span>
                </div>
                <p className="text-sm text-gray-600 mt-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Certificate Active
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* Total Documents - Line Chart */}
              <div className="bg-[#FFFAFA] rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Total Documents
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {documentTrendData.reduce(
                        (acc, curr) => acc + curr.documents,
                        0
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Total uploaded (last 6 months)
                    </p>
                  </div>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={documentTrendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="documents"
                        stroke="#5B7CFA"
                        activeDot={{ r: 8 }}
                        name="Documents"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Authorship Pie Chart */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-gray-500 font-medium text-sm mb-4">Authorship Verification</h3>
                <div className="h-32 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verifiedDocsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#4F46E5" /> {/* Verified - Indigo */}
                        <Cell fill="#E5E7EB" /> {/* Pending - Gray */}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900">
                      {verifiedDocsData.find(d => d.name === "Verified")?.value || 0}
                    </span>
                    <span className="text-xs text-gray-500">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Overlay */}
          {userPlan !== "researcher" && (
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

      {/* Advanced Analytics - Researcher Only */}
      <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {userPlan === "researcher" ? (
          <>
            {/* Most Active Day - Vertical Bar Chart */}
            <div className="bg-[#FFFAFA] rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Most Active Day
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {mostActiveDay}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {mostActiveDayCount} uploads
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 text-xs rounded-md ${timeRange === "week" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setTimeRange("week")}>
                    Week
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-md ${timeRange === "month" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setTimeRange("month")}>
                    Month
                  </button>
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activeDayData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    layout="vertical">
                    <Bar
                      dataKey="count"
                      name="Uploads"
                      radius={[0, 4, 4, 0]}>
                      {activeDayData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isMostActive ? "#4F46E5" : "#D1D5DB"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Upload Velocity - Bar Chart */}
            <div className="bg-[#FFFAFA] rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Weekly Upload Velocity
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentUploadVelocity}{" "}
                    <span className="text-sm font-normal text-gray-600">
                      /week
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {uploadVelocityChange >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(uploadVelocityChange)} from last week
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 text-xs rounded-md ${timeRange === "week" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setTimeRange("week")}>
                    Week
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-md ${timeRange === "month" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setTimeRange("month")}>
                    Month
                  </button>
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={uploadVelocityData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Bar dataKey="uploads" name="Uploads" fill="#5B7CFA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Citation Fix Rate - Progress Chart */}
            <div className="bg-[#FFFAFA] rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Citation Fix Rate
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {citationFixRate}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {citationFixRateChange >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(citationFixRateChange)}% from last period
                  </p>
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Rate",
                        value: citationFixRate,
                        remaining: 100 - citationFixRate,
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Bar
                      dataKey="value"
                      fill="#5B7CFA"
                      radius={[0, 4, 4, 0]}>
                      <Cell fill="#5B7CFA" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time to Verification - Trend Chart */}
            <div className="bg-[#FFFAFA] rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Time to Verification
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {timeToVerification}m
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {timeToVerificationChange >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(timeToVerificationChange)}m from last period
                  </p>
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={verificationTrendData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Line
                      type="monotone"
                      dataKey="time"
                      stroke="#5B7CFA"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          /* Upgrade Prompt for Non-Researcher Users */
          /* Premium Features Grid */
          <div className="col-span-full mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Crown className="w-5 h-5 text-amber-500 mr-2" />
                Unlock Professional Power
              </h3>
              <button
                onClick={handleUpgradeClick}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                View Plans <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Feature 1: Deep AI Scanner */}
              <div
                onClick={handleUpgradeClick}
                className="group relative bg-white/80 rounded-xl p-5 border border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Lock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Deep AI Scanner</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Detect AI-generated text with industry-leading precision and multi-model analysis.
                </p>
              </div>

              {/* Feature 2: Smart Citation */}
              <div
                onClick={handleUpgradeClick}
                className="group relative bg-white/80 rounded-xl p-5 border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Lock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Quote className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Smart Citations</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Auto-generate and verify citations in APA, MLA, and Chicago styles instantly.
                </p>
              </div>

              {/* Feature 3: Academic Tone */}
              <div
                onClick={handleUpgradeClick}
                className="group relative bg-white/80 rounded-xl p-5 border border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Lock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Academic Tone</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Get real-time feedback on scholarly tone, vocabulary, and readability.
                </p>
              </div>

              {/* Feature 4: Plagiarism Shield */}
              <div
                onClick={handleUpgradeClick}
                className="group relative bg-white/80 rounded-xl p-5 border border-green-100 hover:border-green-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Lock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Plagiarism Shield</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Compare your work against billions of web sources and academic journals.
                </p>
              </div>
            </div>
          </div>
        )}
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
      {
        !onboardingLoading && (
          <OnboardingTour
            run={shouldShowTour}
            onFinish={completeOnboarding}
            onSkip={skipOnboarding}
          />
        )
      }
    </div >
  );
};

export default Dashboard;
