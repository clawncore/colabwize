import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TooltipProvider } from "./components/ui/tooltip";

// Add import for billing components
import { BillingProvider } from "./contexts/BillingContext";
import { Toaster } from "./components/ui/toaster";
import { CookieConsent } from "./components/common/CookieConsent";
import { HelmetProvider } from "react-helmet-async";

// Solutions Pages (Marketing)
import ChatWithPdfsPage from "./pages/solutions/ChatWithPdfsPage";
import CitationConfidencePage from "./pages/solutions/CitationConfidencePage";
import AuthorshipCertificatePage from "./pages/solutions/AuthorshipCertificatePage";
import UnifiedDashboardPage from "./pages/solutions/UnifiedDashboardPage";
import AnalyticsMetricsPage from "./pages/solutions/AnalyticsMetricsPage";
import { DraftComparisonPage } from "./pages/solutions/DraftComparisonPage";
import CollaborationPage from "./pages/solutions/CollaborationPage";
import TeamWorkspacePage from "./pages/solutions/TeamWorkspacePage";
import { VerifyCertificatePage } from "./pages/public/VerifyCertificatePage";

// SEO Topical Pages
import WhatIsColabWize from "./pages/seo/WhatIsColabWize";
import AcademicIntegrityPlatform from "./pages/seo/AcademicIntegrityPlatform";
import CitationAuditorSEO from "./pages/seo/CitationAuditorSEO";
import ProofOfAuthorshipSEO from "./pages/seo/ProofOfAuthorshipSEO";
import AcademicCollaborationSEO from "./pages/seo/AcademicCollaborationSEO";
import AcademicIntegrityHub from "./pages/seo/AcademicIntegrityHub";
import AcademicIntegrityGuide from "./pages/seo/AcademicIntegrityGuide";
import ProveAuthorshipSEO from "./pages/seo/ProveAuthorshipSEO";
import CitationVerificationSEO from "./pages/seo/CitationVerificationSEO";
import AIFalsePositiveSEO from "./pages/seo/AIFalsePositiveSEO";
import ProvenNotAiSEO from "./pages/seo/ProvenNotAiSEO";
import CheckCredibilitySEO from "./pages/seo/CheckCredibilitySEO";
import CollaborateAcademicSEO from "./pages/seo/CollaborateAcademicSEO";
import FalseAiAcademiaSEO from "./pages/seo/FalseAiAcademiaSEO";
import WhatIsAcademicIntegrity from "./pages/seo/definitions/WhatIsAcademicIntegrity";
import WhatIsCitationVerification from "./pages/seo/definitions/WhatIsCitationVerification";
import WhatIsAuthorshipVerification from "./pages/seo/definitions/WhatIsAuthorshipVerification";
import ComparePage from "./pages/seo/ComparePage";

// Product Pages
import FeaturesPage from "./pages/FeaturesPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import ChangelogPage from "./pages/ChangelogPage";
import RoadmapPage from "./pages/RoadmapPage";
import PricingPage from "./pages/PricingPage";

// Resources Pages
import BlogsPage from "./pages/resources/BlogsPage";
import BlogPostPage from "./pages/resources/BlogPostPage";
import CaseStudiesPage from "./pages/resources/CaseStudiesPage";
import CaseStudyPage from "./pages/resources/CaseStudyPage";
import HelpCenterPage from "./pages/resources/HelpCenterPage";
import DocumentationPage from "./pages/resources/DocumentationPage";
import ScheduleDemoPage from "./pages/resources/ScheduleDemoPage";

// Company Pages
import AboutPage from "./pages/company/AboutPage";
import CareersPage from "./pages/company/CareersPage";
import PartnersPage from "./pages/company/PartnersPage";
import FAQPage from "./pages/company/FAQPage";

// Legal Pages
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/legal/TermsOfServicePage";
import CookiePolicyPage from "./pages/legal/CookiePolicyPage";
import GDPRPage from "./pages/legal/GDPRPage";
import SecurityPage from "./pages/legal/SecurityPage";
import RefundPolicyPage from "./pages/legal/RefundPolicyPage";

// Other Pages
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import EditorWorkspacePage from "./components/editor/EditorWorkspacePage";

// Dashboard Components
import { Dashboard } from "./components/dashboard/Dashboard";
import DocumentManagementPage from "./components/documents/DocumentManagementPage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import RecycleBinPage from "./components/recyclebin/RecycleBin";
import CreditsPage from "./pages/dashboard/CreditsPage";
import BillingDashboard from "./components/billing/BillingDashboard";
import { DocumentAnalyticsPage } from "./components/dashboard/DocumentAnalyticsPage";
import PdfUploadPage from "./components/pdf-chat/page";
import PdfChatViewerPage from "./components/pdf-chat/[pdfId]/page";

// Add imports for new settings pages
import ProfileSettingsPage from "./components/settings/Profile";
import AccountSettingsPage from "./components/settings/Account";
import BillingSettingsPage from "./components/settings/BillingSettingsPage";
import HelpSettingsPage from "./components/settings/Help";
import FeedbackPage from "./components/feedback/FeedbackDashboard";
import SettingsLayout from "./pages/settings/SettingsLayout";
import CitationAuditReportPage from "./pages/dashboard/CitationAuditReportPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import GuestRoute from "./components/auth/GuestRoute";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import CallbackPage from "./pages/auth/CallbackPage";
import AuthInitializer from "./components/auth/AuthInitializer";
import { useIsMobile } from "./hooks/useIsMobile";
import MobileRestrictedPage from "./pages/MobileRestrictedPage";

// Add imports for workspace pages or members components here
import WorkspaceAnalytics from "./components/workspace/analytics/page";
import { TeamChat } from "./components/workspace/team/TeamChat";
import { KanbanBoard } from "./components/workspace/kanban/page";
import WorkspaceProjectsPage from "./components/workspace/projects/page";
import FilesPage from "./components/workspace/files/FilesPage";
import WorkspaceOverview from "./components/workspace/overview/WorkspaceOverview";
import TemplateGallery from "./components/workspace/templates/TemplateGallery";
import AcceptInvitationPage from "./pages/workspaces/AcceptInvitationPage";

// Add imports for admin pages or components here
import AdminDashboard from "./components/admin/dashboard/page";
import WorkspaceMembersPage from "./components/admin/members/page";
import WorkspaceSettingsPage from "./components/admin/settings/page";
import WorkspaceActivityPage from "./components/admin/activity/page";
import { AdminRoute } from "./components/auth/AdminRoute";

// Add imports for notifications
import NotificationsPage from "./components/workspace/notifications/NotificationsPage";
import NotificationSettings from "./components/admin/settings/NotificationSettings";
import { TimeTrackingProvider } from "./contexts/TimeTrackingContext";

function App() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileRestrictedPage />;
  }

  return (
    <HelmetProvider>
      <ThemeProvider>
        <TimeTrackingProvider>
          <BillingProvider>
            <TooltipProvider>
              <BrowserRouter>
                <AuthProvider>
                  <AuthInitializer>
                    <Routes>
                      {/* Default Route - Public */}
                      <Route path="/" element={<HomePage />} />
                      {/* SEO Definition & Category Pages */}
                      <Route
                        path="/academic-integrity"
                        element={<AcademicIntegrityHub />}
                      />
                      <Route
                        path="/academic-integrity-guide"
                        element={<AcademicIntegrityGuide />}
                      />
                      <Route
                        path="/prove-authorship"
                        element={<ProveAuthorshipSEO />}
                      />
                      <Route
                        path="/citation-verification"
                        element={<CitationVerificationSEO />}
                      />
                      <Route
                        path="/ai-false-positive-problem"
                        element={<AIFalsePositiveSEO />}
                      />
                      <Route
                        path="/how-to-prove-your-writing-is-not-ai"
                        element={<ProvenNotAiSEO />}
                      />
                      <Route
                        path="/how-to-check-citation-credibility"
                        element={<CheckCredibilitySEO />}
                      />
                      <Route
                        path="/how-to-collaborate-on-academic-papers"
                        element={<CollaborateAcademicSEO />}
                      />
                      <Route
                        path="/false-ai-detection-in-academia"
                        element={<FalseAiAcademiaSEO />}
                      />
                      <Route
                        path="/what-is-academic-integrity"
                        element={<WhatIsAcademicIntegrity />}
                      />
                      <Route
                        path="/what-is-citation-verification"
                        element={<WhatIsCitationVerification />}
                      />
                      <Route
                        path="/what-is-authorship-verification"
                        element={<WhatIsAuthorshipVerification />}
                      />
                      <Route
                        path="/compare/:competitor"
                        element={<ComparePage />}
                      />
                      <Route
                        path="/what-is-colabwize"
                        element={<WhatIsColabWize />}
                      />
                      <Route
                        path="/academic-integrity-platform"
                        element={<AcademicIntegrityPlatform />}
                      />
                      <Route
                        path="/citation-auditor"
                        element={<CitationAuditorSEO />}
                      />
                      <Route
                        path="/proof-of-authorship"
                        element={<ProofOfAuthorshipSEO />}
                      />
                      <Route
                        path="/academic-collaboration"
                        element={<AcademicCollaborationSEO />}
                      />
                      {/* Solutions Routes - Marketing Pages - Public */}
                      <Route
                        path="/solutions/chat-with-pdfs"
                        element={<ChatWithPdfsPage />}
                      />
                      <Route
                        path="/solutions/citation-confidence"
                        element={<CitationConfidencePage />}
                      />
                      <Route
                        path="/solutions/authorship-certificate"
                        element={<AuthorshipCertificatePage />}
                      />
                      <Route
                        path="/solutions/unified-dashboard"
                        element={<UnifiedDashboardPage />}
                      />
                      <Route
                        path="/solutions/analytics-metrics"
                        element={<AnalyticsMetricsPage />}
                      />
                      <Route
                        path="/solutions/draft-comparison"
                        element={<DraftComparisonPage />}
                      />
                      <Route
                        path="/solutions/collaboration"
                        element={<CollaborationPage />}
                      />
                      <Route
                        path="/solutions/team-workspace"
                        element={<TeamWorkspacePage />}
                      />
                      {/* Product Routes - Public */}
                      <Route path="/features" element={<FeaturesPage />} />
                      <Route
                        path="/integrations"
                        element={<IntegrationsPage />}
                      />
                      <Route path="/changelog" element={<ChangelogPage />} />
                      <Route path="/roadmap" element={<RoadmapPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route
                        path="/workspaces/accept/:token"
                        element={<AcceptInvitationPage />}
                      />
                      {/* Resources Routes - Public */}
                      <Route path="/resources/blogs" element={<BlogsPage />} />
                      <Route
                        path="/resources/blogs/:id"
                        element={<BlogPostPage />}
                      />
                      <Route
                        path="/verify/:id"
                        element={<VerifyCertificatePage />}
                      />
                      <Route
                        path="/resources/case-studies"
                        element={<CaseStudiesPage />}
                      />
                      <Route
                        path="/resources/case-studies/:id"
                        element={<CaseStudyPage />}
                      />
                      <Route
                        path="/resources/help-center"
                        element={<HelpCenterPage />}
                      />
                      <Route
                        path="/resources/documentation"
                        element={<DocumentationPage />}
                      />
                      <Route
                        path="/resources/schedule-demo"
                        element={<ScheduleDemoPage />}
                      />
                      {/* Company Routes - Public */}
                      <Route path="/company/about" element={<AboutPage />} />
                      <Route
                        path="/company/careers"
                        element={<CareersPage />}
                      />
                      <Route
                        path="/company/partners"
                        element={<PartnersPage />}
                      />
                      <Route path="/company/faq" element={<FAQPage />} />
                      {/* Legal Routes - Public */}
                      <Route
                        path="/legal/cookies"
                        element={<CookiePolicyPage />}
                      />
                      <Route path="/legal/gdpr" element={<GDPRPage />} />
                      <Route
                        path="/legal/security"
                        element={<SecurityPage />}
                      />
                      <Route
                        path="/legal/privacy"
                        element={<PrivacyPolicyPage />}
                      />
                      <Route
                        path="/legal/terms"
                        element={<TermsOfServicePage />}
                      />
                      <Route
                        path="/docs/refund-policy"
                        element={<RefundPolicyPage />}
                      />
                      <Route
                        path="/legal/refund-policy"
                        element={<RefundPolicyPage />}
                      />{" "}
                      {/* Alias for SEO */}
                      {/* Other Routes - Public */}
                      <Route path="/contact" element={<ContactPage />} />
                      <Route
                        path="/schedule-demo"
                        element={<ScheduleDemoPage />}
                      />
                      {/* Guest Only Routes - Accessible only when not signed in */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route
                        path="/forgot-password"
                        element={
                          <GuestRoute>
                            <ForgotPasswordPage />
                          </GuestRoute>
                        }
                      />
                      <Route
                        path="/verify-email"
                        element={
                          <GuestRoute>
                            <VerifyEmailPage />
                          </GuestRoute>
                        }
                      />
                      <Route
                        path="/reset-password"
                        element={
                          <GuestRoute>
                            <ResetPasswordPage />
                          </GuestRoute>
                        }
                      />
                      <Route path="/auth/callback" element={<CallbackPage />} />
                      {/* Protected Dashboard Routes <ProtectedRoute> */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout />
                          </ProtectedRoute>
                        }>
                        <Route index element={<Dashboard />} />
                        <Route
                          path="documents"
                          element={<DocumentManagementPage />}
                        />
                        <Route
                          path="billing/subscription"
                          element={<BillingDashboard />}
                        />
                        <Route path="pdf-upload" element={<PdfUploadPage />} />
                        <Route
                          path="pdf-chat/:pdfId"
                          element={<PdfChatViewerPage />}
                        />
                        <Route
                          path="billing/credits"
                          element={<CreditsPage />}
                        />
                        <Route
                          path="analytics"
                          element={<DocumentAnalyticsPage />}
                        />
                        <Route
                          path="citation-audit"
                          element={<CitationAuditReportPage />}
                        />
                        <Route
                          path="recycle-bin"
                          element={<RecycleBinPage />}
                        />

                        <Route path="admin" element={<AdminDashboard />} />
                        {/* Admin routes with layout <AdminRoute> */}
                        <Route
                          path="admin/:id/members"
                          element={
                            <AdminRoute>
                              <WorkspaceMembersPage />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="admin/:id/settings"
                          element={
                            <AdminRoute>
                              <WorkspaceSettingsPage />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="admin/:id/activity"
                          element={
                            <AdminRoute>
                              <WorkspaceActivityPage />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="admin/:id/notifications"
                          element={
                            <AdminRoute>
                              <NotificationSettings />
                            </AdminRoute>
                          }
                        />

                        {/* Workspace routes with layout <WorkspaceRoute> */}
                        <Route
                          path="workspace/:id/overview"
                          element={<WorkspaceOverview />}
                        />
                        <Route
                          path="workspace/:id/templates"
                          element={<TemplateGallery />}
                        />
                        <Route
                          path="workspace/:id/kanban"
                          element={<KanbanBoard />}
                        />
                        <Route
                          path="workspace/:id/projects"
                          element={<WorkspaceProjectsPage />}
                        />
                        <Route
                          path="workspace/:id/chat"
                          element={<TeamChat />}
                        />
                        <Route
                          path="workspace/:id/analytics"
                          element={<WorkspaceAnalytics />}
                        />
                        <Route
                          path="workspace/:id/files"
                          element={<FilesPage />}
                        />
                        <Route
                          path="workspace/:id/notifications"
                          element={<NotificationsPage />}
                        />
                        <Route
                          path="workspace/:id/documents"
                          element={<DocumentManagementPage />}
                        />
                        <Route
                          path="notifications"
                          element={<NotificationsPage />}
                        />

                        {/* Settings routes with layout */}
                        <Route path="settings" element={<SettingsLayout />}>
                          <Route
                            path="profile"
                            element={<ProfileSettingsPage />}
                          />
                          <Route
                            path="account"
                            element={<AccountSettingsPage />}
                          />
                          <Route
                            path="billing"
                            element={<BillingSettingsPage />}
                          />
                          <Route path="help" element={<HelpSettingsPage />} />
                          <Route path="feedback" element={<FeedbackPage />} />
                        </Route>
                      </Route>
                      {/* Alias for Credit Purchase as per detailed requirement */}
                      <Route
                        path="/purchase-credits"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <CreditsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      {/* Editor Workspace - Protected */}
                      <Route
                        path="/dashboard/editor"
                        element={
                          <ProtectedRoute>
                            <EditorWorkspacePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/editor/:id"
                        element={
                          <ProtectedRoute>
                            <EditorWorkspacePage />
                          </ProtectedRoute>
                        }
                      />
                      {/* 404 Catch-All Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </AuthInitializer>
                </AuthProvider>
                <CookieConsent />
              </BrowserRouter>
              <Toaster />
            </TooltipProvider>
          </BillingProvider>
        </TimeTrackingProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
