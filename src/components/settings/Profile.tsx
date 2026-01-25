import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "../../hooks/use-toast";
import { Loader2, User, Upload, BadgeCheck } from "lucide-react";
import ProfileService, { ProfileData } from "../../services/profileService";
import { supabase } from "../../lib/supabase/client"; // Import Supabase client
import apiClient from "../../services/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    username: "",
    bio: "",
    fieldOfStudy: "",
    academicLevel: "",
    institution: "",
    location: "",
  });
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(
    null
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false); // New modal for method selection
  const [otp, setOtp] = useState("");
  const [otpMethod, setOtpMethod] = useState<"email" | "sms">("email"); // Default to email
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getProfile();
      setProfile(data);
      setOriginalProfile({ ...data });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = () => {
    // Check if user has phone number to offer choice
    // If we have both, show selector. If only email, default to email.
    // For now, let's always show selector if we want to be explicit, 
    // or just checking if phone exists to enable that option.

    // Logic: 
    // 1. Store pending data
    setPendingProfileData(profile);
    // 2. Open Method Selection Modal
    setShowMethodModal(true);
  };

  const handleRequestOTP = async () => {
    setSaving(true);
    try {
      // Request OTP with selected method
      const response = await apiClient.post("/api/users/request-otp", {
        action: "profile_update",
        delivery_method: otpMethod
      });

      if (response.success) {
        setShowMethodModal(false);
        setShowOTPModal(true);
        toast({
          title: "Code Sent",
          description: `Verification code sent to your ${otpMethod === 'email' ? 'email' : 'phone'}.`,
        });
      } else {
        throw new Error(response.message || "Failed to request OTP");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to send code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOTPSubmit = async () => {
    const otpValue = otp || "";
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
      // Submit the profile update with OTP
      const updateData = {
        ...pendingProfileData,
        otp: otpValue,
      };

      // Create a proper ProfileData object
      const profileData: ProfileData = {
        name: updateData.name,
        email: updateData.email,
        username: updateData.username,
        bio: updateData.bio,
        fieldOfStudy: updateData.fieldOfStudy,
        academicLevel: updateData.academicLevel,
        institution: updateData.institution,
        location: updateData.location,
      };

      // Add OTP to the backend data
      const backendData = {
        full_name: profileData.name,
        field_of_study: profileData.fieldOfStudy,
        user_type: profileData.academicLevel,
        bio: profileData.bio,
        institution: profileData.institution,
        location: profileData.location,
        otp: updateData.otp,
      };

      const response = await apiClient.put("/api/users/profile", backendData);

      // Check if the response indicates success
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        });

        setOriginalProfile({ ...pendingProfileData });
        setShowOTPModal(false);
        setOtp("");
        setPendingProfileData(null);
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const hasChanges = () => {
    if (!originalProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(originalProfile);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    // Changed from max-w-4xl to w-full to fill the whole page
    <div className="w-full bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      {/* Added dark mode support to the container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Profile Picture */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Profile Picture
            </h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {avatarPreview || profile.avatarUrl ? (
                  <img
                    src={avatarPreview || profile.avatarUrl}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  // Added dark mode support to the default avatar
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <label className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      handleAvatarChange(e);

                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          // Refresh the profile to get the updated avatar
                          await fetchProfile();

                          // Force update Supabase session to reflect change globally
                          // apiClient returns fileUrl in some versions, or we can use the result if available
                          // But safe way is to just call updateUser with the url if we have it.
                          // Since we just called fetchProfile, we can use the refreshed profile data
                          // BUT fetchProfile relies on state which might not be updated yet.

                          // More reliable: rely on the fact that uploadAvatar returns the URL (from Service)
                          // We need to capture the return from ProfileService.uploadAvatar
                          // Let's modify the line above:
                          // const url = await ProfileService.uploadAvatar(file); 
                          // (Wait, ProfileService.uploadAvatar return type in current file?)
                          // Looking at service file: returns response.fileUrl;

                          // Re-implementing call to capture URL:
                          const uploadedUrl = await ProfileService.uploadAvatar(file);

                          if (uploadedUrl) {
                            await supabase.auth.updateUser({
                              data: { avatar_url: uploadedUrl }
                            });
                            // This triggers useAuth subscription update
                          }

                          await fetchProfile(); // Update local state too
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description:
                              error.message ||
                              "Failed to upload avatar. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                  />
                </label>
              </div>
              <div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white mb-2"
                  variant="outline">
                  Change Photo
                </Button>
                {/* Added dark mode support to the text */}
                <p className="text-sm text-gray-500">
                  JPG, GIF or PNG. Max 1MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                {/* Added dark mode support to the input */}
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
                {/* Added dark mode support to the helper text */}
                <p className="mt-1 text-sm text-gray-500">Min 2 characters</p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  {/* Added dark mode support to the input */}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-gray-900"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <BadgeCheck className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                {/* Added dark mode support to the verified text */}
                <p className="mt-1 text-sm text-green-600 ">Verified</p>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700  mb-1">
                  Username
                </label>
                {/* Added dark mode support to the input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 ">@</span>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-8 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>
                {/* Added dark mode support to the helper text */}
                <p className="mt-1 text-sm text-gray-500 ">
                  Used for @mentions
                </p>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700  mb-1">
                  Bio
                </label>
                {/* Added dark mode support to the textarea */}
                <textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
                <div className="flex justify-between mt-1">
                  {/* Added dark mode support to the helper text */}
                  <p className="text-sm text-gray-500 ">
                    You have typed {profile.bio.length} characters
                  </p>
                  <p className="text-sm text-gray-500 ">
                    {(profile.bio || "").length}/200
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fieldOfStudy"
                  className="block text-sm font-medium text-gray-700  mb-1">
                  Field of Study
                </label>
                {/* Added dark mode support to the input */}
                <input
                  type="text"
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  value={profile.fieldOfStudy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="academicLevel"
                  className="block text-sm font-medium text-gray-700  mb-1">
                  Academic Level
                </label>
                {/* Added dark mode support to the select */}
                <select
                  id="academicLevel"
                  name="academicLevel"
                  value={profile.academicLevel}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900">
                  <option value="">Select level</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="institution"
                  className="block text-sm font-medium text-gray-700  mb-1">
                  Institution
                </label>
                {/* Added dark mode support to the input */}
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={profile.institution}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700  mb-1">
                  Location
                </label>
                {/* Added dark mode support to the input */}
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profile.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveClick}
              disabled={!hasChanges() || saving}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>

      {showOTPModal && (
        <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
          <DialogContent className="sm:max-w-md bg-white text-gray-900">
            <DialogHeader>
              <DialogTitle>Verify Profile Update</DialogTitle>
              <DialogDescription>
                We've sent a 6-digit verification code to your {otpMethod === 'sms' ? 'phone number' : 'email address'}.
                Please enter it below to confirm your profile update.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="otp" className="text-right mb-2 block">
                Verification Code
              </Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit code"
                className="col-span-3"
              />
            </div>
            <DialogFooter className="sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp("");
                }}>
                Cancel
              </Button>
              <Button
                onClick={handleOTPSubmit}
                disabled={otpLoading || !otp || otp.length !== 6}
                className="bg-blue-600 text-white">
                {otpLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Verification Method Selection Modal */}
      <Dialog open={showMethodModal} onOpenChange={setShowMethodModal}>
        <DialogContent className="sm:max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>Verify Profile Update</DialogTitle>
            <DialogDescription>
              To confirm your profile update, we'll send a verification code.
              Please choose how you'd like to receive it.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup
              defaultValue="email"
              value={otpMethod}
              onValueChange={(val) => setOtpMethod(val as "email" | "sms")}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="email" id="method-email" />
                <Label htmlFor="method-email" className="flex-1 cursor-pointer">
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-500">{profile.email}</div>
                </Label>
              </div>

              {/* Only show/enable phone option if phone number exists? 
                  For now showing it but it might fail if no phone. 
                  Ideally we check profile.phone_number if available in state. 
                  (Note: profile state object might not have phone_number if not fetched/mapped)
                  ProfileData interface doesn't have phone_number. 
                  So let's assume if they select SMS and have no phone, backend error will handle it.
              */}
              <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="sms" id="method-sms" />
                <Label htmlFor="method-sms" className="flex-1 cursor-pointer">
                  <div className="font-medium">Phone Number</div>
                  <div className="text-sm text-gray-500">
                    {/* Phone number not visible in frontend ProfileData interface currently, so just generic text */}
                    Via SMS
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowMethodModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestOTP}
              disabled={saving}
              className="bg-blue-600 text-white">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
