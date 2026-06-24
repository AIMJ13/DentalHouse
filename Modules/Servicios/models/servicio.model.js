export class Servicio {
  constructor(data = {}) {
    this.serviceId = data.serviceId ?? data.ServiceId ?? data.id ?? data.Id ?? 0;
    this.serviceName = data.serviceName ?? data.ServiceName ?? '';
    this.cost = Number(data.cost ?? data.Cost ?? 0);

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
    return `SRV-${String(this.serviceId).padStart(3, '0')}`;
  }

  get estadoTexto() {
    return this.state ? 'Activo' : 'Inactivo';
  }

  get estadoClase() {
    return this.state ? 'active' : 'inactive';
  }

  get costoFormateado() {
    return `C$ ${this.cost.toFixed(2)}`;
  }
}