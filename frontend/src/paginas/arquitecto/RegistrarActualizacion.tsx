// Registrar actualización: avance, solicitud, cambio de estado o documento (RF-16).
// Cada tipo va a su propia ruta de la API; la fecha y el responsable se llenan solos.
import { useState, type FormEvent } from 'react';
import { proyectos } from '../../api';
import { CampoArchivos } from '../../componentes/CampoArchivos';
import { BotonEnviar, ErrorCampo, ErrorGeneral, Opciones, Pastillas, claseCampo } from '../../componentes/Formulario';
import { useEnvio } from '../../hooks/useEnvio';
import { useUsuario } from '../../sesion/Sesion';
import type { EstadoProyecto, TipoEvento } from '../../tipos';
import { hoy } from '../../utilidades/formatos';
import { ESTADOS, TIPOS_EVENTO } from '../../utilidades/textos';

interface Props {
  proyectoId: string;
  estadoActual: EstadoProyecto;
  alGuardar: () => void;
}

function guardarSegunTipo(proyectoId: string, tipo: TipoEvento, formulario: HTMLFormElement) {
  const campos = formulario.elements;
  const valor = (nombre: string) => (campos.namedItem(nombre) as HTMLInputElement | null)?.value ?? '';
  const archivos = (nombre: string) => [...((campos.namedItem(nombre) as HTMLInputElement | null)?.files ?? [])];

  if (tipo === 'cambio_estado') return proyectos.cambiarEstado(proyectoId, valor('estado'));
  const datos = new FormData();
  if (tipo === 'documento') {
    datos.append('nombre', valor('nombre'));
    const [archivo] = archivos('archivo');
    if (archivo) datos.append('archivo', archivo);
    return proyectos.subirDocumento(proyectoId, datos);
  }
  datos.append('tipo', tipo);
  datos.append('descripcion', valor('descripcion'));
  archivos('fotos').forEach((foto) => datos.append('fotos', foto));
  return proyectos.registrarActualizacion(proyectoId, datos);
}

export function RegistrarActualizacion({ proyectoId, estadoActual, alGuardar }: Props) {
  const usuario = useUsuario();
  const [tipo, setTipo] = useState<TipoEvento>('avance');
  const { enviando, errores, general, enviar, limpiar } = useEnvio();
  const otrosEstados = Object.fromEntries(Object.entries(ESTADOS).filter(([clave]) => clave !== estadoActual));

  function cambiarTipo(nuevo: string) {
    setTipo(nuevo as TipoEvento);
    limpiar();
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const listo = await enviar(() => guardarSegunTipo(proyectoId, tipo, formulario));
    if (listo === undefined) return;
    formulario.reset();
    setTipo('avance');
    alGuardar();
  }

  return (
    <form className="card bloque" onSubmit={guardar} noValidate>
      <h3>Nueva actualización</h3>
      <Pastillas className="mt" nombre="tipo" leyenda="Tipo" opciones={TIPOS_EVENTO} valor={tipo} alCambiar={cambiarTipo} />

      {(tipo === 'avance' || tipo === 'solicitud') && (
        <div>
          <label htmlFor="descripcion">Descripción</label>
          <textarea className={claseCampo(errores, 'descripcion')} id="descripcion" name="descripcion" maxLength={500} placeholder="Se instalaron 2 de 3 ventanas." />
          <ErrorCampo mensaje={errores.descripcion} />
          <CampoArchivos nombre="fotos" titulo="Fotos (opcional)" ayuda="Hasta 5 imágenes JPG, PNG o WEBP." accept="image/jpeg,image/png,image/webp" multiple />
          <ErrorCampo mensaje={errores.fotos} />
        </div>
      )}

      {tipo === 'cambio_estado' && (
        <div>
          <label htmlFor="nuevoEstado">Nuevo estado</label>
          <select className={claseCampo(errores, 'estado')} id="nuevoEstado" name="estado">
            <Opciones textos={otrosEstados} />
          </select>
          <ErrorCampo mensaje={errores.estado} />
        </div>
      )}

      {tipo === 'documento' && (
        <div>
          <label htmlFor="nombreDocumento">Nombre del documento</label>
          <input className={claseCampo(errores, 'nombre')} id="nombreDocumento" name="nombre" placeholder="Contrato, ficha técnica, garantía…" />
          <ErrorCampo mensaje={errores.nombre} />
          <CampoArchivos nombre="archivo" titulo="Archivo" ayuda="PDF o imagen JPG, PNG o WEBP." accept="application/pdf,image/jpeg,image/png,image/webp" />
          <ErrorCampo mensaje={errores.archivo} />
        </div>
      )}

      <p className="nota">Fecha y responsable se llenan solos: {hoy()} · {usuario.nombre}</p>
      <ErrorGeneral mensaje={general} />
      <BotonEnviar enviando={enviando}>Guardar</BotonEnviar>
    </form>
  );
}
