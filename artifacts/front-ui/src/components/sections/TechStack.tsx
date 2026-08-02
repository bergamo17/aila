import { motion } from 'framer-motion';
import { 
  SiReact, 
  SiNextdotjs, 
  SiNodedotjs, 
  SiFlutter, 
  SiPython, 
  SiDocker, 
  SiPostgresql, 
  SiFirebase 
} from 'react-icons/si';
import { Cloud } from 'lucide-react';

const technologies = [
  { name: 'React', icon: SiReact },
  { name: 'Next.js', icon: SiNextdotjs },
  { name: 'Node.js', icon: SiNodedotjs },
  { name: 'React Native', icon: SiReact },
  { name: 'Flutter', icon: SiFlutter },
  { name: 'Python', icon: SiPython },
  { name: 'AWS', icon: Cloud },
  { name: 'Docker', icon: SiDocker },
  { name: 'PostgreSQL', icon: SiPostgresql },
  { name: 'Firebase', icon: SiFirebase }
];

export function TechStack() {
  return (
    <section className="py-20 border-y border-border bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-widest">
            Engineering Stack
          </h2>
        </div>
        
        {/* Simple scrolling marquee effect or static grid. We'll use a responsive grid that looks highly organized */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16 opacity-70">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name + index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 hover:text-primary transition-all duration-300"
            >
              <tech.icon className="w-10 h-10 md:w-12 md:h-12" />
              <span className="text-xs font-mono font-medium hidden md:block">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
