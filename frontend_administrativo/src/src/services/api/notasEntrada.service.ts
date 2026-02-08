import { API_CONFIG, buildURL } from '../../config/api.config';

export interface NotaEntrada {
  id: number;
  numero: string;
  fecha: string;
  hora: string;
  motivo: "Por Compra" | "Por Producción Interna" | "Por Devolución de Cliente" | "Por Ajuste de Inventario" | "Por Donación/Cortesía";
  doc_referencia?: string;
  productos: ProductoNE[];
  observaciones?: string;
  usuario: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductoNE {
  id: number;
  nombre_producto: string;
  cantidad: number;
  unidad: string;
  producto?: {
    id: number;
    nombre_producto: string;
    stock: number;
  };
}

export interface CreateNotaEntradaRequest {
  fecha: string;
  hora: string;
  motivo: string;
  doc_referencia?: string;
  observaciones?: string;
  usuario: string;
  productos: {
    producto_id: number;
    cantidad: number;
    unidad: string;
  }[];
}

export interface NotaEntradaResponse {
  data: NotaEntrada[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

class NotasEntradaService {
  private baseURL = API_CONFIG.baseURL;

  // Obtener todas las notas de entrada con filtros
  async getAll(params?: {
    search?: string;
    motivo?: string;
    page?: number;
  }): Promise<NotaEntradaResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.motivo && params.motivo !== 'todos') queryParams.append('motivo', params.motivo);
    if (params?.page) queryParams.append('page', params.page.toString());

    const url = buildURL(`/v1/notas-entrada${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Obtener una nota de entrada por ID
  async getById(id: number): Promise<NotaEntrada> {
    const url = buildURL(`/v1/notas-entrada/${id}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // Crear una nueva nota de entrada
  async create(data: CreateNotaEntradaRequest): Promise<NotaEntrada> {
    const url = buildURL('/v1/notas-entrada');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // Actualizar una nota de entrada
  async update(id: number, data: Partial<CreateNotaEntradaRequest>): Promise<NotaEntrada> {
    const url = buildURL(`/v1/notas-entrada/${id}`);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // Eliminar una nota de entrada
  async delete(id: number): Promise<void> {
    const url = buildURL(`/v1/notas-entrada/${id}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }
  }

  // Obtener los motivos disponibles
  async getMotivos(): Promise<string[]> {
    const url = buildURL('/v1/notas-entrada/motivos');
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // Generar el siguiente número de nota de entrada
  async generarSiguienteNumero(): Promise<string> {
    // Por ahora, implementamos una lógica simple en el frontend
    // En el futuro, esto podría venir del backend
    const response = await this.getAll();
    const notas = response.data;
    const ultimoNumero = notas.length > 0 
      ? Math.max(...notas.map(n => parseInt(n.numero.replace('NE-', ''))))
      : 0;
    
    return `NE-${String(ultimoNumero + 1).padStart(6, '0')}`;
  }
}

export const notasEntradaService = new NotasEntradaService();
