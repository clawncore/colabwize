export interface VideoTutorial {
    id: string;
    title: string;
    duration: string;
    thumbnail: string;
    videoId?: string;
    customThumbnail?: string;
    description?: string;
}

export const videoTutorials: VideoTutorial[] = [
    {
        id: "1",
        title: "Introduction to ColabWize",
        duration: "3:45",
        thumbnail: "🎥",
        videoId: "Zsid3NSL188",
        customThumbnail: "/assets/images/thumbnails/intro.jpg",
        description: "Learn the basics of ColabWize and how it can help you with academic writing, citation management, and more."
    },
    {
        id: "2",
        title: "Account Creation and Setup",
        duration: "4:00",
        thumbnail: "👤",
        videoId: "alIzg6uC_sY",
        customThumbnail: "/assets/images/thumbnails/account-creation.jpg",
        description: "Step-by-step guide to creating your ColabWize account and setting up your profile for optimal experience."
    },
    {
        id: "3",
        title: "Uploading Your First Document",
        duration: "3:30",
        thumbnail: "🎬",
        videoId: "22CkOWWOkl4",
        customThumbnail: "/assets/images/thumbnails/upload-document.jpg",
        description: "Learn how to upload documents, papers, and research materials to your ColabWize library."
    },
    {
        id: "4",
        title: "Explore Your Dashboard",
        duration: "5:45",
        thumbnail: "📊",
        videoId: "g_HyTIMTaiE",
        customThumbnail: "/assets/images/thumbnails/dashboard.jpg",
        description: "Navigate your dashboard to track projects, view analytics, and manage your academic work efficiently."
    },
    {
        id: "5",
        title: "Explore Your Papers",
        duration: "4:20",
        thumbnail: "📄",
        videoId: "ndX50xogcno",
        customThumbnail: "/assets/images/thumbnails/papers.jpg",
        description: "Organize and browse your saved papers, research materials, and references in one place."
    },
    {
        id: "6",
        title: "Citation Audit",
        duration: "5:15",
        thumbnail: "🔍",
        videoId: "PRU5CS26tb8",
        customThumbnail: "/assets/images/thumbnails/audit.jpg",
        description: "Analyze your citations for accuracy, completeness, and proper formatting across APA, MLA, and Chicago styles."
    },
    {
        id: "7",
        title: "Workspace Collaboration Overview",
        duration: "6:30",
        thumbnail: "👥",
        videoId: "k67eC8Ttzs8",
        customThumbnail: "/assets/images/thumbnails/workspace.jpg",
        description: "Work together with teammates in real-time, share documents, and collaborate on research projects."
    },
    {
        id: "8",
        title: "Export Your Document",
        duration: "3:10",
        thumbnail: "📤",
        videoId: "k67eC8Ttzs8",
        customThumbnail: "/assets/images/thumbnails/export.jpg",
        description: "Export your documents in various formats with properly formatted citations and references."
    },
];
