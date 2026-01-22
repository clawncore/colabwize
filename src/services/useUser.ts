import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

interface User {
    id: string;
    email?: string;
    [key: string]: any;
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Function to manually refresh user data
    const refreshUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } catch (error) {
            console.error("Error refreshing user:", error);
            setUser(null);
        }
    };

    useEffect(() => {
        // Get current user
        const getCurrentUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error("Error fetching user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getCurrentUser();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { user, loading, refreshUser };
}
