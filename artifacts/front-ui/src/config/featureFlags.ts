export type FeatureFlagKey = 
    | 'ENABLE_MAHASISWA_MENU'
    | 'ENABLE_MATA_KULIAH_MENU'
    | 'ENABLE_NILAI_MENU';

export const FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = {
    ENABLE_MAHASISWA_MENU: import.meta.env.VITE_ENABLE_MAHASISWA == 'false',
    ENABLE_MATA_KULIAH_MENU: true,
    ENABLE_NILAI_MENU: true,
};