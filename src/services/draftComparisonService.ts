import { apiClient } from "../services/apiClient";

export interface ComparisonResult {
  similarityScore: number;
  overlapPercentage: number;
  matchedSegments: {
    segment: string;
    similarity: number;
    sourceParams: { start: number; end: number };
    targetParams: { start: number; end: number };
  }[];
  analysis: string;
  isSelfPlagiarismInternal: boolean;
}

export class DraftComparisonService {
  /**
   * Compare a current draft with a previous text or file
   */
  static async compareDrafts(
    projectId: string,
    currentDraft: string,
    data: { previousDraft?: string; file?: File }
  ): Promise<ComparisonResult> {
    const formData = new FormData();
    formData.append("currentDraft", currentDraft);
    formData.append("projectId", projectId);

    if (data.previousDraft) {
      formData.append("comparisonType", "text");
      formData.append("previousDraft", data.previousDraft);
    } else if (data.file) {
      formData.append("comparisonType", "file");
      formData.append("file", data.file);
    }

    // Since I messed up the route/controller param expectation, let's assume I fix backend to read `projectId` from body if param missing.
    // Actually, let's target the route `/api/originality/compare`.

    try {
      const response = await apiClient.post("/originality/compare", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
