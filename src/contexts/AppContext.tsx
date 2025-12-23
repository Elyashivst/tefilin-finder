import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Listing, FilterState, SnapPoint, MapBounds, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Mock data for demonstration
const mockListings: Listing[] = [
  {
    id: '1',
    status: 'lost',
    userId: 'user1',
    latitude: 31.7683,
    longitude: 35.2137,
    address: 'רחוב יפו 100',
    city: 'ירושלים',
    date: '2024-01-15',
    time: '14:30',
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    tefillinType: 'set',
    bagColor: 'שחור',
    markings: 'רצועות חדשות',
    inscription: 'יוסף בן דוד',
    notes: 'נשכחו באוטובוס קו 1',
    images: [],
    blurImages: true,
    isActive: true,
    isResolved: false,
  },
  {
    id: '2',
    status: 'found',
    userId: 'user2',
    latitude: 32.0853,
    longitude: 34.7818,
    address: 'רחוב דיזנגוף 50',
    city: 'תל אביב',
    date: '2024-01-14',
    time: '09:00',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
    tefillinType: 'yad',
    bagColor: 'כחול',
    notes: 'נמצאו על ספסל בפארק',
    images: [],
    blurImages: true,
    isActive: true,
    isResolved: false,
  },
  {
    id: '3',
    status: 'lost',
    userId: 'user3',
    latitude: 32.7940,
    longitude: 34.9896,
    address: 'רחוב הנמל',
    city: 'חיפה',
    date: '2024-01-13',
    createdAt: '2024-01-13T11:00:00Z',
    updatedAt: '2024-01-13T11:00:00Z',
    tefillinType: 'set',
    bagColor: 'חום',
    inscription: 'מ.כ.',
    images: [],
    blurImages: false,
    isActive: true,
    isResolved: false,
  },
  {
    id: '4',
    status: 'found',
    userId: 'user4',
    latitude: 31.2530,
    longitude: 34.7915,
    address: 'שדרות רגר',
    city: 'באר שבע',
    date: '2024-01-12',
    createdAt: '2024-01-12T16:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    tefillinType: 'rosh',
    bagColor: 'שחור',
    notes: 'נמצאו ליד בית הכנסת',
    images: [],
    blurImages: true,
    isActive: true,
    isResolved: false,
  },
  {
    id: '5',
    status: 'lost',
    userId: 'user5',
    latitude: 31.8928,
    longitude: 34.8113,
    address: 'רחוב הרצל',
    city: 'רחובות',
    date: '2024-01-11',
    createdAt: '2024-01-11T08:00:00Z',
    updatedAt: '2024-01-11T08:00:00Z',
    tefillinType: 'set',
    bagColor: 'בורדו',
    markings: 'תיק עור איכותי',
    images: [],
    blurImages: true,
    isActive: true,
    isResolved: false,
  },
];

interface AppContextType {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  
  // Listings
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
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
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const addListing = (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newListing: Listing = {
      ...listing,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setListings(prev => [newListing, ...prev]);
  };

  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings(prev => prev.map(l => 
      l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
    ));
  };

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
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
