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
          lesson_id: string | null
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
          lesson_id?: string | null
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
          lesson_id?: string | null
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
      ai_lesson_comments: {
        Row: {
          chapter_id: string | null
          chapter_title: string | null
          created_at: string
          id: string
          lesson_id: string
          lesson_title: string | null
          level_after: number
          level_before: number
          level_delta: number
          link_url: string | null
          message: string
          strong_concepts: Json
          user_id: string
          weak_concepts: Json
        }
        Insert: {
          chapter_id?: string | null
          chapter_title?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          lesson_title?: string | null
          level_after?: number
          level_before?: number
          level_delta?: number
          link_url?: string | null
          message: string
          strong_concepts?: Json
          user_id: string
          weak_concepts?: Json
        }
        Update: {
          chapter_id?: string | null
          chapter_title?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          lesson_title?: string | null
          level_after?: number
          level_before?: number
          level_delta?: number
          link_url?: string | null
          message?: string
          strong_concepts?: Json
          user_id?: string
          weak_concepts?: Json
        }
        Relationships: []
      }
      ai_token_usage: {
        Row: {
          created_at: string
          estimated_input_tokens: number
          estimated_output_tokens: number
          function_name: string
          id: string
          is_estimated: boolean
          role_group: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          estimated_input_tokens?: number
          estimated_output_tokens?: number
          function_name: string
          id?: string
          is_estimated?: boolean
          role_group: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          estimated_input_tokens?: number
          estimated_output_tokens?: number
          function_name?: string
          id?: string
          is_estimated?: boolean
          role_group?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chapter_exercises: {
        Row: {
          accepted_answers: Json
          chapter_id: string
          created_at: string
          difficulty: number
          expected_answer: string
          hint: string | null
          id: string
          lesson_id: string | null
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
          difficulty?: number
          expected_answer: string
          hint?: string | null
          id?: string
          lesson_id?: string | null
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
          difficulty?: number
          expected_answer?: string
          hint?: string | null
          id?: string
          lesson_id?: string | null
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
          {
            foreignKeyName: "chapter_exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_quizzes: {
        Row: {
          chapter_id: string
          correct_answer: string
          created_at: string
          difficulty: number
          explanation: string | null
          hint: string | null
          id: string
          lesson_id: string | null
          options: Json
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          correct_answer: string
          created_at?: string
          difficulty?: number
          explanation?: string | null
          hint?: string | null
          id?: string
          lesson_id?: string | null
          options?: Json
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          correct_answer?: string
          created_at?: string
          difficulty?: number
          explanation?: string | null
          hint?: string | null
          id?: string
          lesson_id?: string | null
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
          {
            foreignKeyName: "chapter_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
      chat_conversations: {
        Row: {
          chapter_id: string | null
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_usage: {
        Row: {
          id: string
          image_count: number
          message_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          id?: string
          image_count?: number
          message_count?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          id?: string
          image_count?: number
          message_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      class_announcements: {
        Row: {
          class_id: string
          content: string
          created_at: string
          id: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          content: string
          created_at?: string
          id?: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string
          id?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          class_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          establishment_id: string | null
          filiere: string | null
          id: string
          join_code: string
          name: string
          school_level: Database["public"]["Enums"]["school_level"] | null
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          establishment_id?: string | null
          filiere?: string | null
          id?: string
          join_code?: string
          name: string
          school_level?: Database["public"]["Enums"]["school_level"] | null
          subject?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          establishment_id?: string | null
          filiere?: string | null
          id?: string
          join_code?: string
          name?: string
          school_level?: Database["public"]["Enums"]["school_level"] | null
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      establishments: {
        Row: {
          created_at: string
          establishment_profile_id: string | null
          id: string
          name: string
          teacher_id: string
          type: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          created_at?: string
          establishment_profile_id?: string | null
          id?: string
          name: string
          teacher_id: string
          type?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          created_at?: string
          establishment_profile_id?: string | null
          id?: string
          name?: string
          teacher_id?: string
          type?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "establishments_establishment_profile_id_fkey"
            columns: ["establishment_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          school_level: Database["public"]["Enums"]["school_level"]
          subject: string
          title: string
          title_ar: string | null
          trimester: number
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          school_level: Database["public"]["Enums"]["school_level"]
          subject?: string
          title: string
          title_ar?: string | null
          trimester: number
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          school_level?: Database["public"]["Enums"]["school_level"]
          subject?: string
          title?: string
          title_ar?: string | null
          trimester?: number
          updated_at?: string
        }
        Relationships: []
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
      parent_reports: {
        Row: {
          ai_recommendations: string | null
          child_id: string
          created_at: string
          generated_at: string
          global_level: number | null
          global_success_rate: number | null
          id: string
          parent_id: string
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
          strong_chapters: Json
          summary: string | null
          weak_chapters: Json
        }
        Insert: {
          ai_recommendations?: string | null
          child_id: string
          created_at?: string
          generated_at?: string
          global_level?: number | null
          global_success_rate?: number | null
          id?: string
          parent_id: string
          period_end?: string
          period_start: string
          report_data?: Json
          report_type?: string
          strong_chapters?: Json
          summary?: string | null
          weak_chapters?: Json
        }
        Update: {
          ai_recommendations?: string | null
          child_id?: string
          created_at?: string
          generated_at?: string
          global_level?: number | null
          global_success_rate?: number | null
          id?: string
          parent_id?: string
          period_end?: string
          period_start?: string
          report_data?: Json
          report_type?: string
          strong_chapters?: Json
          summary?: string | null
          weak_chapters?: Json
        }
        Relationships: []
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
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          date_of_birth: string | null
          ecole: string | null
          email: string
          email_verified: boolean | null
          establishment_code: string | null
          establishment_id: string | null
          filiere: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          linking_code: string | null
          phone: string | null
          school_level: Database["public"]["Enums"]["school_level"] | null
          subscription_end_date: string | null
          updated_at: string | null
          ville: string | null
          wilaya: string | null
        }
        Insert: {
          avatar_url?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          ecole?: string | null
          email: string
          email_verified?: boolean | null
          establishment_code?: string | null
          establishment_id?: string | null
          filiere?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          linking_code?: string | null
          phone?: string | null
          school_level?: Database["public"]["Enums"]["school_level"] | null
          subscription_end_date?: string | null
          updated_at?: string | null
          ville?: string | null
          wilaya?: string | null
        }
        Update: {
          avatar_url?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          ecole?: string | null
          email?: string
          email_verified?: boolean | null
          establishment_code?: string | null
          establishment_id?: string | null
          filiere?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          linking_code?: string | null
          phone?: string | null
          school_level?: Database["public"]["Enums"]["school_level"] | null
          subscription_end_date?: string | null
          updated_at?: string | null
          ville?: string | null
          wilaya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      renewal_reminders_log: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          sent_by: string | null
          success: boolean
          target_user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          sent_by?: string | null
          success?: boolean
          target_user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          sent_by?: string | null
          success?: boolean
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "renewal_reminders_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_scores: {
        Row: {
          accuracy_rate: number
          advice_seen: boolean
          assessment_data: Json | null
          chapter_id: string | null
          correct_answers: number
          created_at: string
          current_level: number
          exercise_time_seconds: number
          id: string
          last_advice_generated_at: string | null
          lesson_id: string | null
          periodic_advice: Json | null
          quiz_time_seconds: number
          reading_time_seconds: number
          report_first_shown_at: string | null
          streak: number
          total_answers: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_rate?: number
          advice_seen?: boolean
          assessment_data?: Json | null
          chapter_id?: string | null
          correct_answers?: number
          created_at?: string
          current_level?: number
          exercise_time_seconds?: number
          id?: string
          last_advice_generated_at?: string | null
          lesson_id?: string | null
          periodic_advice?: Json | null
          quiz_time_seconds?: number
          reading_time_seconds?: number
          report_first_shown_at?: string | null
          streak?: number
          total_answers?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_rate?: number
          advice_seen?: boolean
          assessment_data?: Json | null
          chapter_id?: string | null
          correct_answers?: number
          created_at?: string
          current_level?: number
          exercise_time_seconds?: number
          id?: string
          last_advice_generated_at?: string | null
          lesson_id?: string | null
          periodic_advice?: Json | null
          quiz_time_seconds?: number
          reading_time_seconds?: number
          report_first_shown_at?: string | null
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
      teacher_content: {
        Row: {
          chapter_id: string | null
          content_type: string
          created_at: string
          difficulty: number
          filiere: string | null
          id: string
          lesson_id: string | null
          payload: Json
          school_level: Database["public"]["Enums"]["school_level"] | null
          source: string
          teacher_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          chapter_id?: string | null
          content_type: string
          created_at?: string
          difficulty?: number
          filiere?: string | null
          id?: string
          lesson_id?: string | null
          payload?: Json
          school_level?: Database["public"]["Enums"]["school_level"] | null
          source?: string
          teacher_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          chapter_id?: string | null
          content_type?: string
          created_at?: string
          difficulty?: number
          filiere?: string | null
          id?: string
          lesson_id?: string | null
          payload?: Json
          school_level?: Database["public"]["Enums"]["school_level"] | null
          source?: string
          teacher_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_content_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_content_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_content_assignments: {
        Row: {
          assigned_by: string
          class_id: string | null
          content_id: string
          created_at: string
          id: string
          student_id: string | null
        }
        Insert: {
          assigned_by: string
          class_id?: string | null
          content_id: string
          created_at?: string
          id?: string
          student_id?: string | null
        }
        Update: {
          assigned_by?: string
          class_id?: string | null
          content_id?: string
          created_at?: string
          id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_content_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_content_assignments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "teacher_content"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_content_attempts: {
        Row: {
          attempts: number
          completed: boolean
          content_id: string
          created_at: string
          errors: number
          hints_used: number
          id: string
          is_correct: boolean | null
          last_answer: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed?: boolean
          content_id: string
          created_at?: string
          errors?: number
          hints_used?: number
          id?: string
          is_correct?: boolean | null
          last_answer?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed?: boolean
          content_id?: string
          created_at?: string
          errors?: number
          hints_used?: number
          id?: string
          is_correct?: boolean | null
          last_answer?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_content_attempts_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "teacher_content"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_establishments: {
        Row: {
          created_at: string
          establishment_id: string
          id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          establishment_id: string
          id?: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          establishment_id?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_establishments_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_establishments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_parent_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string
          read_at: string | null
          sender_id: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id: string
          read_at?: string | null
          sender_id: string
          student_id: string
          teacher_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string
          read_at?: string | null
          sender_id?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: []
      }
      teacher_student_notes: {
        Row: {
          class_id: string | null
          content: string
          created_at: string
          id: string
          is_private: boolean
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_private?: boolean
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_student_notes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
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
      check_exercise_answer: {
        Args: { _exercise_id: string; _user_answer: string }
        Returns: Json
      }
      check_quiz_answer: {
        Args: { _quiz_id: string; _user_answer: string }
        Returns: Json
      }
      generate_activation_code: { Args: never; Returns: string }
      generate_establishment_code: { Args: never; Returns: string }
      get_establishment_name_by_code: {
        Args: { p_code: string }
        Returns: string
      }
      get_my_primary_establishment: {
        Args: never
        Returns: {
          establishment_id: string
          establishment_name: string
        }[]
      }
      get_my_primary_establishment_name: { Args: never; Returns: string }
      get_student_exercises: {
        Args: { _chapter_id: string; _lesson_id?: string }
        Returns: {
          accepted_answers: Json
          chapter_id: string
          difficulty: number
          expected_answer: string
          hint: string
          id: string
          lesson_id: string
          order_index: number
          solution: string
          statement: string
          title: string
        }[]
      }
      get_student_quizzes: {
        Args: { _chapter_id: string; _lesson_id?: string }
        Returns: {
          chapter_id: string
          correct_answer: string
          difficulty: number
          explanation: string
          hint: string
          id: string
          lesson_id: string
          options: Json
          order_index: number
          question: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_establishment_teacher: {
        Args: { _est_id: string; _teacher_id: string }
        Returns: boolean
      }
      is_parent_of: {
        Args: { _child_id: string; _parent_id: string }
        Returns: boolean
      }
      is_teacher_of: {
        Args: { _student_id: string; _teacher_id: string }
        Returns: boolean
      }
      join_establishment_by_code: {
        Args: { p_code: string }
        Returns: {
          establishment_id: string
          establishment_name: string
        }[]
      }
      log_activity: {
        Args: { _action: string; _details?: Json; _user_id: string }
        Returns: string
      }
      recompute_expired_contracts: { Args: never; Returns: undefined }
      user_has_any_role: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "student"
        | "parent"
        | "admin"
        | "pedago"
        | "teacher"
        | "etablissement"
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
      app_role: [
        "student",
        "parent",
        "admin",
        "pedago",
        "teacher",
        "etablissement",
      ],
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
