import { Search, SlidersHorizontal, User, Bell, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import logoIcon from '@/assets/logo-icon.png';

export function TopBar() {
  const navigate = useNavigate();
  const { isAuthenticated, language, setSnapPoint } = useApp();
  
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
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                >
                  <div className="w-7 h-7 bg-gradient-gold rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </Button>
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
