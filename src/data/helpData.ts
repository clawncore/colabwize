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
        title: "Adding Citations and References",
        duration: "8:45",
        thumbnail: "📚",
        customThumbnail: "/assets/images/thumbnails/citations.jpg"
    },
    {
        id: "6",
        title: "Collaborating with Your Team",
        duration: "6:18",
        thumbnail: "👥",
        customThumbnail: "/assets/images/thumbnails/collaborating.jpg"
    },
];
