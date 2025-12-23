import { motion } from 'framer-motion';
import { MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import { Listing } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
  isSelected?: boolean;
}

export function ListingCard({ listing, onClick, isSelected }: ListingCardProps) {
  const { language } = useApp();
  
  const statusText = listing.status === 'lost' 
    ? (language === 'he' ? 'אבד' : 'Lost')
    : (language === 'he' ? 'נמצא' : 'Found');
  
  const typeText = {
    yad: language === 'he' ? 'של יד' : 'Yad',
    rosh: language === 'he' ? 'של ראש' : 'Rosh',
    set: language === 'he' ? 'סט מלא' : 'Full Set',
  }[listing.tefillinType];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };
  
  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full text-right p-3 rounded-xl
        transition-all duration-200
        ${isSelected 
          ? 'bg-primary/10 border-2 border-primary shadow-gold' 
          : 'bg-card border border-border hover:border-primary/30 hover:shadow-md'
        }
      `}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
    >
      <div className="flex gap-3">
        {/* Thumbnail placeholder */}
        <div className={`
          w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0
          ${listing.images.length > 0 
            ? 'bg-muted' 
            : listing.status === 'lost' 
              ? 'bg-status-lost/10' 
              : 'bg-status-found/10'
          }
        `}>
          {listing.images.length > 0 ? (
            <div className="w-full h-full rounded-lg bg-muted blur-tefillin" />
          ) : (
            <span className={`
              text-2xl
              ${listing.status === 'lost' ? 'text-status-lost' : 'text-status-found'}
            `}>
              {listing.status === 'lost' ? '?' : '✓'}
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            {/* Status badge */}
            <span className={`
              inline-flex px-2 py-0.5 rounded-full text-xs font-medium
              ${listing.status === 'lost' ? 'status-lost' : 'status-found'}
            `}>
              {statusText}
            </span>
            
            {/* Type */}
            <span className="text-xs text-muted-foreground">
              {typeText}
            </span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1 mt-1.5 text-sm text-foreground">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{listing.city || listing.address}</span>
          </div>
          
          {/* Date and indicators */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(listing.date)}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {listing.images.length > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <ImageIcon className="h-3 w-3" />
                  {listing.images.length}
                </span>
              )}
              {listing.bagColor && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {listing.bagColor}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
