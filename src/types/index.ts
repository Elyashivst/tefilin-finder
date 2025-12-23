// Data models for the Tefillin finder app

export type ListingStatus = 'lost' | 'found';

export type TefillinType = 'yad' | 'rosh' | 'set';

export interface Listing {
  id: string;
  status: ListingStatus;
  userId: string;
  
  // Location
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  
  // Date/Time
  date: string; // ISO date
  time?: string;
  createdAt: string;
  updatedAt: string;
  
  // Details
  tefillinType: TefillinType;
  bagColor?: string;
  markings?: string;
  inscription?: string;
  notes?: string;
  
  // Images (URLs)
  images: string[];
  blurImages: boolean;
  
  // Status
  isActive: boolean;
  isResolved: boolean;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  displayName?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface ImageRevealRequest {
  id: string;
  listingId: string;
  requesterId: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'match' | 'message' | 'reveal_request' | 'reveal_approved';
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FilterState {
  status?: ListingStatus;
  radius?: number; // in km
  dateFrom?: string;
  dateTo?: string;
  city?: string;
  query?: string;
  bagColor?: string;
  tefillinType?: TefillinType;
  hasImages?: boolean;
}

// Bottom sheet snap points
export type SnapPoint = 'peek' | 'half' | 'full';

// Report wizard steps
export type ReportStep = 'status' | 'location' | 'details' | 'publish';
