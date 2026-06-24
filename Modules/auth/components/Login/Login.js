import { AuthService } from '../../../Core/Services/auth.service.js';
import { APP_ROUTES } from '../../../../app/app.config.js';

const authService = new AuthService();

const formLogin = document.querySelector('#form-login');
const loginError = document.querySelector('#login-error');
const btnLogin = document.querySelector('#btn-login');

const mostrarError = (mensaje) => {
  loginError.textContent = mensaje;
};

const limpiarError = () => {
  loginError.textContent = '';
};

const cambiarEstadoBoton = (cargando) => {
  btnLogin.disabled = cargando;
  btnLogin.textContent = cargando ? 'Ingresando...' : 'Iniciar Sesión';
};

const redireccionarPorRol = () => {
  const rolPrincipal = authService.obtenerRolPrincipal();

  if (rolPrincipal === 'Doctor') {
    window.location.href = APP_ROUTES.dashboardDoctor;
    return;
  }

  window.location.href = APP_ROUTES.dashboardAdmin;
};

formLogin.addEventListener('submit', async (event) => {
  event.preventDefault();

  const datosFormulario = Object.fromEntries(new FormData(formLogin));

  const username = datosFormulario.username.trim();
  const password = datosFormulario.password.trim();

  if (!username || !password) {
    mostrarError('Ingrese usuario y contraseña.');
    return;
  }

  try {
    limpiarError();
    cambiarEstadoBoton(true);

    const respuesta = await authService.login(username, password);

    console.log('Respuesta login:', respuesta);

    authService.guardarSesion(respuesta);

    const nombreUsuario = authService.obtenerUsername() || username;

    alert(`Bienvenido ${nombreUsuario}`);

    redireccionarPorRol();

  } catch (error) {
    console.error('Error login:', error);
    mostrarError(error.message || 'No se pudo conectar con la API.');
  } finally {
    cambiarEstadoBoton(false);
  }
});