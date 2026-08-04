import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import {
  useListEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, type EventType,
} from '@/lib/schedule-store';
import { useListSubjects } from '@/lib/workspace-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, MoreHorizontal, Trash2, CheckSquare, FileWarning, BookOpen, Bell,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NONE_SUBJECT = '__none__';

const TYPE_META: Record<EventType, { label: string; icon: React.ElementType; color: string }> = {
  task: { label: 'Tugas', icon: CheckSquare, color: '#3b82f6' },
  exam: { label: 'Ujian', icon: FileWarning, color: '#ef4444' },
  study_session: { label: 'Sesi Belajar', icon: BookOpen, color: '#10b981' },
  reminder: { label: 'Reminder', icon: Bell, color: '#f59e0b' },
};

const eventSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.enum(['task', 'exam', 'study_session', 'reminder']),
  subjectId: z.string().optional(),
});
type EventFormValues = z.infer<typeof eventSchema>;

export default function ScheduleList() {
  const { toast } = useToast();
  const { data } = useListEvents();
  const { data: subjectsData } = useListSubjects();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '', date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '', endTime: '', type: 'task', subjectId: NONE_SUBJECT,
    },
  });

  const subjectName = (id?: string) =>
    subjectsData?.data.find((s) => s.id === id)?.name;

  // Dates that have at least one event -> highlighted on calendar
  const eventDates = useMemo(
    () => new Set(data.data.map((e) => e.date)),
    [data.data],
  );

  const eventsOnSelectedDate = useMemo(() => {
    const key = format(selectedDate, 'yyyy-MM-dd');
    return data.data.filter((e) => e.date === key);
  }, [data.data, selectedDate]);

  const groupedForAgenda = useMemo(() => {
    const groups: Record<string, typeof data.data> = {};
    for (const e of data.data) {
      (groups[e.date] ??= []).push(e);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [data.data]);

  const openCreateForm = (presetDate?: Date) => {
    form.reset({
      title: '',
      date: format(presetDate ?? selectedDate, 'yyyy-MM-dd'),
      startTime: '', endTime: '', type: 'task', subjectId: NONE_SUBJECT,
    });
    setIsFormOpen(true);
  };

  const onSubmit = (values: EventFormValues) => {
    createMutation.mutate(
      {
        data: {
          title: values.title,
          date: values.date,
          startTime: values.startTime || undefined,
          endTime: values.endTime || undefined,
          type: values.type,
          subjectId: values.subjectId === NONE_SUBJECT ? undefined : values.subjectId,
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Jadwal berhasil ditambahkan' });
          setIsFormOpen(false);
        },
      },
    );
  };

  const toggleStatus = (id: string, current: 'pending' | 'completed') => {
    updateMutation.mutate({ id, data: { status: current === 'pending' ? 'completed' : 'pending' } });
  };

  const renderEventRow = (e: (typeof data.data)[number]) => {
    const meta = TYPE_META[e.type];
    const Icon = meta.icon;
    return (
      <Card key={e.id} className="p-2.5 hover-elevate transition-all">
        <div className="flex items-start gap-2.5">
          <Checkbox
            checked={e.status === 'completed'}
            onCheckedChange={() => toggleStatus(e.id, e.status)}
            //className="mt-1"
          />
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
            title={meta.label}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-medium truncate ${e.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
              {e.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {e.subjectId && subjectName(e.subjectId) && (
                <Badge variant="secondary" className="text-[10px] font-normal">{subjectName(e.subjectId)}</Badge>
              )}
              {(e.startTime || e.endTime) && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {e.startTime}{e.endTime ? ` - ${e.endTime}` : ''}
                </span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => deleteMutation.mutate(
                  { id: e.id },
                  { onSuccess: () => toast({ title: 'Jadwal dihapus' }) },
                )}
                className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground text-sm">Rencanakan tugas, ujian, dan sesi belajarmu.</p>
        </div>
        <Button onClick={() => openCreateForm()} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
            <Card className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                modifiers={{ hasEvent: (d) => eventDates.has(format(d, 'yyyy-MM-dd')) }}
                modifiersClassNames={{ hasEvent: 'font-bold text-primary underline underline-offset-4' }}
                className="w-full [--cell-size:3.5rem]"
              />
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: localeId })}
                </h3>
                <Button variant="outline" size="sm" onClick={() => openCreateForm(selectedDate)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Tambah untuk tanggal ini
                </Button>
              </div>
              {eventsOnSelectedDate.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground text-sm">
                  Tidak ada jadwal di tanggal ini.
                </Card>
              ) : (
                <div className="space-y-3">{eventsOnSelectedDate.map(renderEventRow)}</div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="agenda" className="mt-4 space-y-6">
          {groupedForAgenda.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              Belum ada jadwal. Klik "Add Schedule" untuk membuat yang pertama.
            </Card>
          ) : (
            groupedForAgenda.map(([date, events]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: localeId })}
                </h3>
                <div className="space-y-3">{events.map(renderEventRow)}</div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul</FormLabel>
                    <FormControl><Input placeholder="e.g. Kerjain tugas Bab 3" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(TYPE_META).map(([key, meta]) => (
                            <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Mulai (opsional)</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Selesai (opsional)</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (opsional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Tidak terkait subject" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_SUBJECT}>Tidak ada</SelectItem>
                        {subjectsData?.data.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}