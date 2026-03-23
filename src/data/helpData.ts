export interface VideoTutorial {
    id: string;
    title: string;
    duration: string;
    thumbnail: string;
    videoId?: string;
    customThumbnail?: string;
}

export const videoTutorials: VideoTutorial[] = [
    {
        id: "1",
        title: "Introduction to ColabWize",
        duration: "3:45",
        thumbnail: "🎥",
        videoId: "Zsid3NSL188",
        customThumbnail: "/assets/images/thumbnails/intro.jpg"
    },
    {
        id: "2",
        title: "Account Creation and Setup",
        duration: "4:00",
        thumbnail: "👤",
        videoId: "alIzg6uC_sY",
        customThumbnail: "/assets/images/thumbnails/account-creation.jpg"
    },
    {
        id: "3",
        title: "Uploading Your First Document",
        duration: "3:30",
        thumbnail: "🎬",
        videoId: "22CkOWWOkl4",
        customThumbnail: "/assets/images/thumbnails/upload-document.jpg"
    },
    {
        id: "4",
        title: "Explore Your Dashboard",
        duration: "5:45",
        thumbnail: "📊",
        videoId: "g_HyTIMTaiE",
        customThumbnail: "/assets/images/thumbnails/dashboard.jpg"
    },
    {
        id: "5",
        title: "Explore Your Papers",
        duration: "4:20",
        thumbnail: "📄",
        videoId: "ndX50xogcno",
        customThumbnail: "/assets/images/thumbnails/papers.jpg"
    },
    {
        id: "6",
        title: "Citation Audit",
        duration: "5:15",
        thumbnail: "🔍",
        videoId: "PRU5CS26tb8",
        customThumbnail: "/assets/images/thumbnails/audit.jpg"
    },
    {
        id: "7",
        title: "Workspace Collaboration Overview",
        duration: "6:30",
        thumbnail: "👥",
        videoId: "k67eC8Ttzs8",
        customThumbnail: "/assets/images/thumbnails/workspace.jpg"
    },
    {
        id: "8",
        title: "Export Your Document",
        duration: "3:10",
        thumbnail: "📤",
        videoId: "k67eC8Ttzs8",
        customThumbnail: "/assets/images/thumbnails/export.jpg"
    },
];
