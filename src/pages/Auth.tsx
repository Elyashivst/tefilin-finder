import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoIcon from '@/assets/logo-icon.png';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error('כתובת אימייל לא תקינה');
      return;
    }
    
    if (!validatePassword(password)) {
      toast.error('הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('אימייל או סיסמה שגויים');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('התחברת בהצלחה!');
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error('כתובת אימייל לא תקינה');
      return;
    }
    
    if (!validatePassword(password)) {
      toast.error('הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }

    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('משתמש עם אימייל זה כבר קיים');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('נרשמת בהצלחה!');
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast.error('שגיאה בהתחברות עם Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={logoIcon} 
              alt="Logo" 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-gold" 
            />
            <h1 className="text-2xl font-bold mb-2">אבן התועים</h1>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'התחבר לחשבונך' : 'צור חשבון חדש'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="שם מלא"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pr-10 h-12 bg-muted border-0"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10 h-12 bg-muted border-0"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 pl-10 h-12 bg-muted border-0"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">מעבד...</span>
              ) : mode === 'login' ? (
                'התחבר'
              ) : (
                'הירשם'
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">או</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 gap-3"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              התחבר עם Google
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              {mode === 'login' ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary font-medium mr-2 hover:underline"
              >
                {mode === 'login' ? 'הירשם' : 'התחבר'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
