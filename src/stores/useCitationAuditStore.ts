
import { create } from 'zustand';

interface CitationAuditState {
    auditResult: any | null;
    loading: boolean;
    error: string | null;
    timestamp: number | null;

    setAuditResult: (result: any) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useCitationAuditStore = create<CitationAuditState>((set) => ({
    auditResult: null,
    loading: false,
    error: null,
    timestamp: null,

    setAuditResult: (result) => set({
        auditResult: result,
        error: null,
        timestamp: Date.now()
    }),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error, loading: false }),

    reset: () => set({
        auditResult: null,
        loading: false,
        error: null,
        timestamp: null
    })
}));
