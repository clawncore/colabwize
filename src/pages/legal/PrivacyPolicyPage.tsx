import { Check } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";

// Intro Hero Section
function IntroHero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop')",
        }}></div>
      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Privacy{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Last updated: January 2026. We're committed to protecting your
            privacy and data security.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              Get Started
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              asChild>
              <RouterLink to="/contact">Contact Us</RouterLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Detail Component


// Features Presentation Flow
function FeaturesPresentationFlow() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="space-y-24">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  1. Information We Collect
                </h2>
                <p className="text-gray-600 mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Account information (name, email, password)</li>
                  <li>Documents you upload for analysis</li>
                  <li>Usage data and analytics</li>
                  <li>Payment information (processed securely by Stripe)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  2. Google User Data & Limited Use
                </h2>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r">
                  <p className="text-sm text-blue-700">
                    <strong>Compliance Notice:</strong> We strictly adhere to the Google API Services User Data Policy, including the Limited Use requirements.
                  </p>
                </div>
                <p className="text-gray-600 mb-4">
                  If you choose to sign in with Google, we access the following information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li><strong>Basic Profile:</strong> Name, Email, and Profile Picture to create your account.</li>
                </ul>
                <p className="text-gray-600 mb-4">
                  <strong>Limited Use Disclosure:</strong> Use of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements. We do not use Google user data for advertising purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  3. How We Use Your Information
                </h2>
                <p className="text-gray-600 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Provide, maintain, and improve our services users</li>
                  <li>Process your documents and generate reports</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Analyze usage patterns to improve our platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  4. Data Security
                </h2>
                <p className="text-gray-600">
                  We implement industry-standard security measures to protect
                  your data:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
                  <li>End-to-end encryption for all data transmission</li>
                  <li>
                    Encrypted storage of documents and personal information
                  </li>
                  <li>Regular security audits and penetration testing</li>
                  <li>SOC 2 Type II compliance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  5. Data Retention
                </h2>
                <p className="text-gray-600">
                  We retain your documents for 30 days after deletion. You can
                  permanently delete your data at any time from your account
                  settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  6. Your Rights
                </h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Export your data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  7. Contact Us
                </h2>
                <p className="text-gray-600">
                  If you have questions about this Privacy Policy, please
                  contact us at{" "}
                  <a
                    href="mailto:privacy@colabwize.com"
                    className="text-green-600 hover:underline">
                    privacy@colabwize.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Closing CTA
function ClosingCTA() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <section className="section-padding relative overflow-hidden bg-white">
      {/* Background with academic shapes */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 opacity-95"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-green-300/30 rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 border-2 border-green-300/30 rotate-12"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Have Questions About Your Privacy?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            We're committed to protecting your data and privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              Start Your Free Trial
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <a
                href="https://docs.colabwize.com/quickstart"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                See How It Works
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Available worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </Layout>
  );
}
