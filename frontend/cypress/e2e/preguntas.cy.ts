// Preguntas frecuentes con respuesta automática (RF-13): el chat del cliente y la pantalla del personal.
describe('Preguntas frecuentes', () => {
  beforeEach(() => cy.apiFalsa());

  it('el cliente toca una pregunta, ve la respuesta y la marca como resuelta', () => {
    cy.intercept('POST', '/api/preguntas/2/resuelta', { statusCode: 204 }).as('resuelta');
    cy.intercept('POST', /\/api\/proyectos\/\d+\/mensajes$/).as('mensaje');
    cy.entrarComo('cliente', '/cliente/proyectos/7/chat');

    cy.get('.faq .btn').should('have.length', 2).and('not.contain', 'fin de semana');
    cy.contains('.faq .btn', '¿Qué garantía tienen los trabajos?').click();
    cy.contains('.b.auto', '5 años en perfiles de aluminio');
    cy.contains('button', 'Sí, esto responde mi duda').click();

    cy.wait('@resuelta');
    cy.contains('.b.auto', '¡Qué bueno!');
    cy.get('@mensaje.all').should('have.length', 0);
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
