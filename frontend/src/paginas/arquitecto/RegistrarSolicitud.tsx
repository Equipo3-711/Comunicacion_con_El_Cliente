// Registrar lo que llegó por WhatsApp, una llamada, redes sociales, correo o en persona (RF-01, RNF-01).
import { useMemo, useState, type FormEvent } from 'react';
import { clientes as apiClientes, proyectos as apiProyectos, solicitudes } from '../../api';
import type { Detalles } from '../../api/cliente';
import { Dialogo } from '../../componentes/Dialogo';
import { BotonEnviar, ErrorCampo, ErrorGeneral, Opciones, Pastillas, claseCampo, valoresDe } from '../../componentes/Formulario';
import { useCarga } from '../../hooks/useCarga';
import { useEnvio } from '../../hooks/useEnvio';
import { useUsuario } from '../../sesion/Sesion';
import type { NuevaSolicitud } from '../../tipos';
import { CANALES, CATEGORIAS, nombreConEmpresa } from '../../utilidades/textos';

type Quien = 'cliente' | 'contacto';
const QUIEN: Record<Quien, string> = { cliente: 'Cliente registrado', contacto: 'Alguien sin cuenta' };

// El portal no se elige: lo que llega por el portal entra solo a la bandeja.
const CANALES_A_MANO = Object.fromEntries(Object.entries(CANALES).filter(([valor]) => valor !== 'portal'));

interface Props {
  abierto: boolean;
  responsables: Record<number, string>;
  alCerrar: () => void;
  alGuardar: () => void;
}

// Si eligió «cliente registrado» pero no eligió a nadie, el aviso va debajo de la lista de clientes.
function adaptarErrores(quien: Quien) {
  return (detalles: Detalles): Detalles => {
    if (quien !== 'cliente' || !detalles.contactoNombre) return detalles;
    const { contactoNombre, ...resto } = detalles;
    return { ...resto, clienteId: 'Elige al cliente.' };
  };
}

// Solo se manda lo que corresponde a «cliente registrado» o a «alguien sin cuenta»; lo demás va vacío.
const CAMPOS_DE: Record<Quien, (keyof NuevaSolicitud)[]> = {
  cliente: ['clienteId', 'proyectoId'],
  contacto: ['contactoNombre', 'contactoTelefono'],
};

export function armarSolicitud(valores: Record<string, string>, quien: Quien): NuevaSolicitud {
  const ajenos = CAMPOS_DE[quien === 'cliente' ? 'contacto' : 'cliente'];
  const campos: (keyof NuevaSolicitud)[] = ['canal', 'categoria', 'descripcion', 'responsableId', ...CAMPOS_DE.cliente, ...CAMPOS_DE.contacto];
  return Object.fromEntries(campos.map((campo) => [campo, ajenos.includes(campo) ? '' : valores[campo] ?? ''])) as unknown as NuevaSolicitud;
}

function ClienteRegistrado({ errores }: { errores: Detalles }) {
  const carga = useCarga(async () => {
    const [{ clientes }, { proyectos }] = await Promise.all([apiClientes.listar(), apiProyectos.listar()]);
    return { clientes, proyectos };
  }, []);
  const [clienteId, setClienteId] = useState('');
  const clientes = useMemo(() => carga.datos?.clientes ?? [], [carga.datos]);

  // Solo los proyectos de la empresa del cliente elegido.
  const suyos = useMemo(() => {
    const cliente = clientes.find((registro) => String(registro.id) === clienteId);
    return cliente ? (carga.datos?.proyectos ?? []).filter((proyecto) => proyecto.empresaId === cliente.empresaId) : [];
  }, [clientes, clienteId, carga.datos]);

  return (
    <div className="g g2">
      <div>
        <label htmlFor="clienteId">Cliente</label>
        <select className={claseCampo(errores, 'clienteId')} id="clienteId" name="clienteId" value={clienteId} onChange={(evento) => setClienteId(evento.target.value)}>
          <Opciones
            textos={Object.fromEntries(clientes.map((cliente) => [cliente.id, nombreConEmpresa(cliente.nombre, cliente.empresa)]))}
            vacia={carga.datos ? 'Elige…' : 'Cargando…'}
          />
        </select>
        <ErrorCampo mensaje={errores.clienteId} />
      </div>
      <div>
        <label htmlFor="proyectoId">Proyecto (opcional)</label>
        <select key={clienteId} className={claseCampo(errores, 'proyectoId')} id="proyectoId" name="proyectoId" defaultValue="">
          <Opciones textos={Object.fromEntries(suyos.map((proyecto) => [proyecto.id, proyecto.nombre]))} vacia="Ninguno" />
        </select>
        <ErrorCampo mensaje={errores.proyectoId} />
      </div>
    </div>
  );
}

function Contacto({ errores }: { errores: Detalles }) {
  return (
    <div className="g g2">
      <div>
        <label htmlFor="contactoNombre">Nombre</label>
        <input className={claseCampo(errores, 'contactoNombre')} id="contactoNombre" name="contactoNombre" autoComplete="off" />
        <ErrorCampo mensaje={errores.contactoNombre} />
      </div>
      <div>
        <label htmlFor="contactoTelefono">Teléfono (opcional)</label>
        <input className={claseCampo(errores, 'contactoTelefono')} id="contactoTelefono" name="contactoTelefono" type="tel" autoComplete="off" />
        <ErrorCampo mensaje={errores.contactoTelefono} />
      </div>
    </div>
  );
}

function FormularioSolicitud({ responsables, alGuardar }: Pick<Props, 'responsables' | 'alGuardar'>) {
  const usuario = useUsuario();
  const [quien, setQuien] = useState<Quien>('cliente');
  const { enviando, errores, general, enviar } = useEnvio();

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = armarSolicitud(valoresDe(evento.currentTarget), quien);
    const listo = await enviar(() => solicitudes.registrar(datos), adaptarErrores(quien));
    if (listo !== undefined) alGuardar();
  }

  return (
    <form onSubmit={guardar} noValidate>
      <Pastillas className="mt" nombre="canal" leyenda={<>¿Por dónde llegó? <i>*</i></>} opciones={CANALES_A_MANO} />
      <ErrorCampo mensaje={errores.canal} />

      <label htmlFor="categoria">¿De qué se trata? <i>*</i></label>
      <select className={claseCampo(errores, 'categoria')} id="categoria" name="categoria" defaultValue="">
        <Opciones textos={CATEGORIAS} vacia="Elige…" />
      </select>
      <ErrorCampo mensaje={errores.categoria} />

      <Pastillas nombre="quien" leyenda="¿Quién la pide?" opciones={QUIEN} valor={quien} alCambiar={(valor) => setQuien(valor as Quien)} />
      {quien === 'cliente' ? <ClienteRegistrado errores={errores} /> : <Contacto errores={errores} />}

      <label htmlFor="descripcion">¿Qué pidió? <i>*</i></label>
      <textarea className={claseCampo(errores, 'descripcion')} id="descripcion" name="descripcion" placeholder="Pregunta si hacen canceles de baño templados." />
      <ErrorCampo mensaje={errores.descripcion} />

      <label htmlFor="responsableId">Responsable</label>
      <select className={claseCampo(errores, 'responsableId')} id="responsableId" name="responsableId" defaultValue={String(usuario.id)}>
        <Opciones textos={responsables} />
      </select>
      <ErrorCampo mensaje={errores.responsableId} />

      <ErrorGeneral mensaje={general} />
      <BotonEnviar enviando={enviando}>Guardar solicitud</BotonEnviar>
    </form>
  );
}

export function RegistrarSolicitud({ abierto, responsables, alCerrar, alGuardar }: Props) {
  return (
    <Dialogo abierto={abierto} alCerrar={alCerrar} titulo="Registrar solicitud" proteger>
      <FormularioSolicitud responsables={responsables} alGuardar={alGuardar} />
    </Dialogo>
  );
}
