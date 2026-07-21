import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { videoService, type ReelVideo, type VideoMapping } from "@/services/videoService";

export const VideoLibraryManager = () => {
    const [mappings, setMappings] = useState<Record<string, VideoMapping>>(
        JSON.parse(localStorage.getItem("video_mappings") || "{}")
    );
    const [formData, setFormData] = useState({
        lessonTitle: "",
        mainVideoUrl: "",
        mainVideoDuration: "15:00",
        reelsJson: "",
    });
    const [loading, setLoading] = useState(false);
    const [deletingTitle, setDeletingTitle] = useState<string | null>(null);

    const handleAddMapping = async () => {
        if (!formData.lessonTitle.trim() || !formData.mainVideoUrl.trim()) {
            toast.error("Le titre et l'URL sont requis");
            return;
        }

        try {
            let reels: ReelVideo[] = [];
            if (formData.reelsJson.trim()) {
                reels = JSON.parse(formData.reelsJson);
            }

            const result = await videoService.upsertVideoMapping(
                formData.lessonTitle,
                formData.mainVideoUrl,
                formData.mainVideoDuration,
                reels
            );

            if (result) {
                setMappings(JSON.parse(localStorage.getItem("video_mappings") || "{}"));
                setFormData({
                    lessonTitle: "",
                    mainVideoUrl: "",
                    mainVideoDuration: "15:00",
                    reelsJson: "",
                });
                toast.success("Mapping vidéo ajouté avec succès");
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout du mapping");
        }
    };

    const handleDelete = async (title: string) => {
        setDeletingTitle(title);
        try {
            if (await videoService.deleteVideoMapping(title)) {
                setMappings(JSON.parse(localStorage.getItem("video_mappings") || "{}"));
                toast.success("Mapping supprimé");
            }
        } finally {
            setDeletingTitle(null);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestionnaire de Vidéos</h1>
                <p className="text-gray-600">Mappez les titres de cours aux vidéos YouTube</p>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un Mapping
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nouveau Mapping Vidéo</DialogTitle>
                        <DialogDescription>
                            Créez un mapping entre un titre de cours et ses vidéos YouTube
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="lessonTitle">Titre du Cours*</Label>
                            <Input
                                id="lessonTitle"
                                placeholder="Ex: Les Équations du 1er degré"
                                value={formData.lessonTitle}
                                onChange={(e) =>
                                    setFormData({ ...formData, lessonTitle: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="mainVideoUrl">URL Vidéo Principale*</Label>
                            <Input
                                id="mainVideoUrl"
                                placeholder="https://youtu.be/..."
                                value={formData.mainVideoUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, mainVideoUrl: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="mainVideoDuration">Durée</Label>
                            <Input
                                id="mainVideoDuration"
                                placeholder="15:00"
                                value={formData.mainVideoDuration}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        mainVideoDuration: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="reelsJson">Vidéos Complémentaires (JSON)</Label>
                            <Textarea
                                id="reelsJson"
                                placeholder='[{"title": "Intro", "url": "https://youtu.be/...", "duration": "5:00"}]'
                                value={formData.reelsJson}
                                onChange={(e) =>
                                    setFormData({ ...formData, reelsJson: e.target.value })
                                }
                                className="h-32 text-xs"
                            />
                        </div>
                        <Button onClick={handleAddMapping} disabled={loading} className="w-full">
                            {loading ? "Ajout..." : "Ajouter"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid gap-4">
                {Object.entries(mappings).map(([title, mapping]) => (
                    <Card key={title} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{mapping.lesson_title}</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={deletingTitle === title}
                                            aria-label="Supprimer le mapping vidéo"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Supprimer ce mapping vidéo ?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Le lien entre « {mapping.lesson_title} » et ses vidéos sera retiré. Cette action est irréversible.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(title)}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                Supprimer
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {mapping.main_video_url && (
                                <div>
                                    <p className="font-semibold text-gray-700">Vidéo principale:</p>
                                    <p className="text-blue-600 break-all">{mapping.main_video_url}</p>
                                    <p className="text-gray-600">Durée: {mapping.main_video_duration}</p>
                                </div>
                            )}
                            {mapping.reel_videos && mapping.reel_videos.length > 0 && (
                                <div>
                                    <p className="font-semibold text-gray-700">
                                        Vidéos complémentaires ({mapping.reel_videos.length}):
                                    </p>
                                    {mapping.reel_videos.map((reel, idx) => (
                                        <div key={idx} className="ml-2 border-l-2 border-gray-300 pl-2">
                                            <p className="text-gray-700">{reel.title}</p>
                                            <p className="text-xs text-gray-500">{reel.duration}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {Object.keys(mappings).length === 0 && (
                    <Card className="bg-gray-50 border-dashed">
                        <CardContent className="p-8 text-center text-gray-500">
                            Aucun mapping vidéo yet. Commencez par en ajouter un!
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default VideoLibraryManager;
