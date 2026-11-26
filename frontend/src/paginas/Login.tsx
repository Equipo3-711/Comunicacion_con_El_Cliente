// Pantalla 1 · Iniciar sesión. El rol que devuelve la API decide a qué pantalla se entra (RNF-06).
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { cuenta } from '../api';
import { BotonEnviar, ErrorCampo, ErrorGeneral, claseCampo, valoresDe } from '../componentes/Formulario';
import { Pantalla } from '../componentes/Pantalla';
import { useEnvio } from '../hooks/useEnvio';
import { inicioDe } from '../sesion/almacen';
import { useSesion } from '../sesion/Sesion';

export default function Login() {
  const { usuario, iniciar } = useSesion();
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const { enviando, errores, general, enviar } = useEnvio();

  if (usuario) return <Navigate to={inicioDe(usuario.rol)} replace />;

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const { correo = '', contrasena = '' } = valoresDe(evento.currentTarget);
    // El mismo mensaje si falla el correo o la contraseña (T-08).
    const sesion = await enviar(() => cuenta.iniciarSesion({ correo, contrasena }));
    if (!sesion) return;
    iniciar(sesion);
    navegar(inicioDe(sesion.usuario.rol), { replace: true });
  }

  return (
    <Pantalla titulo="Iniciar sesión" className="card hero">
      <div>
        <h1>Cada ventana,<br />a la vista.</h1>
        <p className="suave">Ventanas, fachadas, canceles y barandales. Sigue cada proyecto en tiempo real.</p>
      </div>
      <form onSubmit={entrar} noValidate>
        <h2>Iniciar sesión</h2>
        {parametros.get('expirada') === '1' && <p className="aviso">Tu sesión terminó. Vuelve a iniciar sesión.</p>}
        <label htmlFor="correo">Correo</label>
        <input className={claseCampo(errores, 'correo')} id="correo" name="correo" type="email" autoComplete="email" placeholder="tu@empresa.com" required />
        <ErrorCampo mensaje={errores.correo} />
        <label htmlFor="contrasena">Contraseña</label>
        <input className={claseCampo(errores, 'contrasena')} id="contrasena" name="contrasena" type="password" autoComplete="current-password" placeholder="••••••••" required />
        <ErrorCampo mensaje={errores.contrasena} />
        <ErrorGeneral mensaje={general} />
        <BotonEnviar enviando={enviando}>Iniciar sesión</BotonEnviar>
        <p className="centro suave">¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link></p>
        <p className="nota centro">El personal de T Efficiency entra con su correo de trabajo.</p>
      </form>
    </Pantalla>
  );
}
