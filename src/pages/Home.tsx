import {
  CheckCircle,
  Check,
  Play,
  Users,
  Globe,
  Building2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import CountdownTimer from "../components/CountdownTimer";
import { supabase } from "../lib/supabaseClient";
import {
  FEATURES,
  TESTIMONIALS,
  FAQ_ITEMS,
} from "../lib/mockData";

interface HomeProps {
  onWaitlistClick: () => void;
}

export default function Home({ onWaitlistClick }: HomeProps) {
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const { count, error } = await supabase
          .from("waitlist")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching waitlist count:", error);
          return;
        }

        setWaitlistCount(count || 0);
      } catch (err) {
        console.error("Unexpected error fetching waitlist count:", err);
      }
    };

    fetchWaitlistCount();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block bg-purple-500 bg-opacity-40 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-pulse">
              <span className="text-sm font-semibold">
                Coming Soon - Q1 2025
              </span>
            </div>

            {/* Headlines */}
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Your Entire Academic <br />
              <span className="relative">
                Workflow, Unified
                <svg
                  className="absolute left-0 w-full h-3 -bottom-2"
                  viewBox="0 0 300 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5,8 Q150,2 295,6"
                    stroke="#FFCF00"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-xl lg:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Write smarter, cite faster, and check originality — all in one
              beautiful workspace built for students and researchers. Launching
              early 2025.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-4">
                <input
                  type="email"
                  placeholder="Enter your email to get early access"
                  className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-600 text-gray-900 text-lg"
                />
                <button
                  type="button"
                  onClick={onWaitlistClick}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg whitespace-nowrap"
                >
                  Join the Waitlist
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>Be among the first to try</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>Exclusive early access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>No spam, ever</span>
                </div>
              </div>

              <p className="mt-4 text-white text-sm text-center font-semibold">
                Join {waitlistCount.toLocaleString()} students already on the
                waitlist
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-opacity-30 transition font-semibold flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch 60-sec Demo</span>
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-opacity-30 transition font-semibold"
              >
                See What's Coming
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            Sound Familiar?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            ColabWize is here to change that.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">😫</div>
              <h3 className="text-xl font-bold mb-2">Juggling 5+ tools</h3>
              <p className="text-gray-600">
                Switching between Grammarly, Turnitin, Zotero, Overleaf, and
                Trello just to finish one paper.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">😰</div>
              <h3 className="text-xl font-bold mb-2">Plagiarism anxiety</h3>
              <p className="text-gray-600">
                Stressing about originality scores before submission and hoping
                everything is cited correctly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-2">Hours on formatting</h3>
              <p className="text-gray-600">
                Losing precious time formatting citations manually in APA, MLA,
                or Chicago style.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            Built to Save You Time and Stress
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Say goodbye to tool overload. Everything you need is finally in one
            place.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">✍️</div>
              <h3 className="text-2xl font-bold mb-3">Focus on Writing</h3>
              <p className="text-gray-600">
                Stop jumping between apps. Stay in flow from first draft to
                final submission.
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-3">
                Academic Integrity First
              </h3>
              <p className="text-gray-600">
                Built-in plagiarism detection keeps your work original and
                compliant.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold mb-3">
                Made for Collaboration
              </h3>
              <p className="text-gray-600">
                Work with classmates in real-time — smarter than Google Docs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Powerful Features Coming Soon
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition"
              >
                <div
                  className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center text-3xl mb-4`}
                >
                  {feature.icon}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-semibold">
                    Q1 2025
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            Early Bird Pricing
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Lock in special pricing before we launch
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-2">Free Forever</h3>
              <div className="text-4xl font-bold mb-6">
                $0<span className="text-lg text-gray-500">/month</span>
              </div>
              <p className="text-gray-600 mb-6">
                Perfect for trying ColabWize
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">1 active project</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">5,000 words/month</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic AI writing assistance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Simple plagiarism checks</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">APA, MLA, Chicago citations</span>
                </li>
              </ul>
            </div>

            <div className="border-4 border-blue-600 rounded-2xl p-8 relative shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Student Pro</h3>
              <div className="mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold">$5</span>
                  <span className="text-lg text-gray-500 line-through">$7</span>
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-sm text-blue-600 font-semibold mt-1">
                  Save 30% as an early supporter
                </p>
              </div>
              <p className="text-gray-600 mb-6">Everything students need</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited projects</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited words</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced AI writing assistant</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    Comprehensive plagiarism reports
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">All citation styles</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Real-time collaboration</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Export to all formats</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
              <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold text-center">
                Waitlist Exclusive Discount
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-2">Researcher</h3>
              <div className="mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold">$15</span>
                  <span className="text-lg text-gray-500 line-through">
                    $20
                  </span>
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-sm text-blue-600 font-semibold mt-1">
                  Save 25% as an early supporter
                </p>
              </div>
              <p className="text-gray-600 mb-6">For serious researchers</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Everything in Student Pro</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Journal-specific formatting</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Version history</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Team management</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">API access</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onWaitlistClick}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg inline-flex items-center space-x-2"
            >
              <span>Join Waitlist to Lock In Early Pricing</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-600 mt-4">
              First 1,000 users get lifetime discount
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Trusted by Students Worldwide
          </h2>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="text-4xl font-bold text-blue-600">
                  {waitlistCount.toLocaleString()}+
                </div>
              </div>
              <p className="text-gray-600">On waitlist</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Globe className="w-8 h-8 text-blue-600" />
                <div className="text-4xl font-bold text-blue-600">15+</div>
              </div>
              <p className="text-gray-600">Countries represented</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div className="text-4xl font-bold text-blue-600">20+</div>
              </div>
              <p className="text-gray-600">Universities interested</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="w-8 h-8 text-blue-600" />
                <div className="text-4xl font-bold text-blue-600">45</div>
              </div>
              <p className="text-gray-600">Days until launch</p>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">
              Launching in:
            </h3>
            <CountdownTimer />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 italic mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Join the Waitlist?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Early Access</h3>
              <p className="text-gray-600">
                Be first to try ColabWize when we launch
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Exclusive Discount</h3>
              <p className="text-gray-600">
                Lock in 30% off lifetime as an early supporter
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-5xl mb-4">🗳️</div>
              <h3 className="text-xl font-bold mb-2">Shape the Product</h3>
              <p className="text-gray-600">
                Vote on features and influence development
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-5xl mb-4">🎁</div>
              <h3 className="text-xl font-bold mb-2">Bonus Perks</h3>
              <p className="text-gray-600">
                Free templates, priority support, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {FAQ_ITEMS.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Be Part of the Academic Revolution
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students and researchers building the future of
            academic writing. No credit card. No commitment. Just your email.
          </p>

          <button
            onClick={onWaitlistClick}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg inline-flex items-center space-x-2"
          >
            <span>
              Join {waitlistCount.toLocaleString()} Others on the Waitlist
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-sm text-blue-100 mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
