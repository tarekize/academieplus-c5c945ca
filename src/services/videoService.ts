// Stockage temporaire en localStorage (en attente de la migration Supabase video_mappings)
export type VideoType = "main" | "reel";

export interface Video {
    id: string;
    title: string;
    youtubeUrl: string;
    duration: string;
    type: VideoType;
}

export interface ReelVideo {
    title: string;
    url: string;
    duration: string;
}

export interface VideoMapping {
    lesson_title: string;
    main_video_url?: string;
    main_video_duration?: string;
    reel_videos: ReelVideo[];
}

// Stockage local des vidÃ©os (migration vers Supabase video_mappings une fois appliquÃ©e)
const STORAGE_KEY = "video_mappings";

const getStoredMappings = (): Record<string, VideoMapping> => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const saveMappings = (mappings: Record<string, VideoMapping>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
};

export const videoService = {
    /**
     * RÃ©cupÃ¨re les vidÃ©os YouTube pour une leçon selon son titre
     */
    async getVideosByLessonTitle(lessonTitle: string): Promise<Video[]> {
        try {
            const mappings = getStoredMappings();

            // Recherche par titre exact ou approchÃ©e (case-insensitive)
            const matchingKey = Object.keys(mappings).find(key =>
                key.toLowerCase().includes(lessonTitle.toLowerCase())
            );

            if (!matchingKey) {
                console.log(`Aucune vidÃ©o trouvÃ©e pour: ${lessonTitle}`);
                return [];
            }

            const data = mappings[matchingKey];
            const videos: Video[] = [];

            // Ajouter la vidÃ©o principale
            if (data.main_video_url) {
                videos.push({
                    id: `${matchingKey}-main`,
                    title: data.lesson_title,
                    youtubeUrl: data.main_video_url,
                    duration: data.main_video_duration || "15:00",
                    type: "main",
                });
            }

            // Ajouter les micro-vidÃ©os
            if (data.reel_videos && Array.isArray(data.reel_videos)) {
                data.reel_videos.forEach((reel: ReelVideo, idx: number) => {
                    videos.push({
                        id: `${matchingKey}-reel-${idx}`,
                        title: reel.title,
                        youtubeUrl: reel.url,
                        duration: reel.duration,
                        type: "reel",
                    });
                });
            }

            return videos;
        } catch (error) {
            console.error("Erreur:", error);
            return [];
        }
    },

    /**
     * Ajoute ou met Ã  jour les vidÃ©os pour une leçon
     */
    async upsertVideoMapping(
        lessonTitle: string,
        mainVideoUrl: string,
        mainVideoDuration: string = "15:00",
        reels: ReelVideo[] = []
    ): Promise<VideoMapping | null> {
        try {
            const mappings = getStoredMappings();
            const mapping: VideoMapping = {
                lesson_title: lessonTitle,
                main_video_url: mainVideoUrl,
                main_video_duration: mainVideoDuration,
                reel_videos: reels,
            };
            mappings[lessonTitle] = mapping;
            saveMappings(mappings);
            return mapping;
        } catch (error) {
            console.error("Erreur:", error);
            return null;
        }
    },

    /**
     * Supprime les vidÃ©os d'une leçon
     */
    async deleteVideoMapping(lessonTitle: string): Promise<boolean> {
        try {
            const mappings = getStoredMappings();
            delete mappings[lessonTitle];
            saveMappings(mappings);
            return true;
        } catch (error) {
            console.error("Erreur:", error);
            return false;
        }
    },

    /**
     * RÃ©cupÃ¨re tous les mappings vidÃ©o (pour admin)
     */
    async getAllVideoMappings(): Promise<VideoMapping[]> {
        try {
            const mappings = getStoredMappings();
            return Object.values(mappings);
        } catch (error) {
            console.error("Erreur:", error);
            return [];
        }
    }
};
