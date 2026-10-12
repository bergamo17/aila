import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import {
  useScheduleByRange,
  useUpcomingSchedule,
  useAddSchedule,
  useUpdateScheduleStatus,
  useDeleteSchedule,
} from '@/hooks/use-schedule';
import { useListSubjects } from '@/hooks/use-subject';
import type { EventType, ScheduleResponse } from '@/types/schedule';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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

const TYPE_META: Record<EventType, { label: string; icon: React.ElementType; color: string }> = {
  task: { label: 'Tugas', icon: CheckSquare, color: '#3b82f6' },
  exam: { label: 'Ujian', icon: FileWarning, color: '#ef4444' },
  study_session: { label: 'Sesi Belajar', icon: BookOpen, color: '#10b981' },
  reminder: { label: 'Reminder', icon: Bell, color: '#f59e0b' },
};

// Backend bisa mengirim "2026-10-11" atau "2026-10-11T00:00:00Z", dan jam "HH:MM:SS".
// Dinormalisasi supaya perbandingan dan tampilan tetap konsisten.
const dayKey = (s: string) => s.slice(0, 10);
const hhmm = (s?: string | null) => (s ? s.slice(0, 5) : '');

const eventSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  event_date: z.string().min(1, 'Tanggal wajib diisi'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  type: z.enum(['task', 'exam', 'study_session', 'reminder']),
  subject_id: z.string().min(1, 'Subject wajib dipilih'),
  reminder: z.boolean(),
  description: z.string().optional(),
});
type EventFormValues = z.infer<typeof eventSchema>;

export default function ScheduleList() {
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Kalender: ambil jadwal untuk bulan yang sedang ditampilkan
  const rangeFrom = format(startOfMonth(month), 'yyyy-MM-dd');
  const rangeTo = format(endOfMonth(month), 'yyyy-MM-dd');
  const { data: monthEvents = [] } = useScheduleByRange(rangeFrom, rangeTo);

  // Agenda: jadwal yang akan datang, dihitung dari hari ini
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const { data: upcomingEvents = [] } = useUpcomingSchedule(today);

  const { data: subjects = [] } = useListSubjects();
  const createMutation = useAddSchedule();
  const statusMutation = useUpdateScheduleStatus();
  const deleteMutation = useDeleteSchedule();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '', event_date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '', end_time: '', type: 'task', subject_id: '', reminder: false,
      description: '',
    },
  });

  // Deskripsi hanya relevan untuk tipe yang otomatis membuat task di board
  const watchedType = form.watch('type');
  const createsTask = watchedType === 'task' || watchedType === 'exam';

  const subjectName = (id: number) =>
    subjects.find((s) => s.id === id)?.subject_name;

  // Tanggal yang punya minimal satu jadwal -> di-highlight di kalender
  const eventDates = useMemo(
    () => new Set(monthEvents.map((e) => dayKey(e.event_date))),
    [monthEvents],
  );

  const eventsOnSelectedDate = useMemo(() => {
    const key = format(selectedDate, 'yyyy-MM-dd');
    return monthEvents.filter((e) => dayKey(e.event_date) === key);
  }, [monthEvents, selectedDate]);

  const groupedForAgenda = useMemo(() => {
    const groups: Record<string, ScheduleResponse[]> = {};
    for (const e of upcomingEvents) {
      (groups[dayKey(e.event_date)] ??= []).push(e);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [upcomingEvents]);

  const openCreateForm = (presetDate?: Date) => {
    form.reset({
      title: '',
      event_date: format(presetDate ?? selectedDate, 'yyyy-MM-dd'),
      start_time: '', end_time: '', type: 'task', subject_id: '', reminder: false,
      description: '',
    });
    setIsFormOpen(true);
  };

  const onSubmit = (values: EventFormValues) => {
    createMutation.mutate(
      {
        subject_id: Number(values.subject_id),
        title: values.title,
        event_date: values.event_date,
        reminder: values.reminder,
        type: values.type,
        description: values.description?.trim() || '',
        start_time: values.start_time || null,
        end_time: values.end_time || null,
      },
      {
        onSuccess: (res) => {
          toast({
            title: res.task_id
              ? 'Jadwal ditambahkan & masuk ke To Do di Task'
              : 'Jadwal berhasil ditambahkan',
          });
          setIsFormOpen(false);
        },
        onError: () => toast({ title: 'Gagal menambahkan jadwal', variant: 'destructive' }),
      },
    );
  };

  const toggleStatus = (e: ScheduleResponse) => {
    statusMutation.mutate(
      { id: e.id, payload: { is_completed: !e.is_completed } },
      { onError: () => toast({ title: 'Gagal mengubah status', variant: 'destructive' }) },
    );
  };

  const renderEventRow = (e: ScheduleResponse) => {
    const meta = TYPE_META[e.type as EventType] ?? TYPE_META.reminder;
    const Icon = meta.icon;
    const name = subjectName(e.subject_id);
    const start = hhmm(e.start_time);
    const end = hhmm(e.end_time);
    return (
      <Card key={e.id} className="p-2.5 hover-elevate transition-all">
        <div className="flex items-start gap-2.5">
          <Checkbox
            checked={e.is_completed}
            onCheckedChange={() => toggleStatus(e)}
          />
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
            title={meta.label}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-medium truncate ${e.is_completed ? 'line-through text-muted-foreground' : ''}`}>
              {e.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {name && (
                <Badge variant="secondary" className="text-[10px] font-normal">{name}</Badge>
              )}
              {(start || end) && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {start}{end ? ` - ${end}` : ''}
                </span>
              )}
              {e.reminder && <Bell className="w-3 h-3 text-muted-foreground" />}
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
                  e.id,
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
              <div style={{ '--cell-size': '3.5rem' } as React.CSSProperties}></div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (!d) return;
                  setSelectedDate(d);
                  setMonth(d);
                }}
                month={month}
                onMonthChange={setMonth}
                modifiers={{ hasEvent: (d) => eventDates.has(format(d, 'yyyy-MM-dd')) }}
                modifiersClassNames={{ hasEvent: 'font-bold text-primary underline underline-offset-4' }}
                className="w-full"
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
                  name="event_date"
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
                  name="start_time"
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
                  name="end_time"
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
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Pilih subject" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.subject_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {subjects.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Belum ada subject. Buat Mata Kuliah dulu sebelum menambah jadwal.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createsTask && (
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Task (opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Kerjakan soal halaman 11-12"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Akan tampil di kartu task pada board To Do.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="reminder"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <FormLabel className="m-0">Ingatkan saya</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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