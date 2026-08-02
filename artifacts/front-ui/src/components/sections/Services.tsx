import { motion } from 'framer-motion';
import { 
  Code2, 
  Smartphone, 
  LayoutTemplate, 
  Paintbrush, 
  Cloud, 
  ShieldCheck 
} from 'lucide-react';

const services = [
  {
    icon: LayoutTemplate,
    title: 'Web Application Development',
    description: 'High-performance, scalable web apps built with modern React, Next.js, and solid backend architectures.'
  },
  {
    icon: Smartphone,
    title: 'Mobile App Development',
    description: 'Native-feeling cross-platform experiences for iOS and Android using Flutter and React Native.'
  },
  {
    icon: Code2,
    title: 'Custom Software Systems',
    description: 'Bespoke internal tools, ERPs, and specialized platforms designed exactly for your business logic.'
  },
  {
    icon: Paintbrush,
    title: 'UI/UX Design',
    description: 'Methodical, research-backed interface design that prioritizing clarity, conversion, and user experience.'
  },
  {
    icon: Cloud,
    title: 'DevOps & Cloud Infrastructure',
    description: 'Robust AWS/GCP setups, CI/CD pipelines, and containerized deployments for zero-downtime scaling.'
  },
  {
    icon: ShieldCheck,
    title: 'QA & Automated Testing',
    description: 'Rigorous end-to-end testing protocols ensuring your software works flawlessly before it hits production.'
  }
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 md:max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Core Capabilities</h2>
          <p className="text-muted-foreground text-lg">We don't just write code. We architect solutions that solve fundamental business problems.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-background border border-border p-8 hover-elevate transition-all duration-300 rounded-sm"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <service.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
