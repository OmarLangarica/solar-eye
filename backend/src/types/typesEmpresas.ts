export interface Empresa {
    id: number;
    nombre: string;
    logo_url?: string;
    color_primario?: string;
    color_secundario?: string;
    plan: 'basico' | 'profesional' | 'enterprise';
    activo: boolean;
}

export interface EmpresaNueva {
    nombre: string;
    logo_url?: string;
    color_primario?: string;
    color_secundario?: string;
    plan: 'basico' | 'profesional' | 'enterprise';
    activo: boolean;
}