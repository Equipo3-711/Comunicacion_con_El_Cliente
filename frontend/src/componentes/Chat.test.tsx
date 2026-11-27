import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { chat, preguntas, proyectos } from '../api';
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

  test('el asistente saluda con un menú de 4 en 4 y las flechas pasan de página', async () => {
    const muchas = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, pregunta: `Pregunta ${i + 1}`, respuesta: `Respuesta ${i + 1}` }));
    vi.spyOn(preguntas, 'listar').mockResolvedValue({ preguntas: muchas });
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    // 7 opciones: «¿Cómo va mi obra?» y las 6 preguntas frecuentes.
    const menu = await screen.findByRole('group', { name: 'Asistente virtual' });
    expect(menu).toHaveTextContent('soy el asistente virtual');
    expect(screen.getByRole('button', { name: '¿Cómo va mi obra?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pregunta 3' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pregunta 4' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preguntas anteriores' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Más preguntas' }));
    expect(screen.getByText('2 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pregunta 6' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pregunta 1' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Preguntas anteriores' }));
    expect(screen.getByRole('button', { name: 'Pregunta 1' })).toBeInTheDocument();
  });

  test('después de una respuesta se regresa al menú o se habla con el arquitecto', async () => {
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    await userEvent.click(await screen.findByRole('button', { name: INSTALACION.pregunta }));
    expect(screen.queryByRole('group', { name: 'Asistente virtual' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'No, quiero escribirle al arquitecto' }));
    expect(screen.getByLabelText('Mensaje')).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Ver otras preguntas' }));
    expect(screen.getByRole('group', { name: 'Asistente virtual' })).toHaveTextContent('¿Qué más quieres saber?');

    await userEvent.click(screen.getByRole('button', { name: 'Hablar con el arquitecto' }));
    expect(screen.queryByRole('group', { name: 'Asistente virtual' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Mensaje')).toHaveFocus();
    expect(chat.enviar).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Preguntar al asistente virtual' }));
    expect(screen.getByRole('group', { name: 'Asistente virtual' })).toBeInTheDocument();
  });

  test('«¿Cómo va mi obra?» responde con el seguimiento automático del proyecto', async () => {
    vi.spyOn(proyectos, 'resumen').mockResolvedValue({
      resumen: {
        puntos: ['Tu obra está en «En instalación», etapa 3 de 4.', 'Van 2 de 3 actividades realizadas (67 %).'],
        avisos: ['Lleva 9 días sin movimientos registrados.'],
      },
    } as Awaited<ReturnType<typeof proyectos.resumen>>);
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    await userEvent.click(await screen.findByRole('button', { name: '¿Cómo va mi obra?' }));
    expect(proyectos.resumen).toHaveBeenCalledWith('7');
    expect(await screen.findByText(/etapa 3 de 4/)).toHaveTextContent(/Lleva 9 días sin movimientos/);

    await userEvent.click(screen.getByRole('button', { name: 'Sí, esto responde mi duda' }));
    expect(preguntas.marcarResuelta).not.toHaveBeenCalled();
    expect(chat.enviar).not.toHaveBeenCalled();
  });

  test('si no se puede revisar la obra, lo dice y sugiere preguntarle al arquitecto', async () => {
    vi.spyOn(proyectos, 'resumen').mockRejectedValue(new Error('sin conexión'));
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    await userEvent.click(await screen.findByRole('button', { name: '¿Cómo va mi obra?' }));
    expect(await screen.findByText(/No pude revisar tu obra/)).toBeInTheDocument();
  });

  test('si escribe su duda con el menú abierto, el menú se cierra', async () => {
    vi.spyOn(preguntas, 'sugerencias').mockResolvedValue({ sugerencias: [] });
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    await screen.findByRole('group', { name: 'Asistente virtual' });
    await userEvent.type(screen.getByLabelText('Mensaje'), 'Hola');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(chat.enviar).toHaveBeenCalledWith('7', 'Hola'));
    expect(screen.queryByRole('group', { name: 'Asistente virtual' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preguntar al asistente virtual' })).toBeInTheDocument();
  });

  test('si ya hay conversación, se ven los mensajes y el asistente se abre con su botón', async () => {
    vi.spyOn(chat, 'mensajes').mockResolvedValue({
      mensajes: [{ id: 5, texto: 'Mañana instalamos.', autorId: 1, autor: 'Arq. Laura Méndez', creadoEn: '2026-11-20T10:00:00' }],
    } as Awaited<ReturnType<typeof chat.mensajes>>);
    montar(<Chat proyectoId="7" usuario={CLIENTE} />, { usuario: CLIENTE });

    expect(await screen.findByText('Mañana instalamos.')).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: 'Preguntar al asistente virtual' }));
    expect(screen.getByRole('group', { name: 'Asistente virtual' })).toHaveTextContent('soy el asistente virtual');
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
    expect(screen.queryByRole('group', { name: 'Asistente virtual' })).not.toBeInTheDocument();
  });
});
