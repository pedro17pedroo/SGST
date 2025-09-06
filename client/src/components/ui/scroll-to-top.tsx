import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile.tsx';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar o botão quando o usuário rolar mais de 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size={isMobile ? 'sm' : 'default'}
      className={`fixed z-50 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 ${
        isMobile 
          ? 'bottom-20 right-4 w-12 h-12 rounded-full p-0' 
          : 'bottom-8 right-8 w-14 h-14 rounded-full p-0'
      }`}
      aria-label="Voltar ao topo"
    >
      <ChevronUp className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
    </Button>
  );
}