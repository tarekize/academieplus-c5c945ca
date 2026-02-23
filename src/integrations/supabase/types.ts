export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
<<<<<<< HEAD
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_exercises: {
        Row: {
          accepted_answers: Json
          chapter_id: string
          created_at: string
          expected_answer: string
          id: string
          order_index: number
          solution: string
          statement: string
          title: string
          updated_at: string
        }
        Insert: {
          accepted_answers?: Json
          chapter_id: string
          created_at?: string
          expected_answer: string
          id?: string
          order_index?: number
          solution: string
          statement: string
          title: string
          updated_at?: string
        }
        Update: {
          accepted_answers?: Json
          chapter_id?: string
          created_at?: string
          expected_answer?: string
          id?: string
          order_index?: number
          solution?: string
          statement?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_exercises_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_quizzes: {
        Row: {
          chapter_id: string
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: Json
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_quizzes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          created_at: string
          description: string | null
          filiere_id: string | null
          id: string
          order_index: number
          school_level: Database["public"]["Enums"]["school_level"]
          subject: string
          title: string
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filiere_id?: string | null
          id?: string
          order_index?: number
          school_level: Database["public"]["Enums"]["school_level"]
          subject?: string
          title: string
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filiere_id?: string | null
          id?: string
          order_index?: number
          school_level?: Database["public"]["Enums"]["school_level"]
          subject?: string
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
        ]
      }
      filieres: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          name_ar: string | null
          school_level: Database["public"]["Enums"]["school_level"]
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          name_ar?: string | null
          school_level: Database["public"]["Enums"]["school_level"]
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          name_ar?: string | null
          school_level?: Database["public"]["Enums"]["school_level"]
        }
        Relationships: []
      }
      its_recommendations: {
        Row: {
          chapter_id: string | null
          content: string
          created_at: string
          id: string
          is_completed: boolean
          priority: number
          recommendation_type: string
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_completed?: boolean
          priority?: number
          recommendation_type: string
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          priority?: number
          recommendation_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "its_recommendations_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_styles: {
        Row: {
          advice_seen: boolean | null
          assessment_data: Json | null
          completed_at: string
          created_at: string
          id: string
          practical_score: number
          preferred_style: string
          textual_score: number
          updated_at: string
          user_id: string
          visual_score: number
        }
        Insert: {
          advice_seen?: boolean | null
          assessment_data?: Json | null
          completed_at?: string
          created_at?: string
          id?: string
          practical_score?: number
          preferred_style?: string
          textual_score?: number
          updated_at?: string
          user_id: string
          visual_score?: number
        }
        Update: {
          advice_seen?: boolean | null
          assessment_data?: Json | null
          completed_at?: string
          created_at?: string
          id?: string
          practical_score?: number
          preferred_style?: string
          textual_score?: number
          updated_at?: string
          user_id?: string
          visual_score?: number
        }
        Relationships: []
      }
      lessons: {
        Row: {
          chapter_id: string
          content: string | null
          created_at: string
          id: string
          order_index: number
          title: string
          title_ar: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          chapter_id: string
          content?: string | null
          created_at?: string
          id?: string
          order_index?: number
          title: string
          title_ar?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          chapter_id?: string
          content?: string | null
          created_at?: string
          id?: string
          order_index?: number
          title?: string
          title_ar?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_child_links: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          parent_id: string
          status: Database["public"]["Enums"]["link_status"] | null
          updated_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          parent_id: string
          status?: Database["public"]["Enums"]["link_status"] | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          parent_id?: string
          status?: Database["public"]["Enums"]["link_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_child_links_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_child_links_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          filiere: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          linking_code: string | null
          phone: string | null
          school_level: Database["public"]["Enums"]["school_level"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          filiere?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          linking_code?: string | null
          phone?: string | null
          school_level?: Database["public"]["Enums"]["school_level"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          filiere?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          linking_code?: string | null
          phone?: string | null
          school_level?: Database["public"]["Enums"]["school_level"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
=======
      [_ in never]: never
>>>>>>> 2b80e3ab5e9808994e8ffc9dc273736b7955cd3f
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
