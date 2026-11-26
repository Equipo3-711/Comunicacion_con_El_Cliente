// Campana de pendientes (RF-18): cuántos hay sin leer y a dónde lleva cada uno.
// Al abrir un pendiente se marca como leído y el contador baja (HU-22).
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { pendientes as apiPendientes } from '../api';
import { useIntervalo } from '../hooks/useIntervalo';
import { fechaCorta, hora } from '../utilidades/formatos';
import { destinoDe } from '../utilidades/destinos';
import type { Pendiente, Usuario } from '../tipos';

const CADA_CUANTO_MS = 30000;

export function Campana({ usuario }: { usuario: Usuario }) {
  const [abierta, setAbierta] = useState(false);
  const [lista, setLista] = useState<Pendiente[]>([]);
  const contenedor = useRef<HTMLDivElement>(null);
  const navegar = useNavigate();

  const cargar = useCallback(async () => {
    try {
      setLista((await apiPendientes.listar()).pendientes);
    } catch {
      // Si falla, se queda lo último que se vio; se reintenta en el siguiente ciclo.
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useIntervalo(cargar, CADA_CUANTO_MS);

  // Se cierra al dar clic fuera o con Esc.
  useEffect(() => {
    if (!abierta) return undefined;
    const alClic = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierta(false);
    };
    const alTecla = (evento: KeyboardEvent) => { if (evento.key === 'Escape') setAbierta(false); };
    document.addEventListener('click', alClic);
    document.addEventListener('keydown', alTecla);
    return () => {
      document.removeEventListener('click', alClic);
      document.removeEventListener('keydown', alTecla);
    };
  }, [abierta]);

  async function abrir(pendiente: Pendiente) {
    await apiPendientes.marcarLeido(pendiente.id).catch(() => {});
    setAbierta(false);
    setLista((actuales) => actuales.filter((otro) => otro.id !== pendiente.id));
    navegar(destinoDe(pendiente, usuario));
  }

  async function leerTodo() {
    await apiPendientes.marcarTodos().catch(() => {});
    await cargar();
  }

  return (
    <div className="campana" ref={contenedor}>
      <button className="bell" type="button" aria-label={`Pendientes: ${lista.length}`} aria-expanded={abierta} onClick={() => setAbierta(!abierta)}>
        🔔{lista.length > 0 && <b>{lista.length}</b>}
      </button>
      {abierta && (
        <div className="bm">
          {lista.length === 0 && <p>Sin pendientes</p>}
          {lista.map((pendiente) => (
            <a key={pendiente.id} href={destinoDe(pendiente, usuario)} onClick={(evento) => { evento.preventDefault(); abrir(pendiente); }}>
              {pendiente.descripcion}
              <small>{fechaCorta(pendiente.creadoEn)} · {hora(pendiente.creadoEn)}</small>
            </a>
          ))}
          {lista.length > 0 && <button className="todo" type="button" onClick={leerTodo}>Marcar todo como leído</button>}
        </div>
      )}
    </div>
  );
}
