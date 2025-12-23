import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Listing, FilterState, SnapPoint, MapBounds, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Helper function to convert DB row to Listing type
const mapDbRowToListing = (row: any): Listing => ({
  id: row.id,
  status: row.status,
  userId: row.user_id,
  latitude: row.latitude,
  longitude: row.longitude,
  address: row.address,
  city: row.city,
  date: row.date,
  time: row.time,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  tefillinType: row.tefillin_type,
  bagColor: row.bag_color,
  markings: row.markings,
  inscription: row.inscription,
  notes: row.notes,
  images: row.images || [],
  blurImages: row.blur_images,
  isActive: row.is_active,
  isResolved: row.is_resolved,
});

interface AppContextType {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  
  // Listings
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  
  // Filters
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  
  // Map
  mapBounds: MapBounds | null;
  setMapBounds: (bounds: MapBounds | null) => void;
  mapCenter: { lat: number; lng: number };
  setMapCenter: (center: { lat: number; lng: number }) => void;
  
  // Bottom sheet
  snapPoint: SnapPoint;
  setSnapPoint: (snap: SnapPoint) => void;
  
  // UI
  isReporting: boolean;
  setIsReporting: (reporting: boolean) => void;
  reportStatus: 'lost' | 'found' | null;
  setReportStatus: (status: 'lost' | 'found' | null) => void;
  
  // Language
  language: 'he' | 'en';
  setLanguage: (lang: 'he' | 'en') => void;
  direction: 'rtl' | 'ltr';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Sync with Supabase auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          createdAt: session.user.created_at || new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          createdAt: session.user.created_at || new Date().toISOString(),
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listings
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  // Fetch listings from Supabase
  const fetchListings = useCallback(async () => {
    setIsLoadingListings(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching listings:', error);
    } else if (data) {
      setListings(data.map(mapDbRowToListing));
    }
    setIsLoadingListings(false);
  }, []);

  // Load listings on mount
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const addListing = async (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: listing.userId,
        status: listing.status,
        latitude: listing.latitude,
        longitude: listing.longitude,
        address: listing.address,
        city: listing.city,
        date: listing.date,
        time: listing.time || null,
        tefillin_type: listing.tefillinType,
        bag_color: listing.bagColor || null,
        markings: listing.markings || null,
        inscription: listing.inscription || null,
        notes: listing.notes || null,
        images: listing.images,
        blur_images: listing.blurImages,
        is_active: listing.isActive,
        is_resolved: listing.isResolved,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding listing:', error);
      throw error;
    } else if (data) {
      setListings(prev => [mapDbRowToListing(data), ...prev]);
    }
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
    if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.time !== undefined) dbUpdates.time = updates.time;
    if (updates.tefillinType !== undefined) dbUpdates.tefillin_type = updates.tefillinType;
    if (updates.bagColor !== undefined) dbUpdates.bag_color = updates.bagColor;
    if (updates.markings !== undefined) dbUpdates.markings = updates.markings;
    if (updates.inscription !== undefined) dbUpdates.inscription = updates.inscription;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.blurImages !== undefined) dbUpdates.blur_images = updates.blurImages;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.isResolved !== undefined) dbUpdates.is_resolved = updates.isResolved;

    const { error } = await supabase
      .from('listings')
      .update(dbUpdates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating listing:', error);
      throw error;
    } else {
      setListings(prev => prev.map(l => 
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ));
    }
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting listing:', error);
      throw error;
    } else {
      setListings(prev => prev.filter(l => l.id !== id));
    }
  };
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({});
  
  // Map state
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 31.7683, lng: 35.2137 }); // Jerusalem default
  
  // Bottom sheet state
  const [snapPoint, setSnapPoint] = useState<SnapPoint>('peek');
  
  // UI state
  const [isReporting, setIsReporting] = useState(false);
  const [reportStatus, setReportStatus] = useState<'lost' | 'found' | null>(null);
  
  // Language
  const [language, setLanguage] = useState<'he' | 'en'>('he');
  
  const clearFilters = () => setFilters({});
  
  const value: AppContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    listings,
    addListing,
    updateListing,
    deleteListing,
    selectedListing,
    setSelectedListing,
    filters,
    setFilters,
    clearFilters,
    mapBounds,
    setMapBounds,
    mapCenter,
    setMapCenter,
    snapPoint,
    setSnapPoint,
    isReporting,
    setIsReporting,
    reportStatus,
    setReportStatus,
    language,
    setLanguage,
    direction: language === 'he' ? 'rtl' : 'ltr',
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
