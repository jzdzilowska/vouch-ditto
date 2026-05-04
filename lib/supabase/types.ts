// Lightweight types matching the SQL schema in supabase/migrations.
// Generate full types later with `supabase gen types typescript`.

export type ProfileStatus = "draft" | "pending_friends" | "pending_review" | "live" | "paused";

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  age: number | null;
  city: string | null;
  gender: string | null;
  looking_for: string | null;
  invite_slug: string;
  bio: string | null; // approved AI-synthesized blurb
  status: ProfileStatus;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
};

export type FriendSubmission = {
  id: string;
  profile_id: string;
  friend_name: string;
  friend_relationship: string | null;
  q1_three_words: string;
  q2_perfect_date: string;
  q3_secret_strength: string;
  created_at: string;
};

export type ProfileDraft = {
  id: string;
  profile_id: string;
  draft_bio: string;
  source_submission_ids: string[];
  model: string;
  created_at: string;
};

export type Swipe = {
  id: string;
  swiper_id: string;
  swiped_profile_id: string;
  direction: "like" | "pass";
  created_at: string;
};

export type Match = {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
};
