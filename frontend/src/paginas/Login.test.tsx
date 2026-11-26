import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { cuenta } from '../api';
import { ErrorApi } from '../api/cliente';
import { ADMIN, CLIENTE, montar } from '../pruebas/montar';
import { RutaProtegida } from '../sesion/Sesion';
import Login from './Login';

describe('Iniciar sesión', () => {
  test('el personal entra a su inicio y la sesión queda guardada', async () => {
    vi.spyOn(cuenta, 'iniciarSesion').mockResolvedValue({ token: 't', usuario: ADMIN });
    montar(<Login />, { patron: '/' });

    await userEvent.type(screen.getByLabelText('Correo'), 'laura@tefficiency.test');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(cuenta.iniciarSesion).toHaveBeenCalledWith({ correo: 'laura@tefficiency.test', contrasena: 'secreta123' });
    expect(await screen.findByTestId('direccion')).toHaveTextContent('/arquitecto');
    expect(sessionStorage.getItem('portal-sesion')).toContain('"rol":"admin"');
  });

  test('muestra el mensaje de la API debajo del campo y no entra', async () => {
    vi.spyOn(cuenta, 'iniciarSesion').mockRejectedValue(
      new ErrorApi(400, 'Revisa los datos marcados.', { correo: 'Escribe un correo válido.' }),
    );
    montar(<Login />, { patron: '/' });

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Escribe un correo válido.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los datos marcados.');
    expect(screen.getByLabelText('Correo')).toHaveClass('bad');
    expect(screen.getByTestId('direccion')).toHaveTextContent(/^\/$/);
  });

  test('avisa cuando la sesión expiró', () => {
    montar(<Login />, { patron: '/', ruta: '/?expirada=1' });
    expect(screen.getByText(/Tu sesión terminó/)).toBeInTheDocument();
  });
});

describe('pantallas protegidas', () => {
  test('sin sesión manda a iniciar sesión', () => {
    montar(<RutaProtegida roles={['admin']} />, { ruta: '/arquitecto', patron: '/arquitecto' });
    expect(screen.getByTestId('direccion')).toHaveTextContent(/^\/$/);
  });

  test('un cliente que abre una pantalla del personal regresa a sus proyectos', () => {
    montar(<RutaProtegida roles={['admin']} />, { usuario: CLIENTE, ruta: '/arquitecto', patron: '/arquitecto' });
    expect(screen.getByTestId('direccion')).toHaveTextContent('/cliente');
  });
});
