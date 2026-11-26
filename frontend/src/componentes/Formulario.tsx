// Piezas de los formularios: mensaje de error de un campo, opciones de un <select>,
// opciones en forma de pastilla y el botón que dice «Enviando…» mientras se guarda.
import type { ReactNode } from 'react';
import type { Detalles } from '../api/cliente';

export function ErrorCampo({ mensaje }: { mensaje?: string }) {
  return mensaje ? <p className="er">{mensaje}</p> : null;
}

export function ErrorGeneral({ mensaje }: { mensaje: string }) {
  return mensaje ? <p className="er general" role="alert">{mensaje}</p> : null;
}

// Clase del control: se marca en rojo si la API rechazó ese campo.
export function claseCampo(errores: Detalles, campo: string, base = 'in'): string {
  return errores[campo] ? `${base} bad` : base;
}

interface PropsOpciones {
  textos: Record<string | number, string>;
  vacia?: string;
  vaciaDeshabilitada?: boolean;
}

export function Opciones({ textos, vacia, vaciaDeshabilitada = false }: PropsOpciones) {
  return (
    <>
      {vacia !== undefined && <option value="" disabled={vaciaDeshabilitada}>{vacia}</option>}
      {Object.entries(textos).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
    </>
  );
}

interface PropsPastillas {
  nombre: string;
  leyenda: ReactNode;
  opciones: Record<string, string>;
  valor?: string;
  alCambiar?: (valor: string) => void;
  valorInicial?: string;
  className?: string;
}

// Opciones tipo radio que se ven como pastillas. Controladas (valor + alCambiar) o no (valorInicial).
export function Pastillas({ nombre, leyenda, opciones, valor, alCambiar, valorInicial, className = '' }: PropsPastillas) {
  const controlada = valor !== undefined;
  return (
    <fieldset className={`ch ${className}`.trim()}>
      <legend>{leyenda}</legend>
      {Object.entries(opciones).map(([clave, texto]) => (
        <label key={clave}>
          <input
            type="radio"
            name={nombre}
            value={clave}
            {...(controlada
              ? { checked: valor === clave, onChange: () => alCambiar?.(clave) }
              : { defaultChecked: valorInicial === clave })}
          />
          <span>{texto}</span>
        </label>
      ))}
    </fieldset>
  );
}

interface PropsBoton {
  enviando: boolean;
  children: ReactNode;
  className?: string;
}

export function BotonEnviar({ enviando, children, className = 'btn p' }: PropsBoton) {
  return (
    <button className={className} type="submit" disabled={enviando}>
      {enviando ? 'Enviando…' : children}
    </button>
  );
}

// Los valores del formulario como texto, listos para mandarlos a la API.
export function valoresDe(formulario: HTMLFormElement): Record<string, string> {
  const valores: Record<string, string> = {};
  new FormData(formulario).forEach((valor, campo) => {
    if (typeof valor === 'string') valores[campo] = valor;
  });
  return valores;
}
