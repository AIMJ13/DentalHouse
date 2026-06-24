import { HttpService } from './http.service.js';
import { APP_ROUTES } from '../../../app/app.config.js';

export class AuthService {
  constructor() {
    this.http = new HttpService();
  }

  async login(username, password) {
    return await this.http.post('/Auth/login', {
      username: username,
      password: password
    });
  }

  guardarSesion(respuesta) {
    const datos = respuesta.data || respuesta.Data || respuesta;

    const usuario = datos.user || datos.User || datos.usuario || datos.Usuario || {};

    const token = datos.token || datos.Token || datos.accessToken || datos.AccessToken;
    const userId = datos.id || datos.userId || datos.UserId || usuario.id || usuario.userId || '';
    const username = datos.username || datos.userName || datos.UserName || datos.name || usuario.username || usuario.userName || '';
    const email = datos.email || datos.Email || usuario.email || usuario.Email || '';

    const rolesRespuesta = datos.roles || datos.Roles || datos.role || datos.Role || [];
    const roles = Array.isArray(rolesRespuesta) ? rolesRespuesta : [rolesRespuesta];

    if (!token) {
      throw new Error('La API no devolvió un token.');
    }

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('userId', String(userId));
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('roles', JSON.stringify(roles));
    sessionStorage.setItem('rolPrincipal', roles[0] || '');
  }

  cerrarSesion() {
    sessionStorage.clear();
    window.location.href = APP_ROUTES.login;
  }

  estaAutenticado() {
    return !!sessionStorage.getItem('token');
  }

  obtenerToken() {
    return sessionStorage.getItem('token');
  }

  obtenerUsername() {
    return sessionStorage.getItem('username');
  }

  obtenerRolPrincipal() {
    return sessionStorage.getItem('rolPrincipal');
  }

  obtenerRoles() {
    return JSON.parse(sessionStorage.getItem('roles') || '[]');
  }

  tieneRol(rolesPermitidos = []) {
    const rolesUsuario = this.obtenerRoles();
    return rolesPermitidos.some((rol) => rolesUsuario.includes(rol));
  }
}