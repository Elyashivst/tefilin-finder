import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, User, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const claimSchema = z.object({
  name: z.string().trim().min(2, 'שם חייב להכיל לפחות 2 תווים').max(100),
  phone: z.string().trim().min(9, 'מספר טלפון לא תקין').max(15),
  note: z.string().trim().max(500).optional(),
});

interface ClaimFormProps {
  listingId: string;
  listingStatus: 'lost' | 'found';
  onClose: () => void;
  onSuccess: () => void;
}

export function ClaimForm({ listingId, listingStatus, onClose, onSuccess }: ClaimFormProps) {
  const { language, user, isAuthenticated } = useApp();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error(language === 'he' ? 'יש להתחבר כדי להשאיר פרטים' : 'Please login to submit');
      return;
    }

    // Validate
    const result = claimSchema.safeParse({ name, phone, note });
    if (!result.success) {
      const fieldErrors: { name?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'name') fieldErrors.name = err.message;
        if (err.path[0] === 'phone') fieldErrors.phone = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const { error } = await supabase.from('claims').insert({
      listing_id: listingId,
      claimant_user_id: user.id,
      claimant_name: name.trim(),
      claimant_phone: phone.trim(),
      claimant_note: note.trim() || null,
    });

    setIsSubmitting(false);

    if (error) {
      console.error('Error submitting claim:', error);
      toast.error(language === 'he' ? 'שגיאה בשליחת הפרטים' : 'Error submitting');
    } else {
      toast.success(language === 'he' ? 'הפרטים נשלחו בהצלחה!' : 'Details sent successfully!');
      onSuccess();
    }
  };

  const title = listingStatus === 'found'
    ? (language === 'he' ? 'השאר פרטים ליצירת קשר' : 'Leave Contact Details')
    : (language === 'he' ? 'יש לך מידע? השאר פרטים' : 'Have Info? Leave Details');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-lg border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'he' ? 'שם מלא' : 'Full Name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pr-10 bg-muted border-0"
                required
              />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder={language === 'he' ? 'טלפון' : 'Phone'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pr-10 bg-muted border-0"
                dir="ltr"
                required
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Note */}
          <div className="relative">
            <Textarea
              placeholder={language === 'he' ? 'הערות (אופציונלי)...' : 'Notes (optional)...'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-muted border-0 min-h-[80px] resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 ml-2" />
                {language === 'he' ? 'שלח פרטים' : 'Send Details'}
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}