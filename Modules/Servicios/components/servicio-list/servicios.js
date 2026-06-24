import { protegerPorRol } from '../../../Core/Guards/auth.guard.js';
import { ServicioService } from '../../services/servicio.service.js';

protegerPorRol(['Administrador', 'Recepcionista']);

const servicioService = new ServicioService();

const tbodyServicios = document.querySelector('#servicios-tbody');
const inputBuscar = document.querySelector('#input-buscar-servicio');
const btnNuevoServicio = document.querySelector('#btn-nuevo-servicio');

const totalServicios = document.querySelector('#total-servicios');
const totalActivos = document.querySelector('#total-activos');
const totalInactivos = document.querySelector('#total-inactivos');
const costoPromedio = document.querySelector('#costo-promedio');

const paginationInfo = document.querySelector('#pagination-info');
const btnAnterior = document.querySelector('#btn-anterior');
const btnSiguiente = document.querySelector('#btn-siguiente');
const selectPageSize = document.querySelector('#page-size');

const modalServicio = document.querySelector('#modal-servicio');
const modalTitle = document.querySelector('#modal-title');
const btnCerrarModal = document.querySelector('#btn-cerrar-modal');

const formServicio = document.querySelector('#form-servicio');
const inputServiceId = document.querySelector('#serviceId');
const inputServiceName = document.querySelector('#serviceName');
const inputCost = document.querySelector('#cost');
const selectState = document.querySelector('#state');
const btnGuardar = document.querySelector('#btn-guardar-servicio');

let servicios = [];
let servicioEditandoId = null;

let pageNumber = 1;
let pageSize = Number(selectPageSize.value);
let totalPages = 1;
let totalRecords = 0;

const abrirModal = () => {
  modalServicio.hidden = false;
  modalServicio.classList.add('modal-open');
};

const cerrarModal = () => {
  modalServicio.classList.remove('modal-open');
  modalServicio.hidden = true;
  formServicio.reset();
  servicioEditandoId = null;
  inputServiceId.value = '';
};

const mostrarMensajeTabla = (mensaje) => {
  tbodyServicios.innerHTML = `
    <tr>
      <td colspan="5" class="table-message">${mensaje}</td>
    </tr>
  `;
};

const formatearCosto = (valor) => {
  return `C$ ${Number(valor).toFixed(2)}`;
};

const actualizarResumen = () => {
  const activos = servicios.filter((item) => item.state).length;
  const inactivos = servicios.filter((item) => !item.state).length;

  const sumaCostos = servicios.reduce((total, item) => total + item.cost, 0);
  const promedio = servicios.length > 0 ? sumaCostos / servicios.length : 0;

  totalServicios.textContent = totalRecords;
  totalActivos.textContent = activos;
  totalInactivos.textContent = inactivos;
  costoPromedio.textContent = formatearCosto(promedio);
};

const actualizarPaginacion = () => {
  paginationInfo.textContent = `Página ${pageNumber} de ${totalPages} | Total: ${totalRecords}`;

  btnAnterior.disabled = pageNumber <= 1;
  btnSiguiente.disabled = pageNumber >= totalPages;
};

const obtenerServiciosFiltrados = () => {
  const texto = inputBuscar.value.trim().toLowerCase();

  if (!texto) {
    return servicios;
  }

  return servicios.filter((servicio) =>
    servicio.serviceName.toLowerCase().includes(texto)
  );
};

const crearFilaServicio = (servicio) => {
  const textoBotonEstado = servicio.state ? 'Desactivar' : 'Activar';
  const claseBotonEstado = servicio.state ? 'deactivate' : 'activate';

  return `
    <tr>
      <td>
        <span class="codigo">${servicio.codigo}</span>
      </td>

      <td>
        <div class="service-name-cell">
          <span class="service-icon">🦷</span>
          <span class="nombre-servicio">${servicio.serviceName}</span>
        </div>
      </td>

      <td>
        <span class="costo">${servicio.costoFormateado}</span>
      </td>

      <td>
        <span class="status ${servicio.estadoClase}">
          ${servicio.estadoTexto}
        </span>
      </td>

      <td>
        <div class="table-actions">
          <button 
            type="button"
            class="btn-action btn-edit"
            data-action="editar"
            data-id="${servicio.serviceId}">
            Editar
          </button>

          <button 
            type="button"
            class="btn-state ${claseBotonEstado}"
            data-action="estado"
            data-id="${servicio.serviceId}">
            ${textoBotonEstado}
          </button>
        </div>
      </td>
    </tr>
  `;
};

const renderizarServicios = () => {
  const filtrados = obtenerServiciosFiltrados();

  actualizarResumen();
  actualizarPaginacion();

  if (filtrados.length === 0) {
    mostrarMensajeTabla('No hay servicios para mostrar.');
    return;
  }

  tbodyServicios.innerHTML = filtrados
    .map((servicio) => crearFilaServicio(servicio))
    .join('');
};

const cargarServicios = async () => {
  try {
    mostrarMensajeTabla('Cargando servicios...');

    const respuesta = await servicioService.obtenerPaginado(pageNumber, pageSize);

    servicios = respuesta.data;
    pageNumber = respuesta.pageNumber;
    pageSize = respuesta.pageSize;
    totalRecords = respuesta.totalRecords;
    totalPages = respuesta.totalPages;

    console.log('Servicios cargados:', servicios);

    renderizarServicios();

  } catch (error) {
    console.error('Error al cargar servicios:', error);
    mostrarMensajeTabla(error.message || 'No se pudieron cargar los servicios.');
  }
};

const prepararNuevoServicio = () => {
  modalTitle.textContent = 'Nuevo Servicio';
  btnGuardar.textContent = 'Guardar';

  servicioEditandoId = null;
  formServicio.reset();
  inputServiceId.value = '';
  inputServiceName.value = '';
  inputCost.value = '';
  selectState.value = 'true';

  abrirModal();
};

const prepararEditarServicio = (id) => {
  const servicio = servicios.find((item) => item.serviceId === Number(id));

  if (!servicio) {
    alert('No se encontró el servicio seleccionado.');
    return;
  }

  modalTitle.textContent = 'Editar Servicio';
  btnGuardar.textContent = 'Guardar cambios';

  servicioEditandoId = servicio.serviceId;
  inputServiceId.value = servicio.serviceId;
  inputServiceName.value = servicio.serviceName;
  inputCost.value = servicio.cost;
  selectState.value = String(servicio.state);

  abrirModal();
};

const obtenerMensajeError = (error) => {
  const mensaje = error.message || '';

  if (mensaje.toLowerCase().includes('conflicto') || mensaje.includes('409')) {
    return 'No se puede cambiar el estado porque el servicio está asociado a otros registros.';
  }

  return mensaje || 'No se pudo completar la operación.';
};

const guardarServicio = async (event) => {
  event.preventDefault();

  const datosFormulario = Object.fromEntries(new FormData(formServicio));

  const serviceName = datosFormulario.serviceName.trim();
  const cost = Number(datosFormulario.cost);
  const state = datosFormulario.state === 'true';

  if (!serviceName) {
    alert('Ingrese el nombre del servicio.');
    return;
  }

  if (Number.isNaN(cost) || cost < 0) {
    alert('Ingrese un costo válido.');
    return;
  }

  try {
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    if (servicioEditandoId) {
      const servicioActual = servicios.find((item) => item.serviceId === Number(servicioEditandoId));

      await servicioService.actualizar(servicioEditandoId, {
        serviceName: serviceName,
        cost: cost,
        state: servicioActual.state
      });

      if (servicioActual.state !== state) {
        await servicioService.cambiarEstado(servicioEditandoId, state);
      }

      alert('Servicio actualizado correctamente.');
    } else {
      await servicioService.crear({
        serviceName: serviceName,
        cost: cost,
        state: state
      });

      alert('Servicio registrado correctamente.');
    }

    cerrarModal();
    await cargarServicios();

  } catch (error) {
    console.error('Error al guardar servicio:', error);
    alert(obtenerMensajeError(error));
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = servicioEditandoId ? 'Guardar cambios' : 'Guardar';
  }
};

const cambiarEstadoServicio = async (id) => {
  const servicio = servicios.find((item) => item.serviceId === Number(id));

  if (!servicio) {
    alert('No se encontró el servicio seleccionado.');
    return;
  }

  const nuevoEstado = !servicio.state;
  const accion = nuevoEstado ? 'activar' : 'desactivar';

  const confirmar = confirm(`¿Desea ${accion} el servicio "${servicio.serviceName}"?`);

  if (!confirmar) {
    return;
  }

  try {
    await servicioService.cambiarEstado(servicio.serviceId, nuevoEstado);

    alert(`Servicio ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);

    await cargarServicios();

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert(obtenerMensajeError(error));
  }
};

btnNuevoServicio.addEventListener('click', prepararNuevoServicio);

btnCerrarModal.addEventListener('click', cerrarModal);

modalServicio.addEventListener('click', (event) => {
  if (event.target === modalServicio) {
    cerrarModal();
  }
});

formServicio.addEventListener('submit', guardarServicio);

inputBuscar.addEventListener('input', renderizarServicios);

btnAnterior.addEventListener('click', async () => {
  if (pageNumber > 1) {
    pageNumber--;
    await cargarServicios();
  }
});

btnSiguiente.addEventListener('click', async () => {
  if (pageNumber < totalPages) {
    pageNumber++;
    await cargarServicios();
  }
});

selectPageSize.addEventListener('change', async (event) => {
  pageSize = Number(event.target.value);
  pageNumber = 1;
  await cargarServicios();
});

tbodyServicios.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-action]');

  if (!boton) {
    return;
  }

  const action = boton.dataset.action;
  const id = boton.dataset.id;

  if (action === 'editar') {
    prepararEditarServicio(id);
  }

  if (action === 'estado') {
    cambiarEstadoServicio(id);
  }
});

cargarServicios();