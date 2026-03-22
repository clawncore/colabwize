import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import WorkspaceService from "../../services/workspaceService";
import useAuth from "../../services/useAuth";
import { Button } from "../../components/ui/button";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Users,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";

const AcceptInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "unauthenticated"
  >("loading");
  const [workspaceName, setWorkspaceName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus("unauthenticated");
      return;
    }

    if (token) {
      acceptInvite();
    } else {
      setStatus("error");
      setErrorMessage("No invitation token provided.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, token]);

  const acceptInvite = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      const response = await WorkspaceService.acceptInvitation(token);
      setWorkspaceName(response.workspace?.name || "the workspace");
      setStatus("success");
      toast({
        title: "Invitation Accepted!",
        description: `You've successfully joined ${response.workspace?.name || "the workspace"}.`,
      });
    } catch (error: any) {
      console.error("Failed to accept invitation:", error);
      setStatus("error");
      setErrorMessage(
        error.response?.data?.error ||
          "This invitation may have expired or is invalid.",
      );
    }
  };

  if (status === "loading" || authLoading) {
    return (
      <AuthLayout
        title="Accepting Invitation"
        subtitle="Please wait while we process your request..."
        showSidebar={false}>
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Verifying invitation token...</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <AuthLayout
        title="Join Workspace"
        subtitle="Please sign in to accept this invitation"
        showSidebar={false}>
        <div className="text-center space-y-6 p-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600">
            To join this workspace, you need to be logged in to your ColabWize
            account.
          </p>
          <div className="space-y-3">
            <Button
              asChild
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200">
              <Link
                to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}>
                <LogIn className="h-4 w-4 mr-2" />
                Log In to Continue
              </Link>
            </Button>
            <p className="text-sm text-gray-500 font-medium">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout
        title="Welcome!"
        subtitle={`You've joined ${workspaceName}`}
        showSidebar={false}>
        <div className="text-center space-y-6 p-4">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-lg">
            Your invitation was accepted successfully. You can now start
            collaborating with your team.
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 btn-glow">
            Go to Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Invitation Error"
      subtitle="Something went wrong"
      showSidebar={false}>
      <div className="text-center space-y-6 p-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full h-12 rounded-xl">
            Back to Dashboard
          </Button>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact the person who
            invited you.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AcceptInvitationPage;
