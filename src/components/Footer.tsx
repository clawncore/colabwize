import { Link } from "react-router-dom";
import { MessageSquare, Mail, Youtube } from "lucide-react";
import ConfigService from "../services/ConfigService";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Integrations", href: "/integrations" },
    { name: "What's New", href: "/changelog" },
    { name: "Roadmap", href: "/roadmap" },
  ],
  resources: [
    { name: "Blogs", href: "/resources/blogs" },
    { name: "Case Studies", href: "/resources/case-studies" },
    { name: "Help Center", href: "/resources/help-center" },
    {
      name: "Documentation",
      href: ConfigService.getDocsUrl(),
      external: true,
    },
    { name: "Schedule Demo", href: "/resources/schedule-demo" },
  ],
  solutions: [
    {
      name: "Collaboration",
      href: "/solutions/collaboration",
    },
    {
      name: "Team Workspace",
      href: "/solutions/team-workspace",
    },
    { name: "Chat with PDFs", href: "/solutions/chat-with-pdfs" },
    { name: "Citation Confidence", href: "/solutions/citation-confidence" },
    {
      name: "Authorship Certificate",
      href: "/solutions/authorship-certificate",
    },
  ],
  integrity: [
    { name: "Academic Integrity Hub", href: "/academic-integrity" },
    { name: "Prove Authorship", href: "/prove-authorship" },
    { name: "Citation Verification", href: "/citation-verification" },
    { name: "AI False Positives", href: "/ai-false-positive-problem" },
  ],
  guides: [
    {
      name: "Proven Not AI Guide",
      href: "/how-to-prove-your-writing-is-not-ai",
    },
    { name: "Check Credibility", href: "/how-to-check-citation-credibility" },
    {
      name: "Ethical Collaboration",
      href: "/how-to-collaborate-on-academic-papers",
    },
    { name: "The AI Crisis Report", href: "/false-ai-detection-in-academia" },
  ],
  company: [
    { name: "About Us", href: "/company/about" },
    { name: "Careers", href: "/company/careers" },
    { name: "Partners", href: "/company/partners" },
    { name: "FAQs", href: "/company/faq" },
  ],
  legal: [
    { name: "Cookie Policy", href: "/legal/cookies" },
    { name: "GDPR", href: "/legal/gdpr" },
    { name: "Security", href: "/legal/security" },
    { name: "Refund Policy", href: "/legal/refund-policy" },
  ],
  tools: [
    { name: "APA Generator", href: "/apa-citation-generator" },
    { name: "MLA Generator", href: "/mla-citation-generator" },
    { name: "Chicago Generator", href: "/chicago-citation-generator" },
    { name: "Plagiarism Checker", href: "/plagiarism-checker" },
    { name: "Research Organizer", href: "/research-paper-organizer" },
  ],
};

const socialLinks = [
  {
    name: "Discord",
    href: "https://discord.com/invite/2MMSdX3Uee",
    icon: MessageSquare,
  },
  {
    name: "Youtube",
    href: "https://www.youtube.com/@colabwize",
    icon: Youtube,
  },
  { name: "Email", href: "mailto:hello@colabwize.com", icon: Mail },
];

export default function Footer() {
  return (
    <footer className="bg-[#F3F0EC] border-t border-white">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-16 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-10">
            {/* Logo and Description */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <img
                  src="/images/Colabwize-logo.png"
                  alt="ColabWize Logo"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-black font-primary">
                  ColabWize
                </span>
              </Link>
              <p className="text-gray-500 text-sm mb-8 max-w-sm leading-relaxed">
                Your Academic Success, Defended. A platform designed to
                transform anxiety into confidence through academic integrity and
                defensibility.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
                    target="_blank"
                    rel="noopener noreferrer">
                    <social.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="sr-only">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-xs font-bold text-black mb-6 uppercase tracking-[0.2em] font-primary">
                Product
              </h3>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Integrity Hub Links */}
            <div>
              <h3 className="text-xs font-bold text-black mb-6 uppercase tracking-[0.2em] font-primary">
                Integrity
              </h3>
              <ul className="space-y-4">
                {footerLinks.integrity.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guides Links */}
            <div>
              <h3 className="text-xs font-bold text-black mb-6 uppercase tracking-[0.2em] font-primary">
                Guides
              </h3>
              <ul className="space-y-4">
                {footerLinks.guides.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-xs font-bold text-black mb-6 uppercase tracking-[0.2em] font-primary">
                Company
              </h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools Links */}
            <div>
              <h3 className="text-xs font-bold text-black mb-6 uppercase tracking-[0.2em] font-primary">
                Tools
              </h3>
              <ul className="space-y-4">
                {footerLinks.tools.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} ColabWize. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm">
                Made with ❤️ for students and researchers worldwide
              </p>
            </div>
            <div className="flex space-x-4">
              <Link to="/legal/privacy">
                <p className="text-gray-500 text-sm hover:text-gray-400 transition-colors">
                  Privacy Policy
                </p>
              </Link>
              <Link to="/legal/terms">
                <p className="text-gray-500 text-sm hover:text-gray-400 transition-colors">
                  Terms of Service
                </p>
              </Link>
              <Link to="/contact">
                <p className="text-gray-500 text-sm hover:text-gray-400 transition-colors">
                  Contact Us
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
