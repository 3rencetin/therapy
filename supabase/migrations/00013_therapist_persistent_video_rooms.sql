-- Kalıcı terapist görüşme odaları + davet linkleri

CREATE TABLE IF NOT EXISTS public.therapist_video_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.therapist_profiles (profile_id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.booked_sessions (id) ON DELETE SET NULL,
  invited_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS therapist_video_invites_token_idx ON public.therapist_video_invites (token);
CREATE INDEX IF NOT EXISTS therapist_video_invites_profile_idx ON public.therapist_video_invites (profile_id);

ALTER TABLE public.therapist_video_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY therapist_video_invites_staff_all ON public.therapist_video_invites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.therapist_profiles tp
      WHERE tp.profile_id = therapist_video_invites.profile_id
        AND tp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.therapist_profiles tp
      WHERE tp.profile_id = therapist_video_invites.profile_id
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY therapist_video_invites_admin_select ON public.therapist_video_invites
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY therapist_video_invites_invitee_select ON public.therapist_video_invites
  FOR SELECT
  USING (invited_user_id = auth.uid());
