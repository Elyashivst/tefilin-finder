import { useState, useRef } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterState } from '@/types';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDlEJnKlsZHbXl0Cq1mfeCLxCQGh7aKE20';
const libraries: ("places")[] = ['places'];

interface FiltersProps {
  onClose?: () => void;
}

export function Filters({ onClose }: FiltersProps) {
  const { language, filters, setFilters, clearFilters, setMapCenter } = useApp();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [addressValue, setAddressValue] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    language: 'he',
    region: 'IL',
  });
  
  const radiusOptions = [
    { value: undefined, label: language === 'he' ? 'הכל' : 'All' },
    { value: 1, label: '1 ' + (language === 'he' ? 'ק"מ' : 'km') },
    { value: 5, label: '5 ' + (language === 'he' ? 'ק"מ' : 'km') },
    { value: 10, label: '10 ' + (language === 'he' ? 'ק"מ' : 'km') },
    { value: 25, label: '25 ' + (language === 'he' ? 'ק"מ' : 'km') },
  ];

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
        setAddressValue(place.formatted_address || '');
        
        const city = place.address_components?.find(
          comp => comp.types.includes('locality')
        )?.long_name || '';
        
        setLocalFilters({ ...localFilters, city });
      }
    }
  };
  
  const handleApply = () => {
    setFilters(localFilters);
    onClose?.();
  };
  
  const handleClear = () => {
    setLocalFilters({});
    setAddressValue('');
    clearFilters();
  };
  
  const hasFilters = localFilters.radius !== undefined || localFilters.city;
  
  return (
    <div className="p-3 space-y-3 border-b border-border">
      {/* Address search */}
      <div className="relative">
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        {isLoaded ? (
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
            options={{ componentRestrictions: { country: 'il' } }}
          >
            <Input
              placeholder={language === 'he' ? 'חפש לפי כתובת...' : 'Search by address...'}
              value={addressValue}
              onChange={(e) => setAddressValue(e.target.value)}
              className="pr-10 h-10 bg-muted border-0"
            />
          </Autocomplete>
        ) : (
          <Input
            placeholder={language === 'he' ? 'טוען...' : 'Loading...'}
            disabled
            className="pr-10 h-10 bg-muted border-0"
          />
        )}
      </div>
      
      {/* Radius */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">
          {language === 'he' ? 'רדיוס:' : 'Radius:'}
        </span>
        {radiusOptions.map((option) => (
          <Button
            key={option.label}
            variant={localFilters.radius === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLocalFilters({ ...localFilters, radius: option.value })}
            className={`h-8 px-3 ${
              localFilters.radius === option.value 
                ? 'bg-gradient-gold text-primary-foreground border-0' 
                : ''
            }`}
          >
            {option.label}
          </Button>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          onClick={handleApply}
          size="sm"
          className="flex-1 h-9 bg-gradient-gold text-primary-foreground hover:opacity-90"
        >
          {language === 'he' ? 'חפש' : 'Search'}
        </Button>
        
        {hasFilters && (
          <Button 
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="h-9 gap-1"
          >
            <X className="h-3.5 w-3.5" />
            {language === 'he' ? 'נקה' : 'Clear'}
          </Button>
        )}
      </div>
    </div>
  );
}
