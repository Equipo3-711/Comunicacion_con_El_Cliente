import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { cotizaciones, cuenta, pendientes } from '../../api';
import { CLIENTE, montar } from '../../pruebas/montar';
import type { CotizacionDetalle } from '../../tipos';
import Cotizacion from './Cotizacion';

const ENVIADA: CotizacionDetalle = {
  id: 40, clienteId: CLIENTE.id, cliente: CLIENTE.nombre, empresaId: 3, empresa: 'Constructora Roble', telefono: '477 000 1111',
  tipoCliente: 'constructora', tipoTrabajo: 'ventanas', direccion: 'Blvd. Campestre 214, León', medidas: null,
  descripcion: '3 ventanas corredizas.', estado: 'enviada', proyectoId: null, creadoEn: '2026-11-10 12:00:00', modificadaEn: null, archivos: [],
};

beforeEach(() => {
  vi.spyOn(pendientes, 'listar').mockResolvedValue({ total: 0, pendientes: [] });
  vi.spyOn(cuenta, 'yo').mockResolvedValue({ usuario: CLIENTE });
});

describe('Solicitar cotización', () => {
  test('cliente y correo salen de la cuenta; el teléfono se puede corregir', async () => {
    montar(<Cotizacion />, { usuario: CLIENTE, ruta: '/cliente/cotizacion', patron: '/cliente/cotizacion' });

    expect(screen.getByLabelText(/Cliente/)).toHaveValue('Ana López · Constructora Roble');
    expect(screen.getByLabelText(/Correo/)).toHaveValue('ana@roble.test');
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue('477 123 4567');
    expect(screen.getByText(/Fotos o planos/)).toBeInTheDocument();
  });
});

describe('Modificar cotización (RF-11)', () => {
  test('llena el formulario con lo que envió y manda solo los datos, sin archivos', async () => {
    vi.spyOn(cotizaciones, 'obtener').mockResolvedValue({ cotizacion: ENVIADA });
    vi.spyOn(cotizaciones, 'modificar').mockResolvedValue(null);
    montar(<Cotizacion />, { usuario: CLIENTE, ruta: '/cliente/cotizacion/40', patron: '/cliente/cotizacion/:id' });

    expect(await screen.findByText(/Ya te enviamos esta cotización/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue('477 000 1111');
    expect(screen.getByLabelText('Constructora')).toBeChecked();
    expect(screen.queryByText(/Fotos o planos/)).not.toBeInTheDocument();

    const descripcion = screen.getByLabelText(/Descripción/);
    await userEvent.clear(descripcion);
    await userEvent.type(descripcion, 'Ahora son 4 ventanas.');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(cotizaciones.modificar).toHaveBeenCalledWith(40, {
      telefono: '477 000 1111', tipoCliente: 'constructora', tipoTrabajo: 'ventanas',
      direccion: 'Blvd. Campestre 214, León', medidas: '', descripcion: 'Ahora son 4 ventanas.',
    });
    expect(await screen.findByTestId('direccion')).toHaveTextContent('/cliente?modificada=1');
  });
});
