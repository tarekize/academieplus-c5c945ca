import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SchoolLevel = Database["public"]["Enums"]["school_level"];

export interface Lesson {
  id: string;
  title: string;
  title_ar: string | null;
  order_index: number;
  content: string | null;
  video_url: string | null;
}

export interface Chapter {
  id: string;
  title: string;
  title_ar: string | null;
  order_index: number;
  description: string | null;
  lessons: Lesson[];
}

export interface Filiere {
  id: string;
  code: string;
  name: string;
  name_ar: string | null;
  school_level: string;
}

export const courseService = {
  /**
   * RÃ©cupÃ¨re les filiÃ¨res disponibles pour un niveau scolaire
   */
  async getFilieresByLevel(schoolLevel: SchoolLevel): Promise<Filiere[]> {
    const { data, error } = await supabase
      .from("filieres")
      .select("*")
      .eq("school_level", schoolLevel)
      .order("name");

    if (error) {
      console.error("Error fetching filieres:", error);
      return [];
    }

    return data || [];
  },

  /**
   * RÃ©cupÃ¨re les chapitres et leçons pour un niveau, une filiÃ¨re et une matiÃ¨re
   */
  async getChaptersWithLessons(
    schoolLevel: SchoolLevel,
    filiereCode: string | null,
    subject: string = "math"
  ): Promise<Chapter[]> {
    let query = supabase
      .from("chapters")
      .select(`
        id,
        title,
        title_ar,
        order_index,
        description,
        lessons (
          id,
          title,
          title_ar,
          order_index,
          content,
          video_url
        )
      `)
      .eq("school_level", schoolLevel)
      .eq("subject", subject)
      .order("order_index");

    // Si une filiÃ¨re est spÃ©cifiÃ©e, filtrer par filiÃ¨re
    if (filiereCode) {
      const { data: filiereData } = await supabase
        .from("filieres")
        .select("id")
        .eq("code", filiereCode)
        .eq("school_level", schoolLevel)
        .maybeSingle();

      if (filiereData) {
        query = query.eq("filiere_id", filiereData.id);
      } else {
        // Si la filiÃ¨re n'existe pas, chercher les chapitres sans filiÃ¨re
        query = query.is("filiere_id", null);
      }
    } else {
      // Si pas de filiÃ¨re, chercher les chapitres sans filiÃ¨re
      query = query.is("filiere_id", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching chapters:", error);
      return [];
    }

    // Trier les leçons par order_index
    return (data || []).map((chapter: any) => ({
      ...chapter,
      lessons: (chapter.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index),
    }));
  },

  /**
   * RÃ©cupÃ¨re un chapitre spÃ©cifique avec ses leçons
   */
  async getChapterById(chapterId: string): Promise<Chapter | null> {
    const { data, error } = await supabase
      .from("chapters")
      .select(`
        id,
        title,
        title_ar,
        order_index,
        description,
        lessons (
          id,
          title,
          title_ar,
          order_index,
          content,
          video_url
        )
      `)
      .eq("id", chapterId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching chapter:", error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      lessons: (data.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index),
    };
  },

  /**
   * RÃ©cupÃ¨re une leçon spÃ©cifique
   */
  async getLessonById(lessonId: string): Promise<Lesson | null> {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching lesson:", error);
      return null;
    }

    return data;
  },
};
