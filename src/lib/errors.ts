const ERROR_MESSAGES: Record<number, string> = {
  400: 'La solicitud contiene datos inválidos. Revisa los campos e intenta de nuevo.',
  401: 'Tu sesión expiró. Inicia sesión de nuevo.',
  403: 'No tienes acceso a este recurso.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'Ya existe un registro con estos datos.',
  429: 'Has alcanzado el límite de solicitudes. Intenta de nuevo en unos minutos.',
  500: 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.',
};

export function getErrorMessage(status: number, fallback?: string): string {
  return ERROR_MESSAGES[status] ?? fallback ?? 'No se pudo completar la solicitud. Intenta de nuevo.';
}

export function extractApiError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const resp = (error as { response?: { status?: number; data?: { detail?: string | ValidationError[] } } }).response;
    const detail = resp?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((e) => e.msg).join('. ');
    }
    if (resp?.status) return getErrorMessage(resp.status);
  }
  return 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
}

interface ValidationError {
  type: string;
  loc: (string | number)[];
  msg: string;
  input: unknown;
}
