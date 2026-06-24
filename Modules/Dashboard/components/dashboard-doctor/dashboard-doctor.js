import { protegerPorRol } from '../../../Core/Guards/auth.guard.js';

protegerPorRol(['Administrador', 'Doctor']);