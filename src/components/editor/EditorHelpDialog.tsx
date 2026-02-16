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
        } else {
            // Optional: Add a toast here if you have access to it, otherwise just ignore
            // console.log("Video not available yet");
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
            <DialogContent className="sm:max-w-[1100px] h-[85vh] flex flex-col p-0 gap-0 bg-slate-950 text-white border-slate-800 shadow-2xl overflow-hidden rounded-xl">
                <DialogHeader className="p-6 pb-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
                        {selectedVideo ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 -ml-2 hover:bg-white/10 text-white rounded-full transition-colors"
                                    onClick={handleBackToList}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                    {selectedVideo.title}
                                </span>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20">
                                    <Play className="h-5 w-5 text-white fill-white" />
                                </div>
                                <span>Video Tutorials</span>
                            </div>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-slate-950 relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

                    {selectedVideo ? (
                        <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-300 relative z-10">
                            <div className="flex-1 bg-black w-full relative group shadow-2xl">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 shadow-inner"
                                ></iframe>
                            </div>
                            <div className="p-8 bg-slate-900/80 backdrop-blur-xl border-t border-white/10">
                                <h3 className="font-bold text-2xl text-white mb-2">{selectedVideo.title}</h3>
                                <p className="text-slate-400 flex items-center gap-3 text-sm font-medium">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Duration: <span className="text-white">{selectedVideo.duration}</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <ScrollArea className="h-full p-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                {videoTutorials.map((video) => (
                                    <div
                                        key={video.id}
                                        className="group bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
                                        onClick={() => handleVideoSelect(video)}
                                    >
                                        {/* Thumbnail Container */}
                                        <div className="aspect-video relative bg-slate-800 overflow-hidden">
                                            {video.videoId ? (
                                                <>
                                                    <img
                                                        src={
                                                            video.customThumbnail && !imgError[video.id]
                                                                ? video.customThumbnail
                                                                : `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`
                                                        }
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            if (target.src.includes('maxresdefault')) {
                                                                target.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
                                                            } else {
                                                                handleImgError(video.id);
                                                            }
                                                        }}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                                            <Play className="h-6 w-6 text-white ml-1 fill-white" />
                                                        </div>
                                                    </div>
                                                    {/* Duration Badge */}
                                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-medium border border-white/10 group-hover:bg-blue-600/80 group-hover:border-blue-500/50 transition-colors">
                                                        {video.duration}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50 gap-3 group-hover:bg-slate-800 transition-colors">
                                                    <div className="text-5xl opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-500 transform group-hover:scale-110">
                                                        {video.thumbnail}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1 gap-3 relative border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
                                            <h4 className="font-bold text-lg text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                                                {video.title}
                                            </h4>

                                            {!video.videoId ? (
                                                <div className="mt-auto">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider w-fit border border-white/5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                                        Coming Soon
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-auto flex items-center justify-between">
                                                    <div className="text-xs font-medium text-slate-500 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                                                        Watch Now <ArrowLeft className="w-3 h-3 rotate-180" />
                                                    </div>
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
