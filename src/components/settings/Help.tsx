import React, { useState } from "react";
import { useToast } from "../../hooks/use-toast";
import {
  HelpCircle,
  Search,
  Play,
  Mail,
  MessageCircle,
  Users,
  FileText,
  Lightbulb,
  Star,
  Copy,
} from "lucide-react";

import apiClient from "../../services/apiClient";
import WaitlistService from "../../services/waitlistService";
import { SubscriptionService } from "../../services/subscriptionService";
import ConfigService from "../../services/ConfigService";

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  views: number;
}

interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
}

const HelpSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("technical");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketAttachment, setTicketAttachment] = useState<File | null>(null);
  const [ticketPriority, setTicketPriority] = useState("normal");
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [copyStatus, setCopyStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null); // Add state for copy status notification

  const [newFeatureTitle, setNewFeatureTitle] = useState("");
  const [newFeatureDescription, setNewFeatureDescription] = useState("");
  const [submittingFeature, setSubmittingFeature] = useState(false);
  const [featureSubmitted, setFeatureSubmitted] = useState(false);
  const [votedFeatures, setVotedFeatures] = useState<string[]>([]);
  const [featureVotes, setFeatureVotes] = useState<Record<string, number>>({
    "dark-mode": 128,
    "offline-mode": 96,
    "mobile-app": 245,
  });

  const helpArticles: HelpArticle[] = [
    {
      id: "1",
      title: "Getting Started with ColabWize",
      category: "Getting Started",
      views: 1250,
    },
    {
      id: "2",
      title: "How to Add Citations",
      category: "Citations",
      views: 890,
    },
    {
      id: "3",
      title: "Collaboration Best Practices",
      category: "Collaboration",
      views: 720,
    },
    {
      id: "4",
      title: "Keyboard Shortcuts",
      category: "Tips",
      views: 1100,
    },
  ];

  const videoTutorials: VideoTutorial[] = [
    {
      id: "1",
      title: "Creating Your First Document",
      duration: "5:22",
      thumbnail: "🎬",
    },
    {
      id: "2",
      title: "Adding Citations and References",
      duration: "8:45",
      thumbnail: "📚",
    },
    {
      id: "3",
      title: "Collaborating with Your Team",
      duration: "6:18",
      thumbnail: "👥",
    },
    {
      id: "4",
      title: "Using the AI Writing Assistant",
      duration: "12:30",
      thumbnail: "🤖",
    },
  ];

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    try {
      // Prepare feedback data
      const feedbackData = {
        type: "feedback",
        title: `User Feedback - ${feedbackRating} stars`,
        description: feedbackComment,
        category: "general",
        priority: "medium",
        browser_info: navigator.userAgent,
        os_info: navigator.platform,
        screen_size: `${window.screen.width}x${window.screen.height}`,
      };

      // Send feedback to backend using the public endpoint
      const response = await fetch(
        `${ConfigService.getApiUrl()}/api/feedback/public`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedbackData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFeedbackSubmitted(true);
          setFeedbackRating(0);
          setFeedbackComment("");
          // Reset success message after 3 seconds
          setTimeout(() => setFeedbackSubmitted(false), 3000);
        } else {
          throw new Error(result.message || "Failed to submit feedback");
        }
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Show error to user
      toast({
        title: "Feedback Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitTicket = async () => {
    setSubmittingTicket(true);
    try {
      // Get browser and system information
      const browserInfo = navigator.userAgent;
      const osInfo = navigator.platform;
      const screenSize = `${window.screen.width}x${window.screen.height}`;

      // Get the user's current subscription plan
      let userPlan = "free"; // Default to free plan
      try {
        const subscription = await SubscriptionService.getCurrentSubscription();
        const planData = subscription?.subscription?.plan;
        userPlan = typeof planData === 'string' ? planData : (planData?.id || "free");
      } catch (planError) {
        console.warn(
          "Could not fetch user plan, defaulting to free:",
          planError
        );
        userPlan = "free";
      }

      // Upload attachment if present (in a real implementation, you would upload to storage service)
      let attachmentUrl = null;
      if (ticketAttachment) {
        try {
          // Create FormData object for file upload
          const formData = new FormData();
          formData.append("file", ticketAttachment);

          // Upload file to the support ticket upload endpoint (public, no authentication required)
          const response = await fetch("/api/support-ticket/upload", {
            method: "POST",
            body: formData,
          });

          // Check if the response is successful
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${errorText}`);
          }

          // Parse the response data
          const data = await response.json();

          // Check if the upload was successful
          if (!data.success) {
            throw new Error(data.message || "Failed to upload attachment");
          }

          // Use the public URL of the uploaded file
          attachmentUrl = data.fileUrl;
        } catch (uploadError) {
          console.error("Error uploading attachment:", uploadError);
          toast({
            title: "Attachment Upload Failed",
            description:
              "Failed to upload attachment. Continuing without attachment.",
            variant: "destructive",
          });
          // Continue without attachment if upload fails
        }
      }

      // Prepare the data to send to the backend
      const ticketData = {
        subject: ticketSubject,
        message: ticketMessage,
        priority: ticketPriority,
        attachmentUrl,
        browserInfo,
        osInfo,
        screenSize,
        userPlan,
      };

      // Send the ticket data to the backend
      const response = await apiClient.post("/api/support-ticket", ticketData);

      if (response.success) {
        setTicketSubmitted(true);
        setTicketMessage("");
        setTicketAttachment(null);
        // Reset success message after 3 seconds
        setTimeout(() => setTicketSubmitted(false), 3000);
      } else {
        throw new Error(response.error || "Failed to submit ticket");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      // In a real implementation, you would show an error message to the user
      toast({
        title: "Ticket Submission Failed",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleCopySystemInfo = async () => {
    try {
      // Gather system information
      const systemInfo = `
ColabWize System Information
============================
Version: v1.2.3
Platform: Web
Browser: ${navigator.userAgent}
Last Updated: Oct 1, 2024
Screen Resolution: ${window.screen.width}x${window.screen.height}
Window Size: ${window.innerWidth}x${window.innerHeight}
Language: ${navigator.language}
Cookies Enabled: ${navigator.cookieEnabled}
Online Status: ${navigator.onLine ? "Online" : "Offline"}
Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
      `.trim();

      // Copy to clipboard
      await navigator.clipboard.writeText(systemInfo);

      // Show success message (in a real implementation, you might want to use a toast notification)
      setCopyStatus({
        message: "System information copied to clipboard!",
        type: "success",
      });
      setTimeout(() => setCopyStatus(null), 3000);
    } catch (error) {
      // Handle clipboard access errors
      console.error("Failed to copy system information:", error);
      setCopyStatus({
        message: "Failed to copy system information. Please try again.",
        type: "error",
      });
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  const handleVote = async (featureId: string) => {
    if (votedFeatures.includes(featureId)) {
      // User has already voted
      return;
    }

    try {
      // Call the waitlist service to vote for the feature
      const result = await WaitlistService.voteForFeature(featureId);

      if (result.success) {
        // Update the voted features list
        setVotedFeatures([...votedFeatures, featureId]);

        // Update the vote count
        setFeatureVotes({
          ...featureVotes,
          [featureId]: result.votes,
        });
      } else {
        toast({
          title: "Vote Submission Failed",
          description:
            result.message || "Failed to submit vote. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error voting for feature:", error);
      toast({
        title: "Vote Submission Failed",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateFeatureRequest = async () => {
    if (!newFeatureTitle.trim() || !newFeatureDescription.trim()) {
      toast({
        title: "Missing Information",
        description:
          "Please enter both title and description for your feature request.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingFeature(true);
    try {
      // Create a feature request using the dedicated feature request API
      const response = await fetch("/api/feature-request/simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newFeatureTitle,
          description: newFeatureDescription,
          category: "other",
          priority: "nice-to-have",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feature request");
      }

      const result = await response.json();

      if (result.message && result.featureRequestId) {
        setFeatureSubmitted(true);
        setNewFeatureTitle("");
        setNewFeatureDescription("");

        // Reset success message after 3 seconds
        setTimeout(() => setFeatureSubmitted(false), 3000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error submitting feature request:", error);
      toast({
        title: "Feature Request Failed",
        description: "Failed to submit feature request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingFeature(false);
    }
  };

  // const navigate = useNavigate();

  // Define the paths for each help article
  const getArticlePath = (id: string) => {
    const docsUrl = ConfigService.getDocsUrl();
    switch (id) {
      case "1":
        return `${docsUrl}/quickstart`;
      case "2":
        return `${docsUrl}/citations`;
      case "3":
        return `${docsUrl}/collaboration`;
      case "4":
        return `${docsUrl}/keyboard-shortcuts`;
      default:
        return docsUrl;
    }
  };

  const handleArticleClick = (id: string) => {
    const path = getArticlePath(id);
    window.open(path, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full py-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <HelpCircle className="h-6 w-6 text-blue-600 mr-2" />
          Help & Support
        </h1>
        <p className="text-gray-600 mt-1">Get help when you need it</p>
      </div>

      <div className="space-y-6">
        {/* Quick Help */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6 border-b border-gray-200 ">
            <h2 className="text-lg font-semibold text-gray-900 ">Quick Help</h2>
          </div>

          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white  text-gray-900 "
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {helpArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="border border-gray-200  rounded-lg p-4 hover:border-blue-300  hover:bg-blue-50  cursor-pointer transition-colors duration-200">
                  <h3 className="font-medium text-gray-900 ">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100  text-gray-600  rounded">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500 ">
                      {article.views} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6 border-b border-gray-200 ">
            <h2 className="text-lg font-semibold text-gray-900 ">
              Video Tutorials
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videoTutorials.map((video) => (
                <div
                  key={video.id}
                  className="border border-gray-200  rounded-lg overflow-hidden hover:border-blue-300  cursor-pointer">
                  <div className="bg-gray-100  h-32 flex items-center justify-center text-4xl">
                    {video.thumbnail}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 ">
                        {video.title}
                      </h3>
                      <span className="text-xs text-gray-500  bg-gray-100  px-2 py-1 rounded">
                        {video.duration}
                      </span>
                    </div>
                    <button className="mt-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700  ">
                      <Play className="h-4 w-4 mr-1" />
                      Watch Tutorial
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6 border-b border-gray-200 ">
            <h2 className="text-lg font-semibold text-gray-900 ">
              Contact Support
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-200  rounded-lg p-4 text-center">
                <Mail className="h-8 w-8 text-blue-600  mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 ">Email Support</h3>
                <p className="text-sm text-gray-600  mt-1">
                  support@colabwize.com
                </p>
                <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700  ">
                  Send Email
                </button>
              </div>

              <div className="border border-gray-200  rounded-lg p-4 text-center">
                <MessageCircle className="h-8 w-8 text-blue-600  mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 ">
                  Schedule a Meeting
                </h3>
                <p className="text-sm text-gray-600  mt-1">
                  Available Mon-Fri 9AM-5PM EST
                </p>
                <a
                  href="https://calendly.com/audacityimpact/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700   block">
                  Schedule Now
                </a>
              </div>

              <div className="border border-gray-200  rounded-lg p-4 text-center">
                <Users className="h-8 w-8 text-purple-600  mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 ">Community</h3>
                <p className="text-sm text-gray-600  mt-1">Forum and Discord</p>
                <button
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700  "
                  onClick={() =>
                    window.open("https://discord.gg/2MMSdX3Uee", "_blank")
                  }>
                  Join Community
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-400 mb-4">
                Submit a Ticket
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700  mb-1">
                    Subject
                  </label>
                  <select
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white  text-gray-900 ">
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700  mb-1">
                    Message
                  </label>
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white  text-gray-900 "
                    placeholder="Describe your issue or question..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700  mb-1">
                    Attach Screenshot (Optional)
                  </label>
                  <div className="flex items-center">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300  rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100 ">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileText className="h-8 w-8 text-gray-400 " />
                        <p className="text-sm text-gray-500  mt-2">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          setTicketAttachment(e.target.files?.[0] || null)
                        }
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700  mb-1">
                    Priority (Pro users)
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white  text-gray-900 ">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="bg-blue-50  p-4 rounded-lg">
                  <p className="text-sm text-blue-700 ">
                    <span className="font-medium">Response Time:</span> Free:
                    Within 48 hours | Pro: Within 24 hours | Researcher: Within
                    12 hours
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitTicket}
                    disabled={submittingTicket || !ticketMessage}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {submittingTicket ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Ticket"
                    )}
                  </button>
                </div>

                {ticketSubmitted && (
                  <div className="p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                    Ticket submitted successfully! We'll get back to you soon.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6 border-b border-gray-200 ">
            <h2 className="text-lg font-semibold text-gray-900 ">
              System Information
            </h2>
          </div>

          <div className="p-6">
            {/* Copy Status Notification */}
            {copyStatus && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${copyStatus.type === "success"
                  ? "bg-green-50 text-green-700  "
                  : "bg-red-50 text-red-700  "
                  }`}>
                {copyStatus.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900  mb-2">
                  App Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 ">Version:</span>
                    <span className="font-medium text-gray-900 ">v1.2.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 ">Platform:</span>
                    <span className="font-medium text-gray-900 ">Web</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 ">Browser:</span>
                    <span className="font-medium text-gray-900 ">
                      Chrome 119
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 ">Last Updated:</span>
                    <span className="font-medium text-gray-900 ">
                      Oct 1, 2024
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900  mb-2">
                  Support Resources
                </h3>
                <div className="space-y-2">
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600  ">
                    <FileText className="h-4 w-4 mr-2" />
                    Terms of Service
                  </button>
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600  ">
                    <FileText className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </button>
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600  ">
                    <FileText className="h-4 w-4 mr-2" />
                    Cookie Policy
                  </button>
                  <button
                    onClick={handleCopySystemInfo}
                    className="flex items-center text-sm text-gray-700 hover:text-blue-600  ">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy System Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6 border-b border-gray-200 ">
            <h2 className="text-lg font-semibold text-gray-900 ">
              Send Feedback
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700  mb-2">
                  What do you think of ColabWize?
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className="text-2xl focus:outline-none">
                      {star <= feedbackRating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1">
                  Comments
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white  text-gray-900 "
                  placeholder="Tell us what you like or how we can improve..."></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={submittingFeedback || feedbackRating === 0}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {submittingFeedback ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Feedback"
                  )}
                </button>
              </div>

              {feedbackSubmitted && (
                <div className="p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                  Thank you for your feedback! We appreciate your input.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Requests */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6 border-b border-gray-200 ">
            <h2 className="text-lg font-semibold text-gray-900 ">
              Feature Requests
            </h2>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900 ">
                  Request a Feature
                </h3>
                <p className="text-sm text-gray-600 ">
                  Suggest new features or improvements
                </p>
              </div>
              <button
                onClick={handleCreateFeatureRequest}
                disabled={submittingFeature}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700  ">
                <Lightbulb className="h-4 w-4 mr-1" />
                {submittingFeature ? "Requesting..." : "Request"}
              </button>
            </div>

            {/* Feature request form */}
            <div className="mb-6 p-4 bg-gray-50  rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700  mb-1">
                    Feature Title
                  </label>
                  <input
                    type="text"
                    value={newFeatureTitle}
                    onChange={(e) => setNewFeatureTitle(e.target.value)}
                    placeholder="Enter a brief title for your feature"
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white  text-gray-900 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700  mb-1">
                    Description
                  </label>
                  <textarea
                    value={newFeatureDescription}
                    onChange={(e) => setNewFeatureDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe your feature request in detail..."
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white  text-gray-900 "></textarea>
                </div>

                {featureSubmitted && (
                  <div className="p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                    Thank you for your feature request! We'll review it and
                    consider it for future development.
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              <div className="p-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900 ">Dark Mode</h4>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600 ">
                      {featureVotes["dark-mode"]} votes
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600  mt-1">
                  Add a dark theme option for better nighttime writing
                </p>
                <button
                  onClick={() => handleVote("dark-mode")}
                  className={`mt-2 text-sm font-medium ${votedFeatures.includes("dark-mode")
                    ? "text-green-600 "
                    : "text-blue-600 hover:text-blue-700  "
                    }`}
                  disabled={votedFeatures.includes("dark-mode")}>
                  {votedFeatures.includes("dark-mode")
                    ? "Voted"
                    : "Vote for this feature"}
                </button>
              </div>

              <div className="p-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900 ">Offline Mode</h4>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600 ">
                      {featureVotes["offline-mode"]} votes
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600  mt-1">
                  Work on documents without an internet connection
                </p>
                <button
                  onClick={() => handleVote("offline-mode")}
                  className={`mt-2 text-sm font-medium ${votedFeatures.includes("offline-mode")
                    ? "text-green-600 "
                    : "text-blue-600 hover:text-blue-700  "
                    }`}
                  disabled={votedFeatures.includes("offline-mode")}>
                  {votedFeatures.includes("offline-mode")
                    ? "Voted"
                    : "Vote for this feature"}
                </button>
              </div>

              <div className="p-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900 ">Mobile App</h4>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600 ">
                      {featureVotes["mobile-app"]} votes
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600  mt-1">
                  Native iOS and Android applications
                </p>
                <button
                  onClick={() => handleVote("mobile-app")}
                  className={`mt-2 text-sm font-medium ${votedFeatures.includes("mobile-app")
                    ? "text-green-600 "
                    : "text-blue-600 hover:text-blue-700  "
                    }`}
                  disabled={votedFeatures.includes("mobile-app")}>
                  {votedFeatures.includes("mobile-app")
                    ? "Voted"
                    : "Vote for this feature"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSettingsPage;
