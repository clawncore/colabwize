import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import ConfigService from "../../services/ConfigService";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";

import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  Users,
  Shield,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";

export default function ScheduleDemoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    role: "",
    date: "",
    time: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // detailed message with all form fields
      const detailedMessage = `
Institution: ${formData.institution || "Not specified"}
Role: ${formData.role}
Preferred Date: ${formData.date}
Preferred Time: ${formData.time}

Message:
${formData.message || "No additional message provided."}
      `.trim();

      const payload = {
        name: formData.name,
        email: formData.email,
        subject: "New Schedule Demo Request",
        message: detailedMessage,
      };

      const response = await fetch(`${ConfigService.getApiUrl()}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to schedule demo"
        );
      }

      setSubmitStatus({
        type: "success",
        message:
          "Your demo request has been sent successfully! Check your email for a calendar invite.",
      });
      console.log("Demo scheduled:", data);

      // Reset form after submission
      setFormData({
        name: "",
        email: "",
        institution: "",
        role: "",
        date: "",
        time: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error scheduling demo:", error);
      setSubmitStatus({
        type: "error",
        message: error.message || "An error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Intro Hero Section
  function IntroHero() {
    return (
      <section className="section-padding bg-white relative overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop')",
          }}></div>
        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Schedule a Demo
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              See ColabWize in action. Book a personalized demo with our team
              and discover how we can help you defend your academic work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                onClick={() =>
                  document
                    .getElementById("demo-form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }>
                Schedule Demo Now
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/">Learn More</RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Feature Detail Component
  function FeatureDetail({
    icon: Icon,
    title,
    description,
    benefits,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    benefits: string[];
  }) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 hover:border-green-500/50 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Features Presentation Flow
  function FeaturesPresentationFlow() {
    const features = [
      {
        icon: Video,
        title: "30-Minute Live Demo",
        description:
          "Experience all features in action with real examples tailored to your specific use case.",
        benefits: [
          "Live walkthrough of core features",
          "Real-time Q&A with our experts",
          "Customized to your needs",
        ],
      },
      {
        icon: Clock,
        title: "Flexible Scheduling",
        description:
          "Choose a time that works for your busy schedule with our easy booking system.",
        benefits: [
          "Multiple time slots available",
          "Calendar integration",
          "Automatic reminders",
        ],
      },
      {
        icon: CheckCircle,
        title: "Personalized Walkthrough",
        description:
          "Get a demo specifically tailored to your academic or research needs.",
        benefits: [
          "Customized based on your role",
          "Focus on features relevant to you",
          "Address specific concerns",
        ],
      },
      {
        icon: Shield,
        title: "Expert Guidance",
        description:
          "Learn from our team of academic integrity specialists and technical experts.",
        benefits: [
          "Industry best practices",
          "Integration tips",
          "Implementation strategies",
        ],
      },
    ];

    return (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What to Expect in Your Demo
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our personalized demos showcase exactly how ColabWize can help you
              maintain academic integrity and defend your work
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <FeatureDetail
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                benefits={feature.benefits}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Closing CTA Section
  function ClosingCTA() {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Schedule Your Demo?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of researchers and students who are already using
              ColabWize to maintain academic integrity and defend their work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                onClick={() =>
                  document
                    .getElementById("demo-form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }>
                Schedule Demo Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/contact">Contact Sales</RouterLink>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Trusted by 10,000+
                </h3>
                <p className="text-gray-600">
                  Students and researchers worldwide
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                  <Star className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  4.9/5 Rating
                </h3>
                <p className="text-gray-600">Based on user reviews</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Enterprise Security
                </h3>
                <p className="text-gray-600">GDPR compliant & secure</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <Layout>
      <IntroHero />
      <FeaturesPresentationFlow />

      {/* Demo Form Section */}
      <section className="section-padding bg-white" id="demo-form">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="text-center mb-8">
                <Calendar className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Book Your Personalized Demo
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and our team will contact you to
                  schedule your demo
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      value={formData.institution}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          institution: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }>
                      <option value="">Select your role</option>
                      <option value="student">Student</option>
                      <option value="researcher">Researcher</option>
                      <option value="professor">Professor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 resize-none"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell us about your specific needs or questions..."
                  />
                </div>

                {submitStatus.message && (
                  <div
                    className={`p-4 rounded-lg my-4 ${submitStatus.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                    {submitStatus.message}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                  disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scheduling...
                    </span>
                  ) : (
                    "Schedule Demo"
                  )}
                </Button>

                <p className="text-sm text-gray-600 text-center">
                  We'll send you a calendar invite within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <ClosingCTA />
    </Layout>
  );
}
