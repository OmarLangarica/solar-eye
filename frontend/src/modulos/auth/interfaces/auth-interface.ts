export interface UsuarioAuth {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    rol: 'superadmin' | 'usuario';
    activo: boolean;
    // Datos de la empresa activa en sesión
    empresa_id?: number | null;
    empresa_nombre?: string | null;
    empresa_color_primario?: string | null;
    empresa_color_secundario?: string | null;
    rol_empresa?: 'admin' | 'trabajador' | null;
}

export interface LoginCredenciales {
    email: string;
    password: string;
}

export interface RegistroData {
    nombre: string;
    apellido: string;
    email: string;
    password_hash: string;
    telefono?: string | null;
}