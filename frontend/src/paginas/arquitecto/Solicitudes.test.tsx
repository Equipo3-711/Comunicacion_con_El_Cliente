import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { clientes, pendientes, proyectos, solicitudes } from '../../api';
import { ADMIN, montar } from '../../pruebas/montar';
import type { Solicitud } from '../../tipos';
import { armarSolicitud } from './RegistrarSolicitud';
import Solicitudes from './Solicitudes';

const WHATSAPP: Solicitud = {
  id: 70, canal: 'whatsapp', categoria: 'duda', estado: 'nueva', descripcion: '¿Hacen canceles templados?',
  clienteId: null, contacto: 'Roberto Díaz', telefono: '477 555 0123', empresa: null, proyectoId: null, proyecto: null,
  cotizacionId: null, responsableId: null, responsable: null, registradaPorId: 1, registradaPor: ADMIN.nombre,
  creadoEn: '2026-11-20 09:15:00', atendidaEn: null,
};

beforeEach(() => {
  vi.spyOn(pendientes, 'listar').mockResolvedValue({ total: 0, pendientes: [] });
  vi.spyOn(solicitudes, 'responsables').mockResolvedValue({ responsables: [{ id: 1, nombre: ADMIN.nombre }, { id: 5, nombre: 'Ing. Paola Ruiz' }] });
  vi.spyOn(solicitudes, 'listar').mockResolvedValue({ solicitudes: [WHATSAPP] });
});

describe('Bandeja de solicitudes', () => {
  test('muestra quién pide, por dónde llegó y cuántas faltan', async () => {
    montar(<Solicitudes />, { usuario: ADMIN });

    expect(await screen.findByText('Roberto Díaz')).toBeInTheDocument();
    expect(screen.getByText('(sin cuenta)')).toBeInTheDocument();
    expect(screen.getByText('1 solicitud(es) · 1 sin atender')).toBeInTheDocument();
    const fila = screen.getByRole('article');
    expect(within(fila).getByText('WhatsApp')).toBeInTheDocument();
  });

  test('asignar responsable se guarda al elegirlo y vuelve a cargar la bandeja', async () => {
    vi.spyOn(solicitudes, 'actualizar').mockResolvedValue({ solicitud: { ...WHATSAPP, responsableId: 5 } });
    montar(<Solicitudes />, { usuario: ADMIN });
    await screen.findByText('Roberto Díaz');

    await userEvent.selectOptions(screen.getByLabelText('Responsable', { selector: 'select.chico' }), '5');

    expect(solicitudes.actualizar).toHaveBeenCalledWith(70, { responsableId: '5' });
    expect(await screen.findByText('Solicitud actualizada.')).toBeInTheDocument();
    expect(solicitudes.listar).toHaveBeenCalledTimes(2);
  });

  test('los filtros se mandan a la API', async () => {
    montar(<Solicitudes />, { usuario: ADMIN });
    await screen.findByText('Roberto Díaz');

    const filtros = screen.getByRole('form', { name: 'Filtros' });
    await userEvent.selectOptions(within(filtros).getByRole('combobox', { name: 'Estado' }), 'nueva');

    await waitFor(() => expect(solicitudes.listar).toHaveBeenLastCalledWith({ estado: 'nueva' }));
  });

  test('registrar una llamada de alguien sin cuenta', async () => {
    vi.spyOn(clientes, 'listar').mockResolvedValue({ clientes: [] });
    vi.spyOn(proyectos, 'listar').mockResolvedValue({ proyectos: [] });
    vi.spyOn(solicitudes, 'registrar').mockResolvedValue({ solicitud: WHATSAPP });
    montar(<Solicitudes />, { usuario: ADMIN });
    await screen.findByText('Roberto Díaz');

    await userEvent.click(screen.getByRole('button', { name: /Registrar solicitud/ }));
    const dialogo = screen.getByRole('dialog');
    await userEvent.click(within(dialogo).getByText('Llamada'));
    await userEvent.selectOptions(within(dialogo).getByLabelText(/De qué se trata/), 'queja');
    await userEvent.click(within(dialogo).getByText('Alguien sin cuenta'));
    await userEvent.type(within(dialogo).getByLabelText('Nombre'), 'Jorge Pérez');
    await userEvent.type(within(dialogo).getByLabelText(/Qué pidió/), 'La ventana no cierra bien.');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar solicitud' }));

    expect(solicitudes.registrar).toHaveBeenCalledWith({
      canal: 'llamada', categoria: 'queja', descripcion: 'La ventana no cierra bien.', responsableId: '1',
      clienteId: '', proyectoId: '', contactoNombre: 'Jorge Pérez', contactoTelefono: '',
    });
    expect(await screen.findByText('Solicitud registrada.')).toBeInTheDocument();
  });
});

test('solo se manda lo que corresponde a quien la pide', () => {
  const valores = { canal: 'whatsapp', categoria: 'duda', descripcion: 'x', responsableId: '1', clienteId: '10', contactoNombre: 'Otro' };
  expect(armarSolicitud(valores, 'cliente')).toMatchObject({ clienteId: '10', contactoNombre: '' });
  expect(armarSolicitud(valores, 'contacto')).toMatchObject({ clienteId: '', contactoNombre: 'Otro' });
});
