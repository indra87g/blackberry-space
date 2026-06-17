import type { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/** A snippet row with its author profile embedded (PostgREST `profiles(...)`). */
export type SnippetWithProfile = {
  id: string;
  title: string;
  description: string | null;
  language: string;
  code: string;
  tags: string[] | null;
  credits?: string | null;
  created_at: string | null;
  user_id: string | null;
  likes_count: number;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
};
