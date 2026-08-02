import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <a href="#home" className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          Ascendiz
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
          <a href="#portfolio" className="text-muted-foreground hover:text-foreground transition-colors">Portfolio</a>
          <a href="#process" className="text-muted-foreground hover:text-foreground transition-colors">Process</a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild className="hidden md:inline-flex rounded-sm">
            <a href="#contact">Get a Free Consultation</a>
          </Button>
          <Button variant="outline" size="icon" className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
