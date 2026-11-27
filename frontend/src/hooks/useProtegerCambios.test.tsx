import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MENSAJE_SALIR, useProtegerCambios } from './useProtegerCambios';

let sinCambios: () => boolean = () => false;

function Formulario() {
  const formulario = useRef<HTMLFormElement>(null);
  const proteccion = useProtegerCambios(formulario);
  sinCambios = proteccion.sinCambios;
  return (
    <form ref={formulario}>
      <label htmlFor="telefono">Teléfono</label>
      <input id="telefono" />
    </form>
  );
}

const atras = () => act(() => { window.dispatchEvent(new PopStateEvent('popstate')); });

beforeEach(() => {
  // jsdom no vacía el historial entre pruebas: cada una empieza sin guardia.
  window.history.replaceState(null, '', '/');
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  vi.spyOn(window.history, 'back').mockImplementation(() => {});
});

describe('Proteger lo escrito en un formulario', () => {
  test('sin datos, «atrás» no pregunta nada', () => {
    render(<Formulario />);
    atras();
    expect(window.confirm).not.toHaveBeenCalled();
  });

  test('al escribir agrega una entrada al historial, así «atrás» no cierra el navegador', async () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    render(<Formulario />);
    await userEvent.type(screen.getByLabelText('Teléfono'), '4771234567');
    expect(pushState).toHaveBeenCalledTimes(1);
  });

  test('con datos, «atrás» pregunta; si se queda, vuelve a protegerse y no sale', async () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    render(<Formulario />);
    await userEvent.type(screen.getByLabelText('Teléfono'), '477');
    atras();

    expect(window.confirm).toHaveBeenCalledWith(MENSAJE_SALIR);
    expect(pushState).toHaveBeenCalledTimes(2);
    expect(window.history.back).not.toHaveBeenCalled();
  });

  test('si confirma que quiere salir, regresa a la página anterior', async () => {
    vi.mocked(window.confirm).mockReturnValue(true);
    render(<Formulario />);
    await userEvent.type(screen.getByLabelText('Teléfono'), '477');
    atras();
    expect(window.history.back).toHaveBeenCalledTimes(1);
  });

  test('después de guardar ya no pregunta y avisa que la guardia está arriba', async () => {
    render(<Formulario />);
    await userEvent.type(screen.getByLabelText('Teléfono'), '477');
    expect(sinCambios()).toBe(true);
    atras();
    expect(window.confirm).not.toHaveBeenCalled();
  });
});
