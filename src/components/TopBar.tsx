import { Search, SlidersHorizontal, User, Bell, MessageCircle, FileText, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoIcon from '@/assets/logo-icon.png';

export function TopBar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, language, setSnapPoint, setUser } = useApp();

  const handleLogout = async () => {
    // Always clear the local session so UI + RLS state updates immediately,
    // even if the server reports "session not found".
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    setUser(null);

    if (error) {
      console.error('Logout error:', error);
      toast.error(language === 'he' ? 'שגיאה בהתנתקות' : 'Error logging out');
      return;
    }

    toast.success(language === 'he' ? 'התנתקת בהצלחה' : 'Logged out successfully');
    navigate('/');
  };
  
  
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 safe-top"
    >
      <div className="bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="Logo" className="w-8 h-8 rounded-lg shadow-gold" />
            <span className="font-bold text-lg text-foreground">
              {language === 'he' ? 'אבן התועים' : 'Lost Tefillin'}
            </span>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSnapPoint('full')}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSnapPoint('full')}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => toast.info(language === 'he' ? 'אין הודעות חדשות' : 'No new messages')}
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
                  onClick={() => toast.info(language === 'he' ? 'אין התראות חדשות' : 'No new notifications')}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                    >
                      <div className="w-7 h-7 bg-gradient-gold rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user?.displayName || user?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 ml-2" />
                      {language === 'he' ? 'הפרופיל שלי' : 'My Profile'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-listings')}>
                      <FileText className="h-4 w-4 ml-2" />
                      {language === 'he' ? 'הפרסומים שלי' : 'My Listings'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 ml-2" />
                      {language === 'he' ? 'התנתקות' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary font-medium"
                onClick={() => navigate('/auth')}
              >
                {language === 'he' ? 'התחברות' : 'Login'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
