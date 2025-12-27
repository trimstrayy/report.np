-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  location TEXT,
  photo_url TEXT,
  severity TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table (one vote per user per complaint)
CREATE TABLE public.complaint_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(complaint_id, user_id) -- One vote per user per complaint
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_votes ENABLE ROW LEVEL SECURITY;

-- Complaints policies
CREATE POLICY "Anyone can view complaints"
  ON public.complaints FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints"
  ON public.complaints FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own complaints"
  ON public.complaints FOR DELETE
  USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Anyone can view votes"
  ON public.complaint_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.complaint_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their own votes"
  ON public.complaint_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
  ON public.complaint_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to award points when complaint is created
CREATE OR REPLACE FUNCTION public.award_points_on_complaint()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET points = COALESCE(points, 0) + 10
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to award 10 points when user creates a complaint
CREATE TRIGGER on_complaint_created
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_on_complaint();

-- Function to award points on upvote
CREATE OR REPLACE FUNCTION public.handle_vote_points()
RETURNS TRIGGER AS $$
DECLARE
  complaint_owner_id UUID;
BEGIN
  -- Get the complaint owner
  SELECT user_id INTO complaint_owner_id FROM public.complaints WHERE id = NEW.complaint_id;
  
  -- Award 3 points to complaint owner on upvote (not for self-votes)
  IF NEW.vote_type = 'upvote' AND complaint_owner_id != NEW.user_id THEN
    UPDATE public.profiles
    SET points = COALESCE(points, 0) + 3
    WHERE id = complaint_owner_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to remove points when upvote is removed or changed
CREATE OR REPLACE FUNCTION public.handle_vote_removal()
RETURNS TRIGGER AS $$
DECLARE
  complaint_owner_id UUID;
BEGIN
  -- Get the complaint owner
  SELECT user_id INTO complaint_owner_id FROM public.complaints WHERE id = OLD.complaint_id;
  
  -- Remove 3 points from complaint owner if upvote is removed (not for self-votes)
  IF OLD.vote_type = 'upvote' AND complaint_owner_id != OLD.user_id THEN
    UPDATE public.profiles
    SET points = GREATEST(COALESCE(points, 0) - 3, 0)
    WHERE id = complaint_owner_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for vote point handling
CREATE TRIGGER on_vote_created
  AFTER INSERT ON public.complaint_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vote_points();

CREATE TRIGGER on_vote_deleted
  BEFORE DELETE ON public.complaint_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vote_removal();

-- Handle vote changes (e.g., upvote to downvote)
CREATE OR REPLACE FUNCTION public.handle_vote_change()
RETURNS TRIGGER AS $$
DECLARE
  complaint_owner_id UUID;
BEGIN
  SELECT user_id INTO complaint_owner_id FROM public.complaints WHERE id = NEW.complaint_id;
  
  -- If changed from upvote to downvote, remove points
  IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' AND complaint_owner_id != NEW.user_id THEN
    UPDATE public.profiles
    SET points = GREATEST(COALESCE(points, 0) - 3, 0)
    WHERE id = complaint_owner_id;
  -- If changed from downvote to upvote, add points
  ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' AND complaint_owner_id != NEW.user_id THEN
    UPDATE public.profiles
    SET points = COALESCE(points, 0) + 3
    WHERE id = complaint_owner_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_vote_updated
  AFTER UPDATE ON public.complaint_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vote_change();

-- Trigger for updating complaints timestamp
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();