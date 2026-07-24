export interface MovimientoCajaApi {
  id: string;
  tipo: string;
  monto: number;
  fecha_hora: string;
  descripcion?: string | null;
  es_entrada: boolean;
}

export interface TurnoCajaApi {
  id: string;
  cajero_id: string;
  monto_apertura: number;
  fecha_inicio: string;
  estado: "abierto" | "cerrado";
  saldo_esperado: number;
  movimientos: MovimientoCajaApi[];
}

export interface EstadoCajaApi {
  abierto: boolean;
  turno: TurnoCajaApi | null;
}

async function solicitar<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validacion = data.errors ? Object.values(data.errors).flat().join(" ") : "";
    throw new Error(validacion || data.error || data.message || "La operación fue rechazada.");
  }
  return data as T;
}

export const obtenerCajaActual = () => solicitar<EstadoCajaApi>("/api/finanzas/caja/actual");

export const abrirCaja = (cajeroId: string, montoApertura: number) =>
  solicitar<{ turno_id: string; estado: string }>("/api/finanzas/caja/abrir", {
    method: "POST",
    body: JSON.stringify({ cajero_id: cajeroId, monto_apertura: montoApertura }),
  });

export const cerrarCaja = (dineroFisicoReal: number) =>
  solicitar<{ turno_id: string; estado: string }>("/api/finanzas/caja/cerrar", {
    method: "POST",
    body: JSON.stringify({ dinero_fisico_real: dineroFisicoReal }),
  });
