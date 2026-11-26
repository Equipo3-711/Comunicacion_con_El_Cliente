// Pantalla 2 · Crear cuenta. El registro es obligatorio antes de cotizar (CC-01, RF-02).
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { cuenta } from '../api';
import { BotonEnviar, ErrorCampo, ErrorGeneral, claseCampo, valoresDe } from '../componentes/Formulario';
import { Pantalla } from '../componentes/Pantalla';
import { useEnvio } from '../hooks/useEnvio';
import { useSesion } from '../sesion/Sesion';

export default function Registro() {
  const { iniciar } = useSesion();
  const navegar = useNavigate();
  const { enviando, errores, general, enviar } = useEnvio();

  async function crearCuenta(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const sesion = await enviar(() => cuenta.registrar(valoresDe(evento.currentTarget)));
    if (!sesion) return;
    iniciar(sesion);
    navegar('/cliente?bienvenida=1', { replace: true });
  }

  return (
    <Pantalla titulo="Crear cuenta" className="card angosta">
      <form onSubmit={crearCuenta} noValidate>
        <h2>Crear cuenta</h2>
        <p className="suave">Necesitas una cuenta para solicitar una cotización y seguir tus proyectos.</p>
        <label htmlFor="nombre">Nombre de contacto <i>*</i></label>
        <input className={claseCampo(errores, 'nombre')} id="nombre" name="nombre" autoComplete="name" placeholder="Ana López" />
        <ErrorCampo mensaje={errores.nombre} />
        <label htmlFor="empresa">Empresa <i>*</i> (si eres particular, escribe tu nombre)</label>
        <input className={claseCampo(errores, 'empresa')} id="empresa" name="empresa" autoComplete="organization" placeholder="Constructora Roble" />
        <ErrorCampo mensaje={errores.empresa} />
        <label htmlFor="correo">Correo <i>*</i></label>
        <input className={claseCampo(errores, 'correo')} id="correo" name="correo" type="email" autoComplete="email" placeholder="ana@roble.com" />
        <ErrorCampo mensaje={errores.correo} />
        <label htmlFor="telefono">Teléfono <i>*</i></label>
        <input className={claseCampo(errores, 'telefono')} id="telefono" name="telefono" type="tel" autoComplete="tel" placeholder="477 123 4567" />
        <ErrorCampo mensaje={errores.telefono} />
        <div className="g g2">
          <div>
            <label htmlFor="contrasena">Contraseña <i>*</i></label>
            <input className={claseCampo(errores, 'contrasena')} id="contrasena" name="contrasena" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" />
            <ErrorCampo mensaje={errores.contrasena} />
          </div>
          <div>
            <label htmlFor="confirmarContrasena">Confirmar contraseña <i>*</i></label>
            <input className={claseCampo(errores, 'confirmarContrasena')} id="confirmarContrasena" name="confirmarContrasena" type="password" autoComplete="new-password" />
            <ErrorCampo mensaje={errores.confirmarContrasena} />
          </div>
        </div>
        <ErrorGeneral mensaje={general} />
        <BotonEnviar enviando={enviando}>Crear cuenta</BotonEnviar>
        <p className="centro"><Link to="/">Ya tengo cuenta</Link></p>
      </form>
    </Pantalla>
  );
}
