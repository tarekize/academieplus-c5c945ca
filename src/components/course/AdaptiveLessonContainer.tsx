import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { videoService, type Video } from "@/services/videoService";
import { AdaptiveLesson } from "./AdaptiveLesson";

type LearningStyle = "visual" | "textual" | "practical";

interface AdaptiveLessonContainerProps {
    lessonTitle: string;
    lessonContent: string;
    learningStyle: LearningStyle | null;
}

export const AdaptiveLessonContainer = ({
    lessonTitle,
    lessonContent,
    learningStyle,
}: AdaptiveLessonContainerProps) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedVideos = await videoService.getVideosByLessonTitle(lessonTitle);
                setVideos(fetchedVideos);
            } catch (err) {
                setError("Erreur lors du chargement des vidéos");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [lessonTitle]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <AdaptiveLesson
            lessonTitle={lessonTitle}
            lessonContent={lessonContent}
            videos={videos}
            learningStyle={learningStyle}
        />
    );
};

export default AdaptiveLessonContainer;
