# AILA — Task List (Backend & Frontend)

Diurutkan dari yang paling kritis (bug/blocker) sampai next development. Referensi file berdasarkan hasil review langsung ke repo `bergamo17/aila`.

---

## 🔴 Critical / Urgent — bug yang bikin fitur salah/rusak

### Backend

- [ DONE ] **`deleteTask` tidak bisa dipanggil sama sekali.** Route didaftarkan sebagai `DELETE /task/delete` (`server.go`) tanpa parameter `:id`, tapi handler `deleteTask` (`task.go`) melakukan `ctx.ShouldBindUri(&uri)` yang mengharapkan `id` dari path. Setiap request ke endpoint ini akan selalu gagal bind (400). **Fix:** ubah route jadi `DELETE /task/:id`, konsisten dengan pola `updateTask`.
- [ DONE ] **`createTaskResponse` salah JSON tag.** Di `task.go`:
  ```go
  type createTaskResponse struct {
      SubjectID  int64  `json:"subject_id"`
      TaskStatus string `json:"subject_name"` // <- salah, harus "task_status"
      Title      string `json:"title"`
  }
  ```
  Field `TaskStatus` ke-tag `subject_name`, bukan `task_status`. Ini akan membingungkan konsumen API (field muncul dengan nama yang salah).
- [ DONE ] **`createNote` tidak pernah mengisi `Id` di response.** Di `note.go`, `newNoteResponse` punya field `Id`, tapi saat construct `result := &newNoteResponse{...}`, `Id` tidak di-assign — selalu balik `0`. Ini bug nyata karena `useCreateNote` di frontend memakai `note.id` untuk key React (`id: String(note.id)`), jadi setiap note baru akan punya id `"0"` sampai reload.

### Frontend

- [ ] **`WorkspaceList.tsx`, `SubjectDetails.tsx`, `TaskBoard.tsx` masih 100% memakai data mock/dummy** (`workspace-store.tsx`, `task-board-store.tsx`) — belum ada satupun yang benar-benar terhubung ke backend Go untuk subject & task. Ini blocker utama sebelum aplikasi bisa dipakai dengan data asli.
- [ ] **Mismatch tipe `id`.** Semua interface lokal (`Subject.id`, `Note.id`, `Task.id` di store) bertipe `string` (di-generate acak via `Math.random()`), padahal backend selalu `int64`/`number`. Harus diseragamkan ke `number` sebelum hook di-migrasi ke TanStack Query, kalau tidak semua request `GET /subject/:id`, `PUT /task/:id`, dst akan gagal.
- [ ] **Mismatch value `task_status`.** Backend membatasi status task dengan `binding:"oneof='to do' 'in progress' 'done'"` (pakai spasi), sedangkan `task-board-store.tsx` pakai `'todo' | 'in_progress' | 'done'` (tanpa spasi, pakai underscore). Kalau langsung dikoneksikan tanpa disamakan, setiap update status dari drag-and-drop akan ditolak backend (400).

---

## 🟠 High Priority — fitur belum lengkap, blocker untuk CRUD end-to-end

### Backend

- [ ] **Handler untuk list & get task belum ada**, padahal query sqlc-nya sudah siap dipakai (`ListTaskByUser`, `ListTaskBySubject`, `ListTaskByStatus`, `GetTask` sudah ada di `db/query/task.sql`). Tanpa ini, `TaskBoard` tidak akan pernah bisa load data asli walau hook-nya sudah diganti ke API.
- [ ] **Handler untuk list, get, update, delete note belum ada**, padahal query sqlc-nya juga sudah siap (`GetNote`, `ListNotesByUser`, `ListNotesBySubject`, `UpdateNote`, `DeleteNote` sudah ada di `db/query/note.sql`). `SubjectDetails.tsx` butuh minimal list + delete supaya notes-nya nyata.
- [ ] **`updateSubject` dan `deleteSubject` belum ada sama sekali** — bukan cuma handler, query SQL-nya pun belum ditulis di `subject.sql`. Ini yang paling belum siap dibanding task/note. Perlu ditambahkan: query SQL → generate sqlc → handler → route.
- [ ] **`AllowOrigins` di CORS masih hardcode** ke `http://localhost:5173` saja (`server.go`). Perlu env var supaya bisa diisi origin production nanti tanpa ubah kode.

### Frontend

- [ ] **`src/api/task.ts` belum ada** — padahal backend task.go sudah punya 4 endpoint (create/update/updateStatus/delete). Perlu dibuat mengikuti pola `subject.ts`/`note.ts`.
- [ ] **`src/types/task.ts` belum ada** — perlu interface `CreateTaskRequest`, `UpdateTaskRequest`, `TaskResponse` yang field & tipenya sinkron dengan struct Go (setelah bug JSON tag di atas diperbaiki).
- [ ] **`src/api/note.ts` baru punya `create`** — perlu ditambah `list`, `getById`, `update`, `delete` begitu handler backend-nya (poin di atas) sudah jadi.
- [ ] Buat `src/hooks/useSubjects.ts` dengan `useQuery`/`useMutation` (menggantikan 5 fungsi subject di `workspace-store.tsx`), lalu hapus bagian subject dari file itu — biarkan `workspace-store.tsx` fokus untuk notes saja (sementara).
- [ ] Buat `src/hooks/useTasks.ts` dengan `useQuery`/`useMutation`, lalu ganti pemakaian di `TaskBoard.tsx` dari `TaskBoardProvider`/`task-board-store.tsx` ke hook baru ini.

---

## 🟡 Medium — cleanup & konsistensi

- [ ] Hapus dead import `import { number, string } from "zod";` di `src/types/subject.ts`.
- [ ] Hapus dead import `import { X } from "lucide-react";` di `src/api/subject.ts`.
- [ ] Cek ulang logika `featureFlags.ts`:
  ```ts
  ENABLE_MAHASISWA_MENU: import.meta.env.VITE_ENABLE_MAHASISWA == 'false',
  ```
  Kondisinya menyalakan menu justru saat env var `'false'` — kemungkinan besar seharusnya `== 'true'`. Perlu dikonfirmasi apakah ini disengaja.
- [ ] Konsistensikan pola ownership-check antar handler: sebagian (`getSubjectById`) melakukan fetch user lalu bandingkan `UserID` manual di Go, sebagian lain (`GetTask`, `GetNote`) sudah memfilter ownership langsung di level query SQL. Pilih satu pola untuk endpoint baru ke depannya supaya lebih mudah di-maintain.
- [ ] Standarkan pesan error — sebagian handler pakai `errors.New("pesan Bahasa Indonesia")`, sebagian lain langsung `err` dari pgx/validator (pesan Inggris teknis). Tidak urgent, tapi akan terlihat tidak konsisten di UI kalau ditampilkan langsung ke user.

---

## 🟢 Next Development — fitur baru / peningkatan

- [ ] **Kolom `position` belum ada di tabel `tasks`** (cek migration `000001_init_schema.up.sql`), padahal `task-board-store.tsx` (mock) sudah punya logika reorder berbasis `position` untuk drag-and-drop Kanban. Perlu migration baru + update query `UpdateTaskStatus`/tambah `UpdateTaskPosition` supaya urutan kartu di Kanban board tersimpan permanen, bukan cuma di state lokal.
- [ ] Tambahkan pagination untuk `listSubjectByUser` dan (nanti) `listTaskByUser`/`listNotesByUser` — saat ini semua query mengambil semua baris tanpa limit/offset, akan jadi masalah kalau datanya sudah banyak.
- [ ] Tambahkan endpoint search/filter (misal cari subject by nama, filter task by status) di level backend, supaya tidak semua filtering dilakukan client-side seperti pola yang dipakai `MataKuliahList.tsx`.
- [ ] Refresh-token flow (`renewSession`) sudah ada di backend & sudah dipanggil dari `lib/api.ts`, tapi belum ada test end-to-end yang mengonfirmasi token expiry benar-benar ter-handle mulus di UI (misal: user sedang mengisi form lalu token expired di tengah jalan).
- [ ] Pertimbangkan menyatukan pola state management: setelah subject & task selesai dimigrasi ke TanStack Query, evaluasi apakah `schedule-store.tsx` (dipakai `ScheduleList.tsx`) juga perlu migrasi serupa, supaya seluruh app konsisten satu pola data-fetching.