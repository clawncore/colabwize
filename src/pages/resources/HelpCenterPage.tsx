import { Link } from "react-router-dom";
import {
  CreditCard,
  LifeBuoy,
  Mail,
  ArrowRight,
  Zap,
  BookOpen,
  Users
} from "lucide-react";
import Layout from "../../components/Layout";
import ConfigService from "../../services/ConfigService";

const HelpCenterPage = () => {
  const docsUrl = ConfigService.getDocsUrl();

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header / Hero Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-custom pt-16 pb-12 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Support & Help Center
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Get quick answers, manage your subscription, and resolve issues using our self-service tools.
              <br className="hidden md:block" />
              For issues that require additional assistance, our team is available via email.
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
                Most questions can be resolved instantly through your Billing & Subscriptions panel or our Help Center.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/dashboard/billing"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Billing & Subscriptions
                </Link>
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-gray-700 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm"
                >
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
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact & Support Options</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Product Support */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center mb-5">
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Product & Feature Support</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  For issues related to the editor, originality audits, citations, or general usage questions.
                </p>
                <div className="mt-auto">
                  <p className="text-xs text-gray-400 font-medium mb-4">Response time: 24–48 hours</p>
                  <a
                    href="mailto:support@colabwize.com"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Billing Escalation</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  For verified billing errors or payment disputes that cannot be resolved via the self-serve dashboard.
                </p>
                <div className="mt-auto">
                  <p className="text-xs text-green-600 font-medium mb-4 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Self-serve recommended
                  </p>
                  <Link
                    to="/dashboard/billing"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Go to Billing & Subscriptions
                  </Link>
                </div>
              </div>

              {/* Card 3: Partnerships */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center mb-5">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Partnerships & Research</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  For academic institutions, research labs, or enterprise partnership inquiries.
                </p>
                <div className="mt-auto">
                  <p className="text-xs text-gray-400 font-medium mb-4">Business inquiries only</p>
                  <a
                    href="mailto:partnerships@colabwize.com"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Partnerships
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenterPage;
