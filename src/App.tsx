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
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar onWaitlistClick={openWaitlistModal} />

        <main className="flex-1">
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
      </div>
    </Router>
  );
}

export default App;