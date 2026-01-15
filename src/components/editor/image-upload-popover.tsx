import { useState } from "react";
import ConfigService from "../../services/ConfigService";
import { Editor } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Image as ImageIcon, Upload, Search, Loader2 } from "lucide-react";
import { Toggle } from "../ui/toggle";
import axios from "axios";

interface ImageUploadPopoverProps {
  editor: Editor;
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

export function ImageUploadPopover({ editor }: ImageUploadPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadUrl, setUploadUrl] = useState("");
  const [unsplashQuery, setUnsplashQuery] = useState("");
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          editor.chain().focus().setImage({ src: result }).run();
          setIsOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (uploadUrl) {
      editor.chain().focus().setImage({ src: uploadUrl }).run();
      setUploadUrl("");
      setIsOpen(false);
    }
  };

  const searchUnsplash = async () => {
    if (!unsplashQuery) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${ConfigService.getUnsplashConfig().apiUrl}/search/photos`,
        {
          params: {
            query: unsplashQuery,
            per_page: 9,
          },
          headers: {
            Authorization: `Client-ID ${ConfigService.getUnsplashConfig().accessKey}`,
          },
        }
      );
      setUnsplashImages(response.data.results);
    } catch (error) {
      console.error("Failed to search Unsplash:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectUnsplashImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Toggle
          size="sm"
          title="Insert Image"
          pressed={isOpen}
          className="h-8 w-8 data-[state=on]:bg-muted">
          <ImageIcon className="h-4 w-4" />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white" align="start">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none rounded-t-lg">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
          </TabsList>
          <div className="p-4">
            <TabsContent value="upload" className="mt-0 space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="image-url">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                  />
                  <Button size="sm" onClick={handleUrlSubmit}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or upload file
                  </span>
                </div>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload
                    </p>
                    <p className="text-xs text-muted-foreground/75">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Label>
              </div>
            </TabsContent>
            <TabsContent value="unsplash" className="mt-0 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search Unsplash..."
                  value={unsplashQuery}
                  onChange={(e) => setUnsplashQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUnsplash()}
                />
                <Button
                  size="icon"
                  className="bg-indigo-500 hover:bg-indigo-600"
                  onClick={searchUnsplash}
                  disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1">
                {unsplashImages.map((image) => (
                  <button
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-md hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={() => selectUnsplashImage(image.urls.regular)}>
                    <img
                      src={image.urls.small}
                      alt={image.alt_description}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
                {unsplashImages.length === 0 && !isLoading && (
                  <div className="col-span-3 text-center py-8 text-sm text-muted-foreground">
                    {unsplashQuery ? "No results found" : "Search for photos"}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
