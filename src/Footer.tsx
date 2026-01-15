import { Link, useNavigate } from "react-router-dom";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Integrations", href: "/integrations" },
    { name: "What's New", href: "/changelog" },
    { name: "Roadmap", href: "/roadmap" },
  ],
  resources: [
    { name: "Blogs", href: "/blogs" },
    { name: "Case Studies", href: "/resources/case-studies" },
    { name: "Help Center", href: "/help" },
    { name: "Documentation", href: "/docs" },
    { name: "Schedule Demo", href: "/schedule-demo" },
  ],
  solutions: [
    { name: "Analytics", href: "/solutions/analytics" },
    { name: "Plagiarism Detection", href: "/solutions/plagiarism" },
    { name: "Citations", href: "/solutions/citations" },
    { name: "Collaboration", href: "/solutions/collaboration" },
    { name: "AI Writing Assistant", href: "/solutions/ai-writing-assistant" },
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
  ],
};

const socialLinks = [
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "Github", href: "#", icon: Github },
  { name: "LinkedIn", href: "#", icon: Linkedin },
  { name: "Email", href: "mailto:hello@colabwize.com", icon: Mail },
];

export default function Footer() {
  return (
    <footer className="bg-[#121212] border-t border-gray-800">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
            {/* Logo and Description */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <img
                  src="/images/Colabwize-logo.png"
                  alt="ColabWize Logo"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-white">ColabWize</span>
              </Link>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                Your Academic Success, Defended. A platform designed to transform 
                anxiety into confidence through academic integrity and defensibility.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-blue-500 hover:shadow-sm transition-all duration-200 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    <span className="sr-only">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
                Product
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
                Resources
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
                Solutions
              </h3>
              <ul className="space-y-3">
                {footerLinks.solutions.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                    >
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
              <Link to="/docs/privacy">
                <p className="text-gray-500 text-sm hover:text-gray-400 transition-colors">
                  Privacy Policy
                </p>
              </Link>
              <Link to="/docs/terms">
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
