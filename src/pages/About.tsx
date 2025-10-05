import { useState, useEffect } from "react";
import { Globe, Users, Shield, ArrowRight } from "lucide-react";

interface AboutProps {
  onWaitlistClick: () => void;
}

export default function About({ onWaitlistClick }: AboutProps) {
  const [stats] = useState({
    waitlistCount: 10000,
    universities: 20,
    countries: 15,
    wordsToWrite: 1000000,
  });

  // Animated counter effect
  const [animatedStats, setAnimatedStats] = useState({
    waitlistCount: 0,
    universities: 0,
    countries: 0,
    wordsToWrite: 0,
  });

  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000; // 2 seconds
      const steps = 60; // 60 fps
      const increment = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        setAnimatedStats({
          waitlistCount: Math.floor(stats.waitlistCount * progress),
          universities: Math.floor(stats.universities * progress),
          countries: Math.floor(stats.countries * progress),
          wordsToWrite: Math.floor(stats.wordsToWrite * progress),
        });

        if (step >= steps) {
          clearInterval(timer);
          setAnimatedStats(stats);
        }
      }, increment);

      return () => clearInterval(timer);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    const statsElement = document.getElementById("impact-stats");
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => observer.disconnect();
  }, [stats]);



  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 py-20 overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=800&fit=crop')",
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
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Built for Students. Trusted by Researchers. Driven by Purpose.
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              ColabWize was created with one mission: to make academic
              success accessible to every student, anywhere in the world.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="text-xl mb-4">
              It started with frustration. Switching between Grammarly,
              Turnitin, Zotero, Overleaf, and Trello just to finish one paper
              felt overwhelming.
            </p>
            <p className="text-xl mb-4">
              We thought:{" "}
              <span className="font-semibold italic">
                what if there was one intelligent workspace for everything?
              </span>
            </p>
            <p className="text-xl">
              That question became ColabWize — an academic hub where
              students and researchers can write, cite, check originality, and
              collaborate without stress.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-2xl mb-8 leading-relaxed">
            To empower learners everywhere with the tools they need to write
            better, collaborate smarter, and achieve more.
          </p>
          <p className="text-lg text-blue-100">
            We believe great ideas shouldn't be blocked by tool overload, high
            costs, or limited access. That's why ColabWize is designed to
            be affordable, accessible, and AI-powered — leveling the academic
            playing field for everyone.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            We're Building in Public
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Follow our journey as we create the future of academic writing
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Development Timeline</h3>
              <p className="text-gray-600">
                Check our public roadmap to see what we're working on and what's
                coming next.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">Weekly Updates</h3>
              <p className="text-gray-600">
                Get behind-the-scenes insights sent directly to your inbox every
                week.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Community Input</h3>
              <p className="text-gray-600">
                Your feedback shapes our product. Vote on features and join the
                conversation.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onWaitlistClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold inline-flex items-center space-x-2"
            >
              <span>Join Our Journey</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Global Impact (And We Haven't Even Launched Yet!)
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16">
            Why be late? Join the waitlist now and be part of the revolution.
          </p>

          <div
            id="impact-stats"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <div className="text-center p-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {animatedStats.waitlistCount.toLocaleString()}+
              </div>
              <p className="text-gray-600">
                Students waiting for ColabWize
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {animatedStats.universities}+
              </div>
              <p className="text-gray-600">
                Universities testing institutional pilots
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {animatedStats.countries}+
              </div>
              <p className="text-gray-600">Countries represented</p>
            </div>

            <div className="text-center p-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {(animatedStats.wordsToWrite / 1000000).toFixed(1)}M+
              </div>
              <p className="text-gray-600">Words to be written and cited</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl text-gray-700 mb-4">
              Don't be left behind. Join the waitlist now.
            </p>
            <button
              onClick={onWaitlistClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Globe className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">
                Accessibility First 🌍
              </h3>
              <p className="text-gray-700">
                Affordable plans, offline-first editing, and multi-language
                support to reach students everywhere.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Ethical AI 🤖</h3>
              <p className="text-gray-700">
                Transparent suggestions, privacy-first design, and GDPR/FERPA
                compliance you can trust.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">
                Community Over Competition 👥
              </h3>
              <p className="text-gray-700">
                Built to connect students, researchers, and institutions — not
                isolate them.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Closing CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Join Our Journey
          </h2>

          <p className="text-xl mb-12 text-blue-100">
            Want to help shape ColabWize? Join as a beta tester and be
            part of building the future of academic writing.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">
                🚀 Beta Tester Program
              </h3>
              <p className="text-blue-100 mb-4">
                Get early access, test new features, and directly influence our
                development roadmap.
              </p>
              <button
                onClick={onWaitlistClick}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Join Beta Program
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">📬 Stay Updated</h3>
              <p className="text-blue-100 mb-4">
                Join our waitlist for exclusive updates, launch announcements,
                and early bird pricing.
              </p>
              <button
                onClick={onWaitlistClick}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Join Waitlist
              </button>
            </div>
          </div>

          <p className="text-sm text-blue-200">
            Building something this big takes a community. Thank you for being
            part of ours.
          </p>
        </div>
      </section>
    </div>
  );
}
