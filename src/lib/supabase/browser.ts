import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../types/supabase";

export const supabaseBrowser = () =>
  createBrowserClient<Database>(
    process.env.REACT_APP_SUPABASE_URL!,
    process.env.REACT_APP_SUPABASE_ANON_KEY!,
  );
