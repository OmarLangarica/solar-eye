export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    rol: 'superadmin' | 'usuario';
    activo: boolean;
}

export interface UsuarioNuevo {
    nombre: string;
    apellido: string;
    email: string;
    password_hash: string;
    telefono?: string | null;
    rol: 'superadmin' | 'usuario';
    activo: boolean;
}

export interface UsuarioActualizar {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string | null;
    activo: boolean;
}