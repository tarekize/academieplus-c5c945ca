import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePhotoUploadProps {
  currentUrl?: string | null;
  name?: string | null;
  onUpload: (file: File) => Promise<string | null>;
  size?: "sm" | "md" | "lg";
}

export function ProfilePhotoUpload({
  currentUrl,
  name,
  onUpload,
  size = "lg",
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className={cn(sizeClasses[size], "border-4 border-primary/20")}>
          <AvatarImage src={previewUrl || currentUrl || undefined} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {initials || <User className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>
        
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full",
            "bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
            "cursor-pointer"
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            Changer la photo
          </>
        )}
      </Button>
    </div>
  );
}
