// Preguntas frecuentes con respuesta automática (RF-13): el chat del cliente y la pantalla del personal.
describe('Preguntas frecuentes', () => {
  beforeEach(() => cy.apiFalsa());

  it('el asistente virtual saluda, responde una pregunta del menú y regresa al menú', () => {
    cy.intercept('POST', '/api/preguntas/2/resuelta', { statusCode: 204 }).as('resuelta');
    cy.intercept('POST', /\/api\/proyectos\/\d+\/mensajes$/).as('mensaje');
    cy.entrarComo('cliente', '/cliente/proyectos/7/chat');

    // El proyecto 7 ya tiene conversación: primero se ven los mensajes y el asistente se abre con su botón.
    cy.contains('.b.me', '¿Cuándo terminan');
    cy.get('.b.asistente').should('not.exist');
    cy.contains('button', 'Preguntar al asistente virtual').click();
    cy.contains('.b.asistente', 'soy el asistente virtual');
    // «¿Cómo va mi obra?» y las 2 preguntas activas (la apagada no aparece).
    cy.get('.b.asistente .opcion').should('have.length', 3).and('not.contain', 'fin de semana');
    cy.get('.b.asistente .opcion').first().should('contain', '¿Cómo va mi obra?');
    cy.contains('.opcion', '¿Qué garantía tienen los trabajos?').click();
    cy.contains('.b.auto', '5 años en perfiles de aluminio');
    cy.get('.b.asistente').should('not.exist');
    cy.contains('button', 'Sí, esto responde mi duda').click();

    cy.wait('@resuelta');
    cy.contains('.b.auto', '¡Qué bueno!');
    cy.get('@mensaje.all').should('have.length', 0);

    cy.contains('button', 'Ver otras preguntas').click();
    cy.contains('.b.asistente', '¿Qué más quieres saber?');
    cy.contains('.b.asistente button', 'Hablar con el arquitecto').click();
    cy.get('.b.asistente').should('not.exist');
    cy.focused().should('have.id', 'texto');
    cy.contains('button', 'Preguntar al asistente virtual');
  });

  it('«¿Cómo va mi obra?» responde con el seguimiento automático del proyecto', () => {
    cy.intercept('POST', /\/api\/preguntas\/.+\/resuelta$/).as('resuelta');
    cy.entrarComo('cliente', '/cliente/proyectos/7/chat');
    cy.contains('button', 'Preguntar al asistente virtual').click();
    cy.contains('.opcion', '¿Cómo va mi obra?').click();
    cy.wait('@resumen');
    cy.contains('.b.auto', 'etapa 2 de 4').and('contain', 'Lo siguiente es «Instalación de ventanas»');
    cy.contains('button', 'Sí, esto responde mi duda').click();
    cy.get('@resuelta.all').should('have.length', 0);
  });

  it('la flecha regresa del chat al proyecto', () => {
    cy.entrarComo('cliente', '/cliente/proyectos/7/chat');
    cy.contains('a.regresar', 'Mi proyecto').click();
    cy.location('pathname').should('eq', '/cliente/proyectos/7');
  });

  it('si su duda se parece a una pregunta, primero la sugiere; con «No» la manda al arquitecto', () => {
    cy.fixture('datos.json').then((datos) => {
      cy.intercept('GET', /\/api\/preguntas\/sugerencias/, { sugerencias: [datos.preguntas[0]] }).as('sugerencias');
    });
    cy.intercept('POST', '/api/proyectos/7/mensajes', { statusCode: 201, body: { mensaje: { id: 9 } } }).as('mensaje');
    cy.entrarComo('cliente', '/cliente/proyectos/7/chat');

    cy.get('#texto').type('¿En qué fecha instalan?');
    cy.contains('button', 'Enviar').click();
    cy.wait('@sugerencias').its('request.url').should('include', 'texto=');
    cy.contains('.b.auto', 'Quizá esto responde tu duda');
    cy.get('@mensaje.all').should('have.length', 0);

    cy.contains('button', 'No, enviar mi mensaje al arquitecto').click();
    cy.wait('@mensaje').its('request.body').should('deep.equal', { texto: '¿En qué fecha instalan?' });
  });

  it('el personal agrega, apaga y borra preguntas', () => {
    cy.intercept('POST', '/api/preguntas', { statusCode: 201, body: { pregunta: { id: 4 } } }).as('crear');
    cy.intercept('PUT', '/api/preguntas/2', { pregunta: { id: 2 } }).as('apagar');
    cy.intercept('DELETE', '/api/preguntas/3', { statusCode: 204 }).as('borrar');
    cy.entrarComo('admin', '/arquitecto');
    cy.contains('a.gi', 'Preguntas frecuentes').click();

    cy.location('pathname').should('eq', '/arquitecto/preguntas');
    cy.get('article.sol').should('have.length', 3);
    cy.contains('article', 'fin de semana').contains('.tag', 'Apagada');

    cy.contains('button', 'Agregar pregunta').click();
    cy.get('dialog[open]').within(() => {
      cy.get('#pregunta').type('¿Hacen canceles para baño?');
      cy.get('#respuesta').type('Sí, de vidrio templado de 8 mm.');
      cy.get('#palabrasClave').type('cancel, baño, regadera');
      cy.contains('button', 'Agregar pregunta').click();
    });
    cy.wait('@crear').its('request.body').should('deep.equal', {
      pregunta: '¿Hacen canceles para baño?', respuesta: 'Sí, de vidrio templado de 8 mm.', palabrasClave: 'cancel, baño, regadera', activa: true,
    });

    cy.contains('article', 'garantía').contains('button', 'Apagar').click();
    cy.wait('@apagar').its('request.body').should('include', { activa: false });

    cy.contains('article', 'fin de semana').contains('button', 'Borrar').click();
    cy.wait('@borrar');
    cy.contains('.toast', 'Pregunta borrada.');
  });
});
