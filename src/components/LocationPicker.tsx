import { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Crosshair, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDlEJnKlsZHbXl0Cq1mfeCLxCQGh7aKE20';

const libraries: ("places")[] = ['places'];

interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  }) => void;
  initialLocation?: { lat: number; lng: number };
  language?: 'he' | 'en';
}

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
  ],
};

export function LocationPicker({ 
  onLocationSelect, 
  initialLocation,
  language = 'he' 
}: LocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialLocation || { lat: 31.7683, lng: 35.2137 });
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
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

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderRef.current) return { address: '', city: '' };
    
    try {
      const response = await geocoderRef.current.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        const result = response.results[0];
        const city = result.address_components.find(
          comp => comp.types.includes('locality')
        )?.long_name || '';
        return {
          address: result.formatted_address,
          city,
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return { address: '', city: '' };
  };

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      
      const { address, city } = await reverseGeocode(lat, lng);
      onLocationSelect({ lat, lng, address, city });
    }
  };

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = async () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setCenter({ lat, lng });
        setMarkerPosition({ lat, lng });
        
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
        
        const city = place.address_components?.find(
          comp => comp.types.includes('locality')
        )?.long_name || '';
        
        onLocationSelect({
          lat,
          lng,
          address: place.formatted_address || '',
          city,
        });
        
        setSearchValue(place.formatted_address || '');
        setShowSearch(false);
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(16);
          }
          
          const { address, city } = await reverseGeocode(lat, lng);
          onLocationSelect({ lat, lng, address, city });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  if (loadError) {
    return (
      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
        <p className="text-destructive text-sm">שגיאה בטעינת המפה</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">טוען מפה...</div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        onClick={handleMapClick}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#C8A02B',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
              scale: 12,
            }}
          />
        )}
      </GoogleMap>

      {/* Center crosshair hint (when no marker) */}
      {!markerPosition && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-background/80 backdrop-blur-sm rounded-lg p-3">
            <Crosshair className="h-8 w-8 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">
              {language === 'he' ? 'לחץ על המפה לבחירת מיקום' : 'Click map to select location'}
            </p>
          </div>
        </div>
      )}

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 left-2 right-2 z-10"
          >
            <div className="bg-background rounded-lg shadow-lg p-1.5 flex gap-1.5">
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
                options={{ componentRestrictions: { country: 'il' } }}
                className="flex-1"
              >
                <Input
                  placeholder={language === 'he' ? 'חפש כתובת...' : 'Search address...'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              </Autocomplete>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSearch(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 bg-background shadow-md text-xs"
          onClick={() => setShowSearch(true)}
        >
          <Search className="h-3.5 w-3.5 mr-1" />
          {language === 'he' ? 'חפש' : 'Search'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 bg-background shadow-md text-xs"
          onClick={handleUseCurrentLocation}
        >
          <Crosshair className="h-3.5 w-3.5 mr-1" />
          {language === 'he' ? 'מיקומי' : 'My Location'}
        </Button>
      </div>
    </div>
  );
}
