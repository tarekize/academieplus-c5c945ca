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
      activation_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          id: string
          is_family: boolean
          payment_id: string | null
          plan_type: string
          status: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          id?: string
          is_family?: boolean
          payment_id?: string | null
          plan_type: string
          status?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          id?: string
          is_family?: boolean
          payment_id?: string | null
          plan_type?: string
          status?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activation_codes_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
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
      ai_generated_content: {
        Row: {
          chapter_id: string
          content: Json
          content_type: string
          created_at: string
          difficulty_level: number
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          content?: Json
          content_type: string
          created_at?: string
          difficulty_level?: number
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          content?: Json
          content_type?: string
          created_at?: string
          difficulty_level?: number
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_content_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_content_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
          last_advice_generated_at: string | null
          periodic_advice: Json | null
          practical_score: number
          preferred_style: string
          report_first_shown_at: string | null
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
          last_advice_generated_at?: string | null
          periodic_advice?: Json | null
          practical_score?: number
          preferred_style?: string
          report_first_shown_at?: string | null
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
          last_advice_generated_at?: string | null
          periodic_advice?: Json | null
          practical_score?: number
          preferred_style?: string
          report_first_shown_at?: string | null
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
      payments: {
        Row: {
          amount: number
          children_count: number
          created_at: string
          id: string
          is_family: boolean
          payment_date: string
          period_id: string | null
          plan_label: string
          plan_type: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          children_count?: number
          created_at?: string
          id?: string
          is_family?: boolean
          payment_date?: string
          period_id?: string | null
          plan_label: string
          plan_type: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          children_count?: number
          created_at?: string
          id?: string
          is_family?: boolean
          payment_date?: string
          period_id?: string | null
          plan_label?: string
          plan_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "subscription_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          ecole: string | null
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
          ville: string | null
          wilaya: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          ecole?: string | null
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
          ville?: string | null
          wilaya?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          ecole?: string | null
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
          ville?: string | null
          wilaya?: string | null
        }
        Relationships: []
      }
      student_notifications: {
        Row: {
          advice: string | null
          chapter_id: string | null
          created_at: string
          diagnostic: string | null
          id: string
          is_read: boolean
          lesson_id: string | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          advice?: string | null
          chapter_id?: string | null
          created_at?: string
          diagnostic?: string | null
          id?: string
          is_read?: boolean
          lesson_id?: string | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Update: {
          advice?: string | null
          chapter_id?: string | null
          created_at?: string
          diagnostic?: string | null
          id?: string
          is_read?: boolean
          lesson_id?: string | null
          message?: string
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notifications_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_notifications_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_scores: {
        Row: {
          accuracy_rate: number
          chapter_id: string | null
          correct_answers: number
          created_at: string
          current_level: number
          exercise_time_seconds: number
          id: string
          lesson_id: string | null
          quiz_time_seconds: number
          reading_time_seconds: number
          streak: number
          total_answers: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_rate?: number
          chapter_id?: string | null
          correct_answers?: number
          created_at?: string
          current_level?: number
          exercise_time_seconds?: number
          id?: string
          lesson_id?: string | null
          quiz_time_seconds?: number
          reading_time_seconds?: number
          streak?: number
          total_answers?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_rate?: number
          chapter_id?: string | null
          correct_answers?: number
          created_at?: string
          current_level?: number
          exercise_time_seconds?: number
          id?: string
          lesson_id?: string | null
          quiz_time_seconds?: number
          reading_time_seconds?: number
          streak?: number
          total_answers?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_scores_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scores_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_subscriptions: {
        Row: {
          activation_code_id: string | null
          created_at: string
          days_used: number
          id: string
          is_paused: boolean
          last_tick_at: string
          paused_at: string | null
          plan_type: string
          started_at: string
          total_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activation_code_id?: string | null
          created_at?: string
          days_used?: number
          id?: string
          is_paused?: boolean
          last_tick_at?: string
          paused_at?: string | null
          plan_type: string
          started_at?: string
          total_days: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activation_code_id?: string | null
          created_at?: string
          days_used?: number
          id?: string
          is_paused?: boolean
          last_tick_at?: string
          paused_at?: string | null
          plan_type?: string
          started_at?: string
          total_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_subscriptions_activation_code_id_fkey"
            columns: ["activation_code_id"]
            isOneToOne: false
            referencedRelation: "activation_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          plan_type: string
          price_family: number
          price_single: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          plan_type: string
          price_family: number
          price_single: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          plan_type?: string
          price_family?: number
          price_single?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          label: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          label: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          label?: string
          start_date?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_activation_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_parent_of: {
        Args: { _child_id: string; _parent_id: string }
        Returns: boolean
      }
      log_activity: {
        Args: { _action: string; _details?: Json; _user_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "student" | "parent" | "admin" | "pedago"
      link_status: "pending" | "active" | "rejected"
      school_level:
        | "5eme_primaire"
        | "1ere_cem"
        | "2eme_cem"
        | "3eme_cem"
        | "4eme_cem"
        | "premiere"
        | "seconde"
        | "terminale"
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
    Enums: {
      app_role: ["student", "parent", "admin", "pedago"],
      link_status: ["pending", "active", "rejected"],
      school_level: [
        "5eme_primaire",
        "1ere_cem",
        "2eme_cem",
        "3eme_cem",
        "4eme_cem",
        "premiere",
        "seconde",
        "terminale",
      ],
    },
  },
} as const
