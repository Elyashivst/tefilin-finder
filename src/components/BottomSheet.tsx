import { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { SnapPoint, Listing } from '@/types';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/ListingCard';
import { ListingPreview } from '@/components/ListingPreview';
import { Filters } from '@/components/Filters';
import { ReportWizard } from '@/components/ReportWizard';
import { AlertCircle, Search, CheckCircle } from 'lucide-react';

// Snap point heights (from bottom) - calculate safely
const getSnapHeights = () => {
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  return {
    peek: 180,
    half: windowHeight * 0.5,
    full: windowHeight - 60,
  };
};

const SNAP_HEIGHTS = getSnapHeights();

export function BottomSheet() {
  const { 
    language, 
    snapPoint, 
    setSnapPoint, 
    listings, 
    selectedListing, 
    setSelectedListing,
    isReporting,
    setIsReporting,
    setReportStatus,
  } = useApp();
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const [sheetHeight, setSheetHeight] = useState(SNAP_HEIGHTS.peek);
  
  // Update height on snap point change
  useEffect(() => {
    const targetHeight = SNAP_HEIGHTS[snapPoint];
    setSheetHeight(targetHeight);
    animate(y, -(targetHeight - SNAP_HEIGHTS.peek), {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    });
  }, [snapPoint]);
  
  // Handle drag end
  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentY = y.get();
    
    // Determine closest snap point based on position and velocity
    let newSnap: SnapPoint = 'peek';
    
    const peekY = 0;
    const halfY = -(SNAP_HEIGHTS.half - SNAP_HEIGHTS.peek);
    const fullY = -(SNAP_HEIGHTS.full - SNAP_HEIGHTS.peek);
    
    if (velocity < -500) {
      // Fast swipe up
      if (snapPoint === 'peek') newSnap = 'half';
      else newSnap = 'full';
    } else if (velocity > 500) {
      // Fast swipe down
      if (snapPoint === 'full') newSnap = 'half';
      else newSnap = 'peek';
    } else {
      // Snap to closest
      const distances = [
        { snap: 'peek' as SnapPoint, dist: Math.abs(currentY - peekY) },
        { snap: 'half' as SnapPoint, dist: Math.abs(currentY - halfY) },
        { snap: 'full' as SnapPoint, dist: Math.abs(currentY - fullY) },
      ];
      newSnap = distances.sort((a, b) => a.dist - b.dist)[0].snap;
    }
    
    setSnapPoint(newSnap);
  };
  
  // Handle starting a report
  const handleStartReport = (status: 'lost' | 'found') => {
    setReportStatus(status);
    setIsReporting(true);
    setSnapPoint('full');
  };
  
  // Handle listing selection
  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setSnapPoint('half');
  };
  
  // Render content based on state
  const renderContent = () => {
    // Report wizard takes full sheet
    if (isReporting) {
      return (
        <ReportWizard 
          onClose={() => {
            setIsReporting(false);
            setReportStatus(null);
            setSnapPoint('peek');
          }} 
        />
      );
    }
    
    // Preview mode when listing is selected - expand sheet automatically
    if (selectedListing) {
      return (
        <ListingPreview 
          listing={selectedListing} 
          onClose={() => {
            setSelectedListing(null);
            setSnapPoint('peek');
          }}
        />
      );
    }
    
    // Default content based on snap point
    return (
      <>
        {/* Peek state - Action buttons */}
        {snapPoint === 'peek' && !selectedListing && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleStartReport('lost')}
                className="h-14 text-base gap-2 bg-status-lost hover:bg-status-lost/90"
              >
                <AlertCircle className="h-5 w-5" />
                {language === 'he' ? 'איבדתי תפילין' : 'I Lost Tefillin'}
              </Button>
              
              <Button
                onClick={() => handleStartReport('found')}
                className="h-14 text-base gap-2 bg-status-found hover:bg-status-found/90"
              >
                <CheckCircle className="h-5 w-5" />
                {language === 'he' ? 'מצאתי תפילין' : 'I Found Tefillin'}
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setSnapPoint('full')}
              className="w-full gap-2"
            >
              <Search className="h-4 w-4" />
              {language === 'he' ? 'חיפוש מתקדם' : 'Advanced Search'}
            </Button>
          </div>
        )}
        
        {/* Half state - Listing list */}
        {(snapPoint === 'half' || (snapPoint === 'peek' && selectedListing)) && !selectedListing && (
          <div className="p-4">
            <h3 className="font-medium mb-3 flex items-center justify-between">
              <span>
                {language === 'he' ? 'מודעות באזור' : 'Listings in Area'}
              </span>
              <span className="text-sm text-muted-foreground">
                {listings.length} {language === 'he' ? 'תוצאות' : 'results'}
              </span>
            </h3>
            
            <div className="space-y-2 max-h-[40vh] overflow-auto scrollbar-hide">
              {listings.map((listing) => (
                <ListingCard 
                  key={listing.id}
                  listing={listing}
                  onClick={() => handleListingClick(listing)}
                  isSelected={selectedListing?.id === listing.id}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Full state - Filters + Listings */}
        {snapPoint === 'full' && !isReporting && (
          <div className="h-full flex flex-col">
            <Filters onClose={() => setSnapPoint('half')} />
            
            <div className="flex-1 overflow-auto p-4 pt-0">
              <h3 className="font-medium mb-3 flex items-center justify-between">
                <span>
                  {language === 'he' ? 'תוצאות' : 'Results'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {listings.length} {language === 'he' ? 'מודעות' : 'listings'}
                </span>
              </h3>
              
              <div className="space-y-2">
                {listings.map((listing) => (
                  <ListingCard 
                    key={listing.id}
                    listing={listing}
                    onClick={() => handleListingClick(listing)}
                    isSelected={selectedListing?.id === listing.id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };
  
  return (
    <>
      {/* Overlay */}
      {snapPoint !== 'peek' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[hsl(var(--sheet-overlay))] z-40"
          onClick={() => {
            if (!isReporting) {
              setSnapPoint('peek');
              setSelectedListing(null);
            }
          }}
        />
      )}
      
      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        className="fixed left-0 right-0 bottom-0 z-50 bg-background rounded-t-2xl shadow-lg"
        style={{ 
          height: SNAP_HEIGHTS.full,
          y,
          translateY: SNAP_HEIGHTS.full - SNAP_HEIGHTS.peek,
        }}
        drag="y"
        dragConstraints={{
          top: -(SNAP_HEIGHTS.full - SNAP_HEIGHTS.peek),
          bottom: 0,
        }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="sheet-handle" />
        </div>
        
        {/* Content */}
        <div className="h-full overflow-hidden">
          {renderContent()}
        </div>
      </motion.div>
    </>
  );
}
