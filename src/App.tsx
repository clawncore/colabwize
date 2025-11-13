import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WaitlistModal from "./components/WaitlistModal";
import SuccessModal from "./components/SuccessModal";
import VideoNotification from "./components/VideoNotification";
import VideoPlayerModal from "./components/VideoPlayerModal";
import { User } from "./types/user";
import Home from "./pages/Home";
import Features from "./pages/Features";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import Roadmap from "./pages/Roadmap";
import WhatIsColabWize from "./pages/WhatIsColabWize";
import CitationGenerator from "./pages/CitationGenerator";
import PlagiarismChecker from "./pages/PlagiarismChecker";
import CollaborationTool from "./pages/CollaborationTool";
import Comparison from "./pages/Comparison";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [showVideoNotification, setShowVideoNotification] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const openWaitlistModal = () => setIsWaitlistModalOpen(true);
  const closeWaitlistModal = () => setIsWaitlistModalOpen(false);

  const handleWaitlistSuccess = (userData: User) => {
    setUser(userData);
    closeWaitlistModal();
    setIsSuccessModalOpen(true);
  };

  // Show video notification after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideoNotification(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle custom event to show video notification
  useEffect(() => {
    const handleShowVideoNotification = () => {
      setShowVideoNotification(true);
    };

    const handleOpenVideoPlayer = () => {
      setIsVideoPlayerOpen(true);
    };

    window.addEventListener('showVideoNotification', handleShowVideoNotification);
    window.addEventListener('openVideoPlayer', handleOpenVideoPlayer);

    return () => {
      window.removeEventListener('showVideoNotification', handleShowVideoNotification);
      window.removeEventListener('openVideoPlayer', handleOpenVideoPlayer);
    };
  }, []);

  // Hide video notification after 69 seconds
  useEffect(() => {
    if (showVideoNotification) {
      const timer = setTimeout(() => {
        setShowVideoNotification(false);
      }, 69000);

      return () => clearTimeout(timer);
    }
  }, [showVideoNotification]);

  return (
    <Router>
      <div className="min-h-screen w-full bg-white flex flex-col overflow-x-hidden">
        <Navbar onWaitlistClick={openWaitlistModal} />

        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <Routes>
            <Route
              path="/"
              element={<Home onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/features"
              element={<Features onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/about"
              element={<About onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/contact"
              element={<Contact onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/help"
              element={<Help onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/roadmap"
              element={<Roadmap onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/what-is-colabwize"
              element={<WhatIsColabWize onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/citation-generator"
              element={<CitationGenerator onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/plagiarism-checker"
              element={<PlagiarismChecker onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/collaboration-tool"
              element={<CollaborationTool onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/comparison"
              element={<Comparison onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/faq"
              element={<FAQ onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/pricing"
              element={<Pricing onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/blog"
              element={<Blog onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="/blog/:slug"
              element={<BlogPost onWaitlistClick={openWaitlistModal} />}
            />
            <Route
              path="*"
              element={<NotFound onWaitlistClick={openWaitlistModal} />}
            />
          </Routes>
        </main>

        <Footer />

        {showVideoNotification && (
          <VideoNotification
            onClose={() => setShowVideoNotification(false)}
            onPlayVideo={() => setIsVideoPlayerOpen(true)}
          />
        )}

        <VideoPlayerModal
          isOpen={isVideoPlayerOpen}
          onClose={() => setIsVideoPlayerOpen(false)}
        />

        <WaitlistModal
          isOpen={isWaitlistModalOpen}
          onClose={closeWaitlistModal}
          onSuccess={handleWaitlistSuccess}
        />

        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          user={user}
        />

        <Analytics />
      </div>
    </Router>
  );
}

export default App;