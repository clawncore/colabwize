import {
  Mail,
  Building2,
  Newspaper,
  Check,
  ArrowRight,
  Globe,
  Users,
  Clock,
  MessageCircle,
  Building,
} from "lucide-react";
import { useState } from "react";

interface ContactProps {
  onWaitlistClick: () => void;
}

export default function Contact({ onWaitlistClick }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const globalCommunityStats = [
    { country: "United States", users: 3200, flag: "🇺🇸" },
    { country: "United Kingdom", users: 1800, flag: "🇬🇧" },
    { country: "Canada", users: 950, flag: "🇨🇦" },
    { country: "Australia", users: 720, flag: "🇦🇺" },
    { country: "Germany", users: 680, flag: "🇩🇪" },
    { country: "India", users: 1200, flag: "🇮🇳" },
    { country: "Brazil", users: 540, flag: "🇧🇷" },
    { country: "Other Countries", users: 1910, flag: "🌍" },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop')",
            zIndex: 0,
          }}
        ></div>

        <div
          className="absolute inset-0 bg-black/20"
          style={{ zIndex: 1 }}
        ></div>

        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ zIndex: 2 }}
        >
          <div className="bg-blue-100 border-l-4 border-blue-600 p-4 mb-8 max-w-4xl mx-auto">
            <p className="text-blue-800 font-semibold">
              🚀 CollaborateWise is launching Q1 2025 —{" "}
              <button
                onClick={onWaitlistClick}
                className="underline hover:no-underline"
              >
                Join the waitlist for updates
              </button>
            </p>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              We're Here to Help — Anytime, Anywhere
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              Got a question? Need help with CollaborateWise? Whether you're
              writing your first essay or submitting your thesis, we're only a
              message away.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-8 text-gray-700">
            <div className="flex items-center">
              <Clock className="mr-2" size={20} />
              <span>24-hour response time</span>
            </div>
            <div className="flex items-center">
              <Globe className="mr-2" size={20} />
              <span>Global support</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2" size={20} />
              <span>Community driven</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            {" "}
            How Can We Help You?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl text-center">
              <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">General Inquiries</h3>
              <p className="text-gray-600 mb-4">
                Questions about CollaborateWise?
              </p>
              <a
                href="mailto:support@collaboratewise.ai"
                className="text-blue-600 hover:underline font-semibold"
              >
                support@collaboratewise.ai
              </a>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl text-center">
              <Building2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Partnerships</h3>
              <p className="text-gray-600 mb-4">
                Institutional access inquiries
              </p>
              <a
                href="mailto:partners@collaboratewise.ai"
                className="text-purple-600 hover:underline font-semibold"
              >
                partners@collaboratewise.ai
              </a>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl text-center">
              <Newspaper className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Press & Media</h3>
              <p className="text-gray-600 mb-4">Media inquiries welcome</p>
              <a
                href="mailto:press@collaboratewise.ai"
                className="text-green-600 hover:underline font-semibold"
              >
                press@collaboratewise.ai
              </a>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">
                    Thanks for reaching out!
                  </h4>
                  <p className="text-gray-600">
                    We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="you@university.edu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="support">Support</option>
                      <option value="billing">Billing</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact Info */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Other Ways to Reach Us
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support</h3>
              <p className="text-gray-600">Questions? Email us at</p>
              <p className="text-blue-600 font-medium">
                hello@collaboratewise.com
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Partnerships</h3>
              <p className="text-gray-600">
                Interested in institutional access?
              </p>
              <p className="text-purple-600 font-medium">Let's talk.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Newspaper className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Press</h3>
              <p className="text-gray-600">Media inquiries welcome at</p>
              <p className="text-green-600 font-medium">
                press@collaboratewise.com
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-2">
                Is CollaborateWise free to start?
              </h3>
              <p className="text-gray-600">
                Yes! Our Free Plan gives you 1 active project, 5,000
                words/month, and basic plagiarism checks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-2">
                Do I need a credit card to sign up?
              </h3>
              <p className="text-gray-600">
                No, you can start free without payment info.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-2">
                How does plagiarism detection work?
              </h3>
              <p className="text-gray-600">
                We scan your text against billions of sources and flag
                similarities with detailed reports.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-2">
                Can I use CollaborateWise offline?
              </h3>
              <p className="text-gray-600">
                Yes, you can write offline and sync your work once you're back
                online.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-2">
                Do you offer student discounts?
              </h3>
              <p className="text-gray-600">
                Yes, our Student Pro plan is designed to be affordable at just
                $7/month (or $5/month for early supporters).
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-2">
                When will CollaborateWise launch?
              </h3>
              <p className="text-gray-600">
                We're targeting Q1 2025. Join the waitlist to get notified when
                we launch!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Community Map */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Our Global Community
          </h2>
          <p className="text-center text-gray-600 mb-12">
            CollaborateWise users span across continents, united by a passion
            for better academic writing.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {globalCommunityStats.map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">{stat.flag}</div>
                <div className="font-semibold text-gray-900">
                  {stat.country}
                </div>
                <div className="text-blue-600 font-medium">
                  {stat.users.toLocaleString()} users
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Join students and researchers from around the world who are
              building the future of academic writing.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Don't Let Questions Hold You Back
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Your next project could be your best — let us help you get there.
            Join thousands of students already preparing for launch.
          </p>
          <button
            onClick={onWaitlistClick}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg inline-flex items-center space-x-2"
          >
            <span>Join Waitlist</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
