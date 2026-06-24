import { HttpService } from '../../Core/Services/http.service.js';
import { Venta } from '../models/venta.model.js';

export class VentaService {
  constructor() {
    this.http = new HttpService();
  }

  obtenerListaDesdeRespuesta(respuesta) {
    const contenedor = respuesta?.data ?? respuesta?.Data ?? respuesta;
    const lista = Array.isArray(contenedor)
      ? contenedor
      : contenedor?.data ?? contenedor?.Data ?? [];

    return Array.isArray(lista) ? lista : [];
  }

  async obtenerPaginado(pageNumber = 1, pageSize = 10) {
    const respuesta = await this.http.get('/Sales', { pageNumber, pageSize });
    const lista = this.obtenerListaDesdeRespuesta(respuesta);

    return {
      data: lista.map((item) => new Venta(item)),
      pageNumber: respuesta?.pageNumber ?? respuesta?.PageNumber ?? pageNumber,
      pageSize: respuesta?.pageSize ?? respuesta?.PageSize ?? pageSize,
      totalRecords: respuesta?.totalRecords ?? respuesta?.TotalRecords ?? lista.length,
      totalPages: respuesta?.totalPages ?? respuesta?.TotalPages ?? 1
    };
  }

  async obtenerPorId(id) {
    const respuesta = await this.http.get(`/Sales/${id}`);
    const data = respuesta?.data ?? respuesta?.Data ?? respuesta;
    return new Venta(data);
  }

  async crear(venta) {
    return this.http.post('/Sales', {
      appointmentId: Number(venta.appointmentId),
      details: venta.details.map((detalle) => ({
        serviceId: Number(detalle.serviceId),
        quantity: Number(detalle.quantity)
      }))
    });
  }

  async obtenerCitas(pageNumber = 1, pageSize = 100) {
    const respuesta = await this.http.get('/Appointment', { pageNumber, pageSize });
    return this.obtenerListaDesdeRespuesta(respuesta);
  }

  async obtenerServicios(pageNumber = 1, pageSize = 100) {
    const respuesta = await this.http.get('/Service', { pageNumber, pageSize });
    return this.obtenerListaDesdeRespuesta(respuesta);
  }
}
