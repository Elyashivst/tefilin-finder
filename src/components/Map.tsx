import { useCallback, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { useApp } from '@/contexts/AppContext';
import { Locate, Plus, Minus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDlEJnKlsZHbXl0Cq1mfeCLxCQGh7aKE20';

const libraries: ("places")[] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export function Map() {
  const { 
    listings, 
    selectedListing, 
    setSelectedListing, 
    setSnapPoint,
    mapCenter,
    setMapCenter,
  } = useApp();
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zoom, setZoom] = useState(8);
  const [isLocating, setIsLocating] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    language: 'he',
    region: 'IL',
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (listing: typeof listings[0]) => {
    setSelectedListing(listing);
    setSnapPoint('half');
    if (map) {
      map.panTo({ lat: listing.latitude, lng: listing.longitude });
    }
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(newCenter);
          if (map) {
            map.panTo(newCenter);
            map.setZoom(14);
            setZoom(14);
          }
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleZoomIn = () => {
    if (map) {
      const newZoom = Math.min((map.getZoom() || zoom) + 1, 20);
      map.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const newZoom = Math.max((map.getZoom() || zoom) - 1, 3);
      map.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const newCenter = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMapCenter(newCenter);
        if (map) {
          map.panTo(newCenter);
          map.setZoom(15);
          setZoom(15);
        }
        setSearchValue(place.formatted_address || '');
        setShowSearch(false);
      }
    }
  };

  const createMarkerIcon = (status: 'lost' | 'found', isSelected: boolean) => {
    const color = status === 'lost' ? '#EF4444' : '#22C55E';
    const scale = isSelected ? 1.3 : 1;
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 12 * scale,
    };
  };

  if (loadError) {
    return (
      <div className="absolute inset-0 bg-muted flex items-center justify-center">
        <p className="text-destructive">שגיאה בטעינת המפה</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 bg-muted flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">טוען מפה...</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={{ lat: listing.latitude, lng: listing.longitude }}
            icon={createMarkerIcon(listing.status, selectedListing?.id === listing.id)}
            onClick={() => handleMarkerClick(listing)}
            animation={selectedListing?.id === listing.id ? google.maps.Animation.BOUNCE : undefined}
          />
        ))}
      </GoogleMap>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-30"
          >
            <div className="bg-background rounded-lg shadow-lg p-2 flex gap-2">
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  componentRestrictions: { country: 'il' },
                }}
                className="flex-1"
              >
                <Input
                  placeholder="חפש מיקום..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </Autocomplete>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search button (when search is hidden) */}
      {!showSearch && (
        <div className="absolute top-4 right-4 z-30">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 bg-background shadow-md hover:shadow-lg"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      )}

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
            onClick={handleZoomIn}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={handleZoomOut}
          >
            <Minus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg shadow-md p-2 z-20 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-status-lost" />
          <span>אבוד</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-found" />
          <span>נמצא</span>
        </div>
      </div>
    </div>
  );
}
