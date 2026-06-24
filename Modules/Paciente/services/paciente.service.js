import { HttpService } from '../../Core/Services/http.service.js';
import { Paciente } from '../models/paciente.model.js';

export class PacienteService {
  constructor() {
    this.http = new HttpService();
  }

  async obtenerPaginado(pageNumber = 1, pageSize = 10) {
    const respuesta = await this.http.get('/Patient', { pageNumber, pageSize });
    const lista = respuesta.data ?? respuesta.Data ?? [];
    const registros = Array.isArray(lista) ? lista : [];

    return {
      data: registros.map((item) => new Paciente(item)),
      pageNumber: respuesta.pageNumber ?? respuesta.PageNumber ?? pageNumber,
      pageSize: respuesta.pageSize ?? respuesta.PageSize ?? pageSize,
      totalRecords: respuesta.totalRecords ?? respuesta.TotalRecords ?? registros.length,
      totalPages: respuesta.totalPages ?? respuesta.TotalPages ?? 1
    };
  }

  async crear(paciente) {
    return await this.http.post('/Patient', this.crearPayload(paciente));
  }

  async actualizar(id, paciente) {
    return await this.http.put(`/Patient/${id}`, this.crearPayload(paciente, id));
  }

  async cambiarEstado(id, isActive) {
    return await this.http.patch(`/Patient/${id}/state?state=${isActive}`);
  }

  crearPayload(paciente, id = null) {
    const isActive = paciente.isActive ?? paciente.state ?? true;

    const payload = {
      firstName: paciente.firstName,
      lastName: paciente.lastName,
      phone: paciente.phone,
      address: paciente.address,
      birthDate: paciente.birthDate,
      isActive,
      state: isActive
    };

    if (id !== null) {
      payload.patientId = Number(id);
    }

    return payload;
  }
}
