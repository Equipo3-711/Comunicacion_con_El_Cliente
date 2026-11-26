// Iniciar sesión, crear cuenta y entrar a la pantalla de cada rol (RNF-06).
describe('Sesión', () => {
  beforeEach(() => cy.apiFalsa());

  it('el cliente inicia sesión y ve sus proyectos y cotizaciones', () => {
    cy.fixture('datos.json').then((datos) => {
      cy.intercept('POST', '/api/auth/login', { token: 'token-cliente', usuario: datos.cliente }).as('login');
    });
    cy.visit('/');
    cy.get('#correo').type('ana@roble.test');
    cy.get('#contrasena').type('secreta123');
    cy.contains('button', 'Iniciar sesión').click();

    cy.wait('@login').its('request.body').should('deep.equal', { correo: 'ana@roble.test', contrasena: 'secreta123' });
    cy.location('pathname').should('eq', '/cliente');
    cy.contains('h1', 'Mis proyectos');
    cy.contains('Ventanas · Blvd. Campestre 214');
    cy.contains('#cotizaciones', 'Barandales · Calle Roble 12');
    cy.get('html').should('have.class', 'ses');
  });

  it('con datos incorrectos se queda en el inicio de sesión y avisa', () => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 401, body: { error: 'Correo o contraseña incorrectos.' } });
    cy.visit('/');
    cy.get('#correo').type('ana@roble.test');
    cy.get('#contrasena').type('equivocada');
    cy.contains('button', 'Iniciar sesión').click();

    cy.get('[role="alert"]').should('contain', 'Correo o contraseña incorrectos.');
    cy.location('pathname').should('eq', '/');
  });

  it('crear cuenta marca cada campo que falta', () => {
    cy.intercept('POST', '/api/auth/registro', {
      statusCode: 400,
      body: { error: 'Revisa los datos marcados.', detalles: { nombre: 'Escribe tu nombre.', telefono: 'Escribe un teléfono de 10 dígitos.' } },
    });
    cy.visit('/registro');
    cy.contains('button', 'Crear cuenta').click();

    cy.contains('.er', 'Escribe tu nombre.');
    cy.contains('.er', 'Escribe un teléfono de 10 dígitos.');
    cy.get('#nombre').should('have.class', 'bad');
  });

  it('un cliente no puede abrir las pantallas del personal', () => {
    cy.entrarComo('cliente', '/arquitecto/solicitudes');
    cy.location('pathname').should('eq', '/cliente');
  });

  it('la campana lleva al chat y «Salir» cierra la sesión', () => {
    cy.intercept('PATCH', '/api/pendientes/3/leido', { statusCode: 204 }).as('leido');
    cy.entrarComo('admin', '/arquitecto');
    cy.get('.bell b').should('have.text', '1');
    cy.get('.bell').click();
    cy.contains('.bm a', 'escribió en el chat').click();

    cy.wait('@leido');
    cy.location('pathname').should('eq', '/arquitecto/proyectos/7/chat');
    cy.contains('.b', '¿Cuándo terminan la instalación?');

    cy.contains('button', 'Salir').click();
    cy.location('pathname').should('eq', '/');
    cy.window().its('sessionStorage').invoke('getItem', 'portal-sesion').should('be.null');
  });
});
