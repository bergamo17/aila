import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Terminal } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  projectType: z.string({ required_error: 'Please select a project type.' }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactCTA() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      projectType: '',
      message: '',
    },
  });

  function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log(data);
      setIsSubmitting(false);
      toast({
        title: 'Request Received',
        description: "We'll be in touch within 24 hours.",
      });
      form.reset();
    }, 1000);
  }

  return (
    <section id="contact" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-30" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-foreground text-background rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          
          {/* Left panel - Text */}
          <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 text-primary text-xs font-mono font-medium mb-8">
                <Terminal className="w-3 h-3" />
                <span>INIT_CONNECTION</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Ready to Build Your Next Project?
              </h2>
              <p className="text-background/70 text-lg mb-8">
                Skip the sales pitch. Talk directly with a technical architect about your requirements, timeline, and strategy.
              </p>
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4 text-sm font-mono text-background/60">
                <div className="w-1 h-1 bg-primary rounded-full" />
                Response within 24 hours
              </div>
              <div className="flex items-center gap-4 text-sm font-mono text-background/60">
                <div className="w-1 h-1 bg-primary rounded-full" />
                Free technical scoping
              </div>
              <div className="flex items-center gap-4 text-sm font-mono text-background/60">
                <div className="w-1 h-1 bg-primary rounded-full" />
                NDA available upon request
              </div>
            </div>
          </div>
          
          {/* Right panel - Form */}
          <div className="md:w-1/2 bg-background p-10 md:p-16 text-foreground border-l border-border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="rounded-sm bg-secondary/50 focus-visible:bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="john@company.com" className="rounded-sm bg-secondary/50 focus-visible:bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-sm bg-secondary/50 focus:bg-background">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="web_app">Web Application</SelectItem>
                          <SelectItem value="mobile_app">Mobile Application</SelectItem>
                          <SelectItem value="custom_software">Custom Software / ERP</SelectItem>
                          <SelectItem value="ui_ux">UI/UX Design</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe your goals, stack preferences, or timeline..." 
                          className="resize-none h-24 rounded-sm bg-secondary/50 focus-visible:bg-background" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full rounded-sm h-12 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Book a Call'}
                </Button>
                
              </form>
            </Form>
          </div>
          
        </div>
      </div>
    </section>
  );
}
