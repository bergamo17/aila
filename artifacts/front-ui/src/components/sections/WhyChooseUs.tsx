import { motion } from 'framer-motion';

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-foreground text-background" id="about">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Precision in every line of code.
            </h2>
            <p className="text-muted/80 text-lg mb-8 leading-relaxed">
              We operate like an extension of your own company. No black boxes, no bloated timelines. Just senior engineering talent executing with startup velocity.
            </p>
            
            <ul className="space-y-6">
              {[
                { title: 'Methodical Approach', desc: 'Every architecture decision is documented and justified.' },
                { title: 'Dedicated Pods', desc: 'You get a consistent team, not a rotating cast of freelancers.' },
                { title: 'Transparent Velocity', desc: 'Weekly sprints, daily standups, zero surprises.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-sm bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-muted/70">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { number: '5+', label: 'Years Experience' },
              { number: '100+', label: 'Projects Delivered' },
              { number: '50+', label: 'Happy Clients' },
              { number: '24/7', label: 'Support SLA' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background/5 border border-white/10 p-8 flex flex-col items-center justify-center text-center rounded-sm"
              >
                <div className="text-4xl md:text-5xl font-bold font-mono text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted/80 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
