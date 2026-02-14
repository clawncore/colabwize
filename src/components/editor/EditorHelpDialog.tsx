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
    const [imgError, setImgError] = useState<Record<string, boolean>>({});

    const handleVideoSelect = (video: VideoTutorial) => {
        if (video.videoId) {
            setSelectedVideo(video);
        }
    };

    const handleBackToList = () => {
        setSelectedVideo(null);
    };

    const handleImgError = (id: string) => {
        setImgError((prev) => ({ ...prev, [id]: true }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
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

                <div className="flex-1 overflow-hidden bg-gray-50/50">
                    {selectedVideo ? (
                        <div className="w-full h-full flex flex-col">
                            <div className="flex-1 bg-black w-full relative">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0"
                                ></iframe>
                            </div>
                            <div className="p-4 bg-white border-t">
                                <h3 className="font-semibold text-lg">{selectedVideo.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Duration: {selectedVideo.duration}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videoTutorials.map((video) => (
                                    <div
                                        key={video.id}
                                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full relative"
                                        onClick={() => handleVideoSelect(video)}
                                    >
                                        {/* Thumbnail Container */}
                                        <div className="aspect-video relative bg-gray-100 overflow-hidden">
                                            {video.videoId ? (
                                                <>
                                                    <img
                                                        src={
                                                            video.customThumbnail && !imgError[video.id]
                                                                ? video.customThumbnail
                                                                : `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
                                                        }
                                                        onError={() => handleImgError(video.id)}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors z-10">
                                                        <button
                                                            className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transform transition-transform group-hover:scale-110 cursor-pointer hover:bg-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleVideoSelect(video);
                                                            }}
                                                        >
                                                            <Play className="h-5 w-5 text-blue-600 ml-1 fill-blue-600" />
                                                        </button>
                                                    </div>
                                                    {/* Duration Badge */}
                                                    <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium">
                                                        {video.duration}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-50">
                                                    {video.thumbnail}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex flex-col flex-1 gap-2">
                                            <h4 className="font-semibold text-base text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                                {video.title}
                                            </h4>
                                            {!video.videoId && (
                                                <div className="mt-auto pt-2">
                                                    <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                                                        Coming Soon
                                                    </span>
                                                </div>
                                            )}
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
