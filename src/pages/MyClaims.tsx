import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MessageSquare, User, Calendar, Check, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Claim {
  id: string;
  listing_id: string;
  claimant_name: string;
  claimant_phone: string;
  claimant_note: string | null;
  is_read: boolean;
  created_at: string;
  listing?: {
    status: string;
    city: string | null;
    address: string | null;
  };
}

export default function MyClaims() {
  const navigate = useNavigate();
  const { user, isAuthenticated, language, listings } = useApp();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's listing IDs
  const userListingIds = user ? listings.filter(l => l.userId === user.id).map(l => l.id) : [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=my-claims');
      return;
    }

    const fetchClaims = async () => {
      if (!user || userListingIds.length === 0) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .in('listing_id', userListingIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching claims:', error);
        toast.error(language === 'he' ? 'שגיאה בטעינת הפניות' : 'Error loading claims');
      } else {
        // Enrich with listing data
        const enrichedClaims = (data || []).map(claim => {
          const listing = listings.find(l => l.id === claim.listing_id);
          return {
            ...claim,
            listing: listing ? {
              status: listing.status,
              city: listing.city,
              address: listing.address,
            } : undefined,
          };
        });
        setClaims(enrichedClaims);
      }
      setIsLoading(false);
    };

    fetchClaims();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('claims-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'claims',
        },
        (payload) => {
          const newClaim = payload.new as Claim;
          if (userListingIds.includes(newClaim.listing_id)) {
            const listing = listings.find(l => l.id === newClaim.listing_id);
            setClaims(prev => [{
              ...newClaim,
              listing: listing ? {
                status: listing.status,
                city: listing.city,
                address: listing.address,
              } : undefined,
            }, ...prev]);
            toast.info(language === 'he' ? 'התקבלה פנייה חדשה!' : 'New claim received!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user, navigate, language, listings, userListingIds.length]);

  const markAsRead = async (claimId: string) => {
    const { error } = await supabase
      .from('claims')
      .update({ is_read: true })
      .eq('id', claimId);

    if (!error) {
      setClaims(prev => prev.map(c => 
        c.id === claimId ? { ...c, is_read: true } : c
      ));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = claims.filter(c => !c.is_read).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-lg">
            {language === 'he' ? 'פניות שהתקבלו' : 'Received Claims'}
          </h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="w-9" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse text-muted-foreground">
              {language === 'he' ? 'טוען...' : 'Loading...'}
            </div>
          </div>
        ) : claims.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {language === 'he' ? 'אין פניות עדיין' : 'No claims yet'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'he' 
                ? 'כשמישהו יפנה לגבי אחת המודעות שלך, תראה את זה כאן'
                : 'When someone reaches out about your listings, you\'ll see it here'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-card rounded-xl p-4 border shadow-sm ${
                  !claim.is_read ? 'border-primary' : 'border-border'
                }`}
                onClick={() => !claim.is_read && markAsRead(claim.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{claim.claimant_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {claim.listing?.city || claim.listing?.address}
                      </p>
                    </div>
                  </div>
                  
                  {!claim.is_read && (
                    <Badge className="bg-primary text-primary-foreground">
                      {language === 'he' ? 'חדש' : 'New'}
                    </Badge>
                  )}
                </div>

                {/* Phone */}
                <a 
                  href={`tel:${claim.claimant_phone}`}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-2 hover:bg-muted/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-4 w-4 text-status-found" />
                  <span className="font-medium" dir="ltr">{claim.claimant_phone}</span>
                </a>

                {/* Note */}
                {claim.claimant_note && (
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{claim.claimant_note}</p>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(claim.created_at)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}