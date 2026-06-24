export class Doctor {
  constructor(data = {}) {
    this.doctorId = data.doctorId ?? data.DoctorId ?? data.id ?? data.Id ?? 0;
    this.firstName = data.firstName ?? data.FirstName ?? '';
    this.lastName = data.lastName ?? data.LastName ?? '';
    this.phone = data.phone ?? data.Phone ?? '';
    this.specialtyId = Number(data.specialtyId ?? data.SpecialtyId ?? 0);
    this.specialtyName = data.specialtyName ?? data.SpecialtyName ?? 'Sin especialidad';

    const estado =
      data.state ??
      data.State ??
      data.isActive ??
      data.IsActive ??
      true;

    this.state = this.convertirABooleano(estado);
  }

  convertirABooleano(valor) {
    if (valor === true || valor === 1 || valor === '1' || valor === 'true' || valor === 'True') {
      return true;
    }

    if (valor === false || valor === 0 || valor === '0' || valor === 'false' || valor === 'False') {
      return false;
    }

    return true;
  }

  get codigo() {
    return `DOC-${String(this.doctorId).padStart(3, '0')}`;
  }

  get nombreCompleto() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get nombreConTitulo() {
    return `Dr. ${this.nombreCompleto}`;
  }

  get estadoTexto() {
    return this.state ? 'Activo' : 'Inactivo';
  }

  get estadoClase() {
    return this.state ? 'active' : 'inactive';
  }
}