import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import p1 from '@assets/portfolio-1.jpg';
import p2 from '@assets/portfolio-2.jpg';
import p3 from '@assets/portfolio-3.jpg';
import p4 from '@assets/portfolio-4.jpg';

const projects = [
  {
    title: 'Nexus Data Platform',
    description: 'Enterprise analytics dashboard processing millions of events daily. Built for a Fortune 500 logistics firm.',
    image: p1,
    tags: ['React', 'Next.js', 'PostgreSQL', 'AWS'],
  },
  {
    title: 'PayFlow Mobile',
    description: 'Cross-border payment application handling secure, low-latency transactions across SEA.',
    image: p2,
    tags: ['React Native', 'Node.js', 'Redis'],
  },
  {
    title: 'FreightCommand',
    description: 'Complete ERP replacement for maritime shipping. Real-time fleet tracking and complex inventory management.',
    image: p3,
    tags: ['Vue', 'Python', 'Docker', 'GCP'],
  },
  {
    title: 'VitalSync Tracker',
    description: 'HIPAA-compliant health monitoring application connecting patients with specialized clinicians.',
    image: p4,
    tags: ['Flutter', 'Firebase', 'Express'],
  }
];

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Featured Work</h2>
            <p className="text-muted-foreground text-lg">We build systems that handle real scale. Here are a few examples of our engineering in production.</p>
          </div>
          <a href="#contact" className="inline-flex items-center text-primary font-medium hover:underline">
            Discuss your project <ArrowUpRight className="w-4 h-4 ml-1" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {projects.map((project, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/3] mb-6 overflow-hidden bg-secondary rounded-sm border border-border">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300"></div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="font-mono text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors flex items-center justify-between">
                {project.title}
                <ArrowUpRight className="w-5 h-5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-muted-foreground">{project.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
