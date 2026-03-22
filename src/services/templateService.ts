// TypeScript wrapper for templateService.js
// @ts-ignore
import TemplateServiceJS from "./templateService.js";

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: string;
  content?: any;
  is_public?: boolean;
  citation_style?: string;
  updated_at: string;
  created_at?: string;
  author_name?: string;
  workspace_id?: string;
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

  async getTemplates(filters: any = {}): Promise<Template[]> {
    try {
      // @ts-ignore
      return await TemplateServiceJS.getTemplates(filters);
    } catch (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
  }

  async getAllTemplates(): Promise<Template[]> {
    try {
      // @ts-ignore
      return await TemplateServiceJS.getTemplates({});
    } catch (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      // @ts-ignore
      return await TemplateServiceJS.deleteTemplate(id);
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  }

  async createTemplate(templateData: any): Promise<Template | null> {
    try {
      // @ts-ignore
      return await TemplateServiceJS.createTemplate(templateData);
    } catch (error) {
      console.error("Error creating template:", error);
      return null;
    }
  }

  async updateTemplate(
    templateId: string,
    updateData: any,
  ): Promise<Template | null> {
    try {
      // @ts-ignore
      return await TemplateServiceJS.updateTemplate(templateId, updateData);
    } catch (error) {
      console.error("Error updating template:", error);
      return null;
    }
  }
}

export default new TemplateService();
