import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListingCard } from '@/components/ListingCard';
import { ListingPreview } from '@/components/ListingPreview';
import { Filters } from '@/components/Filters';
import { ReportWizard } from '@/components/ReportWizard';
import { 
  AlertCircle, 
  CheckCircle, 
  Search, 
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Listing } from '@/types';

export function DesktopSidebar() {
  const { 
    language, 
    listings, 
    selectedListing, 
    setSelectedListing,
    isReporting,
    setIsReporting,
    setReportStatus,
  } = useApp();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleStartReport = (status: 'lost' | 'found') => {
    setReportStatus(status);
    setIsReporting(true);
  };
  
  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
  };
  
  const filteredListings = listings.filter((listing) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.city?.toLowerCase().includes(query) ||
      listing.address?.toLowerCase().includes(query) ||
      listing.bagColor?.toLowerCase().includes(query)
    );
  });
  
  if (isCollapsed) {
    return (
      <motion.div 
        initial={{ width: 400 }}
        animate={{ width: 56 }}
        className="relative h-full bg-card border-l border-border flex flex-col items-center py-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col gap-2">
          <Button
            size="icon"
            className="h-10 w-10 bg-status-lost hover:bg-status-lost/90"
            onClick={() => {
              setIsCollapsed(false);
              handleStartReport('lost');
            }}
          >
            <AlertCircle className="h-5 w-5" />
          </Button>
          
          <Button
            size="icon"
            className="h-10 w-10 bg-status-found hover:bg-status-found/90"
            onClick={() => {
              setIsCollapsed(false);
              handleStartReport('found');
            }}
          >
            <CheckCircle className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial={{ width: 56 }}
      animate={{ width: 400 }}
      className="relative h-full bg-card border-l border-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-bold text-lg">
          {language === 'he' ? 'מודעות תפילין' : 'Tefillin Listings'}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Report Wizard Mode */}
      <AnimatePresence mode="wait">
        {isReporting && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="flex-1 overflow-hidden"
          >
            <ReportWizard 
              onClose={() => {
                setIsReporting(false);
                setReportStatus(null);
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Listing Preview Mode */}
      <AnimatePresence mode="wait">
        {!isReporting && selectedListing && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="flex-1 overflow-hidden"
          >
            <ListingPreview 
              listing={selectedListing} 
              onClose={() => setSelectedListing(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Default State - Actions + Listings */}
      {!isReporting && !selectedListing && (
        <>
          {/* Action Buttons */}
          <div className="p-4 space-y-3 border-b border-border">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleStartReport('lost')}
                className="h-12 text-sm gap-2 bg-status-lost hover:bg-status-lost/90"
              >
                <AlertCircle className="h-4 w-4" />
                {language === 'he' ? 'איבדתי תפילין' : 'I Lost Tefillin'}
              </Button>
              
              <Button
                onClick={() => handleStartReport('found')}
                className="h-12 text-sm gap-2 bg-status-found hover:bg-status-found/90"
              >
                <CheckCircle className="h-4 w-4" />
                {language === 'he' ? 'מצאתי תפילין' : 'I Found Tefillin'}
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={language === 'he' ? 'חיפוש מהיר...' : 'Quick search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-muted border-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Toggle Filters */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full gap-2"
            >
              <Search className="h-4 w-4" />
              {language === 'he' ? 'חיפוש מתקדם' : 'Advanced Search'}
            </Button>
          </div>
          
          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-border"
              >
                <Filters onClose={() => setShowFilters(false)} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Listings */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-border">
              <h3 className="font-medium text-sm">
                {language === 'he' ? 'מודעות באזור' : 'Listings in Area'}
              </h3>
              <span className="text-xs text-muted-foreground">
                {filteredListings.length} {language === 'he' ? 'תוצאות' : 'results'}
              </span>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {filteredListings.map((listing) => (
                  <ListingCard 
                    key={listing.id}
                    listing={listing}
                    onClick={() => handleListingClick(listing)}
                    isSelected={selectedListing?.id === listing.id}
                  />
                ))}
                
                {filteredListings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      {language === 'he' ? 'לא נמצאו מודעות' : 'No listings found'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </motion.div>
  );
}
