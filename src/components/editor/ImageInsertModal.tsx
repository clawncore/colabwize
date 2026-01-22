import React, { useState } from "react";
import { Search, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "../../hooks/use-toast";
import apiClient from "../../services/apiClient";

interface ImageInsertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsertImage: (imageUrl: string, alt?: string) => void;
    projectId: string;
}

export const ImageInsertModal: React.FC<ImageInsertModalProps> = ({
    isOpen,
    onClose,
    onInsertImage,
    projectId,
}) => {
    const [activeTab, setActiveTab] = useState<"unsplash" | "upload" | "url">("unsplash");
    const [searchQuery, setSearchQuery] = useState("");
    const [urlInput, setUrlInput] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [unsplashImages, setUnsplashImages] = useState<any[]>([]);
    const { toast } = useToast();

    // Unsplash search
    const handleUnsplashSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12`,
                {
                    headers: {
                        Authorization: `Client-ID ${import.meta.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Unsplash search failed");
            }

            const data = await response.json();
            setUnsplashImages(data.results || []);
        } catch (error) {
            console.error("Unsplash search error:", error);
            toast({
                title: "Search Failed",
                description: "Unable to search Unsplash. Please check your API key.",
                variant: "destructive",
            });
        } finally {
            setIsSearching(false);
        }
    };

    // Insert from Unsplash
    const handleUnsplashSelect = async (image: any) => {
        try {
            // Trigger download endpoint (required by Unsplash API terms)
            await fetch(image.links.download_location, {
                headers: {
                    Authorization: `Client-ID ${import.meta.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
                },
            });

            onInsertImage(image.urls.regular, image.alt_description || "Unsplash photo");
            onClose();
        } catch (error) {
            console.error("Error inserting Unsplash image:", error);
        }
    };

    // Handle file upload
    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Image must be less than 5MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("projectId", projectId);

            const response = await apiClient.post("/api/images/upload", formData);

            // apiClient handles response.ok check and parsing, or throws
            // But apiClient.post returns the parsed data directly if successful (usually).
            // Let's assume standard behavior: returns parsed JSON.
            // However, apiClient signature depends on implementation.
            // Let's verify apiClient.ts implementation.
            // It returns `response.json ? await response.json() : response`.
            // So `response` here is the DATA object.

            const data = response;

            // if (!response.ok) check is handled by apiClient throwing error
            onInsertImage(data.url, file.name);
            onClose();

            toast({
                title: "Image Uploaded",
                description: "Image uploaded successfully",
            });
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "Upload Failed",
                description: "Unable to upload image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
        },
        maxFiles: 1,
    });

    // Insert from URL
    const handleUrlInsert = () => {
        if (!urlInput.trim()) return;

        try {
            new URL(urlInput); // Validate URL
            onInsertImage(urlInput, "Image from URL");
            onClose();
        } catch {
            toast({
                title: "Invalid URL",
                description: "Please enter a valid image URL",
                variant: "destructive",
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Insert Image</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab("unsplash")}
                        className={`px-6 py-3 font-medium ${activeTab === "unsplash"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                            }`}>
                        <Search className="inline-block w-4 h-4 mr-2" />
                        Unsplash
                    </button>
                    <button
                        onClick={() => setActiveTab("upload")}
                        className={`px-6 py-3 font-medium ${activeTab === "upload"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                            }`}>
                        <Upload className="inline-block w-4 h-4 mr-2" />
                        Upload
                    </button>
                    <button
                        onClick={() => setActiveTab("url")}
                        className={`px-6 py-3 font-medium ${activeTab === "url"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                            }`}>
                        <LinkIcon className="inline-block w-4 h-4 mr-2" />
                        URL
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Unsplash Tab */}
                    {activeTab === "unsplash" && (
                        <div>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleUnsplashSearch()}
                                    placeholder="Search for images..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleUnsplashSearch}
                                    disabled={isSearching}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {unsplashImages.map((image) => (
                                    <div
                                        key={image.id}
                                        onClick={() => handleUnsplashSelect(image)}
                                        className="cursor-pointer group relative aspect-video overflow-hidden rounded-lg border border-gray-200 hover:border-blue-500 transition-all">
                                        <img
                                            src={image.urls.small}
                                            alt={image.alt_description || "Unsplash photo"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs truncate">
                                                Photo by {image.user.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {unsplashImages.length === 0 && !isSearching && (
                                <div className="text-center py-12 text-gray-500">
                                    Search for images to insert from Unsplash
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload Tab */}
                    {activeTab === "upload" && (
                        <div>
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300 hover:border-gray-400"
                                    }`}>
                                <input {...getInputProps()} />
                                {isUploading ? (
                                    <div>
                                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
                                        <p className="text-gray-600">Uploading image...</p>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium text-gray-700 mb-2">
                                            Drop your image here, or click to browse
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Supports JPEG, PNG, WebP (max 5MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* URL Tab */}
                    {activeTab === "url" && (
                        <div className="max-w-xl mx-auto py-8">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleUrlInsert()}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleUrlInsert}
                                className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Insert Image
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
