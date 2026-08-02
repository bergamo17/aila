/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENABLE_MAHASISWA?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}