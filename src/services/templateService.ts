// TypeScript wrapper for templateService.js
// @ts-ignore
import TemplateServiceJS from "./templateService.js";

interface Template {
    id: string;
    type: string;
    citation_style?: string;
    content?: any;
    [key: string]: any;
}

class TemplateService {
    async getTemplateByType(typeId: string): Promise<Template | null> {
        try {
            // @ts-ignore
            return await TemplateServiceJS.getTemplateByType(typeId);
        } catch (error) {
            console.error("Error fetching template:", error);
            return null;
        }
    }

    async getAllTemplates(): Promise<Template[]> {
        try {
            // @ts-ignore
            return await TemplateServiceJS.getAllTemplates();
        } catch (error) {
            console.error("Error fetching templates:", error);
            return [];
        }
    }
}

export default new TemplateService();
