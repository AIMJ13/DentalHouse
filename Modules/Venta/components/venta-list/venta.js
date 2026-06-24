import { protegerPorRol } from '../../../Core/Guards/auth.guard.js';
import { VentaService } from '../../services/venta.service.js';

protegerPorRol(['Administrador', 'Recepcionista']);

const ventaService = new VentaService();

const $ = (selector) => document.querySelector(selector);

const elementos = {
  tbodyVentas: $('#ventas-tbody'),
  inputBuscar: $('#input-buscar-venta'),
  btnNuevaVenta: $('#btn-nueva-venta'),
  totalVentas: $('#total-ventas'),
  ventasHoy: $('#ventas-hoy'),
  totalGeneral: $('#total-general'),
  promedioVenta: $('#promedio-venta'),
  filtroFecha: $('#filtro-fecha'),
  btnHoy: $('#btn-hoy'),
  btnLimpiarFiltros: $('#btn-limpiar-filtros'),
  paginationInfo: $('#pagination-info'),
  btnAnterior: $('#btn-anterior'),
  btnSiguiente: $('#btn-siguiente'),
  selectPageSize: $('#page-size'),
  modalVenta: $('#modal-venta'),
  modalTitle: $('#modal-title'),
  btnCerrarModal: $('#btn-cerrar-modal'),
  formVenta: $('#form-venta'),
  inputSaleId: $('#saleId'),
  selectAppointmentId: $('#appointmentId'),
  selectServiceId: $('#serviceId'),
  inputQuantity: $('#quantity'),
  btnAgregarDetalle: $('#btn-agregar-detalle'),
  detallesVentaLista: $('#detalles-venta-lista'),
  totalVentaPreview: $('#total-venta-preview'),
  btnGuardarVenta: $('#btn-guardar-venta')
};

let ventas = [];
let citas = [];
let servicios = [];
let detallesVenta = [];
let pageNumber = 1;
let pageSize = Number(elementos.selectPageSize?.value ?? 10);
let totalPages = 1;
let totalRecords = 0;

const formatearMoneda = (cantidad) => new Intl.NumberFormat('es-NI', {
  style: 'currency',
  currency: 'NIO'
}).format(Number(cantidad) || 0);

const fechaHoyInput = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const normalizarFecha = (fechaOriginal) => {
  if (!fechaOriginal) return '';

  const fechaTexto = String(fechaOriginal).split(' ')[0];

  if (fechaTexto.includes('/')) {
    const [dia, mes, anio] = fechaTexto.split('/');
    if (!dia || !mes || !anio) return '';
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  return fechaTexto.includes('-') ? fechaTexto.substring(0, 10) : '';
};

const formatearFecha = (fechaOriginal) => {
  const fechaInput = normalizarFecha(fechaOriginal);
  if (!fechaInput) return 'Sin fecha';

  const fecha = new Date(`${fechaInput}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return fechaOriginal;

  return fecha.toLocaleDateString('es-NI', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const estaActivo = (item) => {
  const estado = item.state ?? item.State ?? item.isActive ?? item.IsActive ?? true;
  return estado === true || estado === 1 || estado === '1' || estado === 'true' || estado === 'True';
};

const obtenerServicioId = (servicio) => Number(servicio.serviceId ?? servicio.ServiceId ?? 0);
const obtenerServicioNombre = (servicio) => servicio.serviceName ?? servicio.ServiceName ?? 'Servicio';
const obtenerServicioCosto = (servicio) => Number(servicio.cost ?? servicio.Cost ?? 0);

const obtenerDetalleNombre = (detalle) => detalle.serviceName ?? detalle.ServiceName ?? 'Servicio';
const obtenerDetalleCantidad = (detalle) => Number(detalle.quantity ?? detalle.Quantity ?? 0);
const obtenerDetalleCosto = (detalle) => Number(detalle.cost ?? detalle.Cost ?? detalle.unitCost ?? detalle.UnitCost ?? 0);

const obtenerDetalles = (venta) => Array.isArray(venta.details ?? venta.Details)
  ? venta.details ?? venta.Details
  : [];

const mostrarMensajeTabla = (mensaje) => {
  elementos.tbodyVentas.innerHTML = `
    <tr>
      <td colspan="8" class="table-message">${mensaje}</td>
    </tr>
  `;
};

const abrirModal = () => {
  elementos.modalVenta.hidden = false;
  elementos.modalVenta.removeAttribute('hidden');
  elementos.modalVenta.classList.add('modal-open');
  document.body.classList.add('modal-active');

  Object.assign(elementos.modalVenta.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'rgba(15, 23, 42, 0.55)',
    opacity: '1',
    visibility: 'visible',
    pointerEvents: 'auto',
    zIndex: '999999'
  });

  const contenido = elementos.modalVenta.querySelector('.modal-content');

  if (contenido) {
    Object.assign(contenido.style, {
      display: 'block',
      opacity: '1',
      visibility: 'visible',
      position: 'relative',
      zIndex: '1000000'
    });
  }
};

const cerrarModal = () => {
  elementos.modalVenta.classList.remove('modal-open');
  elementos.modalVenta.hidden = true;
  elementos.modalVenta.setAttribute('hidden', '');
  elementos.modalVenta.removeAttribute('style');
  document.body.classList.remove('modal-active');

  const contenido = elementos.modalVenta.querySelector('.modal-content');

  if (contenido) {
    contenido.removeAttribute('style');
  }

  elementos.formVenta.reset();
  elementos.inputSaleId.value = '';
  detallesVenta = [];
  elementos.inputQuantity.value = 1;
  renderizarDetallesVenta();
};

const resumenServicios = (venta) => {
  const detalles = obtenerDetalles(venta);

  if (detalles.length === 0) {
    return '<span class="sale-services">Sin detalle</span>';
  }

  return `
    <div class="service-summary-list">
      ${detalles.map((detalle) => `
        <span class="service-summary-item">
          ${obtenerDetalleNombre(detalle)} x${obtenerDetalleCantidad(detalle)}
        </span>
      `).join('')}
    </div>
  `;
};

const crearFilaVenta = (venta) => `
  <tr>
    <td><span class="codigo">${venta.codigo}</span></td>
    <td>${venta.fechaFormateada}</td>
    <td>
      <div class="cell-main">
        <strong>${venta.patientName}</strong>
        <small>ID Paciente: ${venta.patientId || 'N/D'}</small>
      </div>
    </td>
    <td>
      <div class="cell-main">
        <strong>${venta.doctorName}</strong>
        <small>ID Doctor: ${venta.doctorId || 'N/D'}</small>
      </div>
    </td>
    <td><span class="codigo">${venta.codigoCita}</span></td>
    <td>${resumenServicios(venta)}</td>
    <td><span class="sale-total">${venta.totalFormateado}</span></td>
    <td>
      <div class="table-actions">
        <button type="button" class="btn-action btn-view" data-action="detalle" data-id="${venta.saleId}">
          Detalle
        </button>
      </div>
    </td>
  </tr>
`;

const filtrarVentas = () => {
  const texto = elementos.inputBuscar.value.trim().toLowerCase();
  const fecha = elementos.filtroFecha.value;

  return ventas.filter((venta) => {
    const serviciosTexto = obtenerDetalles(venta)
      .map((detalle) => obtenerDetalleNombre(detalle))
      .join(' ')
      .toLowerCase();

    const coincideTexto =
      !texto ||
      venta.codigo.toLowerCase().includes(texto) ||
      venta.patientName.toLowerCase().includes(texto) ||
      venta.doctorName.toLowerCase().includes(texto) ||
      serviciosTexto.includes(texto) ||
      String(venta.appointmentId).includes(texto);

    const coincideFecha = !fecha || venta.fechaInput === fecha;
    return coincideTexto && coincideFecha;
  });
};

const actualizarResumen = () => {
  const hoy = fechaHoyInput();
  const ventasDelDia = ventas.filter((venta) => venta.fechaInput === hoy).length;
  const total = ventas.reduce((acumulado, venta) => acumulado + venta.totalCalculado, 0);
  const promedio = ventas.length > 0 ? total / ventas.length : 0;

  elementos.totalVentas.textContent = totalRecords;
  elementos.ventasHoy.textContent = ventasDelDia;
  elementos.totalGeneral.textContent = formatearMoneda(total);
  elementos.promedioVenta.textContent = formatearMoneda(promedio);
};

const actualizarPaginacion = () => {
  elementos.paginationInfo.textContent = `Página ${pageNumber} de ${totalPages} | Total: ${totalRecords}`;
  elementos.btnAnterior.disabled = pageNumber <= 1;
  elementos.btnSiguiente.disabled = pageNumber >= totalPages;
};

const renderizarVentas = () => {
  const filtradas = filtrarVentas();
  actualizarResumen();
  actualizarPaginacion();

  if (filtradas.length === 0) {
    mostrarMensajeTabla('No hay ventas para mostrar.');
    return;
  }

  elementos.tbodyVentas.innerHTML = filtradas.map((venta) => crearFilaVenta(venta)).join('');
};

const cargarVentas = async () => {
  try {
    mostrarMensajeTabla('Cargando ventas...');
    const respuesta = await ventaService.obtenerPaginado(pageNumber, pageSize);

    ventas = respuesta.data;
    pageNumber = respuesta.pageNumber;
    pageSize = respuesta.pageSize;
    totalRecords = respuesta.totalRecords;
    totalPages = respuesta.totalPages;

    renderizarVentas();
  } catch (error) {
    console.error('Error al cargar ventas:', error);
    mostrarMensajeTabla(error.message || 'No se pudieron cargar las ventas.');
  }
};

const nombreCita = (cita) => {
  const appointmentId = cita.appointmentId ?? cita.AppointmentId ?? 0;
  const patientName = cita.patientName ?? cita.PatientName ?? 'Paciente';
  const doctorName = cita.doctorName ?? cita.DoctorName ?? 'Doctor';
  const date = cita.date ?? cita.Date ?? cita.appointmentDate ?? cita.AppointmentDate ?? '';

  return `CIT-${String(appointmentId).padStart(3, '0')} | ${patientName} | ${doctorName} | ${formatearFecha(date)}`;
};

const cargarCitas = async () => {
  try {
    elementos.selectAppointmentId.innerHTML = '<option value="">Cargando citas...</option>';
    citas = await ventaService.obtenerCitas();

    const citasConVenta = new Set(ventas.map((venta) => Number(venta.appointmentId)));
    const citasDisponibles = citas.filter((cita) => {
      const appointmentId = Number(cita.appointmentId ?? cita.AppointmentId);
      const estado = String(cita.status ?? cita.Status ?? 'Programada').trim().toLowerCase();
      return !['cancelada', 'no asistió', 'no asistio'].includes(estado) && !citasConVenta.has(appointmentId);
    });

    elementos.selectAppointmentId.innerHTML = citasDisponibles.length === 0
      ? '<option value="">No hay citas disponibles para vender</option>'
      : `
        <option value="">Seleccione una cita</option>
        ${citasDisponibles.map((cita) => {
          const id = cita.appointmentId ?? cita.AppointmentId;
          return `<option value="${id}">${nombreCita(cita)}</option>`;
        }).join('')}
      `;
  } catch (error) {
    console.error('Error al cargar citas:', error);
    elementos.selectAppointmentId.innerHTML = '<option value="">No se pudieron cargar citas</option>';
  }
};

const cargarServicios = async () => {
  try {
    elementos.selectServiceId.innerHTML = '<option value="">Cargando servicios...</option>';
    servicios = await ventaService.obtenerServicios();

    const serviciosActivos = servicios.filter((servicio) => estaActivo(servicio));

    elementos.selectServiceId.innerHTML = serviciosActivos.length === 0
      ? '<option value="">No hay servicios activos</option>'
      : `
        <option value="">Seleccione un servicio</option>
        ${serviciosActivos.map((servicio) => `
          <option value="${obtenerServicioId(servicio)}">
            ${obtenerServicioNombre(servicio)} - ${formatearMoneda(obtenerServicioCosto(servicio))}
          </option>
        `).join('')}
      `;
  } catch (error) {
    console.error('Error al cargar servicios:', error);
    elementos.selectServiceId.innerHTML = '<option value="">No se pudieron cargar servicios</option>';
  }
};

const calcularTotalDetalles = () => detallesVenta.reduce((total, detalle) => {
  return total + detalle.quantity * detalle.cost;
}, 0);

function renderizarDetallesVenta() {
  if (detallesVenta.length === 0) {
    elementos.detallesVentaLista.innerHTML = '<p class="empty-detail">No hay servicios agregados.</p>';
    elementos.totalVentaPreview.textContent = formatearMoneda(0);
    return;
  }

  elementos.detallesVentaLista.innerHTML = detallesVenta.map((detalle, index) => {
    const subtotal = detalle.quantity * detalle.cost;

    return `
      <div class="detalle-item">
        <div class="detalle-info">
          <strong>${detalle.serviceName}</strong>
          <small>Cantidad: ${detalle.quantity} | Precio: ${formatearMoneda(detalle.cost)}</small>
        </div>
        <span class="detalle-subtotal">${formatearMoneda(subtotal)}</span>
        <button type="button" class="btn-remove-detail" data-action="quitar-detalle" data-index="${index}">
          Quitar
        </button>
      </div>
    `;
  }).join('');

  elementos.totalVentaPreview.textContent = formatearMoneda(calcularTotalDetalles());
}

const prepararNuevaVenta = async () => {
  elementos.modalTitle.textContent = 'Registrar Venta';
  elementos.btnGuardarVenta.textContent = 'Guardar Venta';
  elementos.formVenta.reset();
  elementos.inputSaleId.value = '';
  elementos.inputQuantity.value = 1;
  detallesVenta = [];

  renderizarDetallesVenta();
  abrirModal();

  await Promise.allSettled([cargarCitas(), cargarServicios()]);
};

const agregarDetalleVenta = () => {
  const serviceId = Number(elementos.selectServiceId.value);
  const quantity = Number(elementos.inputQuantity.value);

  if (!serviceId) {
    alert('Seleccione un servicio.');
    return;
  }

  if (!quantity || quantity <= 0) {
    alert('La cantidad debe ser mayor a 0.');
    return;
  }

  const servicio = servicios.find((item) => obtenerServicioId(item) === serviceId);
  if (!servicio) {
    alert('No se encontró el servicio seleccionado.');
    return;
  }

  const detalleExistente = detallesVenta.find((detalle) => detalle.serviceId === serviceId);

  if (detalleExistente) {
    detalleExistente.quantity += quantity;
  } else {
    detallesVenta.push({
      serviceId,
      quantity,
      serviceName: obtenerServicioNombre(servicio),
      cost: obtenerServicioCosto(servicio)
    });
  }

  elementos.selectServiceId.value = '';
  elementos.inputQuantity.value = 1;
  renderizarDetallesVenta();
};

const obtenerMensajeError = (error) => {
  const mensaje = error.message || '';

  if (mensaje.includes('401')) return 'Sesión expirada. Inicie sesión nuevamente.';
  if (mensaje.includes('403')) return 'No tiene permisos para registrar ventas.';
  if (mensaje.includes('409') || mensaje.toLowerCase().includes('conflicto')) {
    return 'Ya existe una venta para esta cita.';
  }

  return mensaje || 'No se pudo completar la operación.';
};

const guardarVenta = async (event) => {
  event.preventDefault();

  const datosFormulario = Object.fromEntries(new FormData(elementos.formVenta));
  const appointmentId = Number(datosFormulario.appointmentId);

  if (!appointmentId) {
    alert('Seleccione una cita.');
    return;
  }

  if (detallesVenta.length === 0) {
    alert('Agregue al menos un servicio a la venta.');
    return;
  }

  try {
    elementos.btnGuardarVenta.disabled = true;
    elementos.btnGuardarVenta.textContent = 'Guardando...';

    await ventaService.crear({
      appointmentId,
      details: detallesVenta.map(({ serviceId, quantity }) => ({ serviceId, quantity }))
    });

    alert('Venta registrada correctamente.');
    cerrarModal();
    await cargarVentas();
  } catch (error) {
    console.error('Error al guardar venta:', error);
    alert(obtenerMensajeError(error));
  } finally {
    elementos.btnGuardarVenta.disabled = false;
    elementos.btnGuardarVenta.textContent = 'Guardar Venta';
  }
};

const mostrarDetalleVenta = (id) => {
  const venta = ventas.find((item) => Number(item.saleId) === Number(id));

  if (!venta) {
    alert('No se encontró la venta seleccionada.');
    return;
  }

  const detallesTexto = obtenerDetalles(venta).length > 0
    ? obtenerDetalles(venta).map((detalle) => {
      const cantidad = obtenerDetalleCantidad(detalle);
      const costo = obtenerDetalleCosto(detalle);
      return `- ${obtenerDetalleNombre(detalle)} | Cantidad: ${cantidad} | Precio: ${formatearMoneda(costo)} | Subtotal: ${formatearMoneda(cantidad * costo)}`;
    }).join('\n')
    : 'Sin detalle';

  alert(`
Detalle de venta ${venta.codigo}

Paciente: ${venta.patientName}
Doctor: ${venta.doctorName}
Cita: ${venta.codigoCita}
Fecha: ${venta.fechaFormateada}
Total: ${venta.totalFormateado}

Servicios:
${detallesTexto}
  `);
};

const validarElementos = () => {
  const faltantes = Object.entries(elementos)
    .filter(([, elemento]) => !elemento)
    .map(([nombre]) => nombre);

  if (faltantes.length > 0) {
    console.error('Faltan elementos HTML para ventas:', faltantes);
    return false;
  }

  return true;
};

const registrarEventos = () => {
  elementos.btnNuevaVenta.addEventListener('click', prepararNuevaVenta);
  elementos.btnCerrarModal.addEventListener('click', cerrarModal);
  elementos.formVenta.addEventListener('submit', guardarVenta);
  elementos.btnAgregarDetalle.addEventListener('click', agregarDetalleVenta);
  elementos.inputBuscar.addEventListener('input', renderizarVentas);
  elementos.filtroFecha.addEventListener('change', renderizarVentas);

  elementos.modalVenta.addEventListener('click', (event) => {
    if (event.target === elementos.modalVenta) cerrarModal();
  });

  elementos.detallesVentaLista.addEventListener('click', (event) => {
    const boton = event.target.closest('[data-action="quitar-detalle"]');
    if (boton) {
      detallesVenta.splice(Number(boton.dataset.index), 1);
      renderizarDetallesVenta();
    }
  });

  elementos.btnHoy.addEventListener('click', () => {
    elementos.filtroFecha.value = fechaHoyInput();
    renderizarVentas();
  });

  elementos.btnLimpiarFiltros.addEventListener('click', () => {
    elementos.inputBuscar.value = '';
    elementos.filtroFecha.value = '';
    renderizarVentas();
  });

  elementos.btnAnterior.addEventListener('click', async () => {
    if (pageNumber > 1) {
      pageNumber--;
      await cargarVentas();
    }
  });

  elementos.btnSiguiente.addEventListener('click', async () => {
    if (pageNumber < totalPages) {
      pageNumber++;
      await cargarVentas();
    }
  });

  elementos.selectPageSize.addEventListener('change', async (event) => {
    pageSize = Number(event.target.value);
    pageNumber = 1;
    await cargarVentas();
  });

  elementos.tbodyVentas.addEventListener('click', (event) => {
    const boton = event.target.closest('[data-action="detalle"]');
    if (boton) mostrarDetalleVenta(boton.dataset.id);
  });
};

const inicializar = async () => {
  if (!validarElementos()) return;

  registrarEventos();
  renderizarDetallesVenta();
  await cargarVentas();
};

inicializar();
