import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Info, 
  Check,
  ArrowLeft,
  LogIn,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LocationPicker } from '@/components/LocationPicker';
import { ReportStep, TefillinType } from '@/types';
import { toast } from 'sonner';

const steps: ReportStep[] = ['status', 'location', 'details', 'publish'];

interface ReportWizardProps {
  onClose: () => void;
}

export function ReportWizard({ onClose }: ReportWizardProps) {
  const navigate = useNavigate();
  const { language, reportStatus, setReportStatus, isAuthenticated, user, addListing } = useApp();
  const [currentStep, setCurrentStep] = useState<ReportStep>('status');
  const [formData, setFormData] = useState({
    status: reportStatus || 'lost' as const,
    date: new Date().toISOString().split('T')[0],
    time: '',
    latitude: 31.7683,
    longitude: 35.2137,
    address: '',
    city: '',
    tefillinType: 'set' as TefillinType,
    bagColor: '',
    markings: '',
    inscription: '',
    notes: '',
    blurImages: true,
  });
  
  const currentStepIndex = steps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  
  const stepLabels = {
    status: language === 'he' ? 'סטטוס' : 'Status',
    location: language === 'he' ? 'מיקום' : 'Location',
    details: language === 'he' ? 'פרטים' : 'Details',
    publish: language === 'he' ? 'פרסום' : 'Publish',
  };
  
  const goNext = () => {
    if (!isLastStep) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };
  
  const goBack = () => {
    if (!isFirstStep) {
      setCurrentStep(steps[currentStepIndex - 1]);
    } else {
      onClose();
    }
  };
  
  const handlePublish = async () => {
    if (!isAuthenticated || !user) {
      // Store form data in session storage and redirect to auth
      sessionStorage.setItem('pendingReport', JSON.stringify(formData));
      navigate('/auth?redirect=report');
      return;
    }
    
    try {
      // Add the listing
      await addListing({
        status: formData.status,
        userId: user.id,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        city: formData.city,
        date: formData.date,
        time: formData.time,
        tefillinType: formData.tefillinType,
        bagColor: formData.bagColor,
        markings: formData.markings,
        inscription: formData.inscription,
        notes: formData.notes,
        images: [],
        blurImages: formData.blurImages,
        isActive: true,
        isResolved: false,
      });
      
      toast.success(language === 'he' ? 'המודעה פורסמה בהצלחה!' : 'Listing published successfully!');
      onClose();
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בפרסום המודעה' : 'Error publishing listing');
    }
  };

  const handleLoginClick = () => {
    sessionStorage.setItem('pendingReport', JSON.stringify(formData));
    navigate('/auth?redirect=report');
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="font-semibold">
          {formData.status === 'lost' 
            ? (language === 'he' ? 'דיווח על תפילין שאבדו' : 'Report Lost Tefillin')
            : (language === 'he' ? 'דיווח על תפילין שנמצאו' : 'Report Found Tefillin')
          }
        </h2>
        
        <div className="w-9" /> {/* Spacer */}
      </div>
      
      {/* Progress */}
      <div className="flex items-center justify-center gap-1 p-3 bg-muted/50">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              transition-all duration-300
              ${index < currentStepIndex 
                ? 'bg-status-found text-status-found-foreground' 
                : index === currentStepIndex
                  ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                  : 'bg-muted text-muted-foreground'
              }
            `}>
              {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-6 h-0.5 mx-1
                ${index < currentStepIndex ? 'bg-status-found' : 'bg-border'}
              `} />
            )}
          </div>
        ))}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Status Step */}
            {currentStep === 'status' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">
                  {language === 'he' ? 'מה קרה?' : 'What happened?'}
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className={`h-24 flex-col gap-2 ${
                      formData.status === 'lost' 
                        ? 'border-2 border-status-lost bg-status-lost/10' 
                        : ''
                    }`}
                    onClick={() => setFormData({ ...formData, status: 'lost' })}
                  >
                    <span className="text-2xl">😔</span>
                    <span className={formData.status === 'lost' ? 'text-status-lost font-medium' : ''}>
                      {language === 'he' ? 'איבדתי תפילין' : 'I Lost Tefillin'}
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className={`h-24 flex-col gap-2 ${
                      formData.status === 'found' 
                        ? 'border-2 border-status-found bg-status-found/10' 
                        : ''
                    }`}
                    onClick={() => setFormData({ ...formData, status: 'found' })}
                  >
                    <span className="text-2xl">🎉</span>
                    <span className={formData.status === 'found' ? 'text-status-found font-medium' : ''}>
                      {language === 'he' ? 'מצאתי תפילין' : 'I Found Tefillin'}
                    </span>
                  </Button>
                </div>
                
                <div className="space-y-3 mt-6">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {language === 'he' ? 'מתי?' : 'When?'}
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder={language === 'he' ? 'שעה משוערת' : 'Approximate time'}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Location Step */}
            {currentStep === 'location' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">
                  {language === 'he' ? 'איפה?' : 'Where?'}
                </h3>
                
                {/* Location Picker with Google Maps */}
                <LocationPicker
                  onLocationSelect={(location) => {
                    setFormData({
                      ...formData,
                      latitude: location.lat,
                      longitude: location.lng,
                      address: location.address,
                      city: location.city,
                    });
                  }}
                  language={language}
                />
                
                <div className="space-y-3">
                  <Input
                    placeholder={language === 'he' ? 'עיר' : 'City'}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-muted border-0"
                  />
                  <Input
                    placeholder={language === 'he' ? 'כתובת או תיאור מיקום' : 'Address or location description'}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-muted border-0"
                  />
                </div>
              </div>
            )}
            
            {/* Details Step */}
            {currentStep === 'details' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">
                  {language === 'he' ? 'פרטים מזהים' : 'Identifying Details'}
                </h3>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {language === 'he' ? 'סוג תפילין' : 'Tefillin Type'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'yad' as TefillinType, label: language === 'he' ? 'של יד' : 'Yad' },
                      { value: 'rosh' as TefillinType, label: language === 'he' ? 'של ראש' : 'Rosh' },
                      { value: 'set' as TefillinType, label: language === 'he' ? 'סט מלא' : 'Full Set' },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={formData.tefillinType === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, tefillinType: option.value })}
                        className={
                          formData.tefillinType === option.value 
                            ? 'bg-gradient-gold text-primary-foreground border-0' 
                            : ''
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Input
                  placeholder={language === 'he' ? 'צבע התיק' : 'Bag color'}
                  value={formData.bagColor}
                  onChange={(e) => setFormData({ ...formData, bagColor: e.target.value })}
                  className="bg-muted border-0"
                />
                
                <Input
                  placeholder={language === 'he' ? 'שם/כיתוב על התפילין' : 'Name/inscription'}
                  value={formData.inscription}
                  onChange={(e) => setFormData({ ...formData, inscription: e.target.value })}
                  className="bg-muted border-0"
                />
                
                <Input
                  placeholder={language === 'he' ? 'סימנים מזהים' : 'Identifying marks'}
                  value={formData.markings}
                  onChange={(e) => setFormData({ ...formData, markings: e.target.value })}
                  className="bg-muted border-0"
                />
                
                <Textarea
                  placeholder={language === 'he' ? 'הערות נוספות...' : 'Additional notes...'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-muted border-0 min-h-[80px]"
                />
              </div>
            )}
            
            
            {/* Publish Step */}
            {currentStep === 'publish' && (
              <div className="space-y-4">
                {!isAuthenticated ? (
                  // Login prompt
                  <div className="text-center py-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <LogIn className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {language === 'he' ? 'יש להתחבר כדי לפרסם' : 'Login Required'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {language === 'he' 
                        ? 'כדי לפרסם מודעה ולנהל אותה, יש להתחבר לחשבון' 
                        : 'To publish and manage your listing, please login'
                      }
                    </p>
                    <Button 
                      onClick={handleLoginClick}
                      className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {language === 'he' ? 'התחבר / הירשם' : 'Login / Sign Up'}
                    </Button>
                  </div>
                ) : (
                  // Ready to publish
                  <>
                    <div className="text-center py-6">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                        <Check className="h-10 w-10 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {language === 'he' ? 'הכל מוכן!' : 'All Set!'}
                      </h3>
                      <p className="text-muted-foreground">
                        {language === 'he' 
                          ? 'המודעה שלך תפורסם ותופיע במפה' 
                          : 'Your listing will be published and appear on the map'
                        }
                      </p>
                    </div>
                    
                    {/* Summary */}
                    <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{language === 'he' ? 'סטטוס:' : 'Status:'}</span>
                        <span className={formData.status === 'lost' ? 'text-status-lost' : 'text-status-found'}>
                          {formData.status === 'lost' 
                            ? (language === 'he' ? 'אבד' : 'Lost')
                            : (language === 'he' ? 'נמצא' : 'Found')
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{language === 'he' ? 'מיקום:' : 'Location:'}</span>
                        <span>{formData.city || formData.address || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{language === 'he' ? 'תאריך:' : 'Date:'}</span>
                        <span>{formData.date}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-border">
        {isLastStep ? (
          isAuthenticated ? (
            <Button 
              onClick={handlePublish}
              className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
            >
              {language === 'he' ? 'פרסם מודעה' : 'Publish Listing'}
            </Button>
          ) : null
        ) : (
          <Button 
            onClick={goNext}
            className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            {language === 'he' ? 'המשך' : 'Continue'}
            <ChevronRight className="h-4 w-4 mr-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
