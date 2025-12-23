import { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { useApp } from '@/contexts/AppContext';
import { Locate, Plus, Minus, Search, X, AlertCircle, CheckCircle } from 'lucide-react';
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
  gestureHandling: 'greedy',
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
    setIsReporting,
    setReportStatus,
    language,
  } = useApp();
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zoom, setZoom] = useState(8);
  const [isLocating, setIsLocating] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showReportPrompt, setShowReportPrompt] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    language: 'he',
    region: 'IL',
  });

  useEffect(() => {
    if (isLoaded && !geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (listing: typeof listings[0]) => {
    setSelectedListing(listing);
    setSnapPoint('half');
    setShowReportPrompt(false);
    if (map) {
      map.panTo({ lat: listing.latitude, lng: listing.longitude });
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setClickedLocation({ lat, lng });
      setShowReportPrompt(true);
      setSelectedListing(null);
    }
  };

  const handleStartReport = async (status: 'lost' | 'found') => {
    setShowReportPrompt(false);
    setReportStatus(status);
    setIsReporting(true);
    setSnapPoint('full');
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
    // Softer, more pleasant colors
    const color = status === 'lost' ? '#D9534F' : '#4DAF7C';
    const size = isSelected ? 44 : 36;
    
    // Different icons: exclamation mark for lost, checkmark for found
    const iconPath = status === 'lost' 
      ? `<text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" font-size="${size * 0.5}" font-weight="bold" font-family="Arial">!</text>`
      : `<path d="M${size * 0.3} ${size * 0.5} L${size * 0.45} ${size * 0.65} L${size * 0.7} ${size * 0.35}" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
        ${iconPath}
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
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
        onClick={handleMapClick}
      >
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={{ lat: listing.latitude, lng: listing.longitude }}
            icon={createMarkerIcon(listing.status, selectedListing?.id === listing.id)}
            onClick={() => handleMarkerClick(listing)}
          />
        ))}
        
        {/* Clicked location marker */}
        {clickedLocation && showReportPrompt && (
          <Marker
            position={clickedLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#C8A02B',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
              scale: 14,
            }}
          />
        )}
      </GoogleMap>

      {/* Report prompt popup */}
      <AnimatePresence>
        {showReportPrompt && clickedLocation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/3 left-4 right-4 z-40"
          >
            <div className="bg-background rounded-xl shadow-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  {language === 'he' ? 'דווח על תפילין' : 'Report Tefillin'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setShowReportPrompt(false);
                    setClickedLocation(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'he' 
                  ? 'לחצת על מיקום במפה. מה תרצה לדווח?' 
                  : 'You clicked a location. What would you like to report?'}
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleStartReport('lost')}
                  className="h-12 gap-2 bg-status-lost hover:bg-status-lost/90"
                >
                  <AlertCircle className="h-4 w-4" />
                  {language === 'he' ? 'איבדתי' : 'I Lost'}
                </Button>
                
                <Button
                  onClick={() => handleStartReport('found')}
                  className="h-12 gap-2 bg-status-found hover:bg-status-found/90"
                >
                  <CheckCircle className="h-4 w-4" />
                  {language === 'he' ? 'מצאתי' : 'I Found'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className="h-10 w-10 bg-card text-foreground shadow-md hover:shadow-lg border border-border"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute left-4 bottom-64 md:bottom-8 flex flex-col gap-2 z-30">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 bg-card text-foreground shadow-md hover:shadow-lg border border-border"
          onClick={handleLocateMe}
          disabled={isLocating}
        >
          <Locate className={`h-5 w-5 ${isLocating ? 'animate-pulse' : ''}`} />
        </Button>
        
        <div className="flex flex-col bg-card rounded-lg shadow-md overflow-hidden border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none border-b border-border text-foreground"
            onClick={handleZoomIn}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none text-foreground"
            onClick={handleZoomOut}
          >
            <Minus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 md:bottom-8 left-4 md:left-auto md:right-4 bg-background/90 backdrop-blur-sm rounded-lg shadow-md p-2 md:p-3 z-20 text-xs md:text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-status-lost" />
          <span>אבוד</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-status-found" />
          <span>נמצא</span>
        </div>
      </div>
    </div>
  );
}
