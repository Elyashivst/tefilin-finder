import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, User, Mail, Save, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListingCard } from '@/components/ListingCard';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, language, isAuthenticated, listings, setSelectedListing, setUser } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's listings
  const userListings = listings.filter(l => l.userId === user?.id);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Fetch profile data
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      }
      
      if (data?.display_name) {
        setDisplayName(data.display_name);
      } else {
        setDisplayName(user.displayName || '');
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [isAuthenticated, navigate, user]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        display_name: displayName.trim() 
      });

    if (error) {
      console.error('Error updating profile:', error);
      toast.error(language === 'he' ? 'שגיאה בשמירת הפרופיל' : 'Error saving profile');
    } else {
      // Update local user state
      setUser({
        ...user,
        displayName: displayName.trim()
      });
      toast.success(language === 'he' ? 'הפרופיל נשמר בהצלחה' : 'Profile saved successfully');
    }
    
    setIsSaving(false);
  };

  const handleListingClick = (listing: typeof listings[0]) => {
    setSelectedListing(listing);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 safe-top"
      >
        <div className="bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <h1 className="font-bold text-lg">
              {language === 'he' ? 'הפרופיל שלי' : 'My Profile'}
            </h1>
            
            <div className="w-9" />
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="pt-20 pb-8 px-4 max-w-lg mx-auto">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6"
        >
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
              <User className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {language === 'he' ? 'אימייל' : 'Email'}
            </label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-muted border-0"
            />
          </div>

          {/* Display Name (editable) */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              {language === 'he' ? 'שם תצוגה' : 'Display Name'}
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={language === 'he' ? 'הזן שם תצוגה' : 'Enter display name'}
              className="bg-muted border-0"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                {language === 'he' ? 'שמור שינויים' : 'Save Changes'}
              </>
            )}
          </Button>
        </motion.div>

        {/* User's Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center justify-between">
            <span>{language === 'he' ? 'הפרסומים שלי' : 'My Listings'}</span>
            <span className="text-sm text-muted-foreground">
              {userListings.length} {language === 'he' ? 'פרסומים' : 'listings'}
            </span>
          </h2>

          {userListings.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-xl">
              <p className="text-muted-foreground">
                {language === 'he' ? 'אין לך פרסומים עדיין' : 'You have no listings yet'}
              </p>
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="mt-2"
              >
                {language === 'he' ? 'פרסם מודעה חדשה' : 'Create a new listing'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {userListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => handleListingClick(listing)}
                  isSelected={false}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
