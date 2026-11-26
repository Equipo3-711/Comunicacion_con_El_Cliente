// Pantalla 4 · Solicitar cotización (RF-03, CC-10). Cliente y correo salen de la cuenta.
// En /cliente/cotizacion/:id el mismo formulario sirve para modificar una cotización ya enviada (RF-11).
import { useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { cotizaciones, cuenta } from '../../api';
import { useAvisos } from '../../componentes/Avisos';
import { SegunCarga } from '../../componentes/Estados';
import { BotonEnviar, ErrorCampo, ErrorGeneral, Pastillas, claseCampo, valoresDe } from '../../componentes/Formulario';
import { Pantalla } from '../../componentes/Pantalla';
import { useCarga } from '../../hooks/useCarga';
import { useEnvio } from '../../hooks/useEnvio';
import { useSesion, useUsuario } from '../../sesion/Sesion';
import type { CotizacionDetalle, DatosCotizacion } from '../../tipos';
import { TIPOS_CLIENTE, TIPOS_TRABAJO, nombreConEmpresa } from '../../utilidades/textos';

const MAX_ARCHIVOS = 5;
const TIPOS_ACEPTADOS = 'image/jpeg,image/png,image/webp,application/pdf';

// Fotos o planos: se eligen o se arrastran a la zona.
function ZonaArchivos() {
  const entrada = useRef<HTMLInputElement>(null);
  const [nombres, setNombres] = useState<string[]>([]);
  const [encima, setEncima] = useState(false);

  const mostrar = () => setNombres([...(entrada.current?.files ?? [])].map((archivo) => archivo.name));
  const sobre = (evento: DragEvent) => { evento.preventDefault(); setEncima(true); };
  function soltar(evento: DragEvent) {
    evento.preventDefault();
    setEncima(false);
    if (entrada.current) entrada.current.files = evento.dataTransfer.files;
    mostrar();
  }

  return (
    <label className={`up ${encima ? 'encima' : ''}`} onDragEnter={sobre} onDragOver={sobre} onDragLeave={() => setEncima(false)} onDrop={soltar}>
      Fotos o planos (opcional): arrastra imágenes o PDF aquí, o elígelos. Hasta 5 archivos de 10 MB.
      <input ref={entrada} type="file" name="archivos" multiple accept={TIPOS_ACEPTADOS} onChange={mostrar} />
      <ul>{nombres.map((nombre) => <li key={nombre}>{nombre}</li>)}</ul>
    </label>
  );
}

function avisoDeModificacion(cotizacion: CotizacionDetalle): string {
  return cotizacion.estado === 'enviada'
    ? 'Ya te enviamos esta cotización. Si la cambias, la revisaremos de nuevo y te avisaremos en la campana.'
    : 'Cambia lo que necesites. Las fotos o planos que adjuntaste se conservan.';
}

// Al modificar se queda el teléfono de la cotización; si no, el de la cuenta (puede corregirlo).
// Los datos de la cuenta pudieron cambiar desde que inició sesión: se vuelven a pedir.
function useTelefono(existente: CotizacionDetalle | null) {
  const { usuario, actualizarUsuario } = useSesion();
  const [telefono, setTelefono] = useState(existente ? existente.telefono : usuario?.telefono || '');
  const tocado = useRef(Boolean(existente));

  useEffect(() => {
    cuenta.yo().then(({ usuario: actual }) => {
      actualizarUsuario(actual);
      if (!tocado.current) setTelefono(actual.telefono || '');
    }).catch(() => {});
  }, [actualizarUsuario]);

  function cambiar(valor: string) {
    tocado.current = true;
    setTelefono(valor);
  }
  return [telefono, cambiar] as const;
}

function CamposDeLaObra({ existente, errores }: { existente: CotizacionDetalle | null; errores: Record<string, string> }) {
  const valor = (campo: 'direccion' | 'medidas' | 'descripcion') => (existente ? existente[campo] || '' : undefined);
  return (
    <>
      <Pastillas nombre="tipoCliente" leyenda={<>Tipo de cliente <i>*</i></>} opciones={TIPOS_CLIENTE} valorInicial={existente?.tipoCliente} />
      <ErrorCampo mensaje={errores.tipoCliente} />
      <Pastillas nombre="tipoTrabajo" leyenda={<>Tipo de trabajo <i>*</i></>} opciones={TIPOS_TRABAJO} valorInicial={existente?.tipoTrabajo} />
      <ErrorCampo mensaje={errores.tipoTrabajo} />

      <label htmlFor="direccion">Dirección de la obra <i>*</i> (calle, número, colonia y ciudad)</label>
      <input className={claseCampo(errores, 'direccion')} id="direccion" name="direccion" autoComplete="street-address" placeholder="Calle Roble 12, Col. Centro, León" defaultValue={valor('direccion')} />
      <ErrorCampo mensaje={errores.direccion} />

      <label htmlFor="medidas">Medidas aproximadas (opcional)</label>
      <input className={claseCampo(errores, 'medidas')} id="medidas" name="medidas" placeholder="Ej. 3 ventanas de 1.20 × 1.50 m" defaultValue={valor('medidas')} />
      <ErrorCampo mensaje={errores.medidas} />

      <label htmlFor="descripcion">Descripción <i>*</i></label>
      <textarea className={claseCampo(errores, 'descripcion')} id="descripcion" name="descripcion" placeholder="Barandal de vidrio para escalera, 4 m lineales." defaultValue={valor('descripcion')} />
      <ErrorCampo mensaje={errores.descripcion} />
    </>
  );
}

function demasiadosArchivos(formulario: HTMLFormElement): boolean {
  const archivos = formulario.elements.namedItem('archivos') as HTMLInputElement | null;
  return (archivos?.files?.length ?? 0) > MAX_ARCHIVOS;
}

function Formulario({ existente }: { existente: CotizacionDetalle | null }) {
  const usuario = useUsuario();
  const navegar = useNavigate();
  const avisar = useAvisos();
  const { enviando, errores, general, enviar } = useEnvio();
  const [telefono, setTelefono] = useTelefono(existente);
  const modificando = existente !== null;

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    if (demasiadosArchivos(formulario)) {
      avisar(`Puedes adjuntar hasta ${MAX_ARCHIVOS} archivos.`, 'error');
      return;
    }
    // Al modificar, los archivos que ya adjuntó se conservan: solo cambian los datos del formulario.
    const trabajo = existente
      ? () => cotizaciones.modificar(existente.id, valoresDe(formulario) as unknown as DatosCotizacion)
      : () => cotizaciones.enviar(new FormData(formulario));
    const listo = await enviar(trabajo);
    if (listo !== undefined) navegar(`/cliente?${modificando ? 'modificada' : 'enviada'}=1`);
  }

  return (
    <form onSubmit={guardar} noValidate>
      <h2>{modificando ? 'Modificar cotización' : 'Solicitar cotización'}</h2>
      {existente && <p className="nota">{avisoDeModificacion(existente)}</p>}
      <div className="g g2">
        <div>
          <label htmlFor="cliente">Cliente <i>*</i></label>
          <input className="in" id="cliente" readOnly value={nombreConEmpresa(usuario.nombre, usuario.empresa)} />
        </div>
        <div>
          <label htmlFor="correo">Correo <i>*</i></label>
          <input className="in" id="correo" readOnly value={usuario.correo} />
        </div>
      </div>
      <label htmlFor="telefono">Teléfono <i>*</i> (puedes corregirlo)</label>
      <input
        className={claseCampo(errores, 'telefono')}
        id="telefono"
        name="telefono"
        type="tel"
        autoComplete="tel"
        value={telefono}
        onChange={(evento) => setTelefono(evento.target.value)}
      />
      <ErrorCampo mensaje={errores.telefono} />

      <CamposDeLaObra existente={existente} errores={errores} />

      {!modificando && <ZonaArchivos />}
      <ErrorCampo mensaje={errores.archivos} />

      <ErrorGeneral mensaje={general} />
      <div className="g g2 botones">
        <Link className="btn" to="/cliente">Cancelar</Link>
        <BotonEnviar enviando={enviando}>{modificando ? 'Guardar cambios' : 'Enviar cotización'}</BotonEnviar>
      </div>
    </form>
  );
}

function Modificar({ id }: { id: string }) {
  const carga = useCarga(() => cotizaciones.obtener(id), [id]);
  return <SegunCarga carga={carga}>{({ cotizacion }) => <Formulario existente={cotizacion} />}</SegunCarga>;
}

export default function Cotizacion() {
  const { id } = useParams();
  return (
    <Pantalla titulo={id ? 'Modificar cotización' : 'Solicitar cotización'} className="card formulario">
      {id ? <Modificar id={id} /> : <Formulario existente={null} />}
    </Pantalla>
  );
}
