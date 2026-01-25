import React, { useState, useEffect } from "react";
import { useToast } from "../../hooks/use-toast";
import FeedbackService from "../../services/feedbackService";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface UserFeedback {
  id: string;
  user_id: string | null;
  type: string;
  category: string | null;
  priority: string;
  title: string;
  description: string;
  status: string;
  attachment_urls: string[];
  browser_info: string | null;
  os_info: string | null;
  screen_size: string | null;
  user_plan: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

const FeedbackDashboard: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [feedbackItems, setFeedbackItems] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState({
    type: "feedback",
    category: "",
    priority: "medium",
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      const feedback = await FeedbackService.getUserFeedback();
      setFeedbackItems(feedback);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load feedback data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateFeedback = async () => {
    if (!newFeedback.title.trim() || !newFeedback.description.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title and description for your feedback",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Collect browser and OS information
      const browserInfo = navigator.userAgent;
      const osInfo = navigator.platform;
      const screenSize = `${window.screen.width}x${window.screen.height}`;

      await FeedbackService.createFeedback({
        type: newFeedback.type,
        category: newFeedback.category || undefined,
        priority: newFeedback.priority,
        title: newFeedback.title,
        description: newFeedback.description,
        browser_info: browserInfo,
        os_info: osInfo,
        screen_size: screenSize,
      });

      toast({
        title: "Success",
        description: "Your feedback has been submitted successfully",
      });

      setNewFeedback({
        type: "feedback",
        category: "",
        priority: "medium",
        title: "",
        description: "",
      });

      // Refresh data
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your feedback",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Resolved
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-500">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-3 h-3 mr-1" /> Closed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" /> Open
          </Badge>
        );
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          Feedback Center
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Your voice matters. Help us shape the future of ColabWize.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
          <TabsTrigger
            value="overview"
            className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none transition-all">
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="submit"
            className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none transition-all">
            Submit Feedback
          </TabsTrigger>
          <TabsTrigger
            value="my-feedback"
            className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none transition-all">
            My Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Feedback", icon: <MessageSquare className="w-5 h-5 text-purple-600" />, value: feedbackItems.length, sub: "All submissions", bg: "bg-purple-50", border: "border-purple-100" },
              { title: "Open", icon: <Clock className="w-5 h-5 text-yellow-600" />, value: feedbackItems.filter(f => f.status === "open").length, sub: "Awaiting review", bg: "bg-yellow-50", border: "border-yellow-100" },
              { title: "In Progress", icon: <AlertTriangle className="w-5 h-5 text-blue-600" />, value: feedbackItems.filter(f => f.status === "in_progress").length, sub: "Being worked on", bg: "bg-blue-50", border: "border-blue-100" },
              { title: "Resolved", icon: <CheckCircle className="w-5 h-5 text-green-600" />, value: feedbackItems.filter(f => f.status === "resolved").length, sub: "Completed", bg: "bg-green-50", border: "border-green-100" }
            ].map((stat, i) => (
              <Card key={i} className={`border ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-sm text-gray-500 mt-1">{stat.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="md:col-span-2 border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">What's New?</CardTitle>
                <CardDescription>Recent updates and common requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-2">We're listening! 🎧</h3>
                    <p className="text-blue-800 text-sm mb-4">
                      Thanks to your feedback, we've recently improved the dashboard performance and added dark mode support.
                    </p>
                    <Button variant="outline" className="bg-blue-500 hover:bg-blue-600 text-white border-blue-200" onClick={() => setActiveTab('submit')}>
                      Have an idea? Tell us!
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm bg-gray-50/50">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white border border-gray-200 justify-start h-12 shadow-sm"
                  onClick={() => { setNewFeedback({ ...newFeedback, type: "bug_report" }); setActiveTab("submit"); }}>
                  <div className="bg-red-50 p-1.5 rounded mr-3"><Bug className="w-4 h-4 text-red-500" /></div>
                  Report a Bug
                </Button>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white border border-gray-200 justify-start h-12 shadow-sm"
                  onClick={() => { setNewFeedback({ ...newFeedback, type: "feature_request" }); setActiveTab("submit"); }}>
                  <div className="bg-yellow-50 p-1.5 rounded mr-3"><Lightbulb className="w-4 h-4 text-yellow-500" /></div>
                  Request Feature
                </Button>
                <Button
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white border border-gray-200 justify-start h-12 shadow-sm"
                  onClick={() => { setNewFeedback({ ...newFeedback, type: "feedback" }); setActiveTab("submit"); }}>
                  <div className="bg-blue-50 p-1.5 rounded mr-3"><MessageSquare className="w-4 h-4 text-blue-500" /></div>
                  Share Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submit" className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-lg border-0 ring-1 ring-gray-100">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-6">
              <CardTitle className="text-2xl text-gray-900">Submit Feedback</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                We value your input. Please be as detailed as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Type</Label>
                  <Select value={newFeedback.type} onValueChange={(v) => setNewFeedback({ ...newFeedback, type: v })}>
                    <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feedback">General Feedback</SelectItem>
                      <SelectItem value="bug_report">Bug Report</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Priority</Label>
                  <Select value={newFeedback.priority} onValueChange={(v) => setNewFeedback({ ...newFeedback, priority: v })}>
                    <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Title</Label>
                <Input
                  placeholder="Brief summary of your feedback"
                  className="h-11 bg-gray-50 border-gray-200 focus:ring-blue-500"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  placeholder="Tell us more..."
                  className="min-h-[150px] bg-gray-50 border-gray-200 focus:ring-blue-500 resize-none"
                  value={newFeedback.description}
                  onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setActiveTab("overview")}>Cancel</Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px] h-11"
                  onClick={handleCreateFeedback}
                  disabled={isSubmitting || !newFeedback.title.trim() || !newFeedback.description.trim()}
                >
                  {isSubmitting ? "Sending..." : "Submit Feedback"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-feedback" className="animate-in fade-in-50 duration-500">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              {feedbackItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No feedback yet</h3>
                  <p className="text-gray-500 mt-1 mb-6 max-w-sm">Share your first idea or report a bug to help us improve.</p>
                  <Button onClick={() => setActiveTab("submit")}>Submit Feedback</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackItems.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg mt-1 ${item.type === 'bug_report' ? 'bg-red-50 text-red-600' : item.type === 'feature_request' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                          {item.type === 'bug_report' ? <Bug className="w-5 h-5" /> : item.type === 'feature_request' ? <Lightbulb className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">{item.priority} Priority</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackDashboard;
