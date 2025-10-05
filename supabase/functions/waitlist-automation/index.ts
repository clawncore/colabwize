/// <reference types="@supabase/supabase-js" />

import { Resend } from "resend";
// This function adapts the handler to the Supabase Edge runtime
// If using npm: install @supabase/functions and import from it
import { serve } from "https://deno.land/x/supabase_functions_runtime@v1.8.0/function_handler.ts";
const resend = new Resend("re_QTsCAvAb_Eyo8L9nLeaWYx5WpJcHSB4kc");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
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
      from: "CollaborateWise <onboarding@collaboratewise.com>",
      to: entry.email,
      subject: "🎉 You're In! Welcome to the CollaborateWise Waitlist",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome aboard${
          entry.name ? ", " + entry.name : ""
        }!</h1>

        <p>You've successfully secured your spot on the CollaborateWise Early Access list. We're thrilled to have you join the revolution to make academic writing stress-free.</p>

        <p>We built CollaborateWise to solve the pain of juggling Grammarly, Turnitin, Zotero, and Trello just to write one paper. Soon, you'll have all your AI writing, plagiarism detection, and smart citation tools unified in one workspace.</p>

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">Your Waitlist Position</h2>
          <p style="font-size: 24px; font-weight: bold; color: #2563eb;">#${
            entry.position
          }</p>
          <p>Share your referral code to move up: <strong>${
            entry.referralCode
          }</strong></p>
          <p><a href="https://collaboratewise.com?ref=${
            entry.referralCode
          }" style="color: #2563eb;">https://collaboratewise.com?ref=${
        entry.referralCode
      }</a></p>
        </div>

        <h3>What happens next?</h3>
        <ul>
          <li>We're currently polishing our final features</li>
          <li>You'll receive exclusive updates and early sneak peeks</li>
          <li>We'll notify you the moment we open the doors for early access</li>
        </ul>

        <p>In the meantime, feel free to connect with us on <a href="https://twitter.com/collaboratewise" style="color: #2563eb;">Twitter</a> to follow our development journey.</p>

        <p>Happy writing (soon!),<br>The CollaborateWise Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">You're receiving this because you signed up for the CollaborateWise waitlist. <a href="#" style="color: #6b7280;">Unsubscribe</a></p>
      </div>
    `,
    };

    console.log("Sending welcome email to:", entry.email);
    const { data, error } = await resend.emails.send(emailContent);

    if (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }

    console.log("Welcome email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
};

const sendSneakPeekEmail = async (entry: WaitlistEntry) => {
  /**
   * This function sends a sneak peek email to the user.
   */
  try {
    const emailContent = {
      from: "CollaborateWise <updates@collaboratewise.com>",
      to: entry.email,
      subject: "✍️ Sneak Peek: Stop Juggling Tools—Just Write.",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Hi${
          entry.name ? " " + entry.name : ""
        }!</h1>

        <p>We know you joined our list because you're tired of tool overload. That's why we're giving you a quick look at one of the features that makes CollaborateWise truly unified:</p>

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">The Smart Citation Manager 📚</h2>
          <p>Instead of manually formatting references in APA, MLA, or Chicago, CollaborateWise lets you:</p>
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
          <a href="https://collaboratewise.com/feedback" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Share Your Feedback</a>
        </p>

        <p>More updates soon,<br>The CollaborateWise Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">You're receiving this because you signed up for the CollaborateWise waitlist. <a href="#" style="color: #6b7280;">Unsubscribe</a></p>
      </div>
    `,
    };

    console.log("Sending sneak peek email to:", entry.email);
    const { data, error } = await resend.emails.send(emailContent);

    if (error) {
      console.error("Error sending sneak peek email:", error);
      throw error;
    }

    console.log("Sneak peek email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send sneak peek email:", error);
    throw error;
  }
};

const sendCollaborationEmail = async (entry: WaitlistEntry) => {
  try {
    const emailContent = {
      from: "CollaborateWise <team@collaboratewise.com>",
      to: entry.email,
      subject: "👥 Collaboration Made Easy (Bring Your Team)",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Hi${
          entry.name ? " " + entry.name : ""
        }!</h1>

        <p>When writing a paper, research isn't a solo sport. That's why CollaborateWise is built with Google Docs-style collaboration—but customized for academics.</p>

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
          <a href="https://collaboratewise.com?ref=${
            entry.referralCode
          }" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Share with Your Team</a>
        </p>

        <p>Feel free to share this link with classmates, colleagues, or anyone who struggles with academic writing:</p>
        <p><a href="https://collaboratewise.com?ref=${
          entry.referralCode
        }" style="color: #2563eb;">https://collaboratewise.com?ref=${
        entry.referralCode
      }</a></p>

        <p>We're excited to see what you'll write!<br>Best,<br>The CollaborateWise Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">You're receiving this because you signed up for the CollaborateWise waitlist. <a href="#" style="color: #6b7280;">Unsubscribe</a></p>
      </div>
    `,
    };

    console.log("Sending collaboration email to:", entry.email);
    const { data, error } = await resend.emails.send(emailContent);

    if (error) {
      console.error("Error sending collaboration email:", error);
      throw error;
    }

    console.log("Collaboration email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send collaboration email:", error);
    throw error;
  }
};

const sendLaunchEmail = async (entry: WaitlistEntry) => {
  try {
    const emailContent = {
      from: "CollaborateWise <launch@collaboratewise.com>",
      to: entry.email,
      subject:
        "🔓 The Doors Are Open! Your CollaborateWise Early Access is Here.",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Hi${
          entry.name ? " " + entry.name : ""
        }!</h1>

        <p style="font-size: 18px; font-weight: bold;">The wait is over! 🎉</p>

        <p>We are officially opening the doors to our exclusive early access group. Your academic writing workflow is about to be unified.</p>

        <p style="text-align: center; margin: 40px 0;">
          <a href="https://app.collaboratewise.com/signup" style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">Activate My Account Now</a>
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

        <p>The CollaborateWise Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">You're receiving this because you signed up for the CollaborateWise waitlist. <a href="#" style="color: #6b7280;">Unsubscribe</a></p>
      </div>
    `,
    };

    console.log("Sending launch email to:", entry.email);
    const { data, error } = await resend.emails.send(emailContent);

    if (error) {
      console.error("Error sending launch email:", error);
      throw error;
    }

    console.log("Launch email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send launch email:", error);
    throw error;
  }
};

async function handleRequest(req: Request): Promise<Response> {
  /**
   * This function handles the request and sends the appropriate email.
   */
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, entry } = (await req.json()) as {
      type: string;
      entry: WaitlistEntry;
    };

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
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

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

serve(async (req: Request) => {
  /**
   * This is the main entry point for the function.
   * It handles the request and sends the appropriate email.
   */
  try {
    return await handleRequest(req);
  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
