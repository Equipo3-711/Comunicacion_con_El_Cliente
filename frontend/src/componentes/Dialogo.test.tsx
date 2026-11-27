import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MENSAJE_SALIR } from '../hooks/useProtegerCambios';
import { Dialogo } from './Dialogo';

// jsdom no calcula cajas: la ventana ocupa de 100 a 500 px en los dos ejes.
const CAJA = { left: 100, right: 500, top: 100, bottom: 500, width: 400, height: 400, x: 100, y: 100, toJSON: () => ({}) };

function Prueba({ proteger = false, alCerrar }: { proteger?: boolean; alCerrar: () => void }) {
  const [abierto, setAbierto] = useState(true);
  return (
    <Dialogo abierto={abierto} titulo="Agregar usuario" proteger={proteger} alCerrar={() => { alCerrar(); setAbierto(false); }}>
      <label htmlFor="telefono">Teléfono</label>
      <input id="telefono" />
    </Dialogo>
  );
}

function montarVentana(proteger = false) {
  const alCerrar = vi.fn();
  render(<Prueba proteger={proteger} alCerrar={alCerrar} />);
  const ventana = screen.getByRole('dialog', { hidden: true });
  vi.spyOn(ventana, 'getBoundingClientRect').mockReturnValue(CAJA as DOMRect);
  return { alCerrar, ventana };
}

// jsdom no trae PointerEvent: se manda como MouseEvent para que lleve coordenadas.
function presionar(elemento: Element, x: number, y: number) {
  fireEvent(elemento, new MouseEvent('pointerdown', { bubbles: true, clientX: x, clientY: y }));
}

function clicEn(elemento: Element, x: number, y: number) {
  presionar(elemento, x, y);
  fireEvent.click(elemento, { clientX: x, clientY: y });
}

beforeEach(() => {
  // jsdom no vacía el historial entre pruebas: cada una empieza sin guardia.
  window.history.replaceState(null, '', '/');
  vi.spyOn(window, 'confirm').mockReturnValue(false);
});

describe('Ventana modal', () => {
  test('un clic en el margen de la ventana o entre campos no la cierra', () => {
    const { alCerrar, ventana } = montarVentana();
    clicEn(ventana, 300, 300);
    clicEn(ventana, 105, 480);
    expect(alCerrar).not.toHaveBeenCalled();
  });

  test('un clic fuera de la ventana sí la cierra', () => {
    const { alCerrar, ventana } = montarVentana();
    clicEn(ventana, 20, 20);
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  test('seleccionar texto en un campo y soltar fuera no la cierra', () => {
    const { alCerrar, ventana } = montarVentana();
    const campo = screen.getByLabelText('Teléfono');
    presionar(campo, 300, 300);
    fireEvent.click(ventana, { clientX: 20, clientY: 20 });
    expect(alCerrar).not.toHaveBeenCalled();
  });

  test('con datos escritos, Esc pregunta antes de cerrar', async () => {
    const { alCerrar, ventana } = montarVentana(true);
    await userEvent.type(screen.getByLabelText('Teléfono'), '477');

    fireEvent(ventana, new Event('cancel', { cancelable: true }));
    expect(window.confirm).toHaveBeenCalledWith(MENSAJE_SALIR);
    expect(alCerrar).not.toHaveBeenCalled();

    vi.mocked(window.confirm).mockReturnValue(true);
    fireEvent(ventana, new Event('cancel', { cancelable: true }));
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  test('sin datos, Esc cierra sin preguntar', () => {
    const { alCerrar, ventana } = montarVentana(true);
    fireEvent(ventana, new Event('cancel', { cancelable: true }));
    expect(window.confirm).not.toHaveBeenCalled();
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  test('al cerrar una ventana donde se escribió, quita su entrada del historial', async () => {
    const atras = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    vi.mocked(window.confirm).mockReturnValue(true);
    const { alCerrar, ventana } = montarVentana(true);
    await userEvent.type(screen.getByLabelText('Teléfono'), '477');
    expect(window.history.state?.guardia).toBe(true);

    fireEvent(ventana, new Event('cancel', { cancelable: true }));
    expect(alCerrar).toHaveBeenCalledTimes(1);
    expect(atras).toHaveBeenCalledTimes(1);
  });

  test('con datos escritos, «atrás» del celular pregunta y, si confirma, solo cierra la ventana', async () => {
    const { alCerrar } = montarVentana(true);
    await userEvent.type(screen.getByLabelText('Teléfono'), '477');

    act(() => { window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(window.confirm).toHaveBeenCalledWith(MENSAJE_SALIR);
    expect(alCerrar).not.toHaveBeenCalled();

    vi.mocked(window.confirm).mockReturnValue(true);
    act(() => { window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });
});
