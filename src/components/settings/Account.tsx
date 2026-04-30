import { getErrorMessage } from "../../utils/errorHandler";
import React, { useState, useEffect } from "react";
import { Download, Eye, EyeOff, Loader2, User, BadgeCheck } from "lucide-react";
import { Button } from "../ui/button";
import AccountService from "../../services/accountService";
import ZoteroService from "../../services/zoteroService";
import MendeleyService from "../../services/mendeleyService";
import GoogleDriveService from "../../services/googleDriveService";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../lib/supabase/client";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { VaultIcon } from "../common/VaultIcon";
import { MendeleyIcon } from "../common/MendeleyIcon";
import { ZoteroIcon } from "../common/ZoteroIcon";
import { GoogleDriveIcon } from "../common/GoogleDriveIcon";

interface UserAccount {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  user_type: string | null;
  field_of_study: string | null;
  selected_plan: string | null;
  retention_period: number | null;
  affiliate_ref: string | null;
  two_factor_enabled: boolean;
  zotero_user_id?: string | null;
  zotero_api_key?: string | null;
  zotero_auto_sync?: boolean;
  mendeley_access_token?: string | null;
  mendeley_auto_sync?: boolean;
  google_access_token?: string | null;
  created_at: string;
  updated_at: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

const AccountSettingsPage: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Email change states
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeStep, setEmailChangeStep] = useState(1); // 1: enter new email, 2: verify OTP
  const [pendingEmailChange, setPendingEmailChange] = useState("");

  const { toast } = useToast();

  // Handle Zotero and Mendeley callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("zotero_success") === "true") {
      toast({
        title: "Zotero Connected",
        description: "Your research library has been successfully linked.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("mendeley_success") === "true") {
      toast({
        title: "Mendeley Connected",
        description: "Your Mendeley library has been successfully linked.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Handle Google Drive popup message
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_CONNECTED") {
        toast({
          title: "Google Drive Connected",
          description: "Your Google Drive has been successfully linked.",
        });

        // Refresh account details
        try {
          const userData = await AccountService.getUserAccount();
          setUser(userData as any);
        } catch (error) {
          console.error("Error refreshing user account:", error);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [toast]);

  // Fetch user account details
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        // Get user ID from Supabase auth
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }
        const userData = await AccountService.getUserAccount();
        setUser(userData as any);
      } catch (error: any) {
        console.error("Error fetching account details:", error);
        toast({
          title: "Error",
          description: getErrorMessage(
            error,
            "Failed to load account details. Please try again.",
          ),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, [toast]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await AccountService.updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );

      toast({
        title: "Success",
        description: "Password updated successfully.",
      });

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: getErrorMessage(
          error,
          "Failed to update password. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const blob = await AccountService.exportAccountData();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `colabwize-data-export-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Account data exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: getErrorMessage(
          error,
          "Failed to export account data. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Handle email change button click
  const handleChangeEmail = () => {
    setShowEmailChangeModal(true);
    setEmailChangeStep(1);
    setNewEmail(user?.email || "");
  };

  // Handle new email input change
  const handleNewEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
  };

  // Send OTP for email change
  const handleSendEmailChangeOTP = async () => {
    if (!newEmail || newEmail === user?.email) {
      toast({
        title: "Error",
        description: "Please enter a new email address.",
        variant: "destructive",
      });
      return;
    }

    setOtpLoading(true);
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      // Send OTP for email change
      await AccountService.sendProfileOTP({ email: newEmail });
      setPendingEmailChange(newEmail);
      setEmailChangeStep(2); // Move to OTP verification step
      setOtpValue("");

      toast({
        title: "OTP Sent",
        description: `Please check your new email address (${newEmail}) for the verification code.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: getErrorMessage(
          error,
          "Failed to send OTP. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP for email change
  const handleVerifyEmailChangeOTP = async () => {
    console.log("OTP Value:", otpValue); // Debug log
    if (!otpValue || otpValue.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setOtpLoading(true);
    try {
      console.log("Sending profile update with OTP:", {
        email: pendingEmailChange,
        otp: otpValue,
      }); // Debug log

      // Instead of verifying OTP separately, directly update the profile with OTP included
      // This matches how the Profile page works
      await AccountService.updateProfile({
        email: pendingEmailChange,
        otp: otpValue,
      });

      // Update local user state
      if (user) {
        setUser({
          ...user,
          email: pendingEmailChange,
        });
      }

      toast({
        title: "Success",
        description: "Email address updated successfully.",
      });

      // Close modal after a short delay
      setTimeout(() => {
        setShowEmailChangeModal(false);
        setNewEmail("");
        setPendingEmailChange("");
        setOtpValue("");
      }, 2000);
    } catch (error: any) {
      console.error("Error updating email:", error); // Debug log
      toast({
        title: "Error",
        description: getErrorMessage(
          error,
          "Failed to update email. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // Cancel email change process
  const cancelEmailChange = () => {
    setShowEmailChangeModal(false);
    setNewEmail("");
    setPendingEmailChange("");
    setOtpValue("");
    setEmailChangeStep(1);
  };

  const handleToggleAutoSync = async () => {
    if (!user) return;

    const newValue = !user.zotero_auto_sync;
    try {
      await AccountService.updateProfile({
        zotero_auto_sync: newValue,
      });
      setUser({ ...user, zotero_auto_sync: newValue });
      toast({
        title: newValue
          ? "Zotero Auto-Sync Enabled"
          : "Zotero Auto-Sync Disabled",
        description: newValue
          ? "New citations will now be automatically added to your Zotero."
          : "Zotero auto-sync has been turned off.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to update sync settings."),
        variant: "destructive",
      });
    }
  };

  const handleToggleMendeleyAutoSync = async () => {
    if (!user) return;

    const newValue = !user.mendeley_auto_sync;
    try {
      await AccountService.updateProfile({
        mendeley_auto_sync: newValue,
      });
      setUser({ ...user, mendeley_auto_sync: newValue });
      toast({
        title: newValue
          ? "Mendeley Auto-Sync Enabled"
          : "Mendeley Auto-Sync Disabled",
        description: newValue
          ? "New citations will now be automatically added to your Mendeley library."
          : "Mendeley auto-sync has been turned off.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to update sync settings."),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account details and security
        </p>
      </div>

      <div className="space-y-6 p-6 rounded-2xl bg-white">
        {/* Email Management */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900  mb-4">
              Email Management
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 ">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                </div>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleChangeEmail}>
                Change Email
              </Button>
            </div>
          </div>
        </div>

        {/* Verified Accounts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              Verified Accounts
            </h2>
            <div className="space-y-4">
              {/* Primary Email */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.email}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-md border border-green-100">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </div>
              </div>

              {/* Linked Zotero Account */}
              {user?.zotero_user_id && (
                <div className="flex items-center justify-between p-3 bg-red-50/30 rounded-lg border border-red-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <ZoteroIcon width={32} height={32} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">
                        Linked Zotero
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Status: Verified
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-md border border-green-100">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </div>
                </div>
              )}

              {/* Linked Mendeley Account */}
              {user?.mendeley_access_token && (
                <div className="flex items-center justify-between p-3 bg-blue-50/30 rounded-lg border border-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm border border-blue-50 text-blue-600">
                      <MendeleyIcon className="w-full h-full" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">
                        Linked Mendeley
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Status: Verified
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-md border border-green-100">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Management */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900  mb-4">
              Password Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700  mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 rounded-lg bg-white  text-gray-900  shadow-sm border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 " />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 " />
                    )}
                  </button>
                </div>
              </div>

              <div></div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700  mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 rounded-lg bg-white  text-gray-900  shadow-sm border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 " />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 " />
                    )}
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 ">
                    Password requirements:
                  </p>
                  <ul className="mt-1 space-y-1">
                    <li className="flex items-center text-xs text-gray-500 ">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
                      At least 8 characters
                    </li>
                    <li className="flex items-center text-xs text-gray-500 ">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
                      One uppercase letter
                    </li>
                    <li className="flex items-center text-xs text-gray-500 ">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
                      One number
                    </li>
                    <li className="flex items-center text-xs text-gray-500 ">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 mr-2"></span>
                      One special character
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700  mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 rounded-lg bg-white  text-gray-900  shadow-sm border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 " />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 " />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white mb-2"
                onClick={handleUpdatePassword}
                disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Integrations Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Integrations
            </h2>

            {/* Citations Sub-heading */}
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-800 border-b border-gray-100 pb-2">
                Citations
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Zotero Column */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm border border-red-50 overflow-hidden">
                      <ZoteroIcon className="w-full h-full object-contain scale-[1.3]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Zotero</h3>
                      <p className="text-xs text-gray-500">
                        {user?.zotero_user_id
                          ? `Zotero is active and synced.`
                          : "Sync your research library directly"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={user?.zotero_user_id ? "outline" : "default"}
                    className={
                      user?.zotero_user_id
                        ? "border-red-200 text-red-600 hover:bg-red-50 text-xs px-3"
                        : "bg-red-600 hover:bg-red-700 text-white text-xs px-3"
                    }
                    onClick={async () => {
                      if (user?.zotero_user_id) {
                        toast({
                          title: "Zotero Integration",
                          description:
                            "To disconnect your Zotero, please contact support or revoke access in your library settings.",
                        });
                      } else {
                        window.location.href =
                          await ZoteroService.getConnectUrl();
                      }
                    }}>
                    {user?.zotero_user_id ? "Connected" : "Setup Zotero"}
                  </Button>
                </div>
                {user?.zotero_user_id && (
                  <div className="mt-2 p-3 bg-red-50/20 rounded-lg border border-red-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Automated Zotero Sync
                      </h4>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={handleToggleAutoSync}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          user.zotero_auto_sync ? "bg-red-600" : "bg-gray-200"
                        }`}>
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            user.zotero_auto_sync
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mendeley Column */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm border border-blue-50 text-blue-600">
                      <MendeleyIcon className="h-full w-full" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Mendeley</h3>
                      <p className="text-xs text-gray-500">
                        {user?.mendeley_access_token
                          ? `Mendeley is active and synced.`
                          : "Sync your Mendeley library directly"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={
                      user?.mendeley_access_token ? "outline" : "default"
                    }
                    className={
                      user?.mendeley_access_token
                        ? "border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-3"
                        : "bg-blue-600 hover:bg-blue-700 text-white text-xs px-3"
                    }
                    onClick={async () => {
                      if (user?.mendeley_access_token) {
                        toast({
                          title: "Mendeley Integration",
                          description:
                            "To disconnect Mendeley, please contact support or revoke access in your library settings.",
                        });
                      } else {
                        window.location.href =
                          await MendeleyService.getConnectUrl();
                      }
                    }}>
                    {user?.mendeley_access_token
                      ? "Connected"
                      : "Setup Mendeley"}
                  </Button>
                </div>
                {user?.mendeley_access_token && (
                  <div className="mt-2 p-3 bg-blue-50/20 rounded-lg border border-blue-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Automated Mendeley Sync
                      </h4>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={handleToggleMendeleyAutoSync}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          user.mendeley_auto_sync
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}>
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            user.mendeley_auto_sync
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Drives Sub-heading */}
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-800 border-b border-gray-100 pb-2">
                Drives
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Google Drive Column */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm border border-blue-50 text-blue-600">
                      <GoogleDriveIcon className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Google Drive
                      </h3>
                      <p className="text-xs text-gray-500">
                        Sync and export effortlessly
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={user?.google_access_token ? "outline" : "default"}
                    className={
                      user?.google_access_token
                        ? "border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-3"
                        : "bg-blue-600 hover:bg-blue-700 text-white text-xs px-3"
                    }
                    onClick={async () => {
                      if (user?.google_access_token) {
                        toast({
                          title: "Google Drive Integration",
                          description:
                            "To disconnect your Google Drive, please contact support or revoke access in your Google account settings.",
                        });
                      } else {
                        const connectUrl = await GoogleDriveService.getConnectUrl();
                        window.open(connectUrl, "Google Drive Auth", "width=600,height=600");
                      }
                    }}>
                    {user?.google_access_token ? "Connected" : "Setup Drive"}
                  </Button>
                </div>
              </div>

              {/* OneDrive Column */}
              <div className="flex flex-col h-full opacity-60">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 flex-1 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm border border-blue-50 text-blue-600">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 24 24"
                        fill="currentColor">
                        <path
                          d="M17.44 11.23c-.15-.9-1.01-1.63-2.06-1.63-.16 0-.32.02-.48.05-.33-1.07-1.39-1.85-2.65-1.85-1.42 0-2.61.98-2.91 2.33A3 3 0 0 0 6.5 13a3 3 0 0 0 2.96 3h8.08a2.5 2.5 0 0 0 .46-4.96v.19z"
                          fill="#0078D4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          OneDrive
                        </h3>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold leading-none">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Microsoft OneDrive syncing
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    disabled
                    className="border-gray-200 text-gray-400 cursor-not-allowed text-xs px-3">
                    Setup OneDrive
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <TwoFactorSetup
            isEnabled={user?.two_factor_enabled || false}
            onStatusChange={() => {
              // Refresh user data silently to prevent unmounting TwoFactorSetup
              // and losing the backup codes display state
              AccountService.getUserAccount()
                .then((u) => setUser(u as any))
                .catch(console.error);
            }}
          />
        </div>

        {/* Danger Zone */}
        <div className="bg-white  rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6">
            <h2 className="text-lg font-medium text-red-800 mb-4">
              Danger Zone
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 ">
                    Export Account Data
                  </p>
                  <p className="text-sm text-gray-500  mt-1">
                    Download all your documents, certificates, and data
                  </p>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white mb-2"
                  onClick={handleExportData}
                  disabled={exportLoading}>
                  {exportLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Your Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Change Modal */}
      {showEmailChangeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={cancelEmailChange}></div>

            {/* Modal */}
            <div className="relative bg-white  rounded-lg shadow-xl w-full max-w-md mx-auto">
              <div className="p-6">
                {emailChangeStep === 1 && (
                  <>
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-medium text-gray-900 ">
                        Change Email Address
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 ">
                          Enter your new email address below. We'll send a
                          verification code to confirm the change.
                        </p>
                        <div className="mt-4">
                          <label
                            htmlFor="newEmail"
                            className="block text-sm font-medium text-gray-700  mb-1 text-left">
                            New Email Address
                          </label>
                          <input
                            type="email"
                            id="newEmail"
                            value={newEmail}
                            onChange={handleNewEmailChange}
                            className="w-full px-3 py-2 rounded-lg bg-white  text-gray-900  shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter new email address"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <Button variant="outline" onClick={cancelEmailChange}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleSendEmailChangeOTP}
                        disabled={
                          otpLoading || !newEmail || newEmail === user?.email
                        }>
                        {otpLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Verification Code"
                        )}
                      </Button>
                    </div>
                  </>
                )}

                {emailChangeStep === 2 && (
                  <>
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-medium text-gray-900 ">
                        Enter Verification Code
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 ">
                          Please enter the 6-digit code sent to your new email
                          address ({pendingEmailChange}).
                        </p>
                        <input
                          type="text"
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value)}
                          className="mt-3 w-full px-3 py-2 rounded-lg bg-white  text-gray-900  shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <Button variant="outline" onClick={cancelEmailChange}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleVerifyEmailChangeOTP}
                        disabled={otpLoading || otpValue.length !== 6}>
                        {otpLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsPage;
