// Sesión del usuario en este navegador: el token que entrega la API al iniciar sesión.
// Se guarda en sessionStorage, así que se borra al cerrar la pestaña.
const CLAVE = 'portal-sesion';

// Carpeta raíz de la aplicación (frontend/), para armar enlaces desde cualquier página.
const RAIZ = new URL('../', import.meta.url);

export function irA(ruta) {
  window.location.href = new URL(ruta, RAIZ).href;
}

export function enlace(ruta) {
  return new URL(ruta, RAIZ).href;
}

export function inicioDe(rol) {
  return rol === 'admin' ? 'arquitecto/inicio.html' : 'cliente/proyectos.html';
}

function leer() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE)) || null;
  } catch {
    return null;
  }
}

export function guardarSesion({ token, usuario }) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ token, usuario }));
  } catch {
    // Sin almacenamiento (modo privado estricto): la sesión dura solo esta página.
  }
}

export function cerrarSesion() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar.
  }
}

export const token = () => leer()?.token || null;
export const usuarioActual = () => leer()?.usuario || null;

export function actualizarUsuario(usuario) {
  const sesion = leer();
  if (sesion) guardarSesion({ ...sesion, usuario });
}

// Exige sesión iniciada y, si se indica, uno de los roles. Si no, manda a la pantalla que corresponde.
export function exigirSesion(...roles) {
  const usuario = usuarioActual();
  if (!usuario) {
    irA('index.html');
    throw new Error('Sin sesión');
  }
  if (roles.length > 0 && !roles.includes(usuario.rol)) {
    irA(inicioDe(usuario.rol));
    throw new Error('Rol sin acceso a esta pantalla');
  }
  return usuario;
}
