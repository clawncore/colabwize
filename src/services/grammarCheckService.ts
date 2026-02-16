import { supabase } from "../lib/supabase/client";
import ConfigService from "./ConfigService";

const API_BASE_URL = ConfigService.getApiUrl();

export interface GrammarError {
    original: string;
    suggestion: string;
    type: "spelling" | "grammar" | "style" | "capitalization" | "punctuation";
    explanation: string;
}

export const GrammarCheckService = {
    async checkText(text: string): Promise<GrammarError[]> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) throw new Error("No active session");

            const response = await fetch(`${API_BASE_URL}/api/grammar/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || "Failed to check grammar");
            }

            return result.errors || [];
        } catch (error) {
            console.error("Grammar check service error:", error);
            return [];
        }
    }
};
