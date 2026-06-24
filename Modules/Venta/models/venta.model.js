export class Venta {
  constructor(data = {}) {
    this.saleId = data.saleId ?? data.SaleId ?? data.id ?? data.Id ?? 0;
    this.appointmentId = data.appointmentId ?? data.AppointmentId ?? 0;
    this.saleDate = data.saleDate ?? data.SaleDate ?? '';
    this.patientId = data.patientId ?? data.PatientId ?? 0;
    this.doctorId = data.doctorId ?? data.DoctorId ?? 0;
    this.patientName = data.patientName ?? data.PatientName ?? 'Paciente no asignado';
    this.doctorName = data.doctorName ?? data.DoctorName ?? 'Doctor no asignado';
    this.details = data.details ?? data.Details ?? [];
    this.total = Number(data.total ?? data.Total ?? data.totalAmount ?? data.TotalAmount ?? 0);
    this.servicesCount = Number(
      data.servicesCount ??
      data.ServicesCount ??
      (Array.isArray(this.details) ? this.details.length : 0)
    );
  }

  get codigo() {
    return `VTA-${String(this.saleId).padStart(3, '0')}`;
  }

  get codigoCita() {
    return `CIT-${String(this.appointmentId).padStart(3, '0')}`;
  }

  get fechaInput() {
    if (!this.saleDate) return '';

    const fechaTexto = String(this.saleDate).split(' ')[0];

    if (fechaTexto.includes('/')) {
      const [dia, mes, anio] = fechaTexto.split('/');
      if (!dia || !mes || !anio) return '';
      return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }

    if (fechaTexto.includes('-')) {
      return fechaTexto.substring(0, 10);
    }

    return '';
  }

  get fechaFormateada() {
    if (!this.fechaInput) return 'Sin fecha';

    const fecha = new Date(`${this.fechaInput}T00:00:00`);
    if (Number.isNaN(fecha.getTime())) return this.saleDate;

    return fecha.toLocaleDateString('es-NI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  get totalCalculado() {
    if (this.total > 0) return this.total;
    if (!Array.isArray(this.details)) return 0;

    return this.details.reduce((total, detalle) => {
      const quantity = Number(detalle.quantity ?? detalle.Quantity ?? 0);
      const cost = Number(detalle.cost ?? detalle.Cost ?? detalle.unitCost ?? detalle.UnitCost ?? 0);
      return total + quantity * cost;
    }, 0);
  }

  get totalFormateado() {
    return new Intl.NumberFormat('es-NI', {
      style: 'currency',
      currency: 'NIO'
    }).format(this.totalCalculado);
  }

  get cantidadServicios() {
    if (this.servicesCount > 0) return this.servicesCount;
    return Array.isArray(this.details) ? this.details.length : 0;
  }
}
