import {
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { ROADMAP_ITEMS } from "../lib/mockData";

interface RoadmapProps {
  onWaitlistClick: () => void;
}

export default function Roadmap({ onWaitlistClick }: RoadmapProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "upcoming":
        return "Coming Next";
      default:
        return "";
    }
  };

  const completedItems = ROADMAP_ITEMS.filter(
    (item) => item.status === "completed"
  );
  const inProgressItems = ROADMAP_ITEMS.filter(
    (item) => item.status === "in-progress"
  );
  const upcomingItems = ROADMAP_ITEMS.filter(
    (item) => item.status === "upcoming"
  );

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 py-20 overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop')",
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
              Public Development Roadmap
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Follow our journey as we build CollaborateWise. See what we've
              accomplished, what we're working on, and what's coming next.
            </p>
            <button
              onClick={onWaitlistClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold inline-flex items-center space-x-2"
            >
              <span>Join Waitlist to Stay Updated</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          {/* Building in Public Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-green-500 rounded-full mb-6">
            <TrendingUp className="mr-2" size={16} />
            <span className="text-sm font-medium">
              We're Building in Public
            </span>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
                <h2 className="text-3xl font-bold">✅ Completed</h2>
              </div>

              <div className="space-y-4">
                {completedItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-green-50 border-2 border-green-200 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-green-700 mt-2 font-semibold">
                      {item.progress}% Complete
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-8">
                <Clock className="w-10 h-10 text-blue-600" />
                <h2 className="text-3xl font-bold">🚧 In Progress</h2>
              </div>

              <div className="space-y-4">
                {inProgressItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3 relative overflow-hidden">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
                    </div>
                    <p className="text-sm text-blue-700 mt-2 font-semibold">
                      {item.progress}% Complete
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-8">
                <Calendar className="w-10 h-10 text-gray-600" />
                <h2 className="text-3xl font-bold">📅 Coming Next</h2>
              </div>

              <div className="space-y-4">
                {upcomingItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <div className="flex items-center space-x-3">
                        {item.date && (
                          <span className="text-sm text-gray-600 font-semibold">
                            {item.date}
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Overall Progress</h2>
            <p className="text-gray-600 mb-6">
              We're making steady progress toward launch. Here's where we stand:
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {completedItems.length}
                </div>
                <p className="text-gray-600">Completed Milestones</p>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {inProgressItems.length}
                </div>
                <p className="text-gray-600">In Development</p>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-gray-600 mb-2">
                  {upcomingItems.length}
                </div>
                <p className="text-gray-600">Upcoming Features</p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: "65%" }}
              />
            </div>
            <p className="text-sm text-gray-600 mb-6">
              65% Complete - Launching Q1 2025
            </p>

            <button
              onClick={onWaitlistClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Join Waitlist for Launch Updates
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Want to Influence What We Build?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join the waitlist and vote on features. Your input directly shapes
            our development priorities.
          </p>
          <button
            onClick={onWaitlistClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold text-lg inline-flex items-center space-x-2"
          >
            <span>Join Waitlist & Vote on Features</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
