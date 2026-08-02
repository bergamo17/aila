CREATE TABLE "mahasiswa" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"nim" varchar(20) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"jurusan" varchar(100) NOT NULL,
	"angkatan" integer NOT NULL,
	"email" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mahasiswa_nim_unique" UNIQUE("nim")
);
--> statement-breakpoint
CREATE TABLE "mata_kuliah" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"kode_mk" varchar(20) NOT NULL,
	"nama_mk" varchar(255) NOT NULL,
	"sks" integer NOT NULL,
	"dosen_pengampu" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mata_kuliah_kode_mk_unique" UNIQUE("kode_mk")
);
--> statement-breakpoint
CREATE TABLE "nilai" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"mahasiswa_id" bigint NOT NULL,
	"mata_kuliah_id" bigint NOT NULL,
	"nilai_huruf" varchar(2) NOT NULL,
	"semester" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nilai_mahasiswa_id_mata_kuliah_id_semester_unique" UNIQUE("mahasiswa_id","mata_kuliah_id","semester")
);
--> statement-breakpoint
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_mahasiswa_id_mahasiswa_id_fk" FOREIGN KEY ("mahasiswa_id") REFERENCES "public"."mahasiswa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_mata_kuliah_id_mata_kuliah_id_fk" FOREIGN KEY ("mata_kuliah_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE cascade ON UPDATE no action;