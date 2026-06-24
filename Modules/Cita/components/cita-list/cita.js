import { protegerPorRol } from '../../../Core/Guards/auth.guard.js';
import { CitaService } from '../../services/cita.service.js';

protegerPorRol(['Administrador', 'Recepcionista', 'Doctor']);

const citaService = new CitaService();

const tbodyCitas = document.querySelector('#citas-tbody');
const inputBuscar = document.querySelector('#input-buscar-cita');
const btnNuevaCita = document.querySelector('#btn-nueva-cita');

const totalCitas = document.querySelector('#total-citas');
const totalProgramadas = document.querySelector('#total-programadas');
const totalCompletadas = document.querySelector('#total-completadas');
const totalCanceladas = document.querySelector('#total-canceladas');
const totalNoAsistio = document.querySelector('#total-no-asistio');

const filtroFecha = document.querySelector('#filtro-fecha');
const filtroEstado = document.querySelector('#filtro-estado');
const filtroDoctor = document.querySelector('#filtro-doctor');
const btnHoy = document.querySelector('#btn-hoy');
const btnLimpiarFiltros = document.querySelector('#btn-limpiar-filtros');

const paginationInfo = document.querySelector('#pagination-info');
const btnAnterior = document.querySelector('#btn-anterior');
const btnSiguiente = document.querySelector('#btn-siguiente');
const selectPageSize = document.querySelector('#page-size');

const modalCita = document.querySelector('#modal-cita');
const modalTitle = document.querySelector('#modal-title');
const btnCerrarModal = document.querySelector('#btn-cerrar-modal');

const formCita = document.querySelector('#form-cita');
const inputAppointmentId = document.querySelector('#appointmentId');
const selectPatientId = document.querySelector('#patientId');
const selectDoctorId = document.querySelector('#doctorId');
const inputDate = document.querySelector('#date');
const inputTime = document.querySelector('#time');
const inputReason = document.querySelector('#reason');
const btnGuardar = document.querySelector('#btn-guardar-cita');

let citas = [];
let pacientes = [];
let doctores = [];
let citaEditandoId = null;

let pageNumber = 1;
let pageSize = Number(selectPageSize.value);
let totalPages = 1;
let totalRecords = 0;

const asignarTexto = (elemento, valor) => {
  if (elemento) {
    elemento.textContent = valor;
  }
};

const abrirModal = () => {
  modalCita.hidden = false;
  modalCita.classList.add('modal-open');
};

const cerrarModal = () => {
  modalCita.classList.remove('modal-open');
  modalCita.hidden = true;
  formCita.reset();
  citaEditandoId = null;
  inputAppointmentId.value = '';
};

const mostrarMensajeTabla = (mensaje) => {
  tbodyCitas.innerHTML = `
    <tr>
      <td colspan="8" class="table-message">${mensaje}</td>
    </tr>
  `;
};

const obtenerNombrePaciente = (paciente) => {
  const firstName = paciente.firstName ?? paciente.FirstName ?? '';
  const lastName = paciente.lastName ?? paciente.LastName ?? '';

  return `${firstName} ${lastName}`.trim();
};

const obtenerNombreDoctor = (doctor) => {
  const firstName = doctor.firstName ?? doctor.FirstName ?? '';
  const lastName = doctor.lastName ?? doctor.LastName ?? '';

  return `Dr. ${firstName} ${lastName}`.trim();
};

const estaActivo = (item) => {
  const estado =
    item.state ??
    item.State ??
    item.isActive ??
    item.IsActive ??
    true;

  return estado === true ||
    estado === 1 ||
    estado === '1' ||
    estado === 'true' ||
    estado === 'True';
};

const obtenerFechaHoyInput = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};

const obtenerEstadoTexto = (cita) => {
  const estado = String(cita.status ?? cita.Status ?? cita.estadoTexto ?? 'Programada')
    .trim()
    .toLowerCase();

  if (estado === 'completada') {
    return 'Completada';
  }

  if (estado === 'cancelada') {
    return 'Cancelada';
  }

  if (estado === 'no asistió' || estado === 'no asistio' || estado === 'noasistio') {
    return 'No asistió';
  }

  return 'Programada';
};

const obtenerEstadoClase = (cita) => {
  const estado = obtenerEstadoTexto(cita);

  if (estado === 'Completada') {
    return 'completada';
  }

  if (estado === 'Cancelada') {
    return 'cancelada';
  }

  if (estado === 'No asistió') {
    return 'no-asistio';
  }

  return 'programada';
};

const obtenerStatusApi = (estadoTexto) => {
  if (estadoTexto === 'No asistió') {
    return 'NoAsistio';
  }

  return estadoTexto;
};

const obtenerTextoDesdeStatusApi = (statusApi) => {
  if (statusApi === 'NoAsistio') {
    return 'No asistió';
  }

  return statusApi;
};

const actualizarResumen = () => {
  const programadas = citas.filter((cita) => obtenerEstadoTexto(cita) === 'Programada').length;
  const completadas = citas.filter((cita) => obtenerEstadoTexto(cita) === 'Completada').length;
  const canceladas = citas.filter((cita) => obtenerEstadoTexto(cita) === 'Cancelada').length;
  const noAsistio = citas.filter((cita) => obtenerEstadoTexto(cita) === 'No asistió').length;

  asignarTexto(totalCitas, totalRecords);
  asignarTexto(totalProgramadas, programadas);
  asignarTexto(totalCompletadas, completadas);
  asignarTexto(totalCanceladas, canceladas);
  asignarTexto(totalNoAsistio, noAsistio);
};

const actualizarPaginacion = () => {
  paginationInfo.textContent = `Página ${pageNumber} de ${totalPages} | Total: ${totalRecords}`;

  btnAnterior.disabled = pageNumber <= 1;
  btnSiguiente.disabled = pageNumber >= totalPages;
};

const obtenerCitasFiltradas = () => {
  const texto = inputBuscar.value.trim().toLowerCase();
  const fecha = filtroFecha.value;
  const doctorId = filtroDoctor.value;
  const estado = filtroEstado ? filtroEstado.value : '';

  return citas.filter((cita) => {
    const patientName = cita.patientName ?? '';
    const doctorName = cita.doctorName ?? '';
    const reason = cita.reason ?? '';

    const coincideTexto =
      !texto ||
      patientName.toLowerCase().includes(texto) ||
      doctorName.toLowerCase().includes(texto) ||
      reason.toLowerCase().includes(texto);

    const coincideFecha =
      !fecha ||
      cita.fechaInput === fecha;

    const coincideDoctor =
      !doctorId ||
      String(cita.doctorId) === doctorId;

    const coincideEstado =
      !estado ||
      obtenerEstadoTexto(cita) === estado;

    return coincideTexto && coincideFecha && coincideDoctor && coincideEstado;
  });
};

const crearAccionesCita = (cita) => {
  const estadoActual = obtenerEstadoTexto(cita);
  const statusActualApi = obtenerStatusApi(estadoActual);

  return `
    <button 
      type="button"
      class="btn-action btn-edit"
      data-action="editar"
      data-id="${cita.appointmentId}">
      Editar
    </button>

    <select 
      class="select-estado-cita"
      data-id="${cita.appointmentId}"
      data-status-actual="${statusActualApi}">
      <option value="Programada" ${estadoActual === 'Programada' ? 'selected' : ''}>
        Programada
      </option>

      <option value="Completada" ${estadoActual === 'Completada' ? 'selected' : ''}>
        Completada
      </option>

      <option value="Cancelada" ${estadoActual === 'Cancelada' ? 'selected' : ''}>
        Cancelada
      </option>

      <option value="NoAsistio" ${estadoActual === 'No asistió' ? 'selected' : ''}>
        No asistió
      </option>
    </select>
  `;
};

const crearFilaCita = (cita) => {
  return `
    <tr>
      <td>
        <span class="codigo">${cita.codigo}</span>
      </td>

      <td>${cita.fechaFormateada}</td>

      <td>
        <span class="time-box">${cita.horaInput}</span>
      </td>

      <td>
        <div class="cell-main">
          <strong>${cita.patientName}</strong>
          <small>ID Paciente: ${cita.patientId}</small>
        </div>
      </td>

      <td>
        <div class="cell-main">
          <strong>${cita.doctorName}</strong>
          <small>ID Doctor: ${cita.doctorId}</small>
        </div>
      </td>

      <td>
        <span class="reason-text">${cita.reason}</span>
      </td>

      <td>
        <span class="status ${obtenerEstadoClase(cita)}">
          ${obtenerEstadoTexto(cita)}
        </span>
      </td>

      <td>
        <div class="table-actions">
          ${crearAccionesCita(cita)}
        </div>
      </td>
    </tr>
  `;
};

const renderizarCitas = () => {
  const filtradas = obtenerCitasFiltradas();

  actualizarResumen();
  actualizarPaginacion();

  if (filtradas.length === 0) {
    mostrarMensajeTabla('No hay citas para mostrar.');
    return;
  }

  tbodyCitas.innerHTML = filtradas
    .map((cita) => crearFilaCita(cita))
    .join('');
};

const cargarPacientes = async () => {
  try {
    pacientes = await citaService.obtenerPacientes(1, 100);

    selectPatientId.innerHTML = `
      <option value="">Seleccione un paciente</option>
      ${pacientes
        .filter((paciente) => estaActivo(paciente))
        .map((paciente) => {
          const id = paciente.patientId ?? paciente.PatientId;
          const nombre = obtenerNombrePaciente(paciente);

          return `<option value="${id}">${nombre}</option>`;
        })
        .join('')}
    `;
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
    selectPatientId.innerHTML = '<option value="">No se pudieron cargar pacientes</option>';
  }
};

const cargarDoctores = async () => {
  try {
    doctores = await citaService.obtenerDoctores(1, 100);

    const opcionesDoctores = doctores
      .filter((doctor) => estaActivo(doctor))
      .map((doctor) => {
        const id = doctor.doctorId ?? doctor.DoctorId;
        const nombre = obtenerNombreDoctor(doctor);

        return `<option value="${id}">${nombre}</option>`;
      })
      .join('');

    selectDoctorId.innerHTML = `
      <option value="">Seleccione un doctor</option>
      ${opcionesDoctores}
    `;

    filtroDoctor.innerHTML = `
      <option value="">Todos los doctores</option>
      ${opcionesDoctores}
    `;
  } catch (error) {
    console.error('Error al cargar doctores:', error);
    selectDoctorId.innerHTML = '<option value="">No se pudieron cargar doctores</option>';
    filtroDoctor.innerHTML = '<option value="">No se pudieron cargar doctores</option>';
  }
};

const cargarCitas = async () => {
  try {
    mostrarMensajeTabla('Cargando citas...');

    const respuesta = await citaService.obtenerPaginado(pageNumber, pageSize);

    citas = respuesta.data;
    pageNumber = respuesta.pageNumber;
    pageSize = respuesta.pageSize;
    totalRecords = respuesta.totalRecords;
    totalPages = respuesta.totalPages;

    console.log('Citas cargadas:', citas);

    renderizarCitas();

  } catch (error) {
    console.error('Error al cargar citas:', error);
    mostrarMensajeTabla(error.message || 'No se pudieron cargar las citas.');
  }
};

const prepararNuevaCita = () => {
  modalTitle.textContent = 'Agendar Cita';
  btnGuardar.textContent = 'Guardar Cita';

  citaEditandoId = null;
  formCita.reset();

  inputAppointmentId.value = '';
  selectPatientId.value = '';
  selectDoctorId.value = '';
  inputDate.value = '';
  inputTime.value = '';
  inputReason.value = '';

  abrirModal();
};

const prepararEditarCita = (id) => {
  const cita = citas.find((item) => item.appointmentId === Number(id));

  if (!cita) {
    alert('No se encontró la cita seleccionada.');
    return;
  }

  modalTitle.textContent = 'Editar Cita';
  btnGuardar.textContent = 'Guardar cambios';

  citaEditandoId = cita.appointmentId;

  inputAppointmentId.value = cita.appointmentId;
  selectPatientId.value = String(cita.patientId);
  selectDoctorId.value = String(cita.doctorId);
  inputDate.value = cita.fechaInput;
  inputTime.value = cita.horaInput;
  inputReason.value = cita.reason;

  abrirModal();
};

const obtenerMensajeError = (error) => {
  const mensaje = error.message || '';

  if (mensaje.toLowerCase().includes('conflicto') || mensaje.includes('409')) {
    return 'No se puede completar la acción porque la cita está asociada a otros registros.';
  }

  if (mensaje.includes('403')) {
    return 'No tiene permisos para realizar esta acción.';
  }

  return mensaje || 'No se pudo completar la operación.';
};

const guardarCita = async (event) => {
  event.preventDefault();

  const datosFormulario = Object.fromEntries(new FormData(formCita));

  const patientId = Number(datosFormulario.patientId);
  const doctorId = Number(datosFormulario.doctorId);
  const date = datosFormulario.date;
  const time = datosFormulario.time;
  const reason = datosFormulario.reason.trim();

  if (!patientId || !doctorId || !date || !time || !reason) {
    alert('Complete todos los campos de la cita.');
    return;
  }

  try {
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    const cita = {
      patientId: patientId,
      doctorId: doctorId,
      date: date,
      time: time,
      reason: reason
    };

    if (citaEditandoId) {
      await citaService.actualizar(citaEditandoId, cita);
      alert('Cita actualizada correctamente.');
    } else {
      await citaService.crear(cita);
      alert('Cita registrada correctamente.');
    }

    cerrarModal();
    await cargarCitas();

  } catch (error) {
    console.error('Error al guardar cita:', error);
    alert(obtenerMensajeError(error));
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = citaEditandoId ? 'Guardar cambios' : 'Guardar Cita';
  }
};

const cambiarEstadoCita = async (id, statusApi, estadoAnterior) => {
  const cita = citas.find((item) => item.appointmentId === Number(id));

  if (!cita) {
    alert('No se encontró la cita seleccionada.');
    renderizarCitas();
    return;
  }

  const textoEstado = obtenerTextoDesdeStatusApi(statusApi);

  const confirmar = confirm(`¿Desea cambiar la cita de "${cita.patientName}" al estado "${textoEstado}"?`);

  if (!confirmar) {
    renderizarCitas();
    return;
  }

  try {
    await citaService.cambiarEstado(cita.appointmentId, statusApi);

    alert(`La cita fue marcada como "${textoEstado}".`);

    await cargarCitas();

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert(obtenerMensajeError(error));
    renderizarCitas();
  }
};

btnNuevaCita.addEventListener('click', prepararNuevaCita);

btnCerrarModal.addEventListener('click', cerrarModal);

modalCita.addEventListener('click', (event) => {
  if (event.target === modalCita) {
    cerrarModal();
  }
});

formCita.addEventListener('submit', guardarCita);

inputBuscar.addEventListener('input', renderizarCitas);
filtroFecha.addEventListener('change', renderizarCitas);
filtroDoctor.addEventListener('change', renderizarCitas);

if (filtroEstado) {
  filtroEstado.addEventListener('change', renderizarCitas);
}

btnHoy.addEventListener('click', () => {
  filtroFecha.value = obtenerFechaHoyInput();
  renderizarCitas();
});

btnLimpiarFiltros.addEventListener('click', () => {
  inputBuscar.value = '';
  filtroFecha.value = '';
  filtroDoctor.value = '';

  if (filtroEstado) {
    filtroEstado.value = '';
  }

  renderizarCitas();
});

btnAnterior.addEventListener('click', async () => {
  if (pageNumber > 1) {
    pageNumber--;
    await cargarCitas();
  }
});

btnSiguiente.addEventListener('click', async () => {
  if (pageNumber < totalPages) {
    pageNumber++;
    await cargarCitas();
  }
});

selectPageSize.addEventListener('change', async (event) => {
  pageSize = Number(event.target.value);
  pageNumber = 1;
  await cargarCitas();
});

tbodyCitas.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-action]');

  if (!boton) {
    return;
  }

  const action = boton.dataset.action;
  const id = boton.dataset.id;

  if (action === 'editar') {
    prepararEditarCita(id);
  }
});

tbodyCitas.addEventListener('change', (event) => {
  const selectEstado = event.target.closest('.select-estado-cita');

  if (!selectEstado) {
    return;
  }

  const id = selectEstado.dataset.id;
  const estadoNuevo = selectEstado.value;
  const estadoAnterior = selectEstado.dataset.statusActual;

  if (estadoNuevo === estadoAnterior) {
    return;
  }

  cambiarEstadoCita(id, estadoNuevo, estadoAnterior);
});

const inicializar = async () => {
  await cargarPacientes();
  await cargarDoctores();
  await cargarCitas();
};

inicializar();