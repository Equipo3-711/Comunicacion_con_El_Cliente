// Visor de documentos (RF-08, CC-02): el PDF se dibuja dentro del portal, sin opción de descarga.
describe('Visor de documentos', () => {
  beforeEach(() => cy.apiFalsa());

  it('el cliente ve el contrato dibujado con pdf.js, sin menú para guardarlo', () => {
    cy.intercept('GET', '/api/documentos/5/ver', { fixture: 'contrato.pdf,null', headers: { 'content-type': 'application/pdf' } });
    cy.entrarComo('cliente', '/cliente/proyectos/7');
    cy.contains('.act', 'Contrato firmado').contains('a', 'Ver').click();

    cy.location('pathname').should('eq', '/cliente/proyectos/7/documentos/5');
    cy.contains('h2', 'Contrato firmado · Ventanas · Blvd. Campestre 214');
    cy.get('.doc canvas', { timeout: 10000 }).should('have.length', 1).and('have.attr', 'aria-label', 'Página 1 de 1');
    cy.get('.doc a[download]').should('not.exist');
    // El clic derecho no abre el menú del navegador.
    cy.get('.doc').then(($visor) => {
      const evento = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      $visor[0].dispatchEvent(evento);
      expect(evento.defaultPrevented).to.equal(true);
    });
  });

  it('el arquitecto abre el plano de una cotización en el mismo visor', () => {
    cy.intercept('GET', '/api/cotizaciones/archivos/3/ver', { fixture: 'contrato.pdf,null', headers: { 'content-type': 'application/pdf' } });
    cy.entrarComo('admin', '/arquitecto/cotizaciones/40');
    cy.contains('.act', 'plano baño.pdf').contains('button', 'Ver').click();
    cy.get('.doc canvas', { timeout: 10000 }).should('have.length', 1);
  });
});
