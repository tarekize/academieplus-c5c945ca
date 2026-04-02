import { supabase } from '@/integrations/supabase/client';

export const mediaService = {
  // Upload fichier vers Supabase Storage
  async upload(file: File, bucket = 'avatars') {
    // Générer nom unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    // Upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Récupérer URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      path: data.path,
      url: publicUrl,
      fileName: file.name
    };
  },

  // Stub methods for medias table (not available)
  async addToSection(sectionId: number, mediaData: any) {
    console.warn('mediaService.addToSection: medias table not available');
    throw new Error('La table medias n\'est pas disponible');
  },

  async delete(mediaId: number) {
    console.warn('mediaService.delete: medias table not available');
    throw new Error('La table medias n\'est pas disponible');
  },

  // Optimiser image (compression) - this works without database
  async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Redimensionner si trop grand
          let width = img.width;
          let height = img.height;
          const maxSize = 1920;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              }));
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', 0.85);
        };

        img.onerror = reject;
      };

      reader.onerror = reject;
    });
  },

  async listByCourse(coursId: number) {
    console.warn('mediaService.listByCourse: medias table not available');
    return [];
  }
};