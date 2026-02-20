import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

// Use the database type directly
type ProfileRow = Tables<"profiles">;

export interface Profile extends ProfileRow {
  // Any additional computed fields can go here
}

export interface LinkedChild {
  id: string;
  child_id: string;
  status: string;
  created_at: string;
  child: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    school_level: string | null;
    avatar_url: string | null;
  } | null;
}

export interface LinkedParent {
  id: string;
  parent_id: string;
  status: string;
  created_at: string;
  parent: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Log activity using existing function
      await supabase.rpc("log_activity", {
        _user_id: user.id,
        _action: "profile_updated",
        _details: { updated_fields: Object.keys(updates) },
      });

      setProfile((prev) => (prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null));
      toast.success("Profil mis à jour avec succès");
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      await updateProfile({ avatar_url: data.publicUrl });
      return data.publicUrl;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Erreur lors du téléchargement de l'avatar");
      return null;
    }
  };

  return {
    profile,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
}

export function useLinkedChildren() {
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    if (!user) {
      setChildren([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("parent_child_links")
        .select(`
          id,
          child_id,
          status,
          created_at,
          child:profiles!parent_child_links_child_id_fkey(
            id,
            first_name,
            last_name,
            email,
            school_level,
            avatar_url
          )
        `)
        .eq("parent_id", user.id);

      if (error) throw error;
      setChildren((data as any[]) || []);
    } catch (error: any) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const addChildByCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "Non authentifié" };

    const trimmedCode = code.trim();
    
    // Validate code format (8 hex characters)
    if (!/^[a-f0-9]{8}$/i.test(trimmedCode)) {
      return { success: false, message: "Format de code invalide (8 caractères attendus)" };
    }

    try {
      // Call the edge function to link child by code (bypasses RLS)
      const { data, error } = await supabase.functions.invoke("link-child-by-code", {
        body: { code: trimmedCode },
      });

      if (error) {
        console.error("Edge function error:", error);
        return { success: false, message: error.message || "Erreur lors de la liaison" };
      }

      if (data?.error) {
        return { success: false, message: data.error };
      }

      await fetchChildren();
      return { success: true, message: data?.message || "Demande de liaison envoyée" };
    } catch (error: any) {
      console.error("Error adding child by code:", error);
      return { success: false, message: error.message };
    }
  };

  const removeChild = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("parent_child_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;
      
      await fetchChildren();
      toast.success("Lien supprimé avec succès");
      return true;
    } catch (error: any) {
      console.error("Error removing child:", error);
      toast.error("Erreur lors de la suppression du lien");
      return false;
    }
  };

  return {
    children,
    loading,
    addChildByCode,
    removeChild,
    refetch: fetchChildren,
  };
}

export function useLinkedParents() {
  const { user } = useAuth();
  const [parents, setParents] = useState<LinkedParent[]>([]);
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchParents = useCallback(async () => {
    if (!user) {
      setParents([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("parent_child_links")
        .select(`
          id,
          parent_id,
          status,
          created_at,
          parent:profiles!parent_child_links_parent_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("child_id", user.id);

      if (error) throw error;
      setParents((data as any[]) || []);

      // Also fetch the user's linking code
      const { data: profileData } = await supabase
        .from("profiles")
        .select("linking_code")
        .eq("id", user.id)
        .single();

      if (profileData?.linking_code) {
        setLinkingCode(profileData.linking_code);
      }
    } catch (error: any) {
      console.error("Error fetching parents:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const respondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from("parent_child_links")
        .update({ status: accept ? "active" : "rejected" })
        .eq("id", requestId)
        .eq("child_id", user?.id);

      if (error) throw error;
      
      await fetchParents();
      toast.success(accept ? "Lien accepté" : "Demande refusée");
      return { success: true };
    } catch (error: any) {
      console.error("Error responding to request:", error);
      toast.error("Erreur lors de la réponse");
      return { success: false };
    }
  };

  const removeParent = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("parent_child_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;
      
      await fetchParents();
      toast.success("Lien supprimé avec succès");
      return true;
    } catch (error: any) {
      console.error("Error removing parent:", error);
      toast.error("Erreur lors de la suppression du lien");
      return false;
    }
  };

  return {
    parents,
    linkingCode,
    loading,
    respondToRequest,
    removeParent,
    refetch: fetchParents,
  };
}
