export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          avatar_config: Json | null;
          school_id: string | null;
          bio: string | null;
          xp: number;
          coins: number;
          level: number;
          streak: number;
          streak_last_date: string | null;
          lives: number;
          lives_last_refill: string | null;
          theme: string;
          onboarding_completed: boolean;
          interests: string[] | null;
          referral_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          avatar_config?: Json | null;
          school_id?: string | null;
          bio?: string | null;
          xp?: number;
          coins?: number;
          level?: number;
          streak?: number;
          streak_last_date?: string | null;
          lives?: number;
          lives_last_refill?: string | null;
          theme?: string;
          onboarding_completed?: boolean;
          interests?: string[] | null;
          referral_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      schools: {
        Row: {
          id: string;
          official_name: string;
          normalized_name: string;
          country: string;
          city: string;
          institution_type: string;
          website: string | null;
          logo_url: string | null;
          verification_status: "pending" | "verified" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["schools"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["schools"]["Insert"]>;
      };
      school_aliases: {
        Row: { id: string; school_id: string; alias: string; normalized_alias: string };
        Insert: Omit<Database["public"]["Tables"]["school_aliases"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["school_aliases"]["Insert"]>;
      };
      school_submissions: {
        Row: {
          id: string;
          submitted_by: string;
          proposed_name: string;
          normalized_name: string;
          country: string;
          city: string;
          institution_type: string;
          website: string | null;
          status: "pending" | "approved" | "rejected";
          reviewed_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["school_submissions"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["school_submissions"]["Insert"]>;
      };
      school_memberships: {
        Row: { id: string; user_id: string; school_id: string; membership_status: string; joined_at: string };
        Insert: Omit<Database["public"]["Tables"]["school_memberships"]["Row"], "id" | "joined_at"> & { id?: string; joined_at?: string };
        Update: Partial<Database["public"]["Tables"]["school_memberships"]["Insert"]>;
      };
      study_decks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          subject: string | null;
          source_document_id: string | null;
          card_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["study_decks"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["study_decks"]["Insert"]>;
      };
      study_cards: {
        Row: {
          id: string;
          deck_id: string;
          front: string;
          back: string;
          source_reference: string | null;
          difficulty: string;
          next_review_at: string | null;
          review_interval: number;
          ease_factor: number;
          review_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["study_cards"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["study_cards"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          file_type: string;
          storage_path: string;
          file_size: number;
          processing_status: "pending" | "processing" | "completed" | "failed";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      xp_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: string;
          game_type: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["xp_transactions"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["xp_transactions"]["Insert"]>;
      };
      achievements: {
        Row: { id: string; user_id: string; achievement_type: string; unlocked_at: string };
        Insert: Omit<Database["public"]["Tables"]["achievements"]["Row"], "id" | "unlocked_at"> & { id?: string; unlocked_at?: string };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
      };
      friendships: {
        Row: { id: string; requester_id: string; recipient_id: string; status: "pending" | "accepted" | "declined"; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["friendships"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["friendships"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          related_entity_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at" | "is_read"> & { id?: string; created_at?: string; is_read?: boolean };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          referral_code: string;
          status: "pending" | "completed";
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          referral_code: string;
          status?: "pending" | "completed";
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["referrals"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_referral_code: {
        Args: { p_user_id: string; p_username: string | null };
        Returns: string;
      };
      complete_referral: {
        Args: { p_referred_id: string };
        Returns: void;
      };
      award_xp: {
        Args: { p_user_id: string; p_amount: number; p_reason: string; p_game_type?: string | null };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type School = Database["public"]["Tables"]["schools"]["Row"];
export type StudyDeck = Database["public"]["Tables"]["study_decks"]["Row"];
export type StudyCard = Database["public"]["Tables"]["study_cards"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Friendship = Database["public"]["Tables"]["friendships"]["Row"];
