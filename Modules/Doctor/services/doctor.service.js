import { HttpService } from '../../Core/Services/http.service.js';
import { Doctor } from '../models/doctor.model.js';

export class DoctorService {
  constructor() {
    this.http = new HttpService();
  }

  async obtenerPaginado(pageNumber = 1, pageSize = 10) {
    const respuesta = await this.http.get('/Doctor', {
      pageNumber: pageNumber,
      pageSize: pageSize
    });

    console.log('Respuesta completa Doctor:', respuesta);

    const lista = respuesta.data ?? respuesta.Data ?? [];

    const registros = Array.isArray(lista) ? lista : [];

    return {
      data: registros.map((item) => new Doctor(item)),
      pageNumber: respuesta.pageNumber ?? respuesta.PageNumber ?? pageNumber,
      pageSize: respuesta.pageSize ?? respuesta.PageSize ?? pageSize,
      totalRecords: respuesta.totalRecords ?? respuesta.TotalRecords ?? registros.length,
      totalPages: respuesta.totalPages ?? respuesta.TotalPages ?? 1
    };
  }

  async obtenerEspecialidades(pageNumber = 1, pageSize = 100) {
    const respuesta = await this.http.get('/Specialty', {
      pageNumber: pageNumber,
      pageSize: pageSize
    });

    const lista = respuesta.data ?? respuesta.Data ?? [];

    return Array.isArray(lista) ? lista : [];
  }

  async crear(doctor) {
    return await this.http.post('/Doctor', {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      phone: doctor.phone,
      specialtyId: Number(doctor.specialtyId),
      state: doctor.state
    });
  }

  async actualizar(id, doctor) {
    return await this.http.put(`/Doctor/${id}`, {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      phone: doctor.phone,
      specialtyId: Number(doctor.specialtyId),
      state: doctor.state
    });
  }

  async cambiarEstado(id, state) {
    return await this.http.patch(`/Doctor/${id}/state?state=${state}`);
  }
}