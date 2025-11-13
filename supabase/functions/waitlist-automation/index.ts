/// <reference types="@supabase/supabase-js" />

// Initialize Plunk client with better error handling
let plunkApiKey = Deno.env.get("PLUNK_API_KEY") || "";

console.log("=== Function Initialization ===");
console.log("PLUNK_API_KEY exists:", !!plunkApiKey);
console.log("API Key length:", plunkApiKey.length);

// Create a Plunk-like client using fetch
const plunk = {
  emails: {
    send: async (emailContent: any) => {
      if (!plunkApiKey) {
        console.warn("PLUNK_API_KEY not found - using mock client");
        return { success: true, data: { id: "mock-id" } };
      }

      try {
        const response = await fetch("https://api.useplunk.com/v1/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${plunkApiKey}`
          },
          body: JSON.stringify({
            to: emailContent.to,
            subject: emailContent.subject,
            body: emailContent.body
          })
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Plunk API error:", result);
          return { success: false, message: result.message || "Failed to send email" };
        }

        return { success: true, data: result };
      } catch (error) {
        console.error("Error sending email via Plunk:", error);
        return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
      }
    }
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, origin, referer",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface WaitlistEntry {
  email: string;
  name?: string;
  referralCode: string;
  position: number;
}

const sendWelcomeEmail = async (entry: WaitlistEntry) => {
  /**
   * This function sends a welcome email to the user.
   */
  try {
    const emailContent = {
      from: "onboarding@colabwize.vercel.app",
      to: entry.email,
      subject: "🎉 You're In! Welcome to the ColabWize Waitlist",
      body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome aboard${entry.name ? ", " + entry.name : ""
        }!</h1>

        <p>You've successfully secured your spot on the ColabWize Early Access list. We're thrilled to have you join the revolution to make academic writing stress-free.</p>

        <p>We built ColabWize to solve the pain of juggling Grammarly, Turnitin, Zotero, and Trello just to write one paper. Soon, you'll have all your AI writing, plagiarism detection, and smart citation tools unified in one workspace.</p>

        <div style="background-color: #dbeafe; padding: 20px; Sborder-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">Your Waitlist Position</h2>
          <p style="font-size: 24px; font-weight: bold; color: #2563eb;">#${entry.position
        }</p>
          <p>Share your referral code to move up: <strong>${entry.referralCode
        }</strong></p>
          <p><a href="https://colabwize.vercel.app?ref=${entry.referralCode
        }" style="color: #2563eb;">https://colabwize.vercel.app?ref=${entry.referralCode
        }</a></p>
        </div>

        <h3>What happens next?</h3>
        <ul>
          <li>We're currently polishing our final features</li>
          <li>You'll receive exclusive updates and early sneak peeks</li>
          <li>We'll notify you the moment we open the doors for early access</li>
        </ul>

        <p>In the meantime, feel free to connect with us on <a href="https://x.com/colabwize" style="color: #000000;">X</a> to follow our development journey.</p>

        <p>Happy writing (soon!),<br>The ColabWize Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">You're receiving this because you signed up for the ColabWize waitlist. <a href="#" style="color: #6b7280;">Unsubscribe</a></p>
      </div>
    `,
    };

    console.log("Sending welcome email to:", entry.email);
    const result = await plunk.emails.send(emailContent);

    if (!result.success) {
      console.error("Error sending welcome email:", JSON.stringify(result, null, 2));
      return { error: result.message || "Failed to send email" };
    }

    console.log("Welcome email sent successfully:", JSON.stringify(result, null, 2));
    return result.data || { message: "Email sent successfully" };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

const sendSneakPeekEmail = async (entry: WaitlistEntry) => {
  /**
   * This function sends a sneak peek email to the user.
   */
  try {
    const emailContent = {
      from: "updates@colabwize.vercel.app",
      to: entry.email,
      subject: "✍️ Sneak Peek: Stop Juggling Tools—Just Write.",
      body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Hi${entry.name ? " " + entry.name : ""
        }!</h1>

        <p>We know you joined our list because you're tired of tool overload. That's why we're giving you a quick look at one of the features that makes ColabWize truly unified:</p>

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">The Smart Citation Manager 📚</h2>
          <p>Instead of manually formatting references in APA, MLA, or Chicago, ColabWize lets you:</p>
          <ul>
            <li>✅ Paste a DOI or URL and instantly generate a perfect reference</li>
            <li>✅ Add it to your text with one click</li>
            <li>✅ Format your entire bibliography in seconds</li>
          </ul>
          <p><strong>Imagine the time you'll save!</strong> That's time you can put back into research or, better yet, sleeping.</p>
        </div>

        <h3>A Quick Question for You:</h3>
        <p>Since you're joining the early access group, we value your input. What is the one feature you must have in an academic writing tool?</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://colabwize.vercel.app/feedback" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Share Your Feedback</a>
        </p>

        <p>More updates soon,<br>The ColabWize Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">You're receiving this because you signed up for the ColabWize waitlist. <a href="#" style="color: #6b7280;">Unsubscribe</a></p>
      </div>
    `,
    };

    console.log("Sending sneak peek email to:", entry.email);
    const result = await plunk.emails.send(emailContent);

    if (!result.success) {
      console.error("Error sending sneak peek email:", JSON.stringify(result, null, 2));
      return { error: result.message || "Failed to send email" };
    }

    console.log("Sneak peek email sent successfully:", JSON.stringify(result, null, 2));
    return result.data || { message: "Email sent successfully" };
  } catch (error) {
    console.error("Failed to send sneak peek email:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

const sendCollaborationEmail = async (entry: WaitlistEntry) => {
  try {
    const emailContent = {
      from: "team@colabwize.vercel.app",
      to: entry.email,
      subject: "👥 Collaboration Made Easy (Bring Your Team)",
      body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Hi${entry.name ? " " + entry.name : ""
        }!</h1>

        <p>When writing a paper, research isn't a solo sport. That's why ColabWize is built with Google Docs-style collaboration—but customized for academics.</p>

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">Real-time Collaboration 👥</h2>
          <p>You and your co-authors will be able to work together seamlessly:</p>
          <ul>
            <li>➡️ See changes live</li>
            <li>➡️ Add specific, citation-linked comments</li>
            <li>➡️ Maintain version history for integrity</li>
          </ul>
        </div>

        <h3>Want to secure your team's spot?</h3>
        <p>Every friend you refer helps us open the doors for early access faster! The more users we validate, the sooner we launch.</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://colabwize.vercel.app?ref=${entry.referralCode
        }" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Share with Your Team</a>
        </p>

        <p>Feel free to share this link with classmates, colleagues, or anyone who struggles with academic writing:</p>
        <p><a href="https://colabwize.vercel.app?ref=${entry.referralCode
        }" style="color: #2563eb;">https://colabwize.vercel.app?ref=${entry.referralCode
        }</a></p>

        <p>We're excited to see what you'll write!<br>Best,<br>The ColabWize Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">You're receiving this because you signed up for the ColabWize waitlist. <a href="#" style="color: #6b7280;">Unsubscribe</a></p>
      </div>
    `,
    };

    console.log("Sending collaboration email to:", entry.email);
    const result = await plunk.emails.send(emailContent);

    if (!result.success) {
      console.error("Error sending collaboration email:", JSON.stringify(result, null, 2));
      return { error: result.message || "Failed to send email" };
    }

    console.log("Collaboration email sent successfully:", JSON.stringify(result, null, 2));
    return result.data || { message: "Email sent successfully" };
  } catch (error) {
    console.error("Failed to send collaboration email:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

const sendLaunchEmail = async (entry: WaitlistEntry) => {
  try {
    const emailContent = {
      from: "launch@colabwize.vercel.app",
      to: entry.email,
      subject:
        "🔓 The Doors Are Open! Your ColabWize Early Access is Here.",
      body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Hi${entry.name ? " " + entry.name : ""
        }!</h1>

        <p style="font-size: 18px; font-weight: bold;">The wait is over! 🎉</p>

        <p>We are officially opening the doors to our exclusive early access group. Your academic writing workflow is about to be unified.</p>

        <p style="text-align: center; margin: 40px 0;">
          <a href="https://app.colabwize.vercel.app/signup" style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">Activate My Account Now</a>
        </p>

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">As an early access member, you get:</h2>
          <ul>
            <li>✅ 30% lifetime discount on all paid plans</li>
            <li>✅ Priority customer support</li>
            <li>✅ Exclusive early access to new features</li>
            <li>✅ Direct line to our product team</li>
            <li>✅ Free premium templates library</li>
          </ul>
        </div>

        <p style="font-size: 18px; text-align: center;">We can't wait to see what you create.</p>

        <p>The ColabWize Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">You're receiving this because you signed up for the ColabWize waitlist. <a href="#" style="color: #6b7280;">Unsubscribe</a></p>
      </div>
    `,
    };

    console.log("Sending launch email to:", entry.email);
    const result = await plunk.emails.send(emailContent);

    if (!result.success) {
      console.error("Error sending launch email:", JSON.stringify(result, null, 2));
      return { error: result.message || "Failed to send email" };
    }

    console.log("Launch email sent successfully:", JSON.stringify(result, null, 2));
    return result.data || { message: "Email sent successfully" };
  } catch (error) {
    console.error("Failed to send launch email:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

async function handleRequest(req: Request): Promise<Response> {
  /**
   * This function handles the request and sends the appropriate email.
   */
  try {
    console.log("=== handleRequest called ===");

    let requestData;
    try {
      requestData = (await req.json()) as {
        type?: string;
        entry?: WaitlistEntry;
        name?: string;
        email?: string;
        position?: number;
        referralCode?: string;
      };
      console.log("Parsed request data:", JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    let type: string;
    let entry: WaitlistEntry;

    // Handle the new structure where type and entry are nested
    if (requestData.type && requestData.entry) {
      type = requestData.type;
      entry = requestData.entry;
      console.log("Using new structure with type:", type);

      // Validate required fields
      if (!entry.email) {
        console.error("Email is required");
        throw new Error("Email is required");
      }
      // Ensure all required fields have default values if missing
      entry.position = entry.position !== undefined ? entry.position : 0;
      entry.referralCode = entry.referralCode || '';
      entry.name = entry.name || '';
    } else {
      // Handle the old structure (backward compatibility)
      type = 'immediateWelcome';
      console.log("Using backward compatibility structure");

      // Validate required email field
      if (!requestData.email) {
        console.error("Email is required");
        throw new Error("Email is required");
      }
      entry = {
        name: requestData.name || '',
        email: requestData.email,
        position: requestData.position !== undefined ? requestData.position : 0,
        referralCode: requestData.referralCode || ''
      } as WaitlistEntry;
    }

    console.log("Processing request with type:", type, "and entry:", JSON.stringify(entry, null, 2));

    let result;
    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(entry);
        break;
      case "sneakPeek":
        result = await sendSneakPeekEmail(entry);
        break;
      case "collaboration":
        result = await sendCollaborationEmail(entry);
        break;
      case "launch":
        result = await sendLaunchEmail(entry);
        break;
      case "immediateWelcome":
        // Send immediate welcome message after joining waitlist
        result = await sendWelcomeEmail(entry);
        break;
      default:
        console.error("Unknown email type:", type);
        throw new Error(`Unknown email type: ${type}`);
    }

    console.log("Request processed successfully, returning result:", JSON.stringify(result, null, 2));

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}

Deno.serve(async (req: Request) => {
  /**
   * This is the main entry point for the function.
   * It handles the request and sends the appropriate email.
   */
  // Log all requests for debugging
  console.log("Function called:", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Test environment variable access
  console.log("=== Function Entry Environment Test ===");
  console.log("PLUNK_API_KEY exists:", !!Deno.env.get("PLUNK_API_KEY"));
  console.log("API Key length:", (Deno.env.get("PLUNK_API_KEY") || "").length);
  console.log("=== End Function Entry Test ===");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request with headers:", corsHeaders);
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    return await handleRequest(req);
  } catch (error) {
    console.error("Fatal error in Deno.serve:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});