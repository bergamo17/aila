import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { Portfolio } from '@/components/sections/Portfolio';
import { TechStack } from '@/components/sections/TechStack';
import { Process } from '@/components/sections/Process';
import { Testimonials } from '@/components/sections/Testimonials';
import { ContactCTA } from '@/components/sections/ContactCTA';

export default function LandingPage() {
  useEffect(() => {
    document.title = "Ascendiz | Software Engineering & Development House";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Ascendiz is a premier software house in Indonesia building scalable web, mobile, and custom enterprise software solutions.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Ascendiz is a premier software house in Indonesia building scalable web, mobile, and custom enterprise software solutions.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Services />
        <WhyChooseUs />
        <Portfolio />
        <TechStack />
        <Process />
        <Testimonials />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
