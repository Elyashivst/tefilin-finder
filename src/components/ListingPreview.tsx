import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Info, Eye, MessageCircle, ChevronLeft } from 'lucide-react';
import { Listing } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

interface ListingPreviewProps {
  listing: Listing;
  onClose: () => void;
}

export function ListingPreview({ listing, onClose }: ListingPreviewProps) {
  const { language } = useApp();
  
  const statusText = listing.status === 'lost' 
    ? (language === 'he' ? 'תפילין שאבדו' : 'Lost Tefillin')
    : (language === 'he' ? 'תפילין שנמצאו' : 'Found Tefillin');
  
  const typeText = {
    yad: language === 'he' ? 'של יד' : 'Yad',
    rosh: language === 'he' ? 'של ראש' : 'Rosh',
    set: language === 'he' ? 'סט מלא' : 'Full Set',
  }[listing.tefillinType];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-4 pb-8 overflow-auto max-h-[calc(100vh-120px)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <span className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${listing.status === 'lost' ? 'status-lost' : 'status-found'}
        `}>
          {statusText}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Image placeholder */}
      {listing.images.length > 0 ? (
        <div className="relative mb-4">
          <div className="aspect-video rounded-xl bg-muted overflow-hidden">
            <div className={`w-full h-full bg-muted ${listing.blurImages ? 'blur-tefillin' : ''}`} />
          </div>
          {listing.blurImages && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="secondary" size="sm" className="gap-2 shadow-lg">
                <Eye className="h-4 w-4" />
                {language === 'he' ? 'בקש חשיפת תמונה' : 'Request Image'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={`
          aspect-video rounded-xl mb-4 flex items-center justify-center
          ${listing.status === 'lost' ? 'bg-status-lost/10' : 'bg-status-found/10'}
        `}>
          <span className={`
            text-6xl opacity-50
            ${listing.status === 'lost' ? 'text-status-lost' : 'text-status-found'}
          `}>
            {listing.status === 'lost' ? '?' : '✓'}
          </span>
        </div>
      )}
      
      {/* Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-foreground">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{listing.city}{listing.address ? ` - ${listing.address}` : ''}</span>
        </div>
        
        <div className="flex items-center gap-2 text-foreground">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(listing.date)}</span>
          {listing.time && <span className="text-muted-foreground">({listing.time})</span>}
        </div>
        
        <div className="flex items-center gap-2 text-foreground">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span>{typeText}</span>
          {listing.bagColor && (
            <>
              <span className="text-muted-foreground">•</span>
              <span>{language === 'he' ? 'תיק' : 'Bag'}: {listing.bagColor}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Additional details */}
      {(listing.markings || listing.inscription || listing.notes) && (
        <div className="bg-muted rounded-xl p-3 mb-6 space-y-2">
          {listing.markings && (
            <p className="text-sm">
              <span className="text-muted-foreground">{language === 'he' ? 'סימנים: ' : 'Markings: '}</span>
              {listing.markings}
            </p>
          )}
          {listing.inscription && (
            <p className="text-sm">
              <span className="text-muted-foreground">{language === 'he' ? 'כיתוב: ' : 'Inscription: '}</span>
              {listing.inscription}
            </p>
          )}
          {listing.notes && (
            <p className="text-sm">
              <span className="text-muted-foreground">{language === 'he' ? 'הערות: ' : 'Notes: '}</span>
              {listing.notes}
            </p>
          )}
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex gap-3">
        <Button 
          className="flex-1 gap-2 bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
        >
          <MessageCircle className="h-4 w-4" />
          {listing.status === 'lost' 
            ? (language === 'he' ? 'יש לי מידע' : 'I Have Info')
            : (language === 'he' ? 'זה שלי!' : 'This is Mine!')
          }
        </Button>
        
        {listing.status === 'found' && (
          <Button variant="outline" className="flex-1">
            {language === 'he' ? 'אני חושב שזה שלי' : 'I Think It\'s Mine'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
