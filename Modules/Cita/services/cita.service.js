import { HttpService } from '../../Core/Services/http.service.js';
import { Cita } from '../models/cita.model.js';

export class CitaService {
  constructor() {
    this.http = new HttpService();
  }

  async obtenerPaginado(pageNumber = 1, pageSize = 10) {
    const respuesta = await this.http.get('/Appointment', {
      pageNumber: pageNumber,
      pageSize: pageSize
    });

    console.log('Respuesta completa Appointment:', respuesta);

    const lista =
      respuesta.data ??
      respuesta.Data ??
      [];

    const registros = Array.isArray(lista) ? lista : [];

    return {
      data: registros.map((item) => new Cita(item)),
      pageNumber: respuesta.pageNumber ?? respuesta.PageNumber ?? pageNumber,
      pageSize: respuesta.pageSize ?? respuesta.PageSize ?? pageSize,
      totalRecords: respuesta.totalRecords ?? respuesta.TotalRecords ?? registros.length,
      totalPages: respuesta.totalPages ?? respuesta.TotalPages ?? 1
    };
  }

  async obtenerPacientes(pageNumber = 1, pageSize = 100) {
    const respuesta = await this.http.get('/Patient', {
      pageNumber: pageNumber,
      pageSize: pageSize
    });

    const lista = respuesta.data ?? respuesta.Data ?? [];

    return Array.isArray(lista) ? lista : [];
  }

  async obtenerDoctores(pageNumber = 1, pageSize = 100) {
    const respuesta = await this.http.get('/Doctor', {
      pageNumber: pageNumber,
      pageSize: pageSize
    });

    const lista = respuesta.data ?? respuesta.Data ?? [];

    return Array.isArray(lista) ? lista : [];
  }

  async crear(cita) {
    return await this.http.post('/Appointment', {
      date: cita.date,
      time: cita.time,
      reason: cita.reason,
      patientId: Number(cita.patientId),
      doctorId: Number(cita.doctorId)
    });
  }

  async actualizar(id, cita) {
    return await this.http.put(`/Appointment/${id}`, {
      date: cita.date,
      time: cita.time,
      reason: cita.reason,
      patientId: Number(cita.patientId),
      doctorId: Number(cita.doctorId)
    });
  }

  async eliminar(id) {
    return await this.http.delete(`/Appointment/${id}`);
  }

  async cambiarEstado(id, status) {
  return await this.http.patch(`/Appointment/${id}/status?status=${encodeURIComponent(status)}`);
}
}