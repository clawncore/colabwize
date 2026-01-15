import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Documentation imports
import DocsLayout from "./pages/DocsLayout";
import DocumentationPage from "./pages/DocumentationPage";
import SearchResultsPage from "./pages/SearchResultsPage";

import RoadmapPage from "./components/guide/RoadmapPage";
import FAQPage from "./components/guide/FAQPage";
import QuickStartPage from "./components/guide/QuickStartPage";
import InstallationPage from "./components/guide/InstallationPage";
import TroubleshootingPage from "./components/guide/TroubleshootingPage";
import KeyboardShortcutsPage from "./components/guide/KeyboardShortcutsPage";
import HelpCenterPage from "./components/guide/HelpCenterPage";

// Core Features imports
import OriginalityScanPage from "./components/features/OriginalityScanPage";

import CitationsPage from "./components/features/CitationsPage";
import CertificatesPage from "./components/features/CertificatesPage";
import LiteratureReviewPage from "./components/features/LiteratureReviewPage";
import StudyGroupsPage from "./components/features/StudyGroupsPage";
import TemplatesPage from "./components/features/TemplatesPage";

// Subscription imports
import SubscriptionPlansPage from "./components/subscription/SubscriptionPlansPage";
import UsageLimitsPage from "./components/subscription/UsageLimitsPage";
import CreditsPage from "./components/subscription/CreditsPage";

import AdvancedAnalyticsPage from "./components/analytics/AdvancedAnalyticsPage";

import TermsPage from "./components/policy/TermsPage";
import PrivacyPage from "./components/policy/PrivacyPage";
import SecurityPage from "./components/policy/SecurityPage";
import CookiesPage from "./components/policy/CookiesPage";
import GDPRPage from "./components/policy/GDPRPage";
import FERPAPage from "./components/policy/FERPAPage";
import PrivacySecurityPage from "./components/policy/PrivacySecurityPage";

import FeaturesDocsPage from "./components/beta-program/FeaturesDocsPage";
import FeatureRequestPage from "./components/beta-program/FeatureRequestPage";
import BetaProgramPage from "./components/beta-program/BetaProgramPage";

import ContactSupportPage from "./components/contact/ContactSupportPage";
import AccountSetupPage from "./components/account/AccountSetupPage";
import AccountManagementPage from "./components/account/AccountManagementPage";
import ProfileSettingsPage from "./components/account/ProfileSettingsPage";

import BillingPage from "./components/billing/BillingPage";

import NotFoundPage from "./pages/not-found";
import { Toaster } from "./components/ui/toaster";

import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Documentation routes */}
          <Route path="/" element={<DocsLayout />}>
            <Route index element={<DocumentationPage />} />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="quickstart" element={<QuickStartPage />} />
            <Route path="installation" element={<InstallationPage />} />
            <Route path="account-setup" element={<AccountSetupPage />} />
            <Route path="features" element={<FeaturesDocsPage />} />
            <Route path="account" element={<AccountManagementPage />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="privacy-policy" element={<PrivacySecurityPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="troubleshooting" element={<TroubleshootingPage />} />
            <Route path="contact-support" element={<ContactSupportPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route
              path="keyboard-shortcuts"
              element={<KeyboardShortcutsPage />}
            />
            <Route path="help" element={<HelpCenterPage />} />
            {/* Core Features routes */}
            <Route path="originality" element={<OriginalityScanPage />} />

            <Route path="citations" element={<CitationsPage />} />
            <Route path="certificates" element={<CertificatesPage />} />

            {/* Subscription routes */}
            <Route path="plans" element={<SubscriptionPlansPage />} />
            <Route path="limits" element={<UsageLimitsPage />} />
            <Route path="credits" element={<CreditsPage />} />

            <Route path="analytics" element={<AdvancedAnalyticsPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="cookies" element={<CookiesPage />} />
            <Route path="gdpr" element={<GDPRPage />} />
            <Route path="ferpa" element={<FERPAPage />} />
            <Route path="feature-request" element={<FeatureRequestPage />} />
            <Route path="beta-program" element={<BetaProgramPage />} />

            {/* Coming Soon Features */}
            <Route
              path="literature-review"
              element={<LiteratureReviewPage />}
            />
            <Route path="study-groups" element={<StudyGroupsPage />} />
            <Route path="templates" element={<TemplatesPage />} />
          </Route>
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
