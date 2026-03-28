import { apiClient } from "./apiClient";
import { supabase } from "../lib/supabase/client";

export interface ZoteroItem {
  key: string;
  version: number;
  library?: {
    type: string;
    id: number;
    name: string;
    links: {
      alternate: {
        href: string;
        type: string;
      };
    };
  };
  links?: {
    self: {
      href: string;
      type: string;
    };
    alternate: {
      href: string;
      type: string;
    };
  };
  meta: {
    creatorSummary?: string;
    parsedDate?: string;
    numChildren?: number;
  };
  data: {
    key: string;
    version: number;
    itemType: string;
    title: string;
    creators?: Array<{
      creatorType: string;
      firstName?: string;
      lastName?: string;
      name?: string;
    }>;
    abstractNote?: string;
    publicationTitle?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    date?: string;
    series?: string;
    seriesTitle?: string;
    seriesText?: string;
    journalAbbreviation?: string;
    language?: string;
    DOI?: string;
    ISSN?: string;
    shortTitle?: string;
    url?: string;
    accessDate?: string;
    archive?: string;
    archiveLocation?: string;
    libraryCatalog?: string;
    callNumber?: string;
    rights?: string;
    extra?: string;
    tags?: Array<{
      tag: string;
      type?: number;
    }>;
    collections?: string[];
    relations?: Record<string, any>;
    dateAdded?: string;
    dateModified?: string;
    [key: string]: any;
  };
}

export class ZoteroService {
  /**
   * Fetch authenticated user's Zotero library
   */
  static async getLibrary(): Promise<ZoteroItem[]> {
    try {
      const response = await apiClient.get("/api/zotero/library");
      return response.items || [];
    } catch (error) {
      console.error("Failed to fetch Zotero library:", error);
      throw error;
    }
  }

  /**
   * Import specific items from Zotero to a ColabWize project
   */
  static async importItems(projectId: string, itemKeys: string[]): Promise<any> {
    try {
      const response = await apiClient.post("/api/zotero/import", {
        projectId,
        itemKeys,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to import Zotero items:", error);
      throw error;
    }
  }

  /**
   * Search user's Zotero library by DOI, ISBN, or Title
   */
  static async queryLibrary(query: string): Promise<ZoteroItem[]> {
    try {
      const response = await apiClient.get(`/api/zotero/query?q=${encodeURIComponent(query)}`);
      return response || [];
    } catch (error) {
      console.error("Failed to query Zotero library:", error);
      throw error;
    }
  }

  /**
   * Fetch child attachments (PDFs, notes) for a specific item
   */
  static async getAttachments(itemKey: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/zotero/attachments/${itemKey}`);
      return response || [];
    } catch (error) {
      console.error("Failed to fetch Zotero attachments:", error);
      throw error;
    }
  }

  /**
   * Get bibliography strings for specific items in a chosen CSL style
   */
  static async getFormattedBib(itemKey: string, style: string = 'apa'): Promise<any> {
    try {
      const response = await apiClient.get(`/api/zotero/format/${itemKey}?style=${style}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch formatted bibliography:", error);
      throw error;
    }
  }

  /**
   * Update an existing Zotero item (metadata or notes)
   */
  static async updateItem(itemKey: string, updateData: any): Promise<any> {
    try {
      const response = await apiClient.patch(`/api/zotero/items/${itemKey}`, updateData);
      return response;
    } catch (error) {
      console.error("Failed to update Zotero item:", error);
      throw error;
    }
  }

  /**
   * Get the URL to initiate Zotero OAuth connection
   */
  static async getConnectUrl(): Promise<string> {
    const apiUrl = process.env.REACT_APP_API_URL || "https://api.colabwize.com";
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    return `${apiUrl}/api/auth/zotero/connect?token=${token}`;
  }
}

export default ZoteroService;
