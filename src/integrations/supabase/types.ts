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
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          solution: string
          statement: string
          status: string
          submitted_at: string | null
          submitted_by: string | null
          submitted_by_name: string | null
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
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          solution: string
          statement: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
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
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          solution?: string
          statement?: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
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
          {
            foreignKeyName: "chapter_exercises_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_exercises_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          submitted_by_name: string | null
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
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
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
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
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
          {
            foreignKeyName: "chapter_quizzes_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_quizzes_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          created_at: string
          deletion_reason: string | null
          deletion_requested: boolean
          deletion_requested_at: string | null
          deletion_requested_by: string | null
          deletion_requested_by_name: string | null
          description: string | null
          filiere_id: string | null
          id: string
          order_index: number
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          school_level: Database["public"]["Enums"]["school_level"]
          status: string
          subject: string
          submitted_at: string | null
          submitted_by: string | null
          submitted_by_name: string | null
          title: string
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deletion_reason?: string | null
          deletion_requested?: boolean
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          deletion_requested_by_name?: string | null
          description?: string | null
          filiere_id?: string | null
          id?: string
          order_index?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          school_level: Database["public"]["Enums"]["school_level"]
          status?: string
          subject?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deletion_reason?: string | null
          deletion_requested?: boolean
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          deletion_requested_by_name?: string | null
          description?: string | null
          filiere_id?: string | null
          id?: string
          order_index?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          school_level?: Database["public"]["Enums"]["school_level"]
          status?: string
          subject?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_deletion_requested_by_fkey"
            columns: ["deletion_requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          message: string
          name: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          message: string
          name: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          created_at: string
          failed_emails: string[]
          failure_count: number
          filter_contract_status: string
          filter_roles: string[]
          id: string
          recipient_count: number
          sent_by: string | null
          sent_by_name: string | null
          subject_snapshot: string
          success_count: number
          template_id: string | null
          template_name_snapshot: string
        }
        Insert: {
          created_at?: string
          failed_emails?: string[]
          failure_count?: number
          filter_contract_status?: string
          filter_roles?: string[]
          id?: string
          recipient_count?: number
          sent_by?: string | null
          sent_by_name?: string | null
          subject_snapshot: string
          success_count?: number
          template_id?: string | null
          template_name_snapshot: string
        }
        Update: {
          created_at?: string
          failed_emails?: string[]
          failure_count?: number
          filter_contract_status?: string
          filter_roles?: string[]
          id?: string
          recipient_count?: number
          sent_by?: string | null
          sent_by_name?: string | null
          subject_snapshot?: string
          success_count?: number
          template_id?: string | null
          template_name_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_text: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          id: string
          logo_url: string | null
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body_text: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          logo_url?: string | null
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body_text?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          context: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          stack: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          context: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          stack?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          context?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          stack?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      exam_attempts: {
        Row: {
          created_at: string
          duration_seconds: number
          id: string
          score: number
          student_id: string
          subject_id: string
          total_questions: number
        }
        Insert: {
          created_at?: string
          duration_seconds: number
          id?: string
          score: number
          student_id: string
          subject_id: string
          total_questions: number
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          id?: string
          score?: number
          student_id?: string
          subject_id?: string
          total_questions?: number
        }
        Relationships: []
      }
      exam_versions: {
        Row: {
          content: Json
          created_at: string
          duration_minutes: number | null
          exam_id: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          status: string
          submitted_by: string | null
          submitted_by_name: string | null
          title: string | null
          title_ar: string | null
          version_number: number
        }
        Insert: {
          content?: Json
          created_at?: string
          duration_minutes?: number | null
          exam_id: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          status?: string
          submitted_by?: string | null
          submitted_by_name?: string | null
          title?: string | null
          title_ar?: string | null
          version_number: number
        }
        Update: {
          content?: Json
          created_at?: string
          duration_minutes?: number | null
          exam_id?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          status?: string
          submitted_by?: string | null
          submitted_by_name?: string | null
          title?: string | null
          title_ar?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_versions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_versions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_versions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          chapter_ids: string[] | null
          content: Json
          created_at: string
          created_by: string | null
          deletion_reason: string | null
          deletion_requested: boolean
          deletion_requested_at: string | null
          deletion_requested_by: string | null
          deletion_requested_by_name: string | null
          description: string | null
          duration_minutes: number
          filiere_id: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          school_level: Database["public"]["Enums"]["school_level"]
          source: string
          status: string
          subject: string
          submitted_at: string | null
          submitted_by: string | null
          submitted_by_name: string | null
          title: string
          title_ar: string | null
          trimester: number
          updated_at: string
          version_number: number
        }
        Insert: {
          chapter_ids?: string[] | null
          content?: Json
          created_at?: string
          created_by?: string | null
          deletion_reason?: string | null
          deletion_requested?: boolean
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          deletion_requested_by_name?: string | null
          description?: string | null
          duration_minutes?: number
          filiere_id?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          school_level: Database["public"]["Enums"]["school_level"]
          source?: string
          status?: string
          subject?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
          title: string
          title_ar?: string | null
          trimester: number
          updated_at?: string
          version_number?: number
        }
        Update: {
          chapter_ids?: string[] | null
          content?: Json
          created_at?: string
          created_by?: string | null
          deletion_reason?: string | null
          deletion_requested?: boolean
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          deletion_requested_by_name?: string | null
          description?: string | null
          duration_minutes?: number
          filiere_id?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          school_level?: Database["public"]["Enums"]["school_level"]
          source?: string
          status?: string
          subject?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
          title?: string
          title_ar?: string | null
          trimester?: number
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "exams_deletion_requested_by_fkey"
            columns: ["deletion_requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      lesson_versions: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          created_by_name: string
          id: string
          lesson_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          status: string
          version_number: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name: string
          id?: string
          lesson_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          status?: string
          version_number: number
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string
          id?: string
          lesson_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          status?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_versions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_versions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          chapter_id: string
          content: string | null
          created_at: string
          deletion_reason: string | null
          deletion_requested: boolean
          deletion_requested_at: string | null
          deletion_requested_by: string | null
          deletion_requested_by_name: string | null
          draft_content: string | null
          draft_updated_at: string | null
          id: string
          order_index: number
          pending_version_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          submitted_by_name: string | null
          title: string
          title_ar: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          chapter_id: string
          content?: string | null
          created_at?: string
          deletion_reason?: string | null
          deletion_requested?: boolean
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          deletion_requested_by_name?: string | null
          draft_content?: string | null
          draft_updated_at?: string | null
          id?: string
          order_index?: number
          pending_version_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          chapter_id?: string
          content?: string | null
          created_at?: string
          deletion_reason?: string | null
          deletion_requested?: boolean
          deletion_requested_at?: string | null
          deletion_requested_by?: string | null
          deletion_requested_by_name?: string | null
          draft_content?: string | null
          draft_updated_at?: string | null
          id?: string
          order_index?: number
          pending_version_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
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
          {
            foreignKeyName: "lessons_deletion_requested_by_fkey"
            columns: ["deletion_requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_pending_version_id_fkey"
            columns: ["pending_version_id"]
            isOneToOne: false
            referencedRelation: "lesson_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      parental_consents: {
        Row: {
          child_id: string
          created_at: string
          expires_at: string
          id: string
          parent_email: string
          token: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          expires_at?: string
          id?: string
          parent_email: string
          token: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          parent_email?: string
          token?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parental_consents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      password_change_codes: {
        Row: {
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          expires_at: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_bank_details: {
        Row: {
          account_holder: string | null
          bank_name: string | null
          ccp_key: string | null
          ccp_number: string | null
          id: boolean
          instructions: string | null
          rib: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_holder?: string | null
          bank_name?: string | null
          ccp_key?: string | null
          ccp_number?: string | null
          id?: boolean
          instructions?: string | null
          rib?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_holder?: string | null
          bank_name?: string | null
          ccp_key?: string | null
          ccp_number?: string | null
          id?: boolean
          instructions?: string | null
          rib?: string | null
          updated_at?: string
          updated_by?: string | null
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
      pedago_activity_log: {
        Row: {
          action: string
          chapter_id: string | null
          created_at: string
          entity_id: string | null
          entity_title: string | null
          entity_type: string
          id: string
          school_level: Database["public"]["Enums"]["school_level"] | null
          subject: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          chapter_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_title?: string | null
          entity_type: string
          id?: string
          school_level?: Database["public"]["Enums"]["school_level"] | null
          subject?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          chapter_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_title?: string | null
          entity_type?: string
          id?: string
          school_level?: Database["public"]["Enums"]["school_level"] | null
          subject?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedago_activity_log_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedago_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pedago_subjects: {
        Row: {
          created_at: string
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          subject_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedago_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: true
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedago_subjects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          consent_data_processing_at: string | null
          consent_parental_at: string | null
          consent_terms_privacy_at: string | null
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
          consent_data_processing_at?: string | null
          consent_parental_at?: string | null
          consent_terms_privacy_at?: string | null
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
          consent_data_processing_at?: string | null
          consent_parental_at?: string | null
          consent_terms_privacy_at?: string | null
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
      reclamations: {
        Row: {
          created_at: string
          id: string
          message: string
          resolved_at: string | null
          response: string | null
          status: string
          subject: string
          user_id: string
          user_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          resolved_at?: string | null
          response?: string | null
          status?: string
          subject: string
          user_id: string
          user_role: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          resolved_at?: string | null
          response?: string | null
          status?: string
          subject?: string
          user_id?: string
          user_role?: string
        }
        Relationships: []
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
      subjects: {
        Row: {
          icon: string | null
          id: string
          name: string
          name_ar: string | null
          order_index: number
        }
        Insert: {
          icon?: string | null
          id: string
          name: string
          name_ar?: string | null
          order_index?: number
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          order_index?: number
        }
        Relationships: []
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
          subject: string | null
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
          subject?: string | null
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
          subject?: string | null
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
      teacher_content_reads: {
        Row: {
          content_id: string
          id: string
          seen_at: string
          student_id: string
        }
        Insert: {
          content_id: string
          id?: string
          seen_at?: string
          student_id: string
        }
        Update: {
          content_id?: string
          id?: string
          seen_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_content_reads_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "teacher_content"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_content_sessions: {
        Row: {
          content_type: string
          created_at: string
          id: string
          state: Json
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          id?: string
          state?: Json
          teacher_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          id?: string
          state?: Json
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      admin_approve_payment: {
        Args: { p_payment_id: string }
        Returns: string[]
      }
      admin_content_review_history: {
        Args: never
        Returns: {
          chapter_id: string
          chapter_title: string
          filiere_code: string
          filiere_id: string
          filiere_name: string
          id: string
          item_type: string
          lesson_id: string
          lesson_title: string
          rejection_reason: string
          reviewed_at: string
          reviewed_by_name: string
          school_level: Database["public"]["Enums"]["school_level"]
          status: string
          subject: string
          submitted_by_name: string
          title: string
          trimester: number
        }[]
      }
      admin_get_last_sign_in_times: {
        Args: never
        Returns: {
          last_sign_in_at: string
          user_id: string
        }[]
      }
      admin_grant_subscription_days: {
        Args: { p_days: number; p_user_id: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "student_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_list_notification_candidates: {
        Args: never
        Returns: {
          contract_status: string
          email: string
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      admin_pending_content_items: {
        Args: never
        Returns: {
          chapter_id: string
          chapter_title: string
          deletion_reason: string
          difficulty: number
          filiere_code: string
          filiere_id: string
          filiere_name: string
          id: string
          item_type: string
          lesson_id: string
          lesson_title: string
          school_level: Database["public"]["Enums"]["school_level"]
          subject: string
          submitted_at: string
          submitted_by_name: string
          title: string
          trimester: number
        }[]
      }
      admin_reject_payment: {
        Args: { p_payment_id: string; p_reason?: string }
        Returns: undefined
      }
      approve_chapter_item: {
        Args: { p_item_id: string; p_item_type: string }
        Returns: undefined
      }
      approve_exam: { Args: { p_exam_id: string }; Returns: undefined }
      approve_exam_deletion: { Args: { p_exam_id: string }; Returns: undefined }
      approve_item_deletion: {
        Args: { p_item_id: string; p_item_type: string }
        Returns: undefined
      }
      approve_lesson_version: {
        Args: { p_version_id: string }
        Returns: {
          content: string | null
          created_at: string
          created_by: string | null
          created_by_name: string
          id: string
          lesson_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          status: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "lesson_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      calculate_age: { Args: { p_date_of_birth: string }; Returns: number }
      check_and_log_rate_limit: {
        Args: {
          p_action: string
          p_max_requests: number
          p_user_id: string
          p_window_seconds: number
        }
        Returns: boolean
      }
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
      increment_chat_usage: {
        Args: { p_images?: number; p_messages?: number }
        Returns: {
          id: string
          image_count: number
          message_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "chat_usage"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_establishment_member: {
        Args: { _est_id: string; _user_id: string }
        Returns: boolean
      }
      is_establishment_student: {
        Args: { _est_id: string; _student_id: string }
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
      pause_my_subscription: {
        Args: never
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "student_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      pedago_activity_log_with_status: {
        Args: never
        Returns: {
          action: string
          chapter_id: string
          chapter_title: string
          created_at: string
          entity_id: string
          entity_title: string
          entity_type: string
          id: string
          review_status: string
          school_level: Database["public"]["Enums"]["school_level"]
          subject: string
        }[]
      }
      profile_display_name: { Args: { p_user_id: string }; Returns: string }
      recompute_expired_contracts: { Args: never; Returns: undefined }
      redeem_activation_code: {
        Args: { p_code: string; p_target_user_id?: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "student_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_chapter_item: {
        Args: { p_item_id: string; p_item_type: string; p_reason?: string }
        Returns: undefined
      }
      reject_exam: {
        Args: { p_exam_id: string; p_reason: string }
        Returns: undefined
      }
      reject_exam_deletion: { Args: { p_exam_id: string }; Returns: undefined }
      reject_item_deletion: {
        Args: { p_item_id: string; p_item_type: string }
        Returns: undefined
      }
      reject_lesson_version: {
        Args: { p_reason?: string; p_version_id: string }
        Returns: {
          content: string | null
          created_at: string
          created_by: string | null
          created_by_name: string
          id: string
          lesson_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          status: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "lesson_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      request_exam_deletion: {
        Args: { p_exam_id: string; p_reason?: string }
        Returns: boolean
      }
      request_item_deletion: {
        Args: { p_item_id: string; p_item_type: string; p_reason?: string }
        Returns: boolean
      }
      resume_my_subscription: {
        Args: never
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "student_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_exam_draft: {
        Args: {
          p_chapter_ids: string[]
          p_content: Json
          p_duration_minutes: number
          p_exam_id: string
          p_filiere_id: string
          p_school_level: Database["public"]["Enums"]["school_level"]
          p_source: string
          p_subject: string
          p_title: string
          p_title_ar: string
          p_trimester: number
        }
        Returns: string
      }
      save_lesson_draft: {
        Args: { p_content: string; p_lesson_id: string }
        Returns: {
          chapter_id: string
          content: string | null
          created_at: string
          deletion_reason: string | null
          deletion_requested: boolean
          deletion_requested_at: string | null
          deletion_requested_by: string | null
          deletion_requested_by_name: string | null
          draft_content: string | null
          draft_updated_at: string | null
          id: string
          order_index: number
          pending_version_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          submitted_by_name: string | null
          title: string
          title_ar: string | null
          updated_at: string
          video_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "lessons"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      student_unread_teacher_content: {
        Args: never
        Returns: {
          chapter_id: string
          content_id: string
          content_type: string
          lesson_id: string
          school_level: Database["public"]["Enums"]["school_level"]
          subject: string
        }[]
      }
      submit_chapter_item_for_review: {
        Args: { p_item_id: string; p_item_type: string }
        Returns: undefined
      }
      submit_chapter_items_for_review: {
        Args: {
          p_chapter_id: string
          p_item_type: string
          p_lesson_id?: string
        }
        Returns: number
      }
      submit_exam_for_review: {
        Args: { p_exam_id: string }
        Returns: undefined
      }
      submit_lesson_version: {
        Args: { p_content: string; p_lesson_id: string }
        Returns: {
          content: string | null
          created_at: string
          created_by: string | null
          created_by_name: string
          id: string
          lesson_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          status: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "lesson_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_missing_date_of_birth: {
        Args: { p_consent_parent_email?: string; p_date_of_birth: string }
        Returns: undefined
      }
      trigger_gdpr_cleanup: { Args: never; Returns: undefined }
      trigger_scheduled_parent_reports: { Args: never; Returns: undefined }
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
