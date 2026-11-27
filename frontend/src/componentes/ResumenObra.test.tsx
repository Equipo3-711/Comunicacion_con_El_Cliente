import { screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { proyectos } from '../api';
import { CLIENTE, montar } from '../pruebas/montar';
import type { ResumenProyecto } from '../tipos';
import { ResumenObra } from './ResumenObra';

const RESUMEN: ResumenProyecto = {
  etapa: { clave: 'en_instalacion', nombre: 'En instalación', numero: 3, total: 4 },
  actividades: { realizadas: 2, total: 3, porcentaje: 67, siguiente: 'Instalación de ventanas' },
  ultimoMovimiento: null,
  pagos: null,
  garantiaHasta: null,
  puntos: ['Tu obra está en «En instalación», etapa 3 de 4.', 'Van 2 de 3 actividades realizadas (67 %).'],
  avisos: ['Lleva 9 días sin movimientos registrados.'],
  generadoEn: '2026-11-27T18:00:00.000Z',
};

describe('Seguimiento automático de la obra (CC-05)', () => {
  test('muestra la etapa, el avance de actividades, los puntos y los avisos', async () => {
    vi.spyOn(proyectos, 'resumen').mockResolvedValue({ resumen: RESUMEN });
    montar(<ResumenObra proyectoId="7" />, { usuario: CLIENTE });

    expect(await screen.findByRole('heading', { name: 'Seguimiento automático' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Etapa 3 de 4' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Actividades realizadas' })).toHaveAttribute('aria-valuenow', '67');
    expect(screen.getByText('Van 2 de 3 actividades realizadas (67 %).')).toBeInTheDocument();
    expect(screen.getByText('Lleva 9 días sin movimientos registrados.')).toBeInTheDocument();
  });

  test('si no se puede cargar, no estorba en la pantalla', async () => {
    vi.spyOn(proyectos, 'resumen').mockRejectedValue(new Error('sin conexión'));
    const { container } = montar(<ResumenObra proyectoId="7" />, { usuario: CLIENTE });
    await vi.waitFor(() => expect(proyectos.resumen).toHaveBeenCalled());
    expect(container.querySelector('.resumen-obra')).toBeNull();
  });
});
