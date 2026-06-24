export class Especialidad {
  constructor(data = {}) {
    this.specialtyId = Number(data.specialtyId ?? data.SpecialtyId ?? data.id ?? data.Id ?? 0);

    this.specialtyName = data.specialtyName ?? data.SpecialtyName ?? data.name ?? data.Name ?? '';

    const estado = this.convertirABooleano(
      data.state ?? data.State ?? data.isActive ?? data.IsActive ?? true
    );

    this.state = estado;
    this.isActive = estado;
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
    return this.specialtyId > 0 ? `ESP-${String(this.specialtyId).padStart(3, '0')}` : 'ESP-000';
  }

  get estaActiva() {
    return this.state;
  }

  get estadoTexto() {
    return this.estaActiva ? 'Activo' : 'Inactivo';
  }

  get estadoClase() {
    return this.estaActiva ? 'active' : 'inactive';
  }

  coincideCon(texto) {
    const busqueda = texto.trim().toLowerCase();

    if (!busqueda) return true;

    return this.codigo.toLowerCase().includes(busqueda) ||
      this.specialtyName.toLowerCase().includes(busqueda) ||
      String(this.specialtyId).includes(busqueda);
  }
}