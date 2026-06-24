export class Cita {
  constructor(data = {}) {
    this.appointmentId = data.appointmentId ?? data.AppointmentId ?? data.id ?? data.Id ?? 0;
    this.date = data.date ?? data.Date ?? '';
    this.time = data.time ?? data.Time ?? '';
    this.reason = data.reason ?? data.Reason ?? '';
    this.patientId = Number(data.patientId ?? data.PatientId ?? 0);
    this.doctorId = Number(data.doctorId ?? data.DoctorId ?? 0);
    this.patientName = data.patientName ?? data.PatientName ?? 'Paciente no asignado';
    this.doctorName = data.doctorName ?? data.DoctorName ?? 'Doctor no asignado';
    this.status = data.status ?? data.Status ?? 'Programada';
  }

  get codigo() {
    return `CIT-${String(this.appointmentId).padStart(3, '0')}`;
  }

  get fechaInput() {
    if (!this.date) return '';

    const fechaTexto = String(this.date).split(' ')[0];

    if (fechaTexto.includes('/')) {
      const partes = fechaTexto.split('/');

      if (partes.length === 3) {
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const anio = partes[2];

        return `${anio}-${mes}-${dia}`;
      }
    }

    if (fechaTexto.includes('-')) {
      return fechaTexto.substring(0, 10);
    }

    return '';
  }

  get horaInput() {
    if (!this.time) return '';
    return String(this.time).substring(0, 5);
  }

  get fechaFormateada() {
    if (!this.fechaInput) return 'Sin fecha';

    const fecha = new Date(`${this.fechaInput}T00:00:00`);

    if (Number.isNaN(fecha.getTime())) {
      return this.date;
    }

    return fecha.toLocaleDateString('es-NI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  get estadoTexto() {
    const estado = String(this.status).trim().toLowerCase();

    if (estado === 'completada') return 'Completada';
    if (estado === 'cancelada') return 'Cancelada';
    if (estado === 'no asistió' || estado === 'no asistio' || estado === 'noasistio') return 'No asistió';

    return 'Programada';
  }

  get estadoClase() {
    if (this.estadoTexto === 'Completada') return 'completada';
    if (this.estadoTexto === 'Cancelada') return 'cancelada';
    if (this.estadoTexto === 'No asistió') return 'no-asistio';

    return 'programada';
  }

  get estaProgramada() {
    return this.estadoTexto === 'Programada';
  }
}