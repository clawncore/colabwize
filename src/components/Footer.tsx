import { Link } from "react-router-dom";
import { BookOpen, Linkedin, Mail } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", path: "/features" },
        { name: "Pricing", path: "/pricing" },
        { name: "Roadmap", path: "/roadmap" },
        { name: "What is ColabWize?", path: "/what-is-colabwize" },
        { name: "Comparison", path: "/comparison" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", path: "/blog" },
        { name: "Help Center", path: "/help" },
        { name: "FAQ", path: "/faq" },
        { name: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Tools",
      links: [
        { name: "Citation Generator", path: "/citation-generator" },
        { name: "Plagiarism Checker", path: "/plagiarism-checker" },
        { name: "Collaboration Tool", path: "/collaboration-tool" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white w-full" style={{ marginTop: 'auto' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-lg font-bold">ColabWize</span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">
              Your entire academic workflow, unified. Write smarter, cite faster,
              and check originality — all in one beautiful workspace.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://x.com/colabwize" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaXTwitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:hello@colabwize.com" className="text-gray-400 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-base font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-xs">
            &copy; 2025 ColabWize. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-xs">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-xs">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
