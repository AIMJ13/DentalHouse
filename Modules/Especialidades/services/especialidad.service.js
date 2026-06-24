import { HttpService } from '../../Core/Services/http.service.js';
import { Especialidad } from '../models/especialidad.model.js';

export class EspecialidadService {
  constructor() {
    this.http = new HttpService();
  }

  async obtenerPorId(id) {
    const respuesta = await this.http.get(`/Specialty/${id}`);
    const datos = respuesta.data ?? respuesta.Data ?? respuesta;

    return new Especialidad(datos);
  }

  async obtenerPaginado(pageNumber = 1, pageSize = 10) {
    const respuesta = await this.http.get('/Specialty', { pageNumber, pageSize });

    const lista = respuesta.data ?? respuesta.Data ?? respuesta.items ?? respuesta.Items ?? [];
    const pagination = respuesta.pagination ?? respuesta.Pagination ?? respuesta;

    const registros = Array.isArray(lista) ? lista : [];

    const especialidades = registros.map((item) => new Especialidad(item));

    return {
      data: especialidades,
      pageNumber: pagination.pageNumber ?? pagination.PageNumber ?? pageNumber,
      pageSize: pagination.pageSize ?? pagination.PageSize ?? pageSize,
      totalRecords: pagination.totalRecords ?? pagination.TotalRecords ?? registros.length,
      totalPages: pagination.totalPages ?? pagination.TotalPages ?? 1
    };
  }

  async crear(especialidad) {
    return await this.http.post('/Specialty', {
      specialtyName: especialidad.specialtyName,
      specialtyId: 0,
      state: especialidad.state
    });
  }

  async actualizar(id, especialidad) {
    return await this.http.put(`/Specialty/${id}`, {
      specialtyName: especialidad.specialtyName,
      specialtyId: Number(id),
      state: especialidad.state
    });
  }

  async cambiarEstado(id, state) {
    const especialidadActual = await this.obtenerPorId(id);

    return await this.http.put(`/Specialty/${id}`, {
      specialtyName: especialidadActual.specialtyName,
      specialtyId: Number(id),
      state: state
    });
  }
}