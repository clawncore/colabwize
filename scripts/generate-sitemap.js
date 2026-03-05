const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://colabwize.com';

const staticRoutes = [
  '/',
  '/features',
  '/pricing',
  '/resources/blogs',
  '/academic-integrity',
  '/academic-integrity-guide',
  '/prove-authorship',
  '/citation-verification',
  '/ai-false-positive-problem',
  '/how-to-prove-your-writing-is-not-ai',
  '/how-to-check-citation-credibility',
  '/how-to-collaborate-on-academic-papers',
  '/false-ai-detection-in-academia',
  '/what-is-academic-integrity',
  '/what-is-citation-verification',
  '/what-is-authorship-verification',
  '/solutions/originality-map',
  '/solutions/citation-confidence',
  '/solutions/authorship-certificate',
  '/solutions/collaboration'
];

function generateSitemap() {
  const blogPostsPath = path.join(__dirname, '../src/data/blogPosts.ts');
  const blogPostsContent = fs.readFileSync(blogPostsPath, 'utf8');

  // Extract all blog IDs using Regex
  const idRegex = /id:\s*["']([^"']+)["']/g;
  let match;
  const blogPostIds = [];

  while ((match = idRegex.exec(blogPostsContent)) !== null) {
    blogPostIds.push(match[1]);
  }

  const currentDate = new Date().toISOString();

  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static routes
  staticRoutes.forEach(route => {
    sitemapContent += `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // Add blog routes
  blogPostIds.forEach(id => {
    sitemapContent += `
  <url>
    <loc>${BASE_URL}/resources/blogs/${id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  sitemapContent += `\n</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemapContent);

  console.log(`✅ Sitemap generated successfully at public/sitemap.xml with ${staticRoutes.length + blogPostIds.length} URLs.`);
}

generateSitemap();
