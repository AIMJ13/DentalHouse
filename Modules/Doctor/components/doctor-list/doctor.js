import { protegerPorRol } from '../../../Core/Guards/auth.guard.js';
import { DoctorService } from '../../services/doctor.service.js';

protegerPorRol(['Administrador', 'Recepcionista']);

const doctorService = new DoctorService();

const tbodyDoctores = document.querySelector('#doctores-tbody');
const inputBuscar = document.querySelector('#input-buscar-doctor');
const btnNuevoDoctor = document.querySelector('#btn-nuevo-doctor');

const totalDoctores = document.querySelector('#total-doctores');
const totalActivos = document.querySelector('#total-activos');
const totalInactivos = document.querySelector('#total-inactivos');
const totalEspecialidades = document.querySelector('#total-especialidades');

const paginationInfo = document.querySelector('#pagination-info');
const btnAnterior = document.querySelector('#btn-anterior');
const btnSiguiente = document.querySelector('#btn-siguiente');
const selectPageSize = document.querySelector('#page-size');

const modalDoctor = document.querySelector('#modal-doctor');
const modalTitle = document.querySelector('#modal-title');
const btnCerrarModal = document.querySelector('#btn-cerrar-modal');

const formDoctor = document.querySelector('#form-doctor');
const inputDoctorId = document.querySelector('#doctorId');
const inputFirstName = document.querySelector('#firstName');
const inputLastName = document.querySelector('#lastName');
const inputPhone = document.querySelector('#phone');
const selectSpecialtyId = document.querySelector('#specialtyId');
const selectState = document.querySelector('#state');
const btnGuardar = document.querySelector('#btn-guardar-doctor');

const elementosRequeridos = [
  tbodyDoctores,
  inputBuscar,
  btnNuevoDoctor,
  totalDoctores,
  totalActivos,
  totalInactivos,
  totalEspecialidades,
  paginationInfo,
  btnAnterior,
  btnSiguiente,
  selectPageSize,
  modalDoctor,
  modalTitle,
  btnCerrarModal,
  formDoctor,
  inputDoctorId,
  inputFirstName,
  inputLastName,
  inputPhone,
  selectSpecialtyId,
  selectState,
  btnGuardar
];

if (elementosRequeridos.some((elemento) => elemento === null)) {
  console.error('Faltan elementos en doctor.html. Revisá los id del HTML.');
}

let doctores = [];
let especialidades = [];
let doctorEditandoId = null;

let pageNumber = 1;
let pageSize = Number(selectPageSize.value);
let totalPages = 1;
let totalRecords = 0;

const abrirModal = () => {
  modalDoctor.hidden = false;
  modalDoctor.classList.add('modal-open');
};

const cerrarModal = () => {
  modalDoctor.classList.remove('modal-open');
  modalDoctor.hidden = true;
  formDoctor.reset();
  doctorEditandoId = null;
  inputDoctorId.value = '';
};

const mostrarMensajeTabla = (mensaje) => {
  tbodyDoctores.innerHTML = `
    <tr>
      <td colspan="6" class="table-message">${mensaje}</td>
    </tr>
  `;
};

const actualizarResumen = () => {
  const activos = doctores.filter((doctor) => doctor.state).length;
  const inactivos = doctores.filter((doctor) => !doctor.state).length;

  const especialidadesUsadas = new Set(
    doctores
      .filter((doctor) => doctor.specialtyId > 0)
      .map((doctor) => doctor.specialtyId)
  );

  totalDoctores.textContent = totalRecords;
  totalActivos.textContent = activos;
  totalInactivos.textContent = inactivos;
  totalEspecialidades.textContent = especialidadesUsadas.size;
};

const actualizarPaginacion = () => {
  paginationInfo.textContent = `Página ${pageNumber} de ${totalPages} | Total: ${totalRecords}`;

  btnAnterior.disabled = pageNumber <= 1;
  btnSiguiente.disabled = pageNumber >= totalPages;
};

const obtenerDoctoresFiltrados = () => {
  const texto = inputBuscar.value.trim().toLowerCase();

  if (!texto) {
    return doctores;
  }

  return doctores.filter((doctor) =>
    doctor.nombreCompleto.toLowerCase().includes(texto) ||
    doctor.specialtyName.toLowerCase().includes(texto) ||
    doctor.phone.toLowerCase().includes(texto)
  );
};

const crearFilaDoctor = (doctor) => {
  const textoBotonEstado = doctor.state ? 'Desactivar' : 'Activar';
  const claseBotonEstado = doctor.state ? 'deactivate' : 'activate';

  return `
    <tr>
      <td>
        <span class="codigo">${doctor.codigo}</span>
      </td>

      <td>
        <div class="doctor-name-cell">
          <span class="doctor-icon">👨‍⚕️</span>
          <span class="nombre-doctor">${doctor.nombreConTitulo}</span>
        </div>
      </td>

      <td>${doctor.phone}</td>

      <td>
        <span class="especialidad">${doctor.specialtyName}</span>
      </td>

      <td>
        <span class="status ${doctor.estadoClase}">
          ${doctor.estadoTexto}
        </span>
      </td>

      <td>
        <div class="table-actions">
          <button 
            type="button"
            class="btn-action btn-edit"
            data-action="editar"
            data-id="${doctor.doctorId}">
            Editar
          </button>

          <button 
            type="button"
            class="btn-state ${claseBotonEstado}"
            data-action="estado"
            data-id="${doctor.doctorId}">
            ${textoBotonEstado}
          </button>
        </div>
      </td>
    </tr>
  `;
};

const renderizarDoctores = () => {
  const filtrados = obtenerDoctoresFiltrados();

  actualizarResumen();
  actualizarPaginacion();

  if (filtrados.length === 0) {
    mostrarMensajeTabla('No hay doctores para mostrar.');
    return;
  }

  tbodyDoctores.innerHTML = filtrados
    .map((doctor) => crearFilaDoctor(doctor))
    .join('');
};

const cargarEspecialidades = async () => {
  try {
    especialidades = await doctorService.obtenerEspecialidades(1, 100);

    selectSpecialtyId.innerHTML = `
      <option value="">Seleccione una especialidad</option>
      ${especialidades
        .filter((item) => item.state ?? item.State ?? item.isActive ?? item.IsActive ?? true)
        .map((item) => {
          const id = item.specialtyId ?? item.SpecialtyId;
          const nombre = item.specialtyName ?? item.SpecialtyName;

          return `<option value="${id}">${nombre}</option>`;
        })
        .join('')}
    `;
  } catch (error) {
    console.error('Error al cargar especialidades:', error);
    selectSpecialtyId.innerHTML = '<option value="">No se pudieron cargar especialidades</option>';
  }
};

const cargarDoctores = async () => {
  try {
    mostrarMensajeTabla('Cargando doctores...');

    const respuesta = await doctorService.obtenerPaginado(pageNumber, pageSize);

    doctores = respuesta.data;
    pageNumber = respuesta.pageNumber;
    pageSize = respuesta.pageSize;
    totalRecords = respuesta.totalRecords;
    totalPages = respuesta.totalPages;

    console.log('Doctores cargados:', doctores);

    renderizarDoctores();

  } catch (error) {
    console.error('Error al cargar doctores:', error);
    mostrarMensajeTabla(error.message || 'No se pudieron cargar los doctores.');
  }
};

const prepararNuevoDoctor = () => {
  modalTitle.textContent = 'Nuevo Doctor';
  btnGuardar.textContent = 'Guardar';

  doctorEditandoId = null;
  formDoctor.reset();

  inputDoctorId.value = '';
  inputFirstName.value = '';
  inputLastName.value = '';
  inputPhone.value = '';
  selectSpecialtyId.value = '';
  selectState.value = 'true';

  abrirModal();
};

const prepararEditarDoctor = (id) => {
  const doctor = doctores.find((item) => item.doctorId === Number(id));

  if (!doctor) {
    alert('No se encontró el doctor seleccionado.');
    return;
  }

  modalTitle.textContent = 'Editar Doctor';
  btnGuardar.textContent = 'Guardar cambios';

  doctorEditandoId = doctor.doctorId;

  inputDoctorId.value = doctor.doctorId;
  inputFirstName.value = doctor.firstName;
  inputLastName.value = doctor.lastName;
  inputPhone.value = doctor.phone;
  selectSpecialtyId.value = String(doctor.specialtyId);
  selectState.value = String(doctor.state);

  abrirModal();
};

const obtenerMensajeError = (error) => {
  const mensaje = error.message || '';

  if (mensaje.toLowerCase().includes('conflicto') || mensaje.includes('409')) {
    return 'No se puede cambiar el estado porque el doctor está asociado a otros registros.';
  }

  return mensaje || 'No se pudo completar la operación.';
};

const guardarDoctor = async (event) => {
  event.preventDefault();

  const datosFormulario = Object.fromEntries(new FormData(formDoctor));

  const firstName = datosFormulario.firstName.trim();
  const lastName = datosFormulario.lastName.trim();
  const phone = datosFormulario.phone.trim();
  const specialtyId = Number(datosFormulario.specialtyId);
  const state = datosFormulario.state === 'true';

  if (!firstName || !lastName || !phone || !specialtyId) {
    alert('Complete todos los campos del doctor.');
    return;
  }

  try {
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    if (doctorEditandoId) {
      const doctorActual = doctores.find((doctor) => doctor.doctorId === Number(doctorEditandoId));

      await doctorService.actualizar(doctorEditandoId, {
        firstName,
        lastName,
        phone,
        specialtyId,
        state: doctorActual.state
      });

      if (doctorActual.state !== state) {
        await doctorService.cambiarEstado(doctorEditandoId, state);
      }

      alert('Doctor actualizado correctamente.');
    } else {
      await doctorService.crear({
        firstName,
        lastName,
        phone,
        specialtyId,
        state
      });

      alert('Doctor registrado correctamente.');
    }

    cerrarModal();
    await cargarDoctores();

  } catch (error) {
    console.error('Error al guardar doctor:', error);
    alert(obtenerMensajeError(error));
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = doctorEditandoId ? 'Guardar cambios' : 'Guardar';
  }
};

const cambiarEstadoDoctor = async (id) => {
  const doctor = doctores.find((item) => item.doctorId === Number(id));

  if (!doctor) {
    alert('No se encontró el doctor seleccionado.');
    return;
  }

  const nuevoEstado = !doctor.state;
  const accion = nuevoEstado ? 'activar' : 'desactivar';

  const confirmar = confirm(`¿Desea ${accion} el doctor "${doctor.nombreConTitulo}"?`);

  if (!confirmar) {
    return;
  }

  try {
    await doctorService.cambiarEstado(doctor.doctorId, nuevoEstado);

    alert(`Doctor ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);

    await cargarDoctores();

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert(obtenerMensajeError(error));
  }
};

btnNuevoDoctor.addEventListener('click', prepararNuevoDoctor);
btnCerrarModal.addEventListener('click', cerrarModal);

modalDoctor.addEventListener('click', (event) => {
  if (event.target === modalDoctor) {
    cerrarModal();
  }
});

formDoctor.addEventListener('submit', guardarDoctor);
inputBuscar.addEventListener('input', renderizarDoctores);

btnAnterior.addEventListener('click', async () => {
  if (pageNumber > 1) {
    pageNumber--;
    await cargarDoctores();
  }
});

btnSiguiente.addEventListener('click', async () => {
  if (pageNumber < totalPages) {
    pageNumber++;
    await cargarDoctores();
  }
});

selectPageSize.addEventListener('change', async (event) => {
  pageSize = Number(event.target.value);
  pageNumber = 1;
  await cargarDoctores();
});

tbodyDoctores.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-action]');

  if (!boton) {
    return;
  }

  const action = boton.dataset.action;
  const id = boton.dataset.id;

  if (action === 'editar') {
    prepararEditarDoctor(id);
  }

  if (action === 'estado') {
    cambiarEstadoDoctor(id);
  }
});

const inicializar = async () => {
  await cargarEspecialidades();
  await cargarDoctores();
};

inicializar();