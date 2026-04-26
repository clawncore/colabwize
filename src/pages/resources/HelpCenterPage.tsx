import { Link } from "react-router-dom";
import { CreditCard, LifeBuoy, Mail, Zap, BookOpen, Users } from "lucide-react";
import ConfigService from "../../services/ConfigService";

const HelpCenterPage = () => {
  const docsUrl = ConfigService.getDocsUrl();

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header / Hero Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-custom pt-16 pb-12 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Support & Help Center
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Get quick answers, manage your subscription, and resolve issues
              using our self-service tools.
              <br className="hidden md:block" />
              For issues that require additional assistance, our team is
              available via email.
            </p>
          </div>
        </div>

        <div className="container-custom py-12 max-w-5xl">
          {/* 1️⃣ PRIMARY: SELF-SERVICE (TOP, EMPHASIZED) */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-10 border border-blue-100 shadow-sm mb-16 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-100 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-full mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Get Help Instantly
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Most questions can be resolved instantly through your Billing &
                Subscriptions panel or our Help Center.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/dashboard/billing/subscription"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Billing & Subscriptions
                </Link>
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-gray-700 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Visit Help Center
                </a>
              </div>
            </div>
          </section>

          {/* 2️⃣ SECONDARY: CONTACT OPTIONS */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Contact & Support Options
              </span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Product Support */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center mb-5">
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Product & Feature Support
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  For issues related to the editor, originality audits,
                  citations, or general usage questions.
                </p>
                <div className="mt-auto">
                  <p className="text-xs text-gray-400 font-medium mb-4">
                    Response time: 24–48 hours
                  </p>
                  <a
                    href="mailto:support@colabwize.com"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </div>
              </div>

              {/* Card 2: Billing Escalation */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 bg-green-50 text-green-700 rounded-lg flex items-center justify-center mb-5">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Billing Escalation
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  For verified billing errors or payment disputes that cannot be
                  resolved via the self-serve dashboard.
                </p>
                <div className="mt-auto">
                  <p className="text-xs text-green-600 font-medium mb-4 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Self-serve recommended
                  </p>
                  <Link
                    to="/dashboard/billing/subscription"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                    Go to Billing & Subscriptions
                  </Link>
                </div>
              </div>

              {/* Card 3: Partnerships */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center mb-5">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Partnerships & Research
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  For academic institutions, research labs, or enterprise
                  partnership inquiries.
                </p>
                <div className="mt-auto">
                  <p className="text-xs text-gray-400 font-medium mb-4">
                    Business inquiries only
                  </p>
                  <a
                    href="mailto:partnerships@colabwize.com"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Partnerships
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 3️⃣ NEW: FREQUENTLY ASKED QUESTIONS */}
          <section className="mb-16 mt-16">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/3">
                <div className="sticky top-24">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Can't find what you're looking for? Reach out to our support
                    team and we'll be happy to help you get the answers you
                    need.
                  </p>
                  <a
                    href="mailto:support@colabwize.com"
                    className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">
                    Contact Support <span className="ml-2">→</span>
                  </a>
                </div>
              </div>

              <div className="md:w-2/3 space-y-6">
                {/* Getting Started Category */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 text-sm">
                      1
                    </span>
                    Getting Started
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">
                        How does the AI Assistant work?
                      </h4>
                      <p className="text-gray-600">
                        Our AI Assistant is context-aware. It reads the
                        documents in your project library and the text you've
                        written to provide highly relevant suggestions, draft
                        completions, and academic rephrasing. It does not use
                        your private data to train public models.
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">
                        Can I import my existing documents?
                      </h4>
                      <p className="text-gray-600">
                        Yes! You can upload PDFs of papers to your workspace.
                        Our system automatically extracts text, metadata, and
                        citations to build your project's knowledge base.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Editor Features Category */}
                <div className="pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-3 text-sm">
                      2
                    </span>
                    Editor & Research Tools
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">
                        What is the Literature Matrix?
                      </h4>
                      <p className="text-gray-600">
                        The Literature Matrix (accessible via the left sidebar)
                        is a powerful tool that automatically synthesizes your
                        uploaded sources. It compares their methodologies,
                        findings, and limitations side-by-side, helping you
                        identify research gaps quickly.
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">
                        How do I use the Visual Insight Map?
                      </h4>
                      <p className="text-gray-600">
                        The Visual Map analyzes your project and generates an
                        interactive node graph of topics. You can click on
                        topics to instruct the AI to find papers related to that
                        specific sub-topic or to ask targeted questions about
                        those concepts based on your current library.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account & Billing */}
                <div className="pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3 text-sm">
                      3
                    </span>
                    Account & Billing
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">
                        How do I cancel my subscription?
                      </h4>
                      <p className="text-gray-600 mb-2">
                        You can cancel your subscription at any time. Go to the
                        dashboard, click on <strong>Settings & Billing</strong>{" "}
                        in the bottom left, navigate to the{" "}
                        <strong>Billing Info</strong> tab, and click "Cancel
                        Subscription".
                      </p>
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-100">
                        Note: You will retain access to your premium features
                        until the end of your current billing cycle.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4️⃣ NEW: KEYBOARD SHORTCUTS AND TROUBLESHOOTING GRID */}
          <section className="mb-16 border-t border-gray-200 pt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Col: Shortcuts */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-yellow-500" />
                  Editor Keyboard Shortcuts
                </h2>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-3 px-4 font-semibold text-gray-700 text-sm">
                          Action
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-700 text-sm text-right">
                          Windows / Linux
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          Save Document
                        </td>
                        <td className="py-3 px-4 text-right">
                          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 font-mono">
                            Ctrl + S
                          </kbd>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          Open AI Command Bar
                        </td>
                        <td className="py-3 px-4 text-right">
                          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 font-mono">
                            Ctrl + /
                          </kbd>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          Open Literature Matrix
                        </td>
                        <td className="py-3 px-4 text-right">
                          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 font-mono">
                            Alt + M
                          </kbd>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          Open Visual Map
                        </td>
                        <td className="py-3 px-4 text-right">
                          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 font-mono">
                            Alt + V
                          </kbd>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          Toggle Focus Mode
                        </td>
                        <td className="py-3 px-4 text-right">
                          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 font-mono">
                            Alt + F
                          </kbd>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          Format Bold
                        </td>
                        <td className="py-3 px-4 text-right">
                          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 font-mono">
                            Ctrl + B
                          </kbd>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          View Document Outline
                        </td>
                        <td className="py-3 px-4 text-right">
                          <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 font-mono">
                            Alt + O
                          </kbd>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Col: Troubleshooting */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <LifeBuoy className="h-6 w-6 mr-3 text-red-500" />
                  Quick Troubleshooting
                </h2>
                <div className="space-y-4">
                  {/* Issue 1 */}
                  <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      My document isn't saving/syncing
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      This usually happens due to a dropped internet connection
                      or an expired session.
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>Check your internet connection.</li>
                      <li>
                        Try refreshing the page (unsaved changes in the editor
                        are cached locally in your browser).
                      </li>
                      <li>
                        Log out and log back in to refresh your authentication
                        token.
                      </li>
                    </ul>
                  </div>

                  {/* Issue 2 */}
                  <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      AI features are slow or timing out
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Heavy tasks like full-document originality checks or
                      generating a massive literature matrix can take up to 60
                      seconds.
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>
                        Ensure your document text selection isn't too large (try
                        selecting smaller paragraphs).
                      </li>
                      <li>
                        If generating a matrix, wait at least one minute before
                        retrying.
                      </li>
                    </ul>
                  </div>

                  {/* Issue 3 */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Cannot add a collaborator
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      If you receive an error when inviting a team member to
                      your workspace:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>Verify the email address is spelled correctly.</li>
                      <li>
                        Check if you have reached the collaborator limit for
                        your current subscription plan.
                      </li>
                      <li>
                        Ensure the user has created an account on ColabWize
                        before you send the invite.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default HelpCenterPage;
