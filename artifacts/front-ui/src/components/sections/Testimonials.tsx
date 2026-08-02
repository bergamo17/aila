import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import avatar1 from '@assets/avatar-1.jpg';
import avatar2 from '@assets/avatar-2.jpg';
import avatar3 from '@assets/avatar-3.jpg';

const testimonials = [
  {
    quote: "Ascendiz stepped in when our internal team was overwhelmed. They audited our mess of a codebase, re-architected the backend, and delivered a scalable system within 8 weeks. Unbelievable velocity.",
    name: "Sarah Jenkins",
    role: "CEO, FinFlow",
    avatar: avatar1
  },
  {
    quote: "Working with them doesn't feel like managing an outsourced agency. It feels like having a senior engineering pod in the next room. Methodical, transparent, and technically brilliant.",
    name: "Marcus Chen",
    role: "CTO, Logistix AI",
    avatar: avatar2
  },
  {
    quote: "We needed a complex healthcare compliance portal built from scratch. They handled the security requirements flawlessly and shipped a beautiful UI that our clinicians actually want to use.",
    name: "David Aris",
    role: "Director of Product, HealthSync",
    avatar: avatar3
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Trusted by Technical Leaders</h2>
          <p className="text-muted-foreground text-lg">Don't just take our word for it. Here's what engineering and product leaders say about partnering with Ascendiz.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background border border-border p-8 rounded-sm relative flex flex-col h-full"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
              <div className="flex-1 mb-8">
                <p className="text-foreground/80 leading-relaxed">"{item.quote}"</p>
              </div>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-border shrink-0 bg-secondary">
                  <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
