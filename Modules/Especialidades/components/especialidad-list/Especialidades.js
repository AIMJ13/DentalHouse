import { protegerPorRol } from '../../../Core/Guards/auth.guard.js';
import { EspecialidadService } from '../../services/especialidad.service.js';

protegerPorRol(['Administrador', 'Recepcionista']);

const especialidadService = new EspecialidadService();
const $ = (selector) => document.querySelector(selector);

const tbodyEspecialidades = $('#especialidades-tbody');
const inputBuscar = $('#input-buscar-especialidad');
const btnNuevaEspecialidad = $('#btn-nueva-especialidad');
const totalEspecialidades = $('#total-especialidades');
const totalActivas = $('#total-activas');
const totalInactivas = $('#total-inactivas');
const paginationInfo = $('#pagination-info');
const btnAnterior = $('#btn-anterior');
const btnSiguiente = $('#btn-siguiente');
const selectPageSize = $('#page-size');
const modalEspecialidad = $('#modal-especialidad');
const modalTitle = $('#modal-title');
const btnCerrarModal = $('#btn-cerrar-modal');
const formEspecialidad = $('#form-especialidad');
const inputSpecialtyId = $('#specialtyId');
const inputSpecialtyName = $('#specialtyName');
const selectState = $('#state');
const btnGuardar = $('#btn-guardar-especialidad');

let especialidades = [];
let especialidadEditandoId = null;
let pageNumber = 1;
let pageSize = Number(selectPageSize.value);
let totalPages = 1;
let totalRecords = 0;

const abrirModal = () => {
  modalEspecialidad.hidden = false;
  modalEspecialidad.classList.add('modal-open');
};

const cerrarModal = () => {
  modalEspecialidad.classList.remove('modal-open');
  modalEspecialidad.hidden = true;
  formEspecialidad.reset();
  especialidadEditandoId = null;
  inputSpecialtyId.value = '';
};

const mostrarMensajeTabla = (mensaje) => {
  tbodyEspecialidades.innerHTML = `
    <tr>
      <td colspan="4" class="table-message">${mensaje}</td>
    </tr>
  `;
};

const actualizarResumen = () => {
  const activas = especialidades.filter((especialidad) => especialidad.estaActiva).length;

  totalEspecialidades.textContent = totalRecords;
  totalActivas.textContent = activas;
  totalInactivas.textContent = especialidades.length - activas;
};

const actualizarPaginacion = () => {
  paginationInfo.textContent = `Página ${pageNumber} de ${totalPages} | Total: ${totalRecords}`;
  btnAnterior.disabled = pageNumber <= 1;
  btnSiguiente.disabled = pageNumber >= totalPages;
};

const obtenerEspecialidadesFiltradas = () => {
  return especialidades.filter((especialidad) => especialidad.coincideCon(inputBuscar.value));
};

const crearFilaEspecialidad = (especialidad) => {
  const textoBotonEstado = especialidad.state ? 'Desactivar' : 'Activar';
  const claseBotonEstado = especialidad.state ? 'deactivate' : 'activate';

  return `
    <tr>
      <td><span class="codigo">${especialidad.codigo}</span></td>
      <td>
        <div class="specialty-name-cell">
          <span class="specialty-icon">&#129463;</span>
          <span class="nombre-especialidad">${especialidad.specialtyName}</span>
        </div>
      </td>
      <td><span class="status ${especialidad.estadoClase}">${especialidad.estadoTexto}</span></td>
      <td>
        <div class="table-actions">
          <button type="button" class="btn-action btn-edit" data-action="editar" data-id="${especialidad.specialtyId}">
            Editar
          </button>
          <button type="button" class="btn-state ${claseBotonEstado}" data-action="estado" data-id="${especialidad.specialtyId}">
            ${textoBotonEstado}
          </button>
        </div>
      </td>
    </tr>
  `;
};

const renderizarEspecialidades = () => {
  const filtradas = obtenerEspecialidadesFiltradas();

  actualizarResumen();
  actualizarPaginacion();

  if (filtradas.length === 0) {
    mostrarMensajeTabla('No hay especialidades para mostrar.');
    return;
  }

  tbodyEspecialidades.innerHTML = filtradas.map((especialidad) => crearFilaEspecialidad(especialidad)).join('');
};

const cargarEspecialidades = async () => {
  try {
    mostrarMensajeTabla('Cargando especialidades...');

    const respuesta = await especialidadService.obtenerPaginado(pageNumber, pageSize);

    especialidades = respuesta.data;
    pageNumber = respuesta.pageNumber;
    pageSize = respuesta.pageSize;
    totalRecords = respuesta.totalRecords;
    totalPages = respuesta.totalPages;

    renderizarEspecialidades();
  } catch (error) {
    console.error('Error al cargar especialidades:', error);
    mostrarMensajeTabla(error.message || 'No se pudieron cargar las especialidades.');
  }
};

const prepararNuevaEspecialidad = () => {
  modalTitle.textContent = 'Nueva Especialidad';
  btnGuardar.textContent = 'Guardar';
  especialidadEditandoId = null;
  formEspecialidad.reset();
  inputSpecialtyId.value = '';
  selectState.value = 'true';
  abrirModal();
};

const prepararEditarEspecialidad = (id) => {
  const especialidad = especialidades.find((item) => item.specialtyId === Number(id));

  if (!especialidad) {
    alert('No se encontró la especialidad seleccionada.');
    return;
  }

  modalTitle.textContent = 'Editar Especialidad';
  btnGuardar.textContent = 'Guardar cambios';
  especialidadEditandoId = especialidad.specialtyId;
  inputSpecialtyId.value = especialidad.specialtyId;
  inputSpecialtyName.value = especialidad.specialtyName;
  selectState.value = String(especialidad.state);
  abrirModal();
};

const obtenerMensajeError = (error) => {
  const mensaje = error.message || '';

  if (mensaje.toLowerCase().includes('conflicto') || mensaje.includes('409')) {
    return 'No se puede cambiar el estado porque la especialidad está asociada a otros registros.';
  }

  return mensaje || 'No se pudo completar la operación.';
};

const obtenerDatosFormulario = () => {
  const datos = Object.fromEntries(new FormData(formEspecialidad));

  return {
    specialtyId: Number(inputSpecialtyId.value || 0),
    specialtyName: datos.specialtyName.trim(),
    state: datos.state === 'true'
  };
};

const guardarEspecialidad = async (event) => {
  event.preventDefault();

  const especialidad = obtenerDatosFormulario();

  if (!especialidad.specialtyName) {
    alert('Ingrese el nombre de la especialidad.');
    return;
  }

  try {
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    if (especialidadEditandoId) {
      await especialidadService.actualizar(especialidadEditandoId, especialidad);
      alert('Especialidad actualizada correctamente.');
    } else {
      await especialidadService.crear(especialidad);
      alert('Especialidad registrada correctamente.');
    }

    cerrarModal();
    await cargarEspecialidades();
  } catch (error) {
    console.error('Error al guardar especialidad:', error);
    alert(obtenerMensajeError(error));
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = especialidadEditandoId ? 'Guardar cambios' : 'Guardar';
  }
};

const cambiarEstadoEspecialidad = async (id) => {
  const especialidad = especialidades.find((item) => item.specialtyId === Number(id));

  if (!especialidad) {
    alert('No se encontró la especialidad seleccionada.');
    return;
  }

  const nuevoEstado = !especialidad.state;
  const accion = nuevoEstado ? 'activar' : 'desactivar';

  if (!confirm(`¿Desea ${accion} la especialidad "${especialidad.specialtyName}"?`)) return;

  try {
    await especialidadService.cambiarEstado(especialidad.specialtyId, nuevoEstado);
    alert(`Especialidad ${nuevoEstado ? 'activada' : 'desactivada'} correctamente.`);
    await cargarEspecialidades();
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert(obtenerMensajeError(error));
  }
};

btnNuevaEspecialidad.addEventListener('click', prepararNuevaEspecialidad);
btnCerrarModal.addEventListener('click', cerrarModal);
formEspecialidad.addEventListener('submit', guardarEspecialidad);
inputBuscar.addEventListener('input', renderizarEspecialidades);

modalEspecialidad.addEventListener('click', (event) => {
  if (event.target === modalEspecialidad) cerrarModal();
});

btnAnterior.addEventListener('click', async () => {
  if (pageNumber > 1) {
    pageNumber--;
    await cargarEspecialidades();
  }
});

btnSiguiente.addEventListener('click', async () => {
  if (pageNumber < totalPages) {
    pageNumber++;
    await cargarEspecialidades();
  }
});

selectPageSize.addEventListener('change', async (event) => {
  pageSize = Number(event.target.value);
  pageNumber = 1;
  await cargarEspecialidades();
});

tbodyEspecialidades.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-action]');
  if (!boton) return;

  if (boton.dataset.action === 'editar') prepararEditarEspecialidad(boton.dataset.id);
  if (boton.dataset.action === 'estado') cambiarEstadoEspecialidad(boton.dataset.id);
});

cargarEspecialidades();