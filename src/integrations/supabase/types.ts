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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      intake_responses: {
        Row: {
          ai_analysis: Json | null
          budget_range: string | null
          communication_style_preference: string | null
          created_at: string
          current_situation: string | null
          goals: string | null
          id: string
          personality_profile: Json | null
          preferred_gender: string | null
          preferred_language: string | null
          previous_therapy: boolean | null
          session_format_preference: string | null
          specific_concerns: string[] | null
          therapy_type_preference: string | null
          updated_at: string
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          budget_range?: string | null
          communication_style_preference?: string | null
          created_at?: string
          current_situation?: string | null
          goals?: string | null
          id?: string
          personality_profile?: Json | null
          preferred_gender?: string | null
          preferred_language?: string | null
          previous_therapy?: boolean | null
          session_format_preference?: string | null
          specific_concerns?: string[] | null
          therapy_type_preference?: string | null
          updated_at?: string
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          budget_range?: string | null
          communication_style_preference?: string | null
          created_at?: string
          current_situation?: string | null
          goals?: string | null
          id?: string
          personality_profile?: Json | null
          preferred_gender?: string | null
          preferred_language?: string | null
          previous_therapy?: boolean | null
          session_format_preference?: string | null
          specific_concerns?: string[] | null
          therapy_type_preference?: string | null
          updated_at?: string
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          ai_explanation: string | null
          confidence_level: string
          created_at: string
          id: string
          intake_response_id: string | null
          match_reasons: string[] | null
          match_score: number
          status: string | null
          therapist_id: string
          user_feedback: number | null
          user_id: string
        }
        Insert: {
          ai_explanation?: string | null
          confidence_level: string
          created_at?: string
          id?: string
          intake_response_id?: string | null
          match_reasons?: string[] | null
          match_score: number
          status?: string | null
          therapist_id: string
          user_feedback?: number | null
          user_id: string
        }
        Update: {
          ai_explanation?: string | null
          confidence_level?: string
          created_at?: string
          id?: string
          intake_response_id?: string | null
          match_reasons?: string[] | null
          match_score?: number
          status?: string | null
          therapist_id?: string
          user_feedback?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_intake_response_id_fkey"
            columns: ["intake_response_id"]
            isOneToOne: false
            referencedRelation: "intake_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          communication_style_preference: string | null
          counselor_type_preference: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          gender_preference: string | null
          id: string
          last_name: string | null
          phone: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          communication_style_preference?: string | null
          counselor_type_preference?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          gender_preference?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          communication_style_preference?: string | null
          counselor_type_preference?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          gender_preference?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      therapists: {
        Row: {
          approach_style: string | null
          availability_status: string | null
          bio: string | null
          communication_style: string | null
          created_at: string
          gender: string | null
          hourly_rate: number | null
          id: string
          in_person_sessions: boolean | null
          languages: string[] | null
          license_number: string | null
          location: string | null
          match_personality_score: Json | null
          name: string
          online_sessions: boolean | null
          profile_image_url: string | null
          rating: number | null
          specializations: string[] | null
          therapy_types: string[] | null
          title: string
          total_sessions: number | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          approach_style?: string | null
          availability_status?: string | null
          bio?: string | null
          communication_style?: string | null
          created_at?: string
          gender?: string | null
          hourly_rate?: number | null
          id?: string
          in_person_sessions?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          location?: string | null
          match_personality_score?: Json | null
          name: string
          online_sessions?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          therapy_types?: string[] | null
          title: string
          total_sessions?: number | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          approach_style?: string | null
          availability_status?: string | null
          bio?: string | null
          communication_style?: string | null
          created_at?: string
          gender?: string | null
          hourly_rate?: number | null
          id?: string
          in_person_sessions?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          location?: string | null
          match_personality_score?: Json | null
          name?: string
          online_sessions?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          therapy_types?: string[] | null
          title?: string
          total_sessions?: number | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
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
