import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { chat, preguntas } from '../api';
import { ADMIN, CLIENTE, montar } from '../pruebas/montar';
import type { PreguntaFrecuente } from '../tipos';
import { Chat } from './Chat';

const GARANTIA: PreguntaFrecuente = { id: 1, pregunta: '¿Qué garantía tienen?', respuesta: '2 años en herrajes.' };
const INSTALACION: PreguntaFrecuente = { id: 2, pregunta: '¿Cuánto tarda la instalación?', respuesta: 'De 1 a 2 días.' };

beforeEach(() => {
  vi.spyOn(chat, 'mensajes').mockResolvedValue({ mensajes: [] });
  vi.spyOn(chat, 'enviar').mockResolvedValue(null);
  vi.spyOn(preguntas, 'listar').mockResolvedValue({ preguntas: [GARANTIA, INSTALACION] });
  vi.spyOn(preguntas, 'marcarResuelta').mockResolvedValue(null);
});

describe('Preguntas frecuentes en el chat del cliente (RF-13)', () => {
  test('al tocar una pregunta aparece su respuesta y «Sí» la cuenta como resuelta sin mandar mensaje', async () => {
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    await userEvent.click(await screen.findByRole('button', { name: GARANTIA.pregunta }));
    expect(screen.getByText('2 años en herrajes.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sí, esto responde mi duda' }));

    expect(preguntas.marcarResuelta).toHaveBeenCalledWith(1);
    expect(screen.getByText(/Qué bueno/)).toBeInTheDocument();
    expect(chat.enviar).not.toHaveBeenCalled();
  });

  test('si su duda se parece a una pregunta, la sugiere antes de mandarla; «No» la manda al arquitecto', async () => {
    vi.spyOn(preguntas, 'sugerencias').mockResolvedValue({ sugerencias: [INSTALACION] });
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    await userEvent.type(screen.getByLabelText('Mensaje'), '¿Cuándo instalan?');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Quizá esto responde tu duda:')).toBeInTheDocument();
    expect(chat.enviar).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Mensaje')).toHaveValue('');

    await userEvent.click(screen.getByRole('button', { name: 'No, enviar mi mensaje al arquitecto' }));
    await waitFor(() => expect(chat.enviar).toHaveBeenCalledWith('7', '¿Cuándo instalan?'));
  });

  test('si nada se parece, la duda se manda directo', async () => {
    vi.spyOn(preguntas, 'sugerencias').mockResolvedValue({ sugerencias: [] });
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    await userEvent.type(screen.getByLabelText('Mensaje'), 'Hola');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(chat.enviar).toHaveBeenCalledWith('7', 'Hola'));
  });

  test('si no se pueden revisar las sugerencias, el mensaje se manda igual', async () => {
    vi.spyOn(preguntas, 'sugerencias').mockRejectedValue(new Error('sin conexión'));
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    await userEvent.type(screen.getByLabelText('Mensaje'), 'garantía');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(chat.enviar).toHaveBeenCalledWith('7', 'garantía'));
  });

  test('el arquitecto no ve preguntas frecuentes en su chat', async () => {
    vi.spyOn(preguntas, 'sugerencias');
    montar(<Chat proyectoId="7" usuario={ADMIN} />, { usuario: ADMIN });

    await userEvent.type(screen.getByLabelText('Mensaje'), 'La garantía es de 2 años');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(chat.enviar).toHaveBeenCalled());
    expect(preguntas.listar).not.toHaveBeenCalled();
    expect(preguntas.sugerencias).not.toHaveBeenCalled();
    expect(screen.queryByText('Preguntas frecuentes')).not.toBeInTheDocument();
  });
});
