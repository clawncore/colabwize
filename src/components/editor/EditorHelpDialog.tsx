import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../../components/ui/button";
import {
  Play,
  ArrowLeft,
  Mail,
  MessageCircle,
  BookOpen,
  Heart,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { videoTutorials, VideoTutorial } from "../../data/helpData";

interface EditorHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditorHelpDialog({
  open,
  onOpenChange,
}: EditorHelpDialogProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(
    null,
  );
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
      <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[1000px] h-[80vh] flex flex-col p-0 gap-0 bg-gradient-to-b from-white to-slate-50 border-0 shadow-2xl overflow-hidden rounded-2xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex flex-row items-center justify-between rounded-t-2xl">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-800">
            {selectedVideo ? (
              <>
                <Button
                  className="h-9 w-9 -ml-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-all"
                  onClick={handleBackToList}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-slate-800 truncate">
                  {selectedVideo.title}
                </span>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-slate-800">Editor Tutorials</span>
                  <p className="text-xs text-slate-500 font-normal">
                    Learn how to use the editor
                  </p>
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-transparent relative">
          {selectedVideo ? (
            <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-300 relative z-10">
              <div className="flex-1 w-full relative">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 rounded-b-xl"></iframe>
              </div>
              <div className="p-5 bg-white border-t border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">
                      {selectedVideo.title}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {selectedVideo.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-medium text-green-700">
                      {selectedVideo.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full px-6 py-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoTutorials.map((video) => (
                  <div
                    key={video.id}
                    className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
                    onClick={() => handleVideoSelect(video)}>
                    <div className="aspect-video relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
                          Tutorial
                        </span>
                      </div>

                      {video.videoId ? (
                        <>
                          <img
                            src={
                              video.customThumbnail && !imgError[video.id]
                                ? video.customThumbnail
                                : `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
                            }
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src.includes("maxresdefault")) {
                                target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                              } else {
                                handleImgError(video.id);
                              }
                            }}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                              <Play className="h-6 w-6 text-blue-600 ml-1" />
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                            {video.duration}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <div className="text-5xl">{video.thumbnail}</div>
                          <span className="text-xs font-medium text-slate-400">
                            Coming Soon
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <h4 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {video.title}
                      </h4>

                      {video.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {video.description}
                        </p>
                      )}

                      <div className="mt-auto pt-2">
                        {video.videoId ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                            <span>Watch Tutorial</span>
                            <ArrowLeft className="w-3 h-3 rotate-180" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Coming Soon
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  Need Help?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="mailto:support@colabwize.com"
                    className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all group">
                    <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        Email Support
                      </p>
                      <p className="text-xs text-slate-500">
                        Get help from our team
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://calendly.com/colabwize/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all group">
                    <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        Live Chat
                      </p>
                      <p className="text-xs text-slate-500">
                        Chat with support
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
