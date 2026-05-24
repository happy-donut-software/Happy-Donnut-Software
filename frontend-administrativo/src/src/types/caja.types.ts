/**
 * Tipos relacionados con Caja
 */

import { MetodoPago } from './ventas.types';

export type TipoMovimiento = 'Ingreso' | 'Egreso';

export interface CajaAbierta {
  fecha: string;
  hora: string;
  fondoInicial: number;
  fondoInicialYape: number;
  fondoInicialPlin: number;
  usuario: string;
}

export interface MovimientoCaja {
  id: number;
  fecha: string;
  hora: string;
  tipo: TipoMovimiento;
  concepto: string;
  metodoPago: MetodoPago | 'N/A';
  monto: number;
  referencia?: string;
  usuario: string;
}

export interface CierreCaja {
  id: number;
  fecha: string;
  horaApertura: string;
  horaCierre: string;
  usuario: string;
  fondoInicial: number;
  fondoInicialYape: number;
  fondoInicialPlin: number;
  ventasEfectivo: number;
  ventasYape: number;
  ventasPlin: number;
  totalVentas: number;
  egresosEfectivo: number;
  egresosYape: number;
  egresosPlin: number;
  totalEgresos: number;
  efectivoEsperado: number;
  efectivoContado: number;
  yapeEsperado: number;
  yapeContado: number;
  plinEsperado: number;
  plinContado: number;
  diferenciaEfectivo: number;
  diferenciaYape: number;
  diferenciaPlin: number;
  observaciones: string;
}
