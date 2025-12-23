import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Edit, CheckCircle, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoIcon from '@/assets/logo-icon.png';
import { Listing } from '@/types';

export default function MyListings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, listings, language, updateListing, deleteListing: deleteListingFromContext } = useApp();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // Filter listings for current user
  const userListings = user ? listings.filter(l => l.userId === user.id) : [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=my-listings');
    }
  }, [isAuthenticated, navigate]);

  const handleMarkResolved = (listingId: string) => {
    updateListing(listingId, { isResolved: true, isActive: false });
    toast.success(language === 'he' ? 'המודעה סומנה כנמצא!' : 'Listing marked as found!');
  };

  const handleDelete = (listingId: string) => {
    setSelectedListingId(listingId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedListingId) {
      deleteListingFromContext(selectedListingId);
      toast.success(language === 'he' ? 'המודעה נמחקה' : 'Listing deleted');
      setDeleteDialogOpen(false);
      setSelectedListingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="font-semibold text-lg">
          {language === 'he' ? 'הפרסומים שלי' : 'My Listings'}
        </h1>
        
        <img src={logoIcon} alt="Logo" className="w-8 h-8 rounded-lg" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {userListings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {language === 'he' ? 'אין לך פרסומים עדיין' : 'No listings yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'he' 
                ? 'דווח על תפילין שאבדו או נמצאו כדי לעזור לאחרים'
                : 'Report lost or found Tefillin to help others'
              }
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
            >
              {language === 'he' ? 'דווח עכשיו' : 'Report Now'}
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {userListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card rounded-xl p-4 border border-border shadow-sm ${
                  listing.isResolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={listing.status === 'lost' ? 'status-lost' : 'status-found'}
                    >
                      {listing.status === 'lost' 
                        ? (language === 'he' ? 'אבד' : 'Lost')
                        : (language === 'he' ? 'נמצא' : 'Found')
                      }
                    </Badge>
                    {listing.isResolved && (
                      <Badge variant="outline" className="text-status-found border-status-found">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {language === 'he' ? 'טופל' : 'Resolved'}
                      </Badge>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/edit-listing/${listing.id}`)}>
                        <Edit className="h-4 w-4 ml-2" />
                        {language === 'he' ? 'עריכה' : 'Edit'}
                      </DropdownMenuItem>
                      {!listing.isResolved && (
                        <DropdownMenuItem onClick={() => handleMarkResolved(listing.id)}>
                          <CheckCircle className="h-4 w-4 ml-2" />
                          {language === 'he' ? 'סמן כנמצא' : 'Mark as Found'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(listing.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        {language === 'he' ? 'מחק' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.city || listing.address || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(listing.date)}</span>
                  </div>
                  {listing.bagColor && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">{language === 'he' ? 'צבע תיק:' : 'Bag color:'}</span>{' '}
                      {listing.bagColor}
                    </p>
                  )}
                  {listing.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{listing.notes}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'he' ? 'מחיקת מודעה' : 'Delete Listing'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'he' 
                ? 'האם אתה בטוח שברצונך למחוק את המודעה? פעולה זו לא ניתנת לביטול.'
                : 'Are you sure you want to delete this listing? This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {language === 'he' ? 'מחק' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
