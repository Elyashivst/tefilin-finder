import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Locate, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Map marker component (displayed on the map)
function MapMarker({ 
  listing, 
  isSelected, 
  onClick 
}: { 
  listing: { id: string; status: 'lost' | 'found'; latitude: number; longitude: number };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        absolute -translate-x-1/2 -translate-y-full cursor-pointer
        ${isSelected ? 'z-20' : 'z-10'}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: isSelected ? 1.2 : 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="relative">
        {/* Pin shape */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          shadow-lg border-2 border-background
          ${listing.status === 'lost' ? 'bg-status-lost' : 'bg-status-found'}
        `}>
          <span className="text-xs font-bold text-background">
            {listing.status === 'lost' ? '?' : '✓'}
          </span>
        </div>
        {/* Pin tail */}
        <div className={`
          absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0
          border-l-[6px] border-l-transparent
          border-r-[6px] border-r-transparent
          border-t-[8px]
          ${listing.status === 'lost' ? 'border-t-status-lost' : 'border-t-status-found'}
        `} />
        {/* Selection ring */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    </motion.button>
  );
}

export function Map() {
  const { 
    listings, 
    selectedListing, 
    setSelectedListing, 
    setSnapPoint,
    mapCenter 
  } = useApp();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(8);
  const [isLocating, setIsLocating] = useState(false);

  // Simple position calculation for demo (not real geo projection)
  const getMarkerPosition = (lat: number, lng: number) => {
    const centerLat = mapCenter.lat;
    const centerLng = mapCenter.lng;
    
    const scale = Math.pow(2, zoom - 8) * 50;
    const x = (lng - centerLng) * scale + 50;
    const y = (centerLat - lat) * scale + 50;
    
    return { x: `${x}%`, y: `${y}%` };
  };
  
  const handleMarkerClick = (listing: typeof listings[0]) => {
    setSelectedListing(listing);
    setSnapPoint('half');
  };
  
  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLocating(false);
          // Would update map center here
        },
        () => {
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };
  
  return (
    <div ref={mapContainerRef} className="absolute inset-0 bg-muted">
      {/* Map background - stylized placeholder */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern for map feel */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Israel shape silhouette */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="text-[500px] font-black text-foreground select-none">
            🗺
          </div>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40" />
      </div>
      
      {/* Map markers */}
      <div className="absolute inset-0">
        {listings.map((listing) => {
          const pos = getMarkerPosition(listing.latitude, listing.longitude);
          return (
            <div
              key={listing.id}
              style={{ 
                position: 'absolute',
                left: pos.x,
                top: pos.y,
              }}
            >
              <MapMarker
                listing={listing}
                isSelected={selectedListing?.id === listing.id}
                onClick={() => handleMarkerClick(listing)}
              />
            </div>
          );
        })}
      </div>
      
      {/* Map controls */}
      <div className="absolute left-4 bottom-64 flex flex-col gap-2 z-30">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 bg-background shadow-md hover:shadow-lg"
          onClick={handleLocateMe}
          disabled={isLocating}
        >
          <Locate className={`h-5 w-5 ${isLocating ? 'animate-pulse' : ''}`} />
        </Button>
        
        <div className="flex flex-col bg-background rounded-lg shadow-md overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none border-b border-border"
            onClick={() => setZoom(Math.min(zoom + 1, 15))}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={() => setZoom(Math.max(zoom - 1, 5))}
          >
            <Minus className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Map attribution placeholder */}
      <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground/50">
        הוסף מפתח Mapbox להצגת מפה אמיתית
      </div>
    </div>
  );
}
