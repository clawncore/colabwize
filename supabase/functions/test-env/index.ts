// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("=== Test Environment Variables ===");
console.log("All env vars count:", Object.keys(Deno.env.toObject()).length);
console.log("First few env var names:", Object.keys(Deno.env.toObject()).slice(0, 5));
console.log("RESEND_API_KEY exists:", !!Deno.env.get("RESEND_API_KEY"));
console.log("SUPABASE_URL exists:", !!Deno.env.get("SUPABASE_URL"));

Deno.serve(async (req) => {
  const envInfo = {
    count: Object.keys(Deno.env.toObject()).length,
    hasResendKey: !!Deno.env.get("RESEND_API_KEY"),
    hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
    firstFewVars: Object.keys(Deno.env.toObject()).slice(0, 5)
  };

  const data = {
    message: `Environment variable test completed`,
    envInfo: envInfo
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})