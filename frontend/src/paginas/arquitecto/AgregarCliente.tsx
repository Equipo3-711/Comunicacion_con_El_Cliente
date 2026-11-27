// Agregar usuario: cliente nuevo (cuenta + proyecto) o proyecto para un cliente ya registrado.
// Si viene de una cotización, se abre como «Cliente ya registrado» y el proyecto queda ligado a ella.
import { useState, type FormEvent } from 'react';
import { clientes, proyectos } from '../../api';
import type { Detalles } from '../../api/cliente';
import { Dialogo } from '../../componentes/Dialogo';
import { BotonEnviar, ErrorCampo, ErrorGeneral, Opciones, Pastillas, claseCampo, valoresDe } from '../../componentes/Formulario';
import { useCarga } from '../../hooks/useCarga';
import { useEnvio } from '../../hooks/useEnvio';
import type { Cotizacion } from '../../tipos';
import { TIPOS_TRABAJO } from '../../utilidades/textos';

type Modo = 'nuevo' | 'registrado';
const MODOS: Record<Modo, string> = { nuevo: 'Cliente nuevo', registrado: 'Cliente ya registrado' };

interface Props {
  abierto: boolean;
  cotizacion: Cotizacion | null;
  alCerrar: () => void;
  alGuardar: () => void;
}

// La API llama «nombre» al nombre de la obra cuando se crea solo el proyecto.
function adaptarErrores(modo: Modo) {
  return (detalles: Detalles): Detalles => {
    if (modo !== 'registrado' || !detalles.nombre) return detalles;
    const { nombre, ...resto } = detalles;
    return { ...resto, nombreProyecto: nombre };
  };
}

// Son los datos de otra persona: sin autocompletar, para que el celular no ofrezca los del arquitecto.
function CamposClienteNuevo({ errores }: { errores: Detalles }) {
  return (
    <>
      <div className="g g2">
        <div><label htmlFor="nombre">Nombre de contacto <i>*</i></label>
          <input className={claseCampo(errores, 'nombre')} id="nombre" name="nombre" autoComplete="off" />
          <ErrorCampo mensaje={errores.nombre} /></div>
        <div><label htmlFor="empresa">Empresa <i>*</i></label>
          <input className={claseCampo(errores, 'empresa')} id="empresa" name="empresa" autoComplete="off" />
          <ErrorCampo mensaje={errores.empresa} /></div>
        <div><label htmlFor="correoCliente">Correo <i>*</i></label>
          <input className={claseCampo(errores, 'correo')} id="correoCliente" name="correo" type="email" autoComplete="off" />
          <ErrorCampo mensaje={errores.correo} /></div>
        <div><label htmlFor="telefonoCliente">Teléfono <i>*</i></label>
          <input className={claseCampo(errores, 'telefono')} id="telefonoCliente" name="telefono" type="tel" inputMode="tel" autoComplete="off" />
          <ErrorCampo mensaje={errores.telefono} /></div>
      </div>
      <label htmlFor="contrasenaInicial">Contraseña inicial <i>*</i> (compártela con el cliente; mínimo 8 caracteres)</label>
      <input className={claseCampo(errores, 'contrasena')} id="contrasenaInicial" name="contrasena" type="password" autoComplete="new-password" />
      <ErrorCampo mensaje={errores.contrasena} />
    </>
  );
}

function CampoEmpresa({ errores, elegida }: { errores: Detalles; elegida?: string }) {
  const carga = useCarga(() => clientes.empresas(), []);
  const empresas = carga.datos?.empresas ?? [];
  const inicial = empresas.find((empresa) => empresa.nombre === elegida)?.id ?? '';
  return (
    <>
      <label htmlFor="empresaId">Empresa del cliente <i>*</i></label>
      {/* Se vuelve a crear cuando llegan las empresas, para que quede elegida la de la cotización. */}
      <select key={empresas.length} className={claseCampo(errores, 'empresaId')} id="empresaId" name="empresaId" defaultValue={inicial}>
        <Opciones textos={Object.fromEntries(empresas.map((empresa) => [empresa.id, empresa.nombre]))} vacia="Elige…" />
      </select>
      <ErrorCampo mensaje={errores.empresaId} />
    </>
  );
}

function FormularioAgregar({ cotizacion, alGuardar }: Pick<Props, 'cotizacion' | 'alGuardar'>) {
  const [modo, setModo] = useState<Modo>(cotizacion ? 'registrado' : 'nuevo');
  const { enviando, errores, general, enviar, limpiar } = useEnvio();

  function cambiarModo(nuevo: string) {
    setModo(nuevo as Modo);
    limpiar();
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = valoresDe(evento.currentTarget);
    const trabajo = modo === 'nuevo'
      ? () => clientes.agregar(datos)
      : () => proyectos.crear({
        empresaId: datos.empresaId,
        nombre: datos.nombreProyecto,
        tipoTrabajo: datos.tipoTrabajo,
        ...(cotizacion ? { cotizacionId: cotizacion.id } : {}),
      });
    const listo = await enviar(trabajo, adaptarErrores(modo));
    if (listo !== undefined) alGuardar();
  }

  return (
    <form onSubmit={guardar} noValidate>
      <Pastillas className="mt" nombre="modo" leyenda="¿El cliente ya tiene cuenta?" opciones={MODOS} valor={modo} alCambiar={cambiarModo} />
      {modo === 'nuevo' ? <CamposClienteNuevo errores={errores} /> : <CampoEmpresa errores={errores} elegida={cotizacion?.empresa} />}
      <div className="g g2">
        <div><label htmlFor="nombreProyecto">Nombre de la obra <i>*</i></label>
          <input className={claseCampo(errores, 'nombreProyecto')} id="nombreProyecto" name="nombreProyecto" placeholder="Ventanas · Calle Roble 12" />
          <ErrorCampo mensaje={errores.nombreProyecto} /></div>
        <div><label htmlFor="tipoTrabajo">Tipo de trabajo <i>*</i></label>
          <select className={claseCampo(errores, 'tipoTrabajo')} id="tipoTrabajo" name="tipoTrabajo" defaultValue={cotizacion?.tipoTrabajo ?? ''}>
            <Opciones textos={TIPOS_TRABAJO} vacia="Elige…" />
          </select>
          <ErrorCampo mensaje={errores.tipoTrabajo} /></div>
      </div>
      <ErrorGeneral mensaje={general} />
      <BotonEnviar enviando={enviando}>Agregar a mi cartera</BotonEnviar>
    </form>
  );
}

export function AgregarCliente({ abierto, cotizacion, alCerrar, alGuardar }: Props) {
  return (
    <Dialogo abierto={abierto} alCerrar={alCerrar} titulo="Agregar usuario" proteger>
      <FormularioAgregar key={cotizacion?.id ?? 'nuevo'} cotizacion={cotizacion} alGuardar={alGuardar} />
    </Dialogo>
  );
}
