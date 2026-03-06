/**
 * Service to handle Discord Webhook notifications
 */
class DiscordWebhookService {
  private static readonly SURVEY_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1445798910298816645/jwQCSXU42Z_8yH0mQHRWwsO6EjkkbeY2pJIWaDs9jQk-aazPUETdLfgEeY6GuzFU8jS7";

  private static readonly CONTACT_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1445347000466935869/em8gX4l4S02fzeYgh2aoeUsGGxqgF9UPW-zlMaLd2GdM5nsAbOgmb1c4mS0xFJ--nj7b";

  private static readonly FEEDBACK_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1445349012785074317/tVR9cz3trTXBLU3aThYV1gMcZJ8v0gLX65192h0x0986EaqzZzDpVs4R2AvT9Tt3mtUm";

  private static readonly DEMO_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1445342945568882769/nCaxkt3ZFn8nWYhrxvZ2zd9GK8JqAauIn_t-wGJTYAqHBWPuwHKIjasUGdui7BtXnecT";

  private static readonly SUPPORT_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1446457603004698736/EVPDzNd6aQMQt5Kcm-On4srql2PlLp0dFIbjeUhOEPCrT2KPvOyPFz1HrAsvD4ehiYTA";

  private static readonly FEATURE_REQUEST_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1445733290584838177/Z6jALguF9Aj7ZdWKVi0aZkFERKVc0FligdR0PvuuYfFCef0Hw35_yge6woGd8RHcfMaH";

  /**
   * Send a survey response notification to Discord
   */
  static async sendSurveyNotification(
    surveyData: any,
    userEmail?: string,
  ): Promise<boolean> {
    try {
      const payload = {
        embeds: [
          {
            title: "📝 New Onboarding Survey Response",
            color: 0x5865f2, // Discord Blue
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "Email",
                value: userEmail || "Not provided",
                inline: true,
              },
              {
                name: "Role",
                value: surveyData.role || "Not specified",
                inline: true,
              },
              {
                name: "How they heard about us",
                value: surveyData.heardAboutPlatform || "Not specified",
                inline: false,
              },
              {
                name: "Main Goal",
                value: surveyData.userGoal || "Not specified",
                inline: false,
              },
              {
                name: "Primary Job/Problem",
                value: surveyData.mainJob || "Not specified",
                inline: false,
              },
              {
                name: "Institution",
                value: surveyData.institution || "Not specified",
                inline: true,
              },
            ],
            footer: {
              text: "ColabWize Onboarding Bot",
            },
          },
        ],
      };

      const response = await fetch(this.SURVEY_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Discord webhook failed with status ${response.status}`,
        );
      }

      return true;
    } catch (error) {
      console.error("Error sending Discord notification:", error);
      return false;
    }
  }

  /**
   * Send a contact form notification to Discord
   */
  static async sendContactNotification(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    try {
      const payload = {
        embeds: [
          {
            title: "📧 New Contact Form Submission",
            color: 0x2ecc71, // Green
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "Name",
                value: contactData.name,
                inline: true,
              },
              {
                name: "Email",
                value: contactData.email,
                inline: true,
              },
              {
                name: "Subject",
                value: contactData.subject,
                inline: false,
              },
              {
                name: "Message",
                value: contactData.message,
                inline: false,
              },
            ],
            footer: {
              text: "ColabWize Contact Bot",
            },
          },
        ],
      };

      const response = await fetch(this.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Discord webhook failed with status ${response.status}`,
        );
      }

      return true;
    } catch (error) {
      console.error("Error sending Discord contact notification:", error);
      return false;
    }
  }

  /**
   * Send a feedback notification to Discord
   */
  static async sendFeedbackNotification(feedbackData: {
    type: string;
    priority: string;
    title: string;
    description: string;
    userEmail?: string;
    rating?: number;
  }): Promise<boolean> {
    try {
      const payload = {
        embeds: [
          {
            title: `🚀 New ${feedbackData.type === "bug_report" ? "Bug Report" : feedbackData.type === "feature_request" ? "Feature Request" : "General Feedback"}`,
            color:
              feedbackData.priority === "critical"
                ? 0xff0000
                : feedbackData.priority === "high"
                  ? 0xe67e22
                  : 0x3498db,
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "Priority",
                value: feedbackData.priority.toUpperCase(),
                inline: true,
              },
              {
                name: "User Email",
                value: feedbackData.userEmail || "Anonymous",
                inline: true,
              },
              {
                name: "Title",
                value: feedbackData.title,
                inline: false,
              },
              {
                name: "Description",
                value: feedbackData.description,
                inline: false,
              },
            ],
            footer: {
              text: "ColabWize Feedback Bot",
            },
          },
        ],
      };

      if (feedbackData.rating) {
        payload.embeds[0].fields.push({
          name: "Rating",
          value: "⭐".repeat(feedbackData.rating) || "None",
          inline: true,
        });
      }

      const response = await fetch(this.FEEDBACK_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Discord webhook failed with status ${response.status}`,
        );
      }

      return true;
    } catch (error) {
      console.error("Error sending Discord feedback notification:", error);
      return false;
    }
  }

  /**
   * Send a demo request notification to Discord
   */
  static async sendDemoNotification(demoData: {
    name: string;
    email: string;
    institution?: string;
    role: string;
    date: string;
    time: string;
    message?: string;
  }): Promise<boolean> {
    try {
      const payload = {
        embeds: [
          {
            title: "📅 New Demo Request Scheduled",
            color: 0x1abc9c, // Turquoise
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "Name",
                value: demoData.name,
                inline: true,
              },
              {
                name: "Email",
                value: demoData.email,
                inline: true,
              },
              {
                name: "Institution",
                value: demoData.institution || "Not specified",
                inline: true,
              },
              {
                name: "Role",
                value: demoData.role,
                inline: true,
              },
              {
                name: "Date",
                value: demoData.date,
                inline: true,
              },
              {
                name: "Time",
                value: demoData.time,
                inline: true,
              },
              {
                name: "Message",
                value: demoData.message || "No message provided",
                inline: false,
              },
            ],
            footer: {
              text: "ColabWize Demo Bot",
            },
          },
        ],
      };

      const response = await fetch(this.DEMO_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Discord webhook failed with status ${response.status}`,
        );
      }

      return true;
    } catch (error) {
      console.error("Error sending Discord demo notification:", error);
      return false;
    }
  }

  /**
   * Send a support ticket notification to Discord
   */
  static async sendSupportTicketNotification(ticketData: {
    subject: string;
    message: string;
    priority: string;
    userEmail?: string;
    userName?: string;
    attachmentName?: string;
  }): Promise<boolean> {
    try {
      const payload = {
        embeds: [
          {
            title: "🎫 New Support Ticket Submitted",
            color: 0xf1c40f, // Yellow
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "Subject",
                value: ticketData.subject.toUpperCase(),
                inline: true,
              },
              {
                name: "Priority",
                value: ticketData.priority.toUpperCase(),
                inline: true,
              },
              {
                name: "User",
                value: `${ticketData.userName || "Unknown"} (${ticketData.userEmail || "Anonymous"})`,
                inline: false,
              },
              {
                name: "Message",
                value: ticketData.message,
                inline: false,
              },
              {
                name: "Attachment",
                value: ticketData.attachmentName || "None",
                inline: true,
              },
            ],
            footer: {
              text: "ColabWize Support Bot",
            },
          },
        ],
      };

      const response = await fetch(this.SUPPORT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Discord webhook failed with status ${response.status}`,
        );
      }

      return true;
    } catch (error) {
      console.error("Error sending Discord support notification:", error);
      return false;
    }
  }

  /**
   * Send a feature request notification to Discord
   */
  static async sendFeatureRequestNotification(requestData: {
    title: string;
    description: string;
    userEmail?: string;
    userName?: string;
  }): Promise<boolean> {
    try {
      const payload = {
        embeds: [
          {
            title: "💡 New Feature Request Submitted",
            color: 0x9b59b6, // Purple
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "Title",
                value: requestData.title,
                inline: false,
              },
              {
                name: "Description",
                value: requestData.description,
                inline: false,
              },
              {
                name: "Submitted By",
                value: `${requestData.userName || "Unknown"} (${requestData.userEmail || "Anonymous"})`,
                inline: false,
              },
            ],
            footer: {
              text: "ColabWize Feature Bot",
            },
          },
        ],
      };

      const response = await fetch(this.FEATURE_REQUEST_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Discord webhook failed with status ${response.status}`,
        );
      }

      return true;
    } catch (error) {
      console.error(
        "Error sending Discord feature request notification:",
        error,
      );
      return false;
    }
  }
}

export default DiscordWebhookService;
