
import { apiClient } from "./apiClient";

interface ProfileData {
  name: string;
  email: string;
  username: string;
  bio: string;
  fieldOfStudy: string;
  academicLevel: string;
  institution: string;
  location: string;
  avatarUrl?: string;
}

class ProfileService {
  // Get user profile
  static async getProfile() {
    try {
      const response = await apiClient.get("/api/users");
      console.log("Profile service response:", response); // Debug log

      // Map backend fields to frontend interface
      if (response.user) {
        return {
          name: response.user.full_name || "",
          email: response.user.email || "",
          username: response.user.email?.split("@")[0] || "", // Generate username from email
          bio: response.user.bio || "",
          fieldOfStudy: response.user.field_of_study || "",
          academicLevel: response.user.user_type || "",
          institution: response.user.institution || "",
          location: response.user.location || "",
          avatarUrl: response.user.avatar_url || "",
        };
      }

      // Fallback to empty profile if no user data
      return {
        name: "",
        email: "",
        username: "",
        bio: "",
        fieldOfStudy: "",
        academicLevel: "",
        institution: "",
        location: "",
        avatarUrl: "",
      };
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      // Check if the error is due to HTML response
      if (error.message && error.message.includes("JSON")) {
        console.error(
          "Received HTML instead of JSON - this indicates a server error"
        );
      }
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(profileData: ProfileData) {
    try {
      // Map the profile data to the format expected by the backend
      const backendData = {
        full_name: profileData.name,
        field_of_study: profileData.fieldOfStudy,
        user_type: profileData.academicLevel,
        bio: profileData.bio,
        institution: profileData.institution,
        location: profileData.location,
      };

      const response = await apiClient.put("/api/users", backendData);

      // Check if the response indicates success
      if (!response.success) {
        throw new Error(response.message || "Failed to update profile");
      }

      return response;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  // Upload avatar
  static async uploadAvatar(file: File) {
    try {
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Use apiClient which handles Auth, 401s, and proper FormData headers automatically
      const response = await apiClient.post("/api/users/avatar", formData);

      // Check if the upload was successful
      if (!response.success && response.success !== undefined) {
        // If response has success field, check it. 
        // Note: apiClient usually returns parsed JSON.
        throw new Error(response.message || "Failed to upload avatar");
      }
      // If apiClient returns the object directly and it lacks success=false, good.
      // But let's act defensively based on typical successful response structure { success: true, fileUrl: ... }

      return response.fileUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }
}

export type { ProfileData };
export default ProfileService;
