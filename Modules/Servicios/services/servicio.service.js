import { HttpService } from '../../Core/Services/http.service.js';
import { Servicio } from '../models/servicio.model.js';

export class ServicioService {
  constructor() {
    this.http = new HttpService();
  }

  async obtenerPaginado(pageNumber = 1, pageSize = 10) {
    const respuesta = await this.http.get('/Service', {
      pageNumber: pageNumber,
      pageSize: pageSize
    });

    console.log('Respuesta completa Service:', respuesta);

    const contenedor = respuesta.data ?? respuesta.Data ?? respuesta;

    const lista =
      Array.isArray(contenedor)
        ? contenedor
        : contenedor.data ?? contenedor.Data ?? [];

    const registros = Array.isArray(lista) ? lista : [];

    return {
      data: registros.map((item) => new Servicio(item)),
      pageNumber: contenedor.pageNumber ?? contenedor.PageNumber ?? respuesta.pageNumber ?? respuesta.PageNumber ?? pageNumber,
      pageSize: contenedor.pageSize ?? contenedor.PageSize ?? respuesta.pageSize ?? respuesta.PageSize ?? pageSize,
      totalRecords: contenedor.totalRecords ?? contenedor.TotalRecords ?? respuesta.totalRecords ?? respuesta.TotalRecords ?? registros.length,
      totalPages: contenedor.totalPages ?? contenedor.TotalPages ?? respuesta.totalPages ?? respuesta.TotalPages ?? 1
    };
  }

  async crear(servicio) {
    return await this.http.post('/Service', {
      serviceId: 0,
      serviceName: servicio.serviceName,
      cost: String(servicio.cost),
      state: servicio.state
    });
  }

  async actualizar(id, servicio) {
    return await this.http.put(`/Service/${id}`, {
      serviceId: Number(id),
      serviceName: servicio.serviceName,
      cost: String(servicio.cost),
      state: servicio.state
    });
  }

  async cambiarEstado(id, state) {
    return await this.http.patch(`/Service/${id}/state?state=${state}`);
  }
}