import { TopBar } from '@/components/TopBar';
import { Map } from '@/components/Map';
import { BottomSheet } from '@/components/BottomSheet';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { Helmet } from 'react-helmet-async';

function AppContent() {
  const { language, direction } = useApp();
  
  return (
    <div dir={direction} className="h-screen w-screen overflow-hidden bg-background">
      <Helmet>
        <html lang={language} dir={direction} />
        <title>{language === 'he' ? 'אבן התועים - איתור תפילין' : 'Lost Tefillin Finder'}</title>
        <meta 
          name="description" 
          content={language === 'he' 
            ? 'מערכת לאיתור תפילין שאבדו או נמצאו. עזור להחזיר תפילין לבעליהם.' 
            : 'System for finding lost or found Tefillin. Help return Tefillin to their owners.'
          } 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />
        <meta name="theme-color" content="hsl(38, 85%, 45%)" />
      </Helmet>
      
      {/* Top Bar */}
      <TopBar />
      
      {/* Map (full screen behind everything) */}
      <main className="absolute inset-0 pt-14">
        <Map />
      </main>
      
      {/* Bottom Sheet */}
      <BottomSheet />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
