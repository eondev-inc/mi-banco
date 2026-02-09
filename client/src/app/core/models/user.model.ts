// ==================== User & Auth Models ====================

export interface User {
  _id?: string;
  nombre: string;
  email: string;
  rut: string;
  saldo?: number;
}

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  rut: string;
  password: string;
}

// ==================== Beneficiary & Transfer Models ====================

export interface Beneficiary {
  _id?: string;
  rut_destinatario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  banco: string;
  numero_cuenta: string;
  tipo_cuenta: string;
  rut_cliente: string;
}

export interface Transfer {
  _id?: string;
  rut_destinatario: string;
  rut_cliente: string;
  nombre: string;
  email?: string;  // Required by backend API
  banco: string;
  tipo_cuenta: string;
  monto: number;
  fecha?: string;
  estado?: 'completada' | 'pendiente' | 'rechazada';
}

export interface Bank {
  name: string;
  id: string;
}

export interface AccountSummary {
  saldo: number;
  ingresos: number;
  egresos: number;
  transferenciasRecientes: number;
}

// ==================== API Response Types ====================

/**
 * Standard API response wrapper from NestJS backend
 */
export interface ApiResponse<T> {
  ok: boolean;
  body: T;
}

/**
 * API error response body
 */
export interface ApiErrorBody {
  message: string;
  error?: string;
}

/**
 * Response bodies for specific endpoints
 */
export interface LoginResponseBody {
  usuario: User;
}

export interface RegisterResponseBody {
  usuario: User;
}

export interface DestinatariosResponseBody {
  destinatarios: Beneficiary[];
}

export interface HistorialResponseBody {
  historial: Transfer[];
}

export interface CreateResponseBody<T = any> {
  message: string;
  created: T;
}
