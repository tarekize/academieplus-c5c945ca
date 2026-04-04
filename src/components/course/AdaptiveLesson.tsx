import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, BookOpen, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Video } from "@/services/videoService";

type LearningStyle = "visual" | "textual" | "practical";

interface AdaptiveLessonProps {
    lessonTitle: string;
    lessonContent: string;
    videos: Video[];
    learningStyle: LearningStyle | null;
}

// Extraire ID YouTube
const getYoutubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
};

// Lecteur YouTube
const YoutubePlayer = ({ url, title }: { url: string; title: string }) => {
    const youtubeId = getYoutubeId(url);
    if (!youtubeId) {
        return (
            <div className="bg-muted rounded-lg p-8 text-center text-muted-foreground">
                VidÃ©o non disponible
            </div>
        );
    }

    return (
        <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: "56.25%" }}>
            <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export const AdaptiveLesson = ({
    lessonTitle,
    lessonContent,
    videos,
    learningStyle,
}: AdaptiveLessonProps) => {
    // Visuel â†’ affiche vidÃ©os par dÃ©faut ; Textuel â†’ affiche texte par dÃ©faut
    const [showVideos, setShowVideos] = useState(learningStyle === "visual");

    const mainVideo = videos.find((v) => v.type === "main");
    const reelVideos = videos.filter((v) => v.type === "reel");
    const hasVideos = videos.length > 0;

    return (
        <div className="w-full space-y-4">
            {/* Titre + bouton de bascule EN HAUT */}
            <div className="rounded-lg p-4 border bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-xl font-bold text-foreground">{lessonTitle}</h1>

                {hasVideos && (
                    <Button
                        onClick={() => setShowVideos(!showVideos)}
                        variant="outline"
                        className="flex items-center gap-2 shrink-0"
                    >
                        {showVideos ? (
                            <><BookOpen className="h-4 w-4" /> Voir le texte</>
                        ) : (
                            <><Play className="h-4 w-4" /> Voir les vidÃ©os</>
                        )}
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {showVideos && videos.length > 0 ? (
                    <motion.div
                        key="videos"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {mainVideo ? (
                            <div>
                                <h2 className="text-xl font-semibold text-foreground mb-3">
                                    VidÃ©o principale
                                </h2>
                                <YoutubePlayer url={mainVideo.youtubeUrl} title={mainVideo.title} />
                            </div>
                        ) : null}

                        {reelVideos.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-3">
                                    VidÃ©os complÃ©ment
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {reelVideos.map((reel) => (
                                        <Card key={reel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                            <CardContent className="p-3">
                                                <YoutubePlayer url={reel.youtubeUrl} title={reel.title} />
                                                <p className="text-sm text-foreground font-medium mt-2 line-clamp-2">
                                                    {reel.title}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : videos.length > 0 ? null : (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Aucune vidÃ©o disponible pour cette leçon.
                        </AlertDescription>
                    </Alert>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {!showVideos && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="shadow-md">
                            <CardContent className="p-6">
                                <div className="prose prose-sm max-w-none">
                                    <div
                                        dangerouslySetInnerHTML={{ __html: lessonContent }}
                                        className="text-base leading-relaxed text-foreground"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdaptiveLesson;
