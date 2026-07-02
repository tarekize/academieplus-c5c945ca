import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Trash2 } from "lucide-react";

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
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-accent opacity-70 blur-sm transition-opacity group-hover:opacity-100" />
        <Avatar className="relative h-28 w-28 ring-4 ring-background shadow-xl">
          <AvatarImage src={url || undefined} />
          <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 text-transparent group-hover:text-white cursor-pointer transition-all duration-300"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="sr-only"
        />

        <label
          htmlFor="avatar-upload"
          className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200 ring-4 ring-background"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </label>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">JPG, PNG, GIF ou WebP — 5 Mo max</p>
        {url && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-7 gap-1.5 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Retirer
          </Button>
        )}
      </div>
    </div>
  );
}
