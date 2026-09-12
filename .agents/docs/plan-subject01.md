# Menghubungkan API Go ke Frontend (React + TanStack Query)

Panduan umum yang bisa dipakai setiap kali selesai membuat endpoint baru di backend Go, supaya bisa langsung dipakai di UI.

## 1. Samakan tipe request/response

Setiap kali handler Go baru selesai, salin persis field JSON-nya (nama, tipe) ke interface TypeScript di frontend. Ini sumber bug paling sering — tipe FE ketinggalan zaman dari struct Go.

**Checklist:**
- Cocokkan nama field JSON (`snake_case` dari Go, jangan diubah ke `camelCase` di interface kecuali memang di-mapping manual).
- Cocokkan tipe (`int64` di Go → `number` di TS, `time.Time` → `string`).
- Jangan lupa field tambahan pada response varian (contoh: response list yang punya field ekstra dibanding response single-item).

## 2. Buat fungsi pemanggil API

Tambahkan fungsi di `src/api/<resource>.ts` yang memanggil `apiFetch` dengan path, method, dan body yang sesuai route Gin-nya.

**Checklist:**
- Path harus sama persis dengan yang didaftarkan di `server.go` (`router.POST(...)`, dll).
- Method HTTP harus cocok.
- Set `requireAuth: true` kalau route ada di grup `authRoutes` (butuh token).
- Return type fungsi harus pakai interface dari langkah 1.

## 3. Bungkus dengan TanStack Query

Jangan konsumsi fungsi API langsung di komponen. Buat hook `useQuery` (untuk GET) dan `useMutation` (untuk POST/PUT/DELETE) supaya loading, error, dan cache invalidation tertangani otomatis.

**Checklist:**
- Satu `queryKey` konsisten per resource, dipakai ulang untuk invalidation.
- `useMutation` selalu `invalidateQueries` di `onSuccess` supaya data ter-refresh.
- Jangan bikin state loading/error manual — biarkan TanStack Query yang urus.

## 4. Cek CORS di backend

Pastikan origin, method, dan header yang dipakai frontend (`Authorization`, `Content-Type`) diizinkan di `cors.Config` Gin. Kalau frontend jalan di port lain, tambahkan ke `AllowOrigins`.

**Checklist:**
- `AllowOrigins` mencakup URL dev server (mis. `http://localhost:5173`) dan URL production nanti.
- `AllowMethods` mencakup method yang dipakai (GET, POST, PUT, DELETE).
- `AllowHeaders` mencakup `Authorization` kalau pakai Bearer token.

## 5. Hubungkan ke komponen halaman

Ganti sumber data di halaman dari mock/local state ke hook TanStack Query yang baru dibuat, sesuaikan nama field yang dipakai di JSX.

**Checklist:**
- Pastikan tidak ada lagi komponen yang mengimpor dari store mock/dummy data.
- Sesuaikan semua referensi field di JSX ke nama field JSON asli (`subject_name`, bukan `name`, dst).
- Tangani state `isLoading` dan `error` dari hook di UI (skeleton, pesan error, dsb).

## 6. Test end-to-end

Curl/Postman dulu ke endpoint Go untuk pastikan response-nya benar, lalu cek dari UI dengan tab Network browser untuk lihat request/response aslinya.

**Checklist:**
- Test endpoint langsung (curl/Postman) dengan token valid — pastikan status code dan bentuk response sesuai ekspektasi.
- Buka tab Network di browser saat pakai fitur dari UI — cek request payload dan response benar-benar sesuai.
- Cek console browser untuk error runtime (mismatch tipe, field undefined, dsb).