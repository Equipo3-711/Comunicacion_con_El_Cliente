// Bandeja de solicitudes del personal: canal de origen (RF-01), categoría (RF-04) y responsable (RF-05).
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/solicitudes.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/pendientes.repository');

const request = require('supertest');
const { crearApp } = require('../src/app');
const solicitudes = require('../src/repositories/solicitudes.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const proyectos = require('../src/repositories/proyectos.repository');
const pendientes = require('../src/repositories/pendientes.repository');
const { bearer, ADMIN, CLIENTE } = require('./ayudas');

const app = crearApp();

const OTRO_ADMIN = { id: 5, rol: 'admin', nombre: 'Ing. Paola Ruiz' };
const LLAMADA = {
  canal: 'llamada',
  categoria: 'duda',
  descripcion: 'Pregunta si las ventanas llevan doble vidrio.',
  contactoNombre: 'Jorge Pérez',
  contactoTelefono: '477 555 0123',
};

beforeEach(() => {
  jest.clearAllMocks();
  solicitudes.crear.mockResolvedValue(70);
  solicitudes.buscarPorId.mockImplementation(async (id) => ({ id, estado: 'nueva', categoria: 'duda', contacto: 'Jorge Pérez', responsableId: ADMIN.id }));
  usuarios.buscarPorId.mockImplementation(async (id) => ({
    [ADMIN.id]: ADMIN, [OTRO_ADMIN.id]: OTRO_ADMIN, [CLIENTE.id]: { ...CLIENTE, nombre: 'Marcos Ruiz' },
  })[id] ?? null);
});

describe('quién puede usar la bandeja', () => {
  test('sin sesión responde 401 y un cliente recibe 403', async () => {
    const sinSesion = await request(app).get('/api/solicitudes');
    const cliente = await request(app).get('/api/solicitudes').set('Authorization', bearer(CLIENTE));

    expect(sinSesion.status).toBe(401);
    expect(cliente.status).toBe(403);
    expect(solicitudes.listar).not.toHaveBeenCalled();
  });
});

describe('POST /api/solicitudes: registrar lo que llegó por fuera del portal', () => {
  test('marca los campos que faltan y no guarda nada', async () => {
    const respuesta = await request(app).post('/api/solicitudes').set('Authorization', bearer(ADMIN)).send({});

    expect(respuesta.status).toBe(400);
    expect(Object.keys(respuesta.body.detalles).sort()).toEqual(['canal', 'categoria', 'contactoNombre', 'descripcion']);
    expect(solicitudes.crear).not.toHaveBeenCalled();
  });

  test('rechaza un canal que no existe', async () => {
    const respuesta = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', bearer(ADMIN))
      .send({ ...LLAMADA, canal: 'fax' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.canal).toMatch(/opción válida/);
  });

  test('guarda una llamada de alguien sin cuenta y queda a cargo de quien la registró', async () => {
    const respuesta = await request(app).post('/api/solicitudes').set('Authorization', bearer(ADMIN)).send(LLAMADA);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.solicitud).toMatchObject({ id: 70 });
    expect(solicitudes.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        canal: 'llamada', categoria: 'duda', contactoNombre: 'Jorge Pérez', clienteId: null, responsableId: ADMIN.id, registradaPor: ADMIN.id,
      }),
      'cx',
    );
    // No se avisa a sí mismo.
    expect(pendientes.crear).not.toHaveBeenCalled();
  });

  test('al asignarla a otra persona del personal, le llega el aviso a su campana (RF-12)', async () => {
    await request(app)
      .post('/api/solicitudes')
      .set('Authorization', bearer(ADMIN))
      .send({ ...LLAMADA, categoria: 'queja', responsableId: OTRO_ADMIN.id });

    expect(pendientes.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: OTRO_ADMIN.id, tipo: 'solicitud', descripcion: 'Te asignaron una solicitud de Jorge Pérez: Queja' }),
      'cx',
    );
  });

  test('no se puede asignar a un cliente como responsable', async () => {
    const respuesta = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', bearer(ADMIN))
      .send({ ...LLAMADA, responsableId: CLIENTE.id });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.responsableId).toMatch(/personal/);
    expect(solicitudes.crear).not.toHaveBeenCalled();
  });

  test('con un cliente registrado, el proyecto tiene que ser de su empresa', async () => {
    proyectos.buscarPorId.mockResolvedValue({ id: 9, empresaId: 99 });

    const respuesta = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', bearer(ADMIN))
      .send({ canal: 'whatsapp', categoria: 'seguimiento', descripcion: '¿Cuándo instalan?', clienteId: CLIENTE.id, proyectoId: 9 });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.proyectoId).toBe('El proyecto no es de este cliente.');
  });

  test('con un cliente registrado no se guardan nombre ni teléfono sueltos', async () => {
    proyectos.buscarPorId.mockResolvedValue({ id: 7, empresaId: CLIENTE.empresaId });

    await request(app)
      .post('/api/solicitudes')
      .set('Authorization', bearer(ADMIN))
      .send({ canal: 'whatsapp', categoria: 'seguimiento', descripcion: '¿Cuándo instalan?', clienteId: CLIENTE.id, proyectoId: 7, contactoNombre: 'Otro' });

    expect(solicitudes.crear).toHaveBeenCalledWith(
      expect.objectContaining({ clienteId: CLIENTE.id, proyectoId: 7, contactoNombre: null, contactoTelefono: null }),
      'cx',
    );
  });
});

describe('GET /api/solicitudes: filtros de la bandeja', () => {
  test('«responsable=yo» muestra solo las del usuario', async () => {
    solicitudes.listar.mockResolvedValue([{ id: 70 }]);

    const respuesta = await request(app)
      .get('/api/solicitudes?responsable=yo&estado=nueva')
      .set('Authorization', bearer(ADMIN));

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.solicitudes).toEqual([{ id: 70 }]);
    expect(solicitudes.listar).toHaveBeenCalledWith({ estado: 'nueva', responsableId: ADMIN.id, sinAsignar: false });
  });

  test('«responsable=sin_asignar» muestra las que nadie ha tomado', async () => {
    solicitudes.listar.mockResolvedValue([]);
    await request(app).get('/api/solicitudes?responsable=sin_asignar').set('Authorization', bearer(ADMIN));
    expect(solicitudes.listar).toHaveBeenCalledWith({ responsableId: undefined, sinAsignar: true });
  });

  test('un filtro con un valor que no existe responde 400', async () => {
    const respuesta = await request(app).get('/api/solicitudes?categoria=chisme').set('Authorization', bearer(ADMIN));
    expect(respuesta.status).toBe(400);
    expect(solicitudes.listar).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/solicitudes/:id: clasificar, atender y reasignar', () => {
  test('reasignar avisa al nuevo responsable', async () => {
    const respuesta = await request(app)
      .patch('/api/solicitudes/70')
      .set('Authorization', bearer(ADMIN))
      .send({ responsableId: OTRO_ADMIN.id });

    expect(respuesta.status).toBe(200);
    expect(solicitudes.actualizar).toHaveBeenCalledWith(70, { responsableId: OTRO_ADMIN.id }, 'cx');
    expect(pendientes.crear).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: OTRO_ADMIN.id, tipo: 'solicitud' }), 'cx');
  });

  test('cambiar la categoría y el estado no avisa a nadie', async () => {
    await request(app)
      .patch('/api/solicitudes/70')
      .set('Authorization', bearer(ADMIN))
      .send({ categoria: 'Queja', estado: 'atendida' });

    expect(solicitudes.actualizar).toHaveBeenCalledWith(70, { categoria: 'queja', estado: 'atendida' }, 'cx');
    expect(pendientes.crear).not.toHaveBeenCalled();
  });

  test('sin cambios responde 400 y no toca la base', async () => {
    const respuesta = await request(app).patch('/api/solicitudes/70').set('Authorization', bearer(ADMIN)).send({});
    expect(respuesta.status).toBe(400);
    expect(solicitudes.actualizar).not.toHaveBeenCalled();
  });

  test('no se puede dejar sin responsable', async () => {
    const respuesta = await request(app).patch('/api/solicitudes/70').set('Authorization', bearer(ADMIN)).send({ responsableId: '' });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.responsableId).toBe('Elige al responsable.');
  });

  test('una solicitud que no existe responde 404', async () => {
    solicitudes.buscarPorId.mockResolvedValue(null);
    const respuesta = await request(app).patch('/api/solicitudes/999').set('Authorization', bearer(ADMIN)).send({ estado: 'atendida' });
    expect(respuesta.status).toBe(404);
  });
});

describe('listas para el formulario', () => {
  test('los responsables son el personal, sin su correo', async () => {
    usuarios.listarAdmins.mockResolvedValue([{ id: 1, nombre: ADMIN.nombre, correo: 'laura@tefficiency.mx' }]);
    const respuesta = await request(app).get('/api/solicitudes/responsables').set('Authorization', bearer(ADMIN));
    expect(respuesta.body.responsables).toEqual([{ id: 1, nombre: ADMIN.nombre }]);
  });

  test('solo el personal ve la lista de clientes', async () => {
    usuarios.listarClientes.mockResolvedValue([{ id: CLIENTE.id, nombre: 'Marcos Ruiz', empresa: 'Constructora Alba' }]);

    const admin = await request(app).get('/api/clientes').set('Authorization', bearer(ADMIN));
    const cliente = await request(app).get('/api/clientes').set('Authorization', bearer(CLIENTE));

    expect(admin.status).toBe(200);
    expect(admin.body.clientes).toHaveLength(1);
    expect(cliente.status).toBe(403);
  });
});
