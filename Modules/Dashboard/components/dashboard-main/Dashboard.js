const token = sessionStorage.getItem('token');

if (!token) {
    alert('Debe iniciar sesión primero.');
    window.location.href = '/Modules/auth/components/Login/index.html';
}

import { protegerPorRol } from '../../../Core/Guards/auth.guard.js';

protegerPorRol(['Administrador']);
