import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          answer: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          answer: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question?: string;
          answer?: string;
          created_at?: string;
        };
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          quiz_topic: string;
          score: number;
          total_questions: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_topic: string;
          score: number;
          total_questions: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_topic?: string;
          score?: number;
          total_questions?: number;
          created_at?: string;
        };
      };
      game_scores: {
        Row: {
          id: string;
          user_id: string;
          game_name: string;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_name: string;
          score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_name?: string;
          score?: number;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          accessibility_mode: string;
          font_preference: string;
          voice_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          accessibility_mode?: string;
          font_preference?: string;
          voice_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          accessibility_mode?: string;
          font_preference?: string;
          voice_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      health_forms: {
        Row: {
          id: string;
          user_id: string;
          symptoms: string;
          severity: string;
          duration: string;
          additional_notes: string;
          ai_response: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symptoms: string;
          severity: string;
          duration: string;
          additional_notes?: string;
          ai_response: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symptoms?: string;
          severity?: string;
          duration?: string;
          additional_notes?: string;
          ai_response?: string;
          created_at?: string;
        };
      };
      mood_checkins: {
        Row: {
          id: string;
          user_id: string;
          mood: string;
          notes: string;
          ai_response: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: string;
          notes?: string;
          ai_response: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood?: string;
          notes?: string;
          ai_response?: string;
          created_at?: string;
        };
      };
    };
  };
};