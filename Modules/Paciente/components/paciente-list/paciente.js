import { protegerPorRol } from '../../../Core/Guards/auth.guard.js';
import { PacienteService } from '../../services/paciente.service.js';

protegerPorRol(['Administrador', 'Recepcionista']);

const pacienteService = new PacienteService();

const $ = (selector) => document.querySelector(selector);

const tbodyPacientes = $('#pacientes-tbody');
const inputBuscar = $('#input-buscar-paciente');
const btnNuevoPaciente = $('#btn-nuevo-paciente');
const totalPacientes = $('#total-pacientes');
const totalActivos = $('#total-activos');
const totalInactivos = $('#total-inactivos');
const paginationInfo = $('#pagination-info');
const btnAnterior = $('#btn-anterior');
const btnSiguiente = $('#btn-siguiente');
const selectPageSize = $('#page-size');
const modalPaciente = $('#modal-paciente');
const modalTitle = $('#modal-title');
const btnCerrarModal = $('#btn-cerrar-modal');
const formPaciente = $('#form-paciente');
const inputPatientId = $('#patientId');
const inputFirstName = $('#firstName');
const inputLastName = $('#lastName');
const inputPhone = $('#phone');
const inputAddress = $('#address');
const inputBirthDate = $('#birthDate');
const selectState = $('#state');
const btnGuardar = $('#btn-guardar-paciente');

let pacientes = [];
let pacienteEditandoId = null;
let pageNumber = 1;
let pageSize = Number(selectPageSize.value);
let totalPages = 1;
let totalRecords = 0;

const abrirModal = () => {
  modalPaciente.hidden = false;
  modalPaciente.classList.add('modal-open');
};

const cerrarModal = () => {
  modalPaciente.classList.remove('modal-open');
  modalPaciente.hidden = true;
  formPaciente.reset();
  pacienteEditandoId = null;
  inputPatientId.value = '';
};

const mostrarMensajeTabla = (mensaje) => {
  tbodyPacientes.innerHTML = `
    <tr>
      <td colspan="7" class="table-message">${mensaje}</td>
    </tr>
  `;
};

const actualizarResumen = () => {
  const activos = pacientes.filter((paciente) => paciente.estaActivo).length;

  totalPacientes.textContent = totalRecords;
  totalActivos.textContent = activos;
  totalInactivos.textContent = pacientes.length - activos;
};

const actualizarPaginacion = () => {
  paginationInfo.textContent = `Página ${pageNumber} de ${totalPages} | Total: ${totalRecords}`;
  btnAnterior.disabled = pageNumber <= 1;
  btnSiguiente.disabled = pageNumber >= totalPages;
};

const obtenerPacientesFiltrados = () => {
  return pacientes.filter((paciente) => paciente.coincideCon(inputBuscar.value));
};

const crearFilaPaciente = (paciente) => {
  const textoBotonEstado = paciente.estaActivo ? 'Desactivar' : 'Activar';
  const claseBotonEstado = paciente.estaActivo ? 'deactivate' : 'activate';

  return `
    <tr>
      <td><span class="codigo">${paciente.codigo}</span></td>
      <td>
        <div class="patient-name-cell">
          <span class="patient-icon">👤</span>
          <span class="nombre-paciente">${paciente.nombreCompleto}</span>
        </div>
      </td>
      <td>${paciente.phone || 'Sin teléfono'}</td>
      <td>${paciente.address || 'Sin dirección'}</td>
      <td>${paciente.fechaNacimientoFormateada}</td>
      <td><span class="status ${paciente.estadoClase}">${paciente.estadoTexto}</span></td>
      <td>
        <div class="table-actions">
          <button type="button" class="btn-action btn-edit" data-action="editar" data-id="${paciente.patientId}">
            Editar
          </button>
          <button type="button" class="btn-state ${claseBotonEstado}" data-action="estado" data-id="${paciente.patientId}">
            ${textoBotonEstado}
          </button>
        </div>
      </td>
    </tr>
  `;
};

const renderizarPacientes = () => {
  const filtrados = obtenerPacientesFiltrados();

  actualizarResumen();
  actualizarPaginacion();

  if (filtrados.length === 0) {
    mostrarMensajeTabla('No hay pacientes para mostrar.');
    return;
  }

  tbodyPacientes.innerHTML = filtrados.map((paciente) => crearFilaPaciente(paciente)).join('');
};

const cargarPacientes = async () => {
  try {
    mostrarMensajeTabla('Cargando pacientes...');

    const respuesta = await pacienteService.obtenerPaginado(pageNumber, pageSize);

    pacientes = respuesta.data;
    pageNumber = respuesta.pageNumber;
    pageSize = respuesta.pageSize;
    totalRecords = respuesta.totalRecords;
    totalPages = respuesta.totalPages;

    renderizarPacientes();
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
    mostrarMensajeTabla(error.message || 'No se pudieron cargar los pacientes.');
  }
};

const convertirFechaParaInput = (fechaTexto) => {
  if (!fechaTexto) return '';

  const texto = String(fechaTexto).split('T')[0].split(' ')[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(texto)) {
    const [dia, mes, anio] = texto.split('/');
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  return '';
};

const prepararNuevoPaciente = () => {
  modalTitle.textContent = 'Nuevo Paciente';
  btnGuardar.textContent = 'Guardar';
  pacienteEditandoId = null;
  formPaciente.reset();
  selectState.value = 'true';
  abrirModal();
};

const prepararEditarPaciente = (id) => {
  const paciente = pacientes.find((item) => item.patientId === Number(id));

  if (!paciente) {
    alert('No se encontró el paciente seleccionado.');
    return;
  }

  modalTitle.textContent = 'Editar Paciente';
  btnGuardar.textContent = 'Guardar cambios';
  pacienteEditandoId = paciente.patientId;
  inputPatientId.value = paciente.patientId;
  inputFirstName.value = paciente.firstName;
  inputLastName.value = paciente.lastName;
  inputPhone.value = paciente.phone;
  inputAddress.value = paciente.address;
  inputBirthDate.value = convertirFechaParaInput(paciente.birthDate);
  selectState.value = String(paciente.estaActivo);
  abrirModal();
};

const obtenerMensajeError = (error) => {
  const mensaje = error.message || '';

  if (mensaje.includes('400')) {
    return 'La API rechazó los datos del paciente. Revisa que firstName, lastName, phone, address, birthDate e isActive se estén enviando correctamente.';
  }

  if (mensaje.toLowerCase().includes('conflicto') || mensaje.includes('409')) {
    return 'No se puede cambiar el estado porque el paciente está asociado a otros registros.';
  }

  return mensaje || 'No se pudo completar la operación.';
};

const obtenerDatosFormulario = () => {
  const datos = Object.fromEntries(new FormData(formPaciente));

  return {
    patientId: Number(inputPatientId.value || 0),
    firstName: datos.firstName.trim(),
    lastName: datos.lastName.trim(),
    phone: datos.phone.trim(),
    address: datos.address.trim(),
    birthDate: datos.birthDate,
    isActive: datos.state === 'true'
  };
};

const guardarPaciente = async (event) => {
  event.preventDefault();

  const paciente = obtenerDatosFormulario();

  if (!paciente.firstName || !paciente.lastName || !paciente.phone || !paciente.address || !paciente.birthDate) {
    alert('Complete todos los campos del paciente.');
    return;
  }

  try {
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    if (pacienteEditandoId) {
      const pacienteActual = pacientes.find((item) => item.patientId === Number(pacienteEditandoId));

      await pacienteService.actualizar(pacienteEditandoId, paciente);

      if (pacienteActual && pacienteActual.estaActivo !== paciente.isActive) {
        await pacienteService.cambiarEstado(pacienteEditandoId, paciente.isActive);
      }

      alert('Paciente actualizado correctamente.');
    } else {
      await pacienteService.crear(paciente);
      alert('Paciente registrado correctamente.');
    }

    cerrarModal();
    await cargarPacientes();
  } catch (error) {
    console.error('Error al guardar paciente:', error);
    alert(obtenerMensajeError(error));
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = pacienteEditandoId ? 'Guardar cambios' : 'Guardar';
  }
};

const cambiarEstadoPaciente = async (id) => {
  const paciente = pacientes.find((item) => item.patientId === Number(id));

  if (!paciente) {
    alert('No se encontró el paciente seleccionado.');
    return;
  }

  const nuevoEstado = !paciente.estaActivo;
  const accion = nuevoEstado ? 'activar' : 'desactivar';

  if (!confirm(`¿Desea ${accion} el paciente "${paciente.nombreCompleto}"?`)) return;

  try {
    await pacienteService.cambiarEstado(paciente.patientId, nuevoEstado);
    alert(`Paciente ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);
    await cargarPacientes();
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert(obtenerMensajeError(error));
  }
};

btnNuevoPaciente.addEventListener('click', prepararNuevoPaciente);
btnCerrarModal.addEventListener('click', cerrarModal);
formPaciente.addEventListener('submit', guardarPaciente);
inputBuscar.addEventListener('input', renderizarPacientes);

modalPaciente.addEventListener('click', (event) => {
  if (event.target === modalPaciente) cerrarModal();
});

btnAnterior.addEventListener('click', async () => {
  if (pageNumber > 1) {
    pageNumber--;
    await cargarPacientes();
  }
});

btnSiguiente.addEventListener('click', async () => {
  if (pageNumber < totalPages) {
    pageNumber++;
    await cargarPacientes();
  }
});

selectPageSize.addEventListener('change', async (event) => {
  pageSize = Number(event.target.value);
  pageNumber = 1;
  await cargarPacientes();
});

tbodyPacientes.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-action]');
  if (!boton) return;

  if (boton.dataset.action === 'editar') prepararEditarPaciente(boton.dataset.id);
  if (boton.dataset.action === 'estado') cambiarEstadoPaciente(boton.dataset.id);
});

cargarPacientes();
