import { AuthService } from '../Services/auth.service.js';
import { APP_ROUTES } from '../../../app/app.config.js';

const authService = new AuthService();

export const protegerRuta = () => {
  if (!authService.estaAutenticado()) {
    alert('Debe iniciar sesión para acceder al sistema.');
    window.location.href = APP_ROUTES.login;
    return false;
  }

  return true;
};

export const protegerPorRol = (rolesPermitidos = []) => {
  if (!protegerRuta()) {
    return false;
  }

  if (!authService.tieneRol(rolesPermitidos)) {
    alert('No tiene permisos para acceder a esta pantalla.');

    const rolPrincipal = authService.obtenerRolPrincipal();

    if (rolPrincipal === 'Doctor') {
      window.location.href = APP_ROUTES.dashboardDoctor;
    } else {
      window.location.href = APP_ROUTES.dashboardAdmin;
    }

    return false;
  }

  return true;
};