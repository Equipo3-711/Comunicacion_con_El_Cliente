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

  it('el cliente ve sus planos al modificar su cotización, sin descargarlos', () => {
    cy.intercept('GET', '/api/cotizaciones/archivos/3/ver', { fixture: 'contrato.pdf,null', headers: { 'content-type': 'application/pdf' } });
    cy.entrarComo('cliente', '/cliente/cotizacion/40');
    cy.contains('.archivos-cotizacion', 'Tus fotos y planos');
    cy.get('input[type="file"]').should('not.exist');
    cy.contains('.act', 'plano baño.pdf').contains('button', 'Ver').click();
    cy.get('.doc canvas', { timeout: 10000 }).should('have.length', 1);
    cy.get('.doc a[download]').should('not.exist');
  });

  it('la zona para elegir archivos usa los colores del portal y muestra lo elegido', () => {
    cy.entrarComo('cliente', '/cliente/cotizacion');
    cy.contains('.up .up-boton', 'Elegir archivos').should('be.visible').and('have.class', 'p');
    cy.contains('.up-estado', 'Todavía no eliges ninguno');
    cy.get('.up input[type="file"]').selectFile([
      { contents: Cypress.Buffer.from('%PDF-1.4'), fileName: 'plano baño.pdf', mimeType: 'application/pdf' },
      { contents: Cypress.Buffer.from('foto'), fileName: 'fachada.jpg', mimeType: 'image/jpeg' },
    ], { force: true });
    cy.contains('.up-estado', '2 archivos elegidos');
    cy.get('.up ul li').should('have.length', 2).first().should('have.text', 'plano baño.pdf');
  });

  it('el proyecto del cliente muestra el seguimiento automático', () => {
    cy.entrarComo('cliente', '/cliente/proyectos/7');
    cy.wait('@resumen');
    cy.contains('.resumen-obra h2', 'Seguimiento automático');
    cy.get('.resumen-obra .etapas li').should('have.length', 4);
    cy.get('.resumen-obra .etapas li.actual').should('contain', 'En proceso');
    cy.get('.resumen-obra [role="progressbar"]').should('have.attr', 'aria-valuenow', '33');
    cy.contains('.resumen-obra li', 'Has pagado $92,500.00 de $185,000.00 (50 %).');
  });
});
