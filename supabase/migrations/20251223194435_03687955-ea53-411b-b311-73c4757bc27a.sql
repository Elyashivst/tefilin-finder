-- Create claims table for users to claim found tefillin or provide info
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  claimant_user_id UUID NOT NULL,
  claimant_name TEXT NOT NULL,
  claimant_phone TEXT NOT NULL,
  claimant_note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Claimants can create claims
CREATE POLICY "Users can create claims"
ON public.claims
FOR INSERT
WITH CHECK (auth.uid() = claimant_user_id);

-- Claimants can view their own claims
CREATE POLICY "Users can view their own claims"
ON public.claims
FOR SELECT
USING (auth.uid() = claimant_user_id);

-- Listing owners can view claims on their listings
CREATE POLICY "Listing owners can view claims on their listings"
ON public.claims
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings 
    WHERE listings.id = claims.listing_id 
    AND listings.user_id = auth.uid()
  )
);

-- Listing owners can update claims on their listings (mark as read)
CREATE POLICY "Listing owners can update claims on their listings"
ON public.claims
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.listings 
    WHERE listings.id = claims.listing_id 
    AND listings.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_claims_updated_at
BEFORE UPDATE ON public.claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for claims
ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;