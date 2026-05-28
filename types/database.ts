export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string;
          role: string;
          banned_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string;
          role?: string;
          banned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string;
          role?: string;
          banned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      onboarding_answers: {
        Row: {
          id: string;
          user_id: string;
          emotions: string[];
          support_type: string | null;
          therapist_gender_preference: string | null;
          preferred_languages: string[];
          availability_preferences: string[];
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          emotions?: string[];
          support_type?: string | null;
          therapist_gender_preference?: string | null;
          preferred_languages?: string[];
          availability_preferences?: string[];
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          emotions?: string[];
          support_type?: string | null;
          therapist_gender_preference?: string | null;
          preferred_languages?: string[];
          availability_preferences?: string[];
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      session_reschedule_requests: {
        Row: {
          id: string;
          session_id: string;
          proposed_by: string;
          proposed_availability_id: string;
          status: string;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          proposed_by: string;
          proposed_availability_id: string;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          proposed_by?: string;
          proposed_availability_id?: string;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "session_reschedule_requests_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "booked_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_reschedule_requests_proposed_availability_id_fkey";
            columns: ["proposed_availability_id"];
            isOneToOne: false;
            referencedRelation: "therapist_availability";
            referencedColumns: ["id"];
          },
        ];
      };
      therapist_availability: {
        Row: {
          id: string;
          profile_id: string;
          starts_at: string;
          ends_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          starts_at: string;
          ends_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          starts_at?: string;
          ends_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "therapist_availability_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "therapist_profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      booked_session_notebook_pages: {
        Row: {
          id: string;
          session_id: string;
          sort_order: number;
          title: string;
          body: string;
          therapist_can_view: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          sort_order: number;
          title?: string;
          body?: string;
          therapist_can_view?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          sort_order?: number;
          title?: string;
          body?: string;
          therapist_can_view?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booked_session_notebook_pages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "booked_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      session_reflections: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          mood: number;
          note: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          mood: number;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          mood?: number;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_reflections_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "booked_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_reflections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_journal_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          title: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date: string;
          title?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_date?: string;
          title?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_journal_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_notes: {
        Row: {
          id: string;
          user_id: string;
          note_date: string;
          title: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          note_date?: string;
          title?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          note_date?: string;
          title?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      booked_session_therapist_private_notes: {
        Row: {
          session_id: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          session_id?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booked_session_therapist_private_notes_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: true;
            referencedRelation: "booked_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      booked_sessions: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string;
          availability_id: string;
          starts_at: string;
          ends_at: string;
          status: string;
          payment_status: string;
          notes: string | null;
          video_call_extended_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id: string;
          availability_id: string;
          starts_at: string;
          ends_at: string;
          status?: string;
          payment_status?: string;
          notes?: string | null;
          video_call_extended_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string;
          availability_id?: string;
          starts_at?: string;
          ends_at?: string;
          status?: string;
          payment_status?: string;
          notes?: string | null;
          video_call_extended_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booked_sessions_availability_id_fkey";
            columns: ["availability_id"];
            isOneToOne: false;
            referencedRelation: "therapist_availability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booked_sessions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "therapist_profiles";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "booked_sessions_user_id_profiles_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      therapist_profiles: {
        Row: {
          profile_id: string;
          user_id: string | null;
          full_name: string;
          professional_title: string | null;
          avatar_url: string | null;
          gender: string;
          specialization: string[];
          languages: string[];
          availability: string[];
          bio: string;
          rating: number;
          years_of_experience: number;
          session_duration_minutes: number;
          session_fee_try: number;
          verified: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id?: string;
          user_id?: string | null;
          full_name: string;
          professional_title?: string | null;
          avatar_url?: string | null;
          gender: string;
          specialization?: string[];
          languages?: string[];
          availability?: string[];
          bio?: string;
          rating?: number;
          years_of_experience?: number;
          session_duration_minutes?: number;
          session_fee_try?: number;
          verified?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          user_id?: string | null;
          full_name?: string;
          professional_title?: string | null;
          avatar_url?: string | null;
          gender?: string;
          specialization?: string[];
          languages?: string[];
          availability?: string[];
          bio?: string;
          rating?: number;
          years_of_experience?: number;
          session_duration_minutes?: number;
          session_fee_try?: number;
          verified?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guide_articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          cover_image_url: string | null;
          category: string;
          tags: string[];
          body: string;
          translations: Record<string, unknown>;
          status: string;
          is_featured: boolean;
          published_at: string | null;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string;
          cover_image_url?: string | null;
          category?: string;
          tags?: string[];
          body?: string;
          translations?: Record<string, unknown>;
          status?: string;
          is_featured?: boolean;
          published_at?: string | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          cover_image_url?: string | null;
          category?: string;
          tags?: string[];
          body?: string;
          translations?: Record<string, unknown>;
          status?: string;
          is_featured?: boolean;
          published_at?: string | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      therapist_video_invites: {
        Row: {
          id: string;
          profile_id: string;
          session_id: string | null;
          invited_user_id: string | null;
          created_by: string;
          token: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          session_id?: string | null;
          invited_user_id?: string | null;
          created_by: string;
          token: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          session_id?: string | null;
          invited_user_id?: string | null;
          created_by?: string;
          token?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { check_uid: string };
        Returns: boolean;
      };
      resolve_session_reschedule_request: {
        Args: { p_request_id: string; p_accept: boolean };
        Returns: Json;
      };
      extend_booked_session_video: {
        Args: { p_session_id: string; p_minutes: number };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type OnboardingAnswersRow = Database["public"]["Tables"]["onboarding_answers"]["Row"];
export type OnboardingAnswersInsert = Database["public"]["Tables"]["onboarding_answers"]["Insert"];
export type TherapistProfileRow = Database["public"]["Tables"]["therapist_profiles"]["Row"];
export type TherapistAvailabilityRow = Database["public"]["Tables"]["therapist_availability"]["Row"];
export type BookedSessionRow = Database["public"]["Tables"]["booked_sessions"]["Row"];
