export class Paciente {
  constructor(data = {}) {
    this.patientId = Number(data.patientId ?? data.PatientId ?? data.id ?? data.Id ?? 0);
    this.firstName = data.firstName ?? data.FirstName ?? '';
    this.lastName = data.lastName ?? data.LastName ?? '';
    this.phone = data.phone ?? data.Phone ?? '';
    this.address = data.address ?? data.Address ?? '';
    this.birthDate = data.birthDate ?? data.BirthDate ?? '';
    this.isActive = data.isActive ?? data.IsActive ?? data.state ?? data.State ?? true;
  }

  get codigo() {
    return this.patientId > 0 ? `PAC-${String(this.patientId).padStart(3, '0')}` : 'PAC-000';
  }

  get nombreCompleto() {
    return `${this.firstName} ${this.lastName}`.trim() || 'Paciente sin nombre';
  }

  get estaActivo() {
    return this.isActive === true ||
      this.isActive === 1 ||
      this.isActive === '1' ||
      this.isActive === 'true' ||
      this.isActive === 'True';
  }

  get estadoTexto() {
    return this.estaActivo ? 'Activo' : 'Inactivo';
  }

  get estadoClase() {
    return this.estaActivo ? 'active' : 'inactive';
  }

  get fechaNacimientoFormateada() {
    if (!this.birthDate) return 'Sin fecha';

    const fechaTexto = String(this.birthDate).split('T')[0].split(' ')[0];

    if (fechaTexto.includes('/')) {
      const [dia, mes, anio] = fechaTexto.split('/');
      return dia && mes && anio
        ? `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`
        : fechaTexto;
    }

    if (fechaTexto.includes('-')) {
      const [anio, mes, dia] = fechaTexto.split('-');
      return dia && mes && anio
        ? `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`
        : fechaTexto;
    }

    return fechaTexto;
  }

  coincideCon(texto) {
    const busqueda = texto.trim().toLowerCase();

    if (!busqueda) return true;

    return this.codigo.toLowerCase().includes(busqueda) ||
      this.nombreCompleto.toLowerCase().includes(busqueda) ||
      this.phone.toLowerCase().includes(busqueda) ||
      this.address.toLowerCase().includes(busqueda) ||
      String(this.patientId).includes(busqueda);
  }
}
