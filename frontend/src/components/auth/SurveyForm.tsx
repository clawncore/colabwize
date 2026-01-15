import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";
import authService from "../../services/authService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SurveyFormProps {
  onSuccess: () => void;
}

export default function SurveyForm({ onSuccess }: SurveyFormProps) {
  const [formData, setFormData] = useState({
    role: "", // Changed from userRole to match SurveyData interface
    institution: "",
    fieldOfStudy: "",
    primaryUseCase: "",
    heardAboutPlatform: "",
    userGoal: "",
    mainJob: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const heardAboutOptions = [
    "Facebook",
    "Instagram",
    "YouTube",
    "Reddit",
    "Twitter",
    "LinkedIn",
    "TikTok",
    "Search Engine",
    "Friend/Colleague",
    "University/Institution",
    "Advertisement",
    "Blog/Article",
    "Other",
  ];

  const userRoles = [
    "Student",
    "Researcher",
    "Professor/Faculty",
    "Academic Administrator",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.role) {
      setError("Please select your role");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.submitSurvey(formData);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error("Survey submission error:", err);
      // Show the actual error message for debugging purposes
      setError(
        `Error: ${err.message || JSON.stringify(err) || "An unexpected error occurred"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              How did you hear about us? <span className="text-red-500">*</span>
            </label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, heardAboutPlatform: value })
              }
              required>
              <SelectTrigger className="h-12 rounded-xl bg-white border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {heardAboutOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              What's the main goal you hope to achieve with our product?{" "}
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Tell us about your goals..."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none placeholder-gray-400"
              rows={3}
              value={formData.userGoal}
              onChange={(e) =>
                setFormData({ ...formData, userGoal: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              What best describes your role?{" "}
              <span className="text-red-500">*</span>
            </label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
              required>
              <SelectTrigger className="h-12 rounded-xl bg-white border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {userRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Institution - Keeping as it's useful */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Institution / University (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., Stanford University"
              value={formData.institution}
              onChange={(e) =>
                setFormData({ ...formData, institution: e.target.value })
              }
              className="h-12 rounded-xl bg-white border-gray-300"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              What 'job' are you primarily 'hiring' our product to do for you?
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Describe the main task or problem you want to solve..."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none placeholder-gray-400"
              rows={3}
              value={formData.mainJob}
              onChange={(e) =>
                setFormData({ ...formData, mainJob: e.target.value })
              }
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200"
            disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          This helps us provide better recommendations and features
        </p>
      </form>
    </div>
  );
}
