import Layout from "../../components/Layout";
import { Shield, Scale, ExternalLink, ChevronRight, Info } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";

// 1. Policy Header
function PolicyHeader() {
  return (
    <section className="py-16 border-b border-gray-200 bg-gray-50">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
        <p className="text-gray-600 text-lg mb-4">
          This policy explains how ColabWize uses cookies and similar
          technologies to recognize you when you visit our platform. It explains
          what these technologies are and why we use them.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
          <span>Effective Date: January 4, 2026</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>Version 1.2</span>
        </div>
      </div>
    </section>
  );
}

// 2. Formal Content Sections
function PolicyContent() {
  const sections = [
    {
      title: "1. Definition of Cookies",
      content:
        "Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.",
    },
    {
      title: "2. Why We Use Cookies",
      content:
        "We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate. We refer to these as 'essential' or 'strictly necessary' cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Services.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom max-w-4xl">
        {/* Intro Sections */}
        {sections.map((s, i) => (
          <div key={i} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{s.title}</h2>
            <p className="text-gray-700 leading-relaxed">{s.content}</p>
          </div>
        ))}

        {/* 3. Detailed Cookie Classification Table */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          3. Types of Cookies We Use
        </h2>

        <div className="space-y-8 mb-16">
          {/* Strictly Necessary */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-green-600" />
              Strictly Necessary Cookies
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              These cookies are essential to provide you with services available
              through our Website and to use some of its features, such as
              access to secure areas.
            </p>
            <div className="bg-gray-50 rounded p-4 text-xs font-mono text-gray-500 grid grid-cols-2 gap-4">
              <div>Name: cw_auth_session</div>
              <div>Purpose: User Authentication</div>
              <div>Provider: ColabWize</div>
              <div>Expiry: 30 Days</div>
            </div>
          </div>

          {/* Analytics */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-blue-600" />
              Analytics and Customization Cookies
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              These cookies collect information that is used either in aggregate
              form to help us understand how our Website is being used or how
              effective our marketing campaigns are.
            </p>
            <div className="bg-gray-50 rounded p-4 text-xs font-mono text-gray-500 grid grid-cols-2 gap-4">
              <div>Name: _ga</div>
              <div>Purpose: Usage Analytics</div>
              <div>Provider: Google</div>
              <div>Expiry: 2 Years</div>
            </div>
          </div>
        </div>

        {/* 4. Other Tracking Technologies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            4. What about other tracking technologies, like web beacons?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cookies are not the only way to recognize or track visitors to a
            website. We may use other, similar technologies from time to time,
            like web beacons (sometimes called "tracking pixels" or "clear
            gifs"). These are tiny graphics files that contain a unique
            identifier that enable us to recognize when someone has visited our
            Website or opened an e-mail including them.
          </p>
          <p className="text-gray-700 leading-relaxed">
            This allows us, for example, to monitor the traffic patterns of
            users from one page within a website to another, to deliver or
            communicate with cookies, to understand whether you have come to the
            website from an online advertisement displayed on a third-party
            website, to improve site performance, and to measure the success of
            e-mail marketing campaigns. In many instances, these technologies
            are reliant on cookies to function properly, and so declining
            cookies will often impair their functioning.
          </p>
        </div>

        {/* 5. Targeted Advertising */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            5. Do you serve targeted advertising?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Third parties may serve cookies on your computer or mobile device to
            serve advertising through our Website. These companies may use
            information about your visits to this and other websites in order to
            provide relevant advertisements about goods and services that you
            may be interested in. They may also employ technology that is used
            to measure the effectiveness of advertisements.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              We do not sell your personal data to advertisers. Any advertising
              is done through aggregated, anonymized data partners.
            </p>
          </div>
        </div>

        {/* 6. Updates to Policy */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. How often will you update this Cookie Policy?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Cookie Policy from time to time in order to
            reflect, for example, changes to the cookies we use or for other
            operational, legal, or regulatory reasons. Please therefore re-visit
            this Cookie Policy regularly to stay informed about our use of
            cookies and related technologies. The date at the top of this Cookie
            Policy indicates when it was last updated.
          </p>
        </div>

        {/* 7. More Information */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Where can I get further information?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions about our use of cookies or other
            technologies, please email us at{" "}
            <a
              href="mailto:privacy@colabwize.com"
              className="text-green-600 hover:underline">
              privacy@colabwize.com
            </a>
            .
          </p>
          <p className="text-gray-700">
            For more information about cookies, you can visit:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
            <li>
              <a
                href="https://allaboutcookies.org"
                target="_blank"
                rel="noreferrer"
                className="text-green-600 hover:underline inline-flex items-center gap-1">
                All About Cookies <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              <a
                href="https://www.youronlinechoices.com/"
                target="_blank"
                rel="noreferrer"
                className="text-green-600 hover:underline inline-flex items-center gap-1">
                Your Online Choices <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>

        {/* 8. Cookie Consent Manager */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            8. Cookie Consent Manager
          </h2>
          <p className="text-gray-700 mb-6">
            You have the right to decide whether to accept or reject cookies.
            You can exercise your cookie rights by setting your preferences in
            the Cookie Consent Manager. The Cookie Consent Manager allows you to
            select which categories of cookies you accept or reject. Essential
            cookies cannot be rejected as they are strictly necessary to provide
            you with services.
          </p>
          <div className="bg-green-50 border border-green-100 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-green-900">Manage your settings</h4>
              <p className="text-sm text-green-800">
                Change your preferences or withdraw your consent at any time.
              </p>
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem("cookie-consent");
                window.location.reload();
              }}
              className="bg-green-700 hover:bg-green-800 text-white">
              Reset Cookie Preferences
            </Button>
          </div>
        </div>

        {/* 9. Contact Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            9. Contact Us
          </h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about our use of cookies or other
            technologies, please contact us at:
          </p>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-green-600" />
              <strong>Email:</strong> privacy@colabwize.com
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-green-600" />
              <strong>Support:</strong>{" "}
              <RouterLink to="/contact" className="text-green-700 underline">
                Contact Form
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function CookiePolicyPage() {
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <PolicyHeader />
        <PolicyContent />
      </div>
    </Layout>
  );
}
