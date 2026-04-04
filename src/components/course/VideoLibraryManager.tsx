import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
    const { toast } = useToast();

    const handleAddMapping = async () => {
        if (!formData.lessonTitle.trim() || !formData.mainVideoUrl.trim()) {
            toast({ description: "Le titre et l'URL sont requis" });
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
                toast({ description: "Mapping vidÃ©o ajoutÃ© avec succÃ¨s" });
            }
        } catch (error) {
            toast({ description: "Erreur lors de l'ajout du mapping" });
        }
    };

    const handleDelete = async (title: string) => {
        if (await videoService.deleteVideoMapping(title)) {
            setMappings(JSON.parse(localStorage.getItem("video_mappings") || "{}"));
            toast({ description: "Mapping supprimÃ©" });
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestionnaire de VidÃ©os</h1>
                <p className="text-gray-600">Mappez les titres de cours aux vidÃ©os YouTube</p>
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
                        <DialogTitle>Nouveau Mapping VidÃ©o</DialogTitle>
                        <DialogDescription>
                            CrÃ©ez un mapping entre un titre de cours et ses vidÃ©os YouTube
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="lessonTitle">Titre du Cours*</Label>
                            <Input
                                id="lessonTitle"
                                placeholder="Ex: Les Ã‰quations du 1er degrÃ©"
                                value={formData.lessonTitle}
                                onChange={(e) =>
                                    setFormData({ ...formData, lessonTitle: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="mainVideoUrl">URL VidÃ©o Principale*</Label>
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
                            <Label htmlFor="mainVideoDuration">DurÃ©e</Label>
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
                            <Label htmlFor="reelsJson">VidÃ©os ComplÃ©mentaires (JSON)</Label>
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
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(title)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {mapping.main_video_url && (
                                <div>
                                    <p className="font-semibold text-gray-700">VidÃ©o principale:</p>
                                    <p className="text-blue-600 break-all">{mapping.main_video_url}</p>
                                    <p className="text-gray-600">DurÃ©e: {mapping.main_video_duration}</p>
                                </div>
                            )}
                            {mapping.reel_videos && mapping.reel_videos.length > 0 && (
                                <div>
                                    <p className="font-semibold text-gray-700">
                                        VidÃ©os complÃ©mentaires ({mapping.reel_videos.length}):
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
                            Aucun mapping vidÃ©o yet. Commencez par en ajouter un!
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default VideoLibraryManager;
