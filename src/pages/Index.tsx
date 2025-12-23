import { TopBar } from '@/components/TopBar';
import { Map } from '@/components/Map';
import { BottomSheet } from '@/components/BottomSheet';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { useApp } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const { language, direction } = useApp();
  const isMobile = useIsMobile();
  
  return (
    <div dir={direction} className="fixed inset-0 overflow-hidden bg-background flex flex-col" style={{ height: '100dvh' }}>
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
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-14">
        {/* Map */}
        <main className="flex-1 relative">
          <Map />
        </main>
        
        {/* Desktop Sidebar */}
        {!isMobile && <DesktopSidebar />}
      </div>
      
      {/* Bottom Sheet - Mobile Only */}
      {isMobile && <BottomSheet />}
    </div>
  );
}
