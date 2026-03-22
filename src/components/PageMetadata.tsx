import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  children?: React.ReactNode;
}

const PageMetadata: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath,
  ogType = "website",
  ogImage = "/og-image.png",
  noindex = false,
  children,
}) => {
  const location = useLocation();
  const domain = "https://app.colabwize.com";
  
  // Use provided canonicalPath or fallback to current location
  const path = canonicalPath || location.pathname;
  const canonicalUrl = `${domain}${path}`;

  const defaultTitle = "ColabWize – Academic Integrity & Collaboration Platform";
  const defaultDescription = "ColabWize helps students and researchers prove the authenticity and credibility of their academic work with citation auditing, authorship verification, and collaborative writing tools.";
  
  const fullTitle = title ? `${title} | ColabWize` : defaultTitle;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots Tag */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph Tags */}
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage.startsWith("http") ? ogImage : `${domain}${ogImage}`} />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage.startsWith("http") ? ogImage : `${domain}${ogImage}`} />

      {children}
    </Helmet>
  );
};

export default PageMetadata;
