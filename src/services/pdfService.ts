import { apiClient } from "./apiClient";

export interface Annotation {
    id?: string;
    file_id: string;
    user_id: string;
    content?: string;
    type: string;
    color?: string;
    coordinates: any;
}

export class PDFService {
    /**
     * Get all annotations for a specific file
     */
    static async getAnnotations(fileId: string): Promise<Annotation[]> {
        try {
            const response = await apiClient.get(`/api/annotations/${fileId}`);
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch annotations:", error);
            throw new Error(error.message || "Failed to fetch annotations");
        }
    }

    /**
     * Save a new annotation
     */
    static async saveAnnotation(annotation: Omit<Annotation, 'id' | 'user_id'>): Promise<Annotation> {
        try {
            const response = await apiClient.post("/api/annotations", annotation);
            return response.data;
        } catch (error: any) {
            console.error("Failed to save annotation:", error);
            throw new Error(error.message || "Failed to save annotation");
        }
    }

    /**
     * Update an annotation
     */
    static async updateAnnotation(id: string, content: string): Promise<Annotation> {
        try {
            const response = await apiClient.put(`/api/annotations/${id}`, { content });
            return response.data;
        } catch (error: any) {
            console.error("Failed to update annotation:", error);
            throw new Error(error.message || "Failed to update annotation");
        }
    }

    /**
     * Delete an annotation
     */
    static async deleteAnnotation(id: string): Promise<void> {
        try {
            await apiClient.delete(`/api/annotations/${id}`);
        } catch (error: any) {
            console.error("Failed to delete annotation:", error);
            throw new Error(error.message || "Failed to delete annotation");
        }
    }
}
