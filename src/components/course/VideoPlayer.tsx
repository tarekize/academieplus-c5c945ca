import { Play } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  title: string;
}

/** Lecteur vidéo générique (YouTube, Vimeo ou fichier vidéo direct), utilisé
 * partout où une leçon référence une vidéo par simple URL. */
export const VideoPlayer = ({ url, title }: VideoPlayerProps) => {
  // Support YouTube, Vimeo, and direct video URLs
  /** Convertit une URL "page" (youtube.com/watch, youtu.be/, vimeo.com/) en URL
   * d'embed iframe. Renvoie l'URL telle quelle si aucun format connu ne matche. */
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // Un lien youtu.be/ peut porter des paramètres de suivi (ex. ?t=30) :
      // sans les retirer, videoId contenait "abc123?t=30" et l'embed cassait.
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()?.split("?")[0]
        : new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop()?.split("?")[0];
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
