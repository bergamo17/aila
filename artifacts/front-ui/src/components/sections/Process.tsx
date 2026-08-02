import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Discovery & Architecture',
    desc: 'We map out your business logic, system requirements, and technical constraints before writing a single line of code.'
  },
  {
    num: '02',
    title: 'UI/UX Design',
    desc: 'Creating precise wireframes and interactive prototypes to validate user flows and visual hierarchy.'
  },
  {
    num: '03',
    title: 'Development Sprints',
    desc: 'Iterative, transparent engineering. Weekly deployments to staging environments for continuous feedback.'
  },
  {
    num: '04',
    title: 'Rigorous Testing',
    desc: 'Automated unit tests, integration tests, and manual QA to ensure edge cases are handled gracefully.'
  },
  {
    num: '05',
    title: 'Deployment',
    desc: 'Zero-downtime releases utilizing modern CI/CD pipelines, container orchestration, and cloud infrastructure.'
  },
  {
    num: '06',
    title: 'Long-term Support',
    desc: 'Ongoing maintenance, monitoring, and feature iteration. We stay with you as your platform scales.'
  }
];

export function Process() {
  return (
    <section id="process" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 md:max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The Pipeline</h2>
          <p className="text-muted-foreground text-lg">A systematic approach to shipping complex software on time, every time.</p>
        </div>

        <div className="relative">
          {/* Vertical line connecting steps on desktop */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border hidden md:block"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex flex-col md:flex-row gap-6 md:gap-12"
              >
                <div className="flex items-center md:items-start gap-4 z-10 md:w-32 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center font-mono font-bold text-primary">
                    {step.num}
                  </div>
                </div>
                
                <div className="bg-secondary/30 border border-border p-6 md:p-8 rounded-sm flex-1 hover-elevate transition-all">
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
