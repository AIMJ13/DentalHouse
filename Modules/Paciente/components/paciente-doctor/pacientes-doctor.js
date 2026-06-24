import { protegerPorRol } from '../../../Core/Guards/auth.guard.js';
import { PacienteDoctorService } from '../../services/paciente-doctor.service.js';

protegerPorRol(['Doctor']);

const pacienteService = new PacienteDoctorService();
const $ = (selector) => document.querySelector(selector);

const elementos = {
  pacientesLista: $('#pacientes-lista'),
  inputBuscar: $('#input-buscar-paciente'),
  totalPacientes: $('#total-pacientes'),
  pacientesActivos: $('#pacientes-activos'),
  pacientesInactivos: $('#pacientes-inactivos'),
  paginationInfo: $('#pagination-info'),
  btnAnterior: $('#btn-anterior'),
  btnSiguiente: $('#btn-siguiente'),
  selectPageSize: $('#page-size')
};

let pacientes = [];
let pacientesFiltrados = [];
let pageNumber = 1;
let pageSize = Number(elementos.selectPageSize?.value ?? 20);
let totalPages = 1;
let totalRecords = 0;

const mostrarMensaje = (mensaje) => {
  elementos.pacientesLista.innerHTML = `
    <div class="table-row table-message">
      ${mensaje}
    </div>
  `;
};

const actualizarResumen = () => {
  const activos = pacientes.filter((paciente) => paciente.estaActivo).length;
  const inactivos = pacientes.length - activos;

  elementos.totalPacientes.textContent = totalRecords;
  elementos.pacientesActivos.textContent = activos;
  elementos.pacientesInactivos.textContent = inactivos;
};

const actualizarPaginacion = () => {
  elementos.paginationInfo.textContent = `Página ${pageNumber} de ${totalPages} | Total: ${totalRecords}`;
  elementos.btnAnterior.disabled = pageNumber <= 1;
  elementos.btnSiguiente.disabled = pageNumber >= totalPages;
};

const filtrarPacientes = () => {
  const texto = elementos.inputBuscar.value;
  pacientesFiltrados = pacientes.filter((paciente) => paciente.coincideCon(texto));
};

const crearFilaPaciente = (paciente) => `
  <div class="table-row">
    <div class="patient-info">
      <strong>${paciente.nombreCompleto}</strong>
      <small>ID Paciente: ${paciente.patientId}</small>
    </div>

    <span>${paciente.phone}</span>
    <span>${paciente.address}</span>
    <span>${paciente.email}</span>
    <span>${paciente.fechaNacimientoFormateada}</span>

    <span class="status ${paciente.estaActivo ? 'active' : 'inactive'}">
      ${paciente.estadoTexto}
    </span>
  </div>
`;

const renderizarPacientes = () => {
  filtrarPacientes();
  actualizarResumen();
  actualizarPaginacion();

  if (pacientesFiltrados.length === 0) {
    mostrarMensaje('No hay pacientes para mostrar.');
    return;
  }

  elementos.pacientesLista.innerHTML = pacientesFiltrados
    .map((paciente) => crearFilaPaciente(paciente))
    .join('');
};

const cargarPacientes = async () => {
  try {
    mostrarMensaje('Cargando pacientes...');

    const respuesta = await pacienteService.obtenerPaginado(pageNumber, pageSize);

    pacientes = respuesta.data;
    pageNumber = respuesta.pageNumber;
    pageSize = respuesta.pageSize;
    totalRecords = respuesta.totalRecords;
    totalPages = respuesta.totalPages;

    renderizarPacientes();
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
    mostrarMensaje(error.message || 'No se pudieron cargar los pacientes. Revise que la API esté encendida.');
  }
};

const registrarEventos = () => {
  elementos.inputBuscar.addEventListener('input', renderizarPacientes);

  elementos.btnAnterior.addEventListener('click', async () => {
    if (pageNumber > 1) {
      pageNumber--;
      await cargarPacientes();
    }
  });

  elementos.btnSiguiente.addEventListener('click', async () => {
    if (pageNumber < totalPages) {
      pageNumber++;
      await cargarPacientes();
    }
  });

  elementos.selectPageSize.addEventListener('change', async (event) => {
    pageSize = Number(event.target.value);
    pageNumber = 1;
    await cargarPacientes();
  });
};

const validarElementos = () => {
  const faltantes = Object.entries(elementos)
    .filter(([, elemento]) => !elemento)
    .map(([nombre]) => nombre);

  if (faltantes.length > 0) {
    console.error('Faltan elementos HTML para pacientes:', faltantes);
    return false;
  }

  return true;
};

const inicializar = async () => {
  if (!validarElementos()) return;

  registrarEventos();
  await cargarPacientes();
};

inicializar();
