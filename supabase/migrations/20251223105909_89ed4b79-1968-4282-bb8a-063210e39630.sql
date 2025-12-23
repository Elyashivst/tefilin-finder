-- Create listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('lost', 'found')),
  
  -- Location
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  city TEXT,
  
  -- Date/Time
  date DATE NOT NULL,
  time TIME,
  
  -- Details
  tefillin_type TEXT NOT NULL DEFAULT 'set' CHECK (tefillin_type IN ('yad', 'rosh', 'set')),
  bag_color TEXT,
  markings TEXT,
  inscription TEXT,
  notes TEXT,
  
  -- Images
  images TEXT[] DEFAULT '{}',
  blur_images BOOLEAN NOT NULL DEFAULT true,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Anyone can view active listings (public read)
CREATE POLICY "Anyone can view active listings" 
ON public.listings 
FOR SELECT 
USING (is_active = true);

-- Users can view their own listings (including inactive)
CREATE POLICY "Users can view their own listings" 
ON public.listings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own listings
CREATE POLICY "Users can create their own listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update their own listings" 
ON public.listings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings" 
ON public.listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_is_active ON public.listings(is_active);
CREATE INDEX idx_listings_location ON public.listings(latitude, longitude);
CREATE INDEX idx_listings_city ON public.listings(city);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);