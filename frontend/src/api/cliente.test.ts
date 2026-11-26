import { afterEach, describe, expect, test, vi } from 'vitest';
import { ErrorApi, consulta, pedir } from './cliente';
import { guardarSesion, leerSesion } from '../sesion/almacen';

const respuesta = (estado: number, cuerpo: unknown) => new Response(JSON.stringify(cuerpo), {
  status: estado, headers: { 'Content-Type': 'application/json' },
});

afterEach(() => vi.unstubAllGlobals());

describe('conexión con la API', () => {
  test('manda el token y el cuerpo en JSON', async () => {
    guardarSesion({ token: 'abc', usuario: { id: 1, rol: 'admin' } as never });
    const fetch = vi.fn().mockResolvedValue(respuesta(200, { ok: true }));
    vi.stubGlobal('fetch', fetch);

    await pedir('POST', '/solicitudes', { canal: 'llamada' });

    const [url, opciones] = fetch.mock.calls[0];
    expect(url).toBe('/api/solicitudes');
    expect(opciones.headers).toMatchObject({ Authorization: 'Bearer abc', 'Content-Type': 'application/json' });
    expect(opciones.body).toBe('{"canal":"llamada"}');
  });

  test('un 400 llega como ErrorApi con el mensaje de cada campo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(400, { error: 'Revisa los datos.', detalles: { canal: 'Elige el canal.' } })));

    const error: ErrorApi = await pedir('POST', '/solicitudes', {}).catch((fallo: ErrorApi) => fallo) as ErrorApi;

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.estado).toBe(400);
    expect(error.detalles).toEqual({ canal: 'Elige el canal.' });
  });

  test('si la sesión expiró (401), la borra y vuelve a iniciar sesión', async () => {
    guardarSesion({ token: 'viejo', usuario: { id: 1, rol: 'cliente' } as never });
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(401, { error: 'Sesión expirada.' })));

    await pedir('GET', '/proyectos').catch(() => {});

    expect(leerSesion()).toBeNull();
    expect(assign).toHaveBeenCalledWith('/?expirada=1');
  });

  test('sin conexión da un mensaje claro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(pedir('GET', '/proyectos')).rejects.toThrow(/API esté encendida/);
  });

  test('la consulta omite los filtros vacíos', () => {
    expect(consulta({ estado: 'nueva', canal: '', categoria: undefined })).toBe('?estado=nueva');
    expect(consulta({})).toBe('');
  });
});
