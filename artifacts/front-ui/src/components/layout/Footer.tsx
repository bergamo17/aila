import { SiGithub, SiX, SiInstagram } from 'react-icons/si';
import { Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-16 border-t border-border/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1">
            <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              Ascendiz
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs">
              Engineering excellence for the modern web. We build scalable software for startups and enterprises worldwide.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-background/80">Services</h4>
            <ul className="space-y-4 text-sm text-background/60">
              <li><a href="#" className="hover:text-primary transition-colors">Web Development</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mobile Applications</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Custom Software</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">UI/UX Design</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">DevOps & Cloud</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-background/80">Company</h4>
            <ul className="space-y-4 text-sm text-background/60">
              <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#portfolio" className="hover:text-primary transition-colors">Portfolio</a></li>
              <li><a href="#process" className="hover:text-primary transition-colors">Our Process</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-background/80">Connect</h4>
            <address className="not-italic text-sm text-background/60 space-y-4 mb-6">
              <p>Jakarta, Indonesia<br/>Sudirman Central Business District</p>
              <p><a href="mailto:hello@ascendiz.com" className="hover:text-primary transition-colors">hello@ascendiz.com</a></p>
              <p><a href="tel:+628110000000" className="hover:text-primary transition-colors">+62 811 000 0000</a></p>
            </address>
            <div className="flex gap-4">
              <a href="#" className="text-background/60 hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors" aria-label="GitHub">
                <SiGithub className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors" aria-label="Twitter">
                <SiX className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors" aria-label="Instagram">
                <SiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-background/40">
          <p>&copy; {currentYear} Ascendiz. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-background transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
