// Encabezado de todas las pantallas: tema claro u oscuro, logo y, con sesión, la campana y «Salir».
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSesion } from '../sesion/Sesion';
import { inicioDe } from '../sesion/almacen';
import { nombreConEmpresa } from '../utilidades/textos';
import { Campana } from './Campana';

const CLAVE_TEMA = 'portal-tema';

function aplicarTemaGuardado(): void {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA);
    if (guardado) document.documentElement.dataset.theme = guardado;
  } catch {
    // Sin almacenamiento: se usa el tema del sistema.
  }
}

function cambiarTema(): void {
  const raiz = document.documentElement;
  raiz.dataset.theme = getComputedStyle(raiz).colorScheme === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(CLAVE_TEMA, raiz.dataset.theme);
  } catch {
    // No se recuerda, pero el cambio sí se aplica.
  }
}

export function Encabezado() {
  const { usuario, salir } = useSesion();
  const navegar = useNavigate();

  useEffect(aplicarTemaGuardado, []);

  // El cliente con sesión iniciada ve el acento naranja.
  useEffect(() => {
    document.documentElement.classList.toggle('ses', usuario?.rol === 'cliente');
  }, [usuario]);

  function cerrarSesion() {
    salir();
    navegar('/', { replace: true });
  }

  return (
    <header className="top">
      <button className="ic" type="button" aria-label="Cambiar tema" onClick={cambiarTema}>◐</button>
      <Link className="logo" to={usuario ? inicioDe(usuario.rol) : '/'} aria-label="T Efficiency, inicio">
        <i>T</i>
        <div>T EFFICIENCY<small>INNOVATION ADVISORS</small></div>
      </Link>
      {usuario && (
        <div className="usr">
          <Campana usuario={usuario} />
          <span className="nombre">
            {usuario.rol === 'cliente' ? nombreConEmpresa(usuario.nombre, usuario.empresa) : usuario.nombre}
          </span>
          <button className="salir" type="button" onClick={cerrarSesion}>Salir</button>
        </div>
      )}
    </header>
  );
}
