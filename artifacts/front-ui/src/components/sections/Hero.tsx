import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Terminal } from 'lucide-react';
import heroImage from '@assets/hero-visual.jpg';

export function Hero() {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50 dark:opacity-20" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Terminal className="w-4 h-4" />
              <span>Engineering Excellence</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              We Build Software <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">That Scales.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Ascendiz is the trusted engineering partner for startups and enterprises. Methodical, fast, and precise custom software development.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="rounded-sm h-14 px-8 text-base group" asChild>
                <a href="#contact">
                  Start Your Project
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-sm h-14 px-8 text-base border-border bg-background/50 backdrop-blur" asChild>
                <a href="#portfolio">View Our Work</a>
              </Button>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Jakarta Based
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Global Reach
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-full rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img 
                src={heroImage} 
                alt="Abstract technological visualization" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/20 to-transparent mix-blend-overlay"></div>
            </div>
            
            {/* Floating accent card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 md:bottom-12 md:-left-12 bg-background border border-border p-4 rounded-lg shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-md text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Uptime</p>
                <p className="font-mono font-bold text-xl">99.99%</p>
              </div>
            </motion.div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
