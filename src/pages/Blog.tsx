import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User, Tag } from "lucide-react";
import { useState } from "react";

interface BlogProps {
    onWaitlistClick: () => void;
}

export default function Blog({ onWaitlistClick }: BlogProps) {
    // Blog post data
    const blogPosts = [
        {
            id: "1",
            slug: "best-citation-tools-2025-comprehensive-guide-for-students",
            title: "Best Citation Tools 2025 — A Comprehensive Guide for Students",
            excerpt: "Discover the top citation tools for 2025 that can save you hours on formatting and referencing. Learn what features to look for and how to choose the right tool for your academic needs.",
            date: "November 15, 2025",
            author: "Dr. Sarah Johnson",
            readTime: "8 min read",
            category: "Citation Tools",
            image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop"
        },
        {
            id: "2",
            slug: "best-plagiarism-checkers-for-students-in-2025",
            title: "Best Plagiarism Checkers for Students in 2025",
            excerpt: "Discover the top plagiarism checkers for 2025 that can help you maintain academic integrity. Learn what features matter most and how to use these tools effectively.",
            date: "November 10, 2025",
            author: "Dr. Michael Reyes",
            readTime: "10 min read",
            category: "Plagiarism Detection",
            image: "https://www.alloysoftware.com/wp-content/uploads/2025/07/ai-635x400-txt.png"
        },
        {
            id: "3",
            slug: "tools-for-collaborating-on-research-papers-a-students-guide",
            title: "Tools for Collaborating on Research Papers: A Student's Guide",
            excerpt: "Discover the best tools and strategies for effective collaboration on academic research papers with classmates and advisors.",
            date: "November 5, 2025",
            author: "Alex Morgan",
            readTime: "12 min read",
            category: "Collaboration",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop"
        },
        {
            id: "4",
            slug: "how-to-avoid-plagiarism-in-university-essential-tips-for-students",
            title: "How to Avoid Plagiarism in University: Essential Tips for Students",
            excerpt: "Learn practical strategies to maintain academic integrity and avoid unintentional plagiarism in your university coursework.",
            date: "October 30, 2025",
            author: "Dr. Emily Rodriguez",
            readTime: "7 min read",
            category: "Academic Integrity",
            image: "https://www.runsensible.com/wp-content/uploads/2024/06/Plagiarism-vs-Copyright-Infringement-main.jpg"
        },
        {
            id: "5",
            slug: "apa-vs-mla-vs-chicago-citation-styles-when-to-use-each",
            title: "APA vs MLA vs Chicago Citation Styles: When to Use Each",
            excerpt: "Understand the key differences between major citation styles and learn when to use APA, MLA, or Chicago in your academic writing.",
            date: "October 25, 2025",
            author: "Prof. David Wilson",
            readTime: "9 min read",
            category: "Citation Styles",
            image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=400&fit=crop"
        },
        {
            id: "6",
            slug: "how-to-write-a-research-paper-faster-a-students-guide-to-speed-and-quality",
            title: "How to Write a Research Paper Faster: A Student's Guide to Speed and Quality",
            excerpt: "Learn how to write research papers more efficiently without sacrificing quality. Discover time-saving techniques, tools, and strategies for academic success.",
            date: "October 28, 2025",
            author: "Dr. Laura Bennett",
            readTime: "11 min read",
            category: "Academic Writing",
            image: "https://www.daniel-wong.com/wp-content/uploads/2023/06/how-to-write-a-paper-fast.jpg"
        },
        {
            id: "8",
            slug: "how-to-organize-research-notes-like-a-pro",
            title: "How to Organize Research Notes Like a Pro",
            excerpt: "Learn how to organize your research notes like a professional researcher. Discover simple but powerful methods to save time and reduce stress.",
            date: "October 15, 2025",
            author: "Dr. Hannah Cole",
            readTime: "9 min read",
            category: "Academic Writing",
            image: "https://miro.medium.com/0*j1znnoa2-Tn0Wd_H.jpeg"
        },
        {
            id: "9",
            slug: "beginners-guide-to-academic-referencing-in-2025",
            title: "Beginner’s Guide to Academic Referencing in 2025",
            excerpt: "Learn everything you need to know about academic referencing in 2025. A beginner-friendly guide to citation styles, best practices, and common mistakes.",
            date: "September 22, 2025",
            author: "Dr. Samuel Hart",
            readTime: "10 min read",
            category: "Academic Writing",
            image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=400&fit=crop"
        },
        {
            id: "10",
            slug: "why-citations-matter-in-academic-writing",
            title: "Why Citations Matter in Academic Writing",
            excerpt: "Discover why citations are the backbone of credible academic writing. Learn how they build credibility, prevent plagiarism, and strengthen your arguments.",
            date: "September 5, 2025",
            author: "Dr. Olivia Hayes",
            readTime: "8 min read",
            category: "Academic Writing",
            image: "https://www.sourcely.net/_next/image?url=https%3A%2F%2Fassets.seobotai.com%2Fcdn-cgi%2Fimage%2Fquality%3D75%2Cw%3D1536%2Ch%3D1024%2Fsourcely.net%2F68ce28037b5c01ae368b2fa0-1758343107205.jpg&w=3840&q=75"
        },
        {
            id: "11",
            slug: "how-to-improve-your-academic-writing-skills-quickly",
            title: "How to Improve Your Academic Writing Skills Quickly",
            excerpt: "Discover simple, actionable steps to elevate your academic writing quickly. Learn how to plan, structure, and polish your essays and research papers.",
            date: "August 29, 2025",
            author: "Dr. Marcus Reed",
            readTime: "9 min read",
            category: "Academic Writing",
            image: "https://clippings-me-blog.imgix.net/blog/wp-content/uploads/2021/06/How-to-improve-your-writing-skills-1.jpg"
        },
        {
            id: "12",
            slug: "common-citation-mistakes-students-should-avoid",
            title: "Common Citation Mistakes Students Should Avoid",
            excerpt: "Avoid these 10 common citation mistakes that cost students points. Learn how to cite sources correctly and strengthen your academic writing.",
            date: "August 10, 2025",
            author: "Dr. Natalie Brooks",
            readTime: "8 min read",
            category: "Citation Styles",
            image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&h=400&fit=crop"
        },
        {
            id: "13",
            slug: "how-to-choose-reliable-sources-for-academic-research",
            title: "How to Choose Reliable Sources for Academic Research",
            excerpt: "Learn how to identify credible academic sources and avoid unreliable information. A guide to building strong research foundations.",
            date: "August 2, 2025",
            author: "Dr. Ethan Clarke",
            readTime: "9 min read",
            category: "Research Skills",
            image: "https://www.sourcely.net/_next/image?url=https%3A%2F%2Fassets.seobotai.com%2Fsourcely.net%2F678eed990118902285bba61d-1737428359910.jpg&w=3840&q=75"
        },
        {
            id: "14",
            slug: "how-to-strengthen-your-thesis-statement-in-academic-writing",
            title: "How to Strengthen Your Thesis Statement in Academic Writing",
            excerpt: "Learn how to craft a powerful thesis statement that guides your entire academic paper. Avoid common mistakes and strengthen your argument.",
            date: "July 25, 2025",
            author: "Dr. Claire Mitchell",
            readTime: "8 min read",
            category: "Academic Writing",
            image: "https://cdn.cheekyscientist.com/cs/uploads/2020/08/green-chameleon-s9CC2SKySJM-unsplash-3-900x600.jpg"
        },
        {
            id: "15",
            slug: "how-to-write-a-strong-introduction-for-academic-papers",
            title: "How to Write a Strong Introduction for Academic Papers",
            excerpt: "Learn how to craft compelling introductions that set the tone for your academic papers. A guide to clear, engaging, and purposeful openings.",
            date: "July 12, 2025",
            author: "Dr. Fiona Andrews",
            readTime: "8 min read",
            category: "Academic Writing",
            image: "https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=800&h=400&fit=crop"
        },
        {
            id: "16",
            slug: "how-ai-is-transforming-academic-writing-in-2025",
            title: "How AI Is Transforming Academic Writing in 2025",
            excerpt: "Discover how artificial intelligence is reshaping research, writing, and productivity for students in 2025. A guide to responsible AI use in academia.",
            date: "June 30, 2025",
            author: "Dr. Riley Thompson",
            readTime: "10 min read",
            category: "Academic Writing",
            image: "https://kenfra.in/wp-content/uploads/2025/06/Screenshot-2025-06-26-162144.png"
        },
        {
            id: "17",
            slug: "how-ai-can-help-students-avoid-plagiarism-the-smart-way",
            title: "How AI Can Help Students Avoid Plagiarism (The Smart Way)",
            excerpt: "Discover how AI tools can help students avoid plagiarism responsibly while improving paraphrasing, citations, and original idea development.",
            date: "June 18, 2025",
            author: "Dr. Lucas Bennett",
            readTime: "9 min read",
            category: "Academic Integrity",
            image: "https://packback.co/wp-content/uploads/2025/06/Gotcha-to-Growth-Featured-Image-1.png"
        },
        {
            id: "18",
            slug: "the-role-of-critical-thinking-in-academic-writing-and-how-ai-can-support-it",
            title: "The Role of Critical Thinking in Academic Writing (And How AI Can Support It)",
            excerpt: "Discover why critical thinking is essential for academic writing and how AI tools can support (not replace) strong analytical reasoning in 2025.",
            date: "June 4, 2025",
            author: "Dr. Isabella Grant",
            readTime: "9 min read",
            category: "Academic Writing",
            image: "https://integranxt.com/wp-content/uploads/2024/02/Integra-Learning-Cirtical-thinking-Through-AI-scaled-1.jpg"
        },
        {
            id: "19",
            slug: "how-digital-tools-are-changing-the-way-students-do-research",
            title: "How Digital Tools Are Changing the Way Students Do Research",
            excerpt: "Discover how AI-powered research assistants, cloud storage, and digital note-taking are transforming academic research for students in 2025.",
            date: "May 27, 2025",
            author: "Dr. Adrian Wells",
            readTime: "10 min read",
            category: "Research Skills",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
        },
        {
            id: "20",
            slug: "how-to-stay-motivated-during-long-research-projects",
            title: "How to Stay Motivated During Long Research Projects",
            excerpt: "Discover practical strategies to maintain motivation and momentum during long research projects, dissertations, and capstone assignments.",
            date: "May 12, 2025",
            author: "Dr. Helena Ward",
            readTime: "9 min read",
            category: "Research Skills",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop"
        },
        {
            id: "21",
            slug: "how-to-write-a-high-quality-literature-review-step-by-step-guide",
            title: "How to Write a High-Quality Literature Review (Step-by-Step Guide)",
            excerpt: "Learn how to write a strong literature review with this complete step-by-step guide for students working on dissertations, theses, or research papers.",
            date: "May 2, 2025",
            author: "Dr. Naomi Ellis",
            readTime: "11 min read",
            category: "Research Skills",
            image: "https://www.wikihow.com/images/5/5b/Write-an-Article-Review-Step-14.jpg"
        },
        {
            id: "22",
            slug: "top-ai-tools-every-student-should-use-in-2025",
            title: "Top AI Tools Every Student Should Use in 2025",
            excerpt: "Discover the most useful AI tools for students in 2025 that can boost productivity, improve research, and enhance academic writing.",
            date: "April 26, 2025",
            author: "Dr. Valerie Kim",
            readTime: "10 min read",
            category: "Student Productivity",
            image: "https://content.jdmagicbox.com/quickquotes/listicle/listicle_1758610798281_hx4p6_2000x945.jpg?impolicy=queryparam&im=Resize=(847,400),aspect=fit&q=75"
        },
        {
            id: "23",
            slug: "how-to-read-academic-articles-faster-and-understand-them-better",
            title: "How to Read Academic Articles Faster and Understand Them Better",
            excerpt: "Learn practical strategies and modern tools to read academic papers faster while improving comprehension and retention.",
            date: "April 15, 2025",
            author: "Dr. Emily Rhodes",
            readTime: "9 min read",
            category: "Study Skills",
            image: "https://blog.researcher.life/wp-content/uploads/2022/08/pexels-pixabay-159866-1-1024x687.jpg"
        },
        {
            id: "24",
            slug: "how-to-write-a-strong-abstract-for-your-research-paper",
            title: "How to Write a Strong Abstract for Your Research Paper",
            excerpt: "Learn how to craft a compelling abstract that summarizes your research paper effectively and grabs readers' attention.",
            date: "April 8, 2025",
            author: "Dr. Aisha Morgan",
            readTime: "9 min read",
            category: "Academic Writing",
            image: "https://tressacademic.com/wp-content/uploads/2019/03/abstract-900.jpg"
        },
        {
            id: "25",
            slug: "how-to-turn-your-class-notes-into-a-full-research-paper",
            title: "How to Turn Your Class Notes Into a Full Research Paper",
            excerpt: "Discover how to transform your class notes into a complete research paper using a clear process and modern AI-supported tools.",
            date: "March 29, 2025",
            author: "Dr. Leonard Hayes",
            readTime: "10 min read",
            category: "Academic Writing",
            image: "https://framerusercontent.com/images/VDHy9H1cIgvaAoav869i1Shis.jpg?width=2400&height=1600"
        },
        {
            id: "26",
            slug: "how-to-build-a-strong-research-argument-that-actually-persuades",
            title: "How to Build a Strong Research Argument That Actually Persuades",
            excerpt: "Learn how to craft a powerful academic argument using critical thinking, structured reasoning, and modern AI-supported tools.",
            date: "March 18, 2025",
            author: "Dr. Serena Blake",
            readTime: "10 min read",
            category: "Academic Writing",
            image: "https://images.prismic.io/impactio-blog/e634cd3b-2585-43f0-9bf1-21d9fd78d407_How+To+Build+a+Strong+Argument+in+Your+Academic+Writing.png?auto=compress,format"
        },
        {
            id: "27",
            slug: "digital-reading-skills-how-to-study-faster-using-modern-tools",
            title: "Digital Reading Skills: How to Study Faster Using Modern Tools",
            excerpt: "Discover how to master digital reading tools and strategies to learn faster, understand more, and stay ahead in your academic workload.",
            date: "March 9, 2025",
            author: "Dr. Olivia Hart",
            readTime: "9 min read",
            category: "Study Skills",
            image: "https://www.open.edu/openlearn/pluginfile.php/2347992/tool_ocwmanage/image/0/sdw_1_course_image_786x400.jpg"
        },
        {
            id: "28",
            slug: "time-management-for-university-students-using-ai-and-digital-tools",
            title: "Time Management for University Students Using AI and Digital Tools",
            excerpt: "Learn how to take control of your time using modern AI tools and digital systems to manage your university workload more effectively.",
            date: "March 1, 2025",
            author: "Dr. Marcus Lane",
            readTime: "10 min read",
            category: "Student Productivity",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM5LjRNw358GLfftYICAkTsvIsN8tfwX1ZuQ&s"
        },
        {
            id: "29",
            slug: "how-to-use-mind-mapping-to-improve-research-and-study-skills",
            title: "How to Use Mind Mapping to Improve Research and Study Skills",
            excerpt: "Discover how to use mind mapping techniques to visualize ideas, connect concepts, and organize information for better research and study skills.",
            date: "October 6, 2025",
            author: "Dr. Hannah Lewis",
            readTime: "9 min read",
            category: "Study Techniques",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop"
        },
        {
            id: "30",
            slug: "how-to-build-better-study-habits-using-the-science-of-learning",
            title: "How to Build Better Study Habits Using the Science of Learning",
            excerpt: "Learn how to build better study habits using principles from cognitive psychology, neuroscience, and digital learning tools.",
            date: "August 14, 2025",
            author: "Dr. Michael Reeves",
            readTime: "9 min read",
            category: "Study Skills",
            image: "https://www.vedantu.com/seo/content-images/3b375296-3a84-439e-9d25-d4697cb7c02b.jpg"
        },
        {
            id: "31",
            slug: "how-to-take-effective-notes-during-fast-paced-lectures",
            title: "How to Take Effective Notes During Fast-Paced Lectures",
            excerpt: "Learn how to take clear, organized notes during fast-paced lectures using modern strategies and digital tools.",
            date: "September 3, 2025",
            author: "Dr. Laura Benton",
            readTime: "9 min read",
            category: "Study Skills",
            image: "https://i.ytimg.com/vi/QUndnWBR0A0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBWvfYaniS3z_vJNTMQUNwQM1UvSQ"
        }
    ];

    const [showAll, setShowAll] = useState(false);
    const displayedPosts = showAll ? blogPosts : blogPosts.slice(0, 6);

    return (
        <div className="w-full">
            {/* SEO Meta Tags */}
            <Helmet>
                <title>ColabWize Blog - Academic Writing Tips & Resources</title>
                <meta name="description" content="Learn about academic writing, citation tools, plagiarism detection, and research collaboration with our expert blog posts designed for students and researchers." />
                <meta name="keywords" content="academic writing blog, citation tools, plagiarism detection, research collaboration, student resources" />
                <link rel="canonical" href="https://colabwize.com/blog" />
            </Helmet>

            <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        ColabWize Blog
                    </h1>
                    <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
                        Expert tips, guides, and resources for academic writing, citation tools, plagiarism detection, and research collaboration.
                    </p>
                    <button
                        onClick={onWaitlistClick}
                        className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold inline-flex items-center space-x-2"
                    >
                        <span>Join Waitlist</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {displayedPosts.map((post) => (
                            <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <Link to={`/blog/${post.slug}`}>
                                    <img
                                        src={post.image}
                                        alt="Student reading academic books while preparing citations"
                                        className="w-full h-48 object-cover"
                                    />
                                </Link>
                                <div className="p-6">
                                    <div className="flex items-center text-sm text-gray-500 mb-3">
                                        <Tag className="w-4 h-4 mr-1" />
                                        <span>{post.category}</span>
                                        <span className="mx-2">•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 hover:text-blue-600 transition-colors">
                                        <Link to={`/blog/${post.slug}`} className="text-gray-900 hover:text-blue-600">
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <User className="w-4 h-4 mr-1" />
                                        <span className="mr-3">{post.author}</span>
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>{post.date}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {!showAll && blogPosts.length > 5 && (
                        <div className="mt-12 text-center">
                            <button
                                onClick={() => setShowAll(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                                Read More Blogs
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-8 text-center">Popular Categories</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {["Citation Tools", "Plagiarism Detection", "Collaboration", "Academic Integrity", "Citation Styles", "Research Tips"].map((category, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold">{category}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Stay Updated with Our Latest Posts</h2>
                    <p className="text-xl text-gray-700 mb-8">
                        Join our waitlist to receive notifications when we publish new articles.
                    </p>
                    <button
                        onClick={onWaitlistClick}
                        className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg inline-flex items-center space-x-2"
                    >
                        <span>Join Waitlist</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>
        </div>
    );
}