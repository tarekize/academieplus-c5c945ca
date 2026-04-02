import { Play } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  title: string;
}

export const VideoPlayer = ({ url, title }: VideoPlayerProps) => {
  // Support YouTube, Vimeo, and direct video URLs
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be") 
        ? url.split("/").pop()
        : new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const isEmbedded = url.includes("youtube") || url.includes("vimeo");

  return (
    <div className="bg-card rounded-lg overflow-hidden border-2">
      <div className="aspect-video bg-muted relative">
        {isEmbedded ? (
          <iframe
            src={getEmbedUrl(url)}
            title={title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <video
            src={url}
            controls
            className="w-full h-full"
            title={title}
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          <span className="font-medium">{title}</span>
        </div>
      </div>
    </div>
  );
};