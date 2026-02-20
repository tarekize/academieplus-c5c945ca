import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface AvatarUploadProps {
  url: string | null | undefined;
  onUpload: (url: string) => void;
  onDelete?: () => void;
}

export function AvatarUpload({ url, onUpload, onDelete }: AvatarUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;

    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Vous devez sélectionner une image à télécharger.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop()?.toLowerCase();

      // Validate file type
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        throw new Error("Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.");
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Le fichier est trop volumineux. Maximum 5 Mo.");
      }

      // Use user folder path for RLS compatibility
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // First, try to remove old avatars in user folder
      try {
        const { data: existingFiles } = await supabase.storage.from("avatars").list(user.id);
        if (existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
          await supabase.storage.from("avatars").remove(filesToDelete);
        }
      } catch {
        // Ignore errors when cleaning up old files
      }

      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);

      onUpload(publicUrl);
      toast({
        title: "Succès",
        description: "Votre photo de profil a été mise à jour.",
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger l'image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24 border-2 border-primary/20">
        <AvatarImage src={url || undefined} />
        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <div className="relative">
          <Button variant="outline" disabled={uploading} asChild>
            <label htmlFor="avatar-upload" className="cursor-pointer">
              {uploading ? "Chargement..." : url ? "Modifier la photo" : "Ajouter une photo"}
            </label>
          </Button>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        {url && onDelete && (
          <Button variant="outline" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
