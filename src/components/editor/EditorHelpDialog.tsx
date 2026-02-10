import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../../components/ui/button";
import { Play, ArrowLeft } from "lucide-react";
import { videoTutorials, VideoTutorial } from "../../data/helpData";

interface EditorHelpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditorHelpDialog({ open, onOpenChange }: EditorHelpDialogProps) {
    const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);

    const handleVideoSelect = (video: VideoTutorial) => {
        if (video.videoId) {
            setSelectedVideo(video);
        }
    };

    const handleBackToList = () => {
        setSelectedVideo(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        {selectedVideo ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 -ml-2 mr-1"
                                    onClick={handleBackToList}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                {selectedVideo.title}
                            </>
                        ) : (
                            "Video Tutorials"
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-6 pt-2">
                    {selectedVideo ? (
                        <div className="w-full h-full flex flex-col gap-4">
                            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shrink-0">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <p className="text-sm text-gray-500">
                                Duration: {selectedVideo.duration}
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                {videoTutorials.map((video) => (
                                    <div
                                        key={video.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 cursor-pointer group transition-all"
                                        onClick={() => handleVideoSelect(video)}
                                    >
                                        <div className="aspect-video relative bg-gray-100 overflow-hidden">
                                            {video.videoId ? (
                                                <>
                                                    <img
                                                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md transition-transform group-hover:scale-110">
                                                            <Play className="h-4 w-4 text-blue-600 ml-0.5 fill-blue-600" />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                                    {video.thumbnail}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                                                    {video.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                    {video.duration}
                                                </span>
                                                {!video.videoId && (
                                                    <span className="text-[10px] uppercase font-bold text-gray-400">
                                                        Coming Soon
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
