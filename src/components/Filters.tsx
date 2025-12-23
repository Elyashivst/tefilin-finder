import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, MapPin, Calendar, Palette, Tag, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterState, TefillinType } from '@/types';

interface FiltersProps {
  onClose?: () => void;
}

export function Filters({ onClose }: FiltersProps) {
  const { language, filters, setFilters, clearFilters } = useApp();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  
  const statusOptions = [
    { value: undefined, label: language === 'he' ? 'הכל' : 'All' },
    { value: 'lost' as const, label: language === 'he' ? 'אבד' : 'Lost' },
    { value: 'found' as const, label: language === 'he' ? 'נמצא' : 'Found' },
  ];
  
  const typeOptions = [
    { value: undefined, label: language === 'he' ? 'הכל' : 'All' },
    { value: 'yad' as TefillinType, label: language === 'he' ? 'של יד' : 'Yad' },
    { value: 'rosh' as TefillinType, label: language === 'he' ? 'של ראש' : 'Rosh' },
    { value: 'set' as TefillinType, label: language === 'he' ? 'סט מלא' : 'Full Set' },
  ];
  
  const colorOptions = [
    { value: undefined, label: language === 'he' ? 'הכל' : 'All' },
    { value: 'שחור', label: language === 'he' ? 'שחור' : 'Black' },
    { value: 'כחול', label: language === 'he' ? 'כחול' : 'Blue' },
    { value: 'חום', label: language === 'he' ? 'חום' : 'Brown' },
    { value: 'בורדו', label: language === 'he' ? 'בורדו' : 'Burgundy' },
  ];
  
  const radiusOptions = [
    { value: undefined, label: language === 'he' ? 'ללא הגבלה' : 'No Limit' },
    { value: 1, label: '1 ' + (language === 'he' ? 'ק"מ' : 'km') },
    { value: 5, label: '5 ' + (language === 'he' ? 'ק"מ' : 'km') },
    { value: 10, label: '10 ' + (language === 'he' ? 'ק"מ' : 'km') },
    { value: 25, label: '25 ' + (language === 'he' ? 'ק"מ' : 'km') },
    { value: 50, label: '50 ' + (language === 'he' ? 'ק"מ' : 'km') },
  ];
  
  const handleApply = () => {
    setFilters(localFilters);
    onClose?.();
  };
  
  const handleClear = () => {
    setLocalFilters({});
    clearFilters();
  };
  
  const hasFilters = Object.values(localFilters).some(v => v !== undefined && v !== '');
  
  return (
    <div className="p-4 space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={language === 'he' ? 'חיפוש חופשי...' : 'Free search...'}
          value={localFilters.query || ''}
          onChange={(e) => setLocalFilters({ ...localFilters, query: e.target.value })}
          className="pr-10 bg-muted border-0"
        />
      </div>
      
      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {language === 'he' ? 'סטטוס' : 'Status'}
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.label}
              variant={localFilters.status === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocalFilters({ ...localFilters, status: option.value })}
              className={
                localFilters.status === option.value 
                  ? 'bg-gradient-gold text-primary-foreground border-0' 
                  : ''
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {language === 'he' ? 'סוג תפילין' : 'Tefillin Type'}
        </label>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <Button
              key={option.label}
              variant={localFilters.tefillinType === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocalFilters({ ...localFilters, tefillinType: option.value })}
              className={
                localFilters.tefillinType === option.value 
                  ? 'bg-gradient-gold text-primary-foreground border-0' 
                  : ''
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Radius */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {language === 'he' ? 'רדיוס' : 'Radius'}
        </label>
        <div className="flex flex-wrap gap-2">
          {radiusOptions.map((option) => (
            <Button
              key={option.label}
              variant={localFilters.radius === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocalFilters({ ...localFilters, radius: option.value })}
              className={
                localFilters.radius === option.value 
                  ? 'bg-gradient-gold text-primary-foreground border-0' 
                  : ''
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Color */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          {language === 'he' ? 'צבע תיק' : 'Bag Color'}
        </label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((option) => (
            <Button
              key={option.label}
              variant={localFilters.bagColor === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocalFilters({ ...localFilters, bagColor: option.value })}
              className={
                localFilters.bagColor === option.value 
                  ? 'bg-gradient-gold text-primary-foreground border-0' 
                  : ''
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Has Images */}
      <div className="flex items-center gap-3">
        <Button
          variant={localFilters.hasImages ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLocalFilters({ ...localFilters, hasImages: !localFilters.hasImages })}
          className={`gap-2 ${
            localFilters.hasImages 
              ? 'bg-gradient-gold text-primary-foreground border-0' 
              : ''
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          {language === 'he' ? 'רק עם תמונות' : 'With Images Only'}
        </Button>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button 
          onClick={handleApply}
          className="flex-1 bg-gradient-gold text-primary-foreground hover:opacity-90"
        >
          {language === 'he' ? 'החל פילטרים' : 'Apply Filters'}
        </Button>
        
        {hasFilters && (
          <Button 
            variant="outline"
            onClick={handleClear}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            {language === 'he' ? 'נקה' : 'Clear'}
          </Button>
        )}
      </div>
    </div>
  );
}
