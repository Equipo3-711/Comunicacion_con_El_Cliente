// Flujos del personal: bandeja de solicitudes (RF-01, RF-04, RF-05), cotizaciones y proyecto.
describe('Arquitecto', () => {
  beforeEach(() => cy.apiFalsa());

  it('registra una solicitud que llegó por llamada', () => {
    cy.intercept('POST', '/api/solicitudes', { statusCode: 201, body: { solicitud: { id: 72 } } }).as('registrar');
    cy.entrarComo('admin', '/arquitecto/solicitudes');
    cy.contains('2 solicitud(es) · 2 sin atender');

    cy.contains('button', 'Registrar solicitud').click();
    cy.get('dialog[open]').within(() => {
      cy.contains('label', 'Llamada').click();
      cy.get('#categoria').select('Queja');
      cy.contains('label', 'Alguien sin cuenta').click();
      cy.get('#contactoNombre').type('Jorge Pérez');
      cy.get('#contactoTelefono').type('477 555 0199');
      cy.get('#descripcion').type('La ventana de la recámara no cierra bien.');
      cy.contains('button', 'Guardar solicitud').click();
    });

    cy.wait('@registrar').its('request.body').should('deep.include', {
      canal: 'llamada', categoria: 'queja', contactoNombre: 'Jorge Pérez', clienteId: '', responsableId: '1',
    });
    cy.get('dialog[open]').should('not.exist');
    cy.contains('.toast', 'Solicitud registrada.');
  });

  it('cambia el estado de una solicitud desde la bandeja', () => {
    cy.intercept('PATCH', '/api/solicitudes/70', { solicitud: { id: 70 } }).as('actualizar');
    cy.entrarComo('admin', '/arquitecto/solicitudes');

    cy.contains('article', 'Roberto Díaz').within(() => {
      cy.contains('label', 'Estado').find('select').select('Atendida');
    });
    cy.wait('@actualizar').its('request.body').should('deep.equal', { estado: 'atendida' });
    cy.contains('.toast', 'Solicitud actualizada.');
  });

  it('abre el proyecto a partir de una cotización y quedan ligados', () => {
    cy.intercept('POST', '/api/proyectos', { statusCode: 201, body: { proyecto: { id: 12 } } }).as('crear');
    cy.entrarComo('admin', '/arquitecto/cotizaciones/40');
    cy.contains('h1', 'Barandales · Ana López');
    cy.contains('dd', 'Calle Roble 12');
    cy.contains('a', 'Abrir proyecto').click();

    cy.location('pathname').should('eq', '/arquitecto');
    cy.get('dialog[open]').within(() => {
      cy.get('input[value="registrado"]').should('be.checked');
      cy.get('#empresaId').should('have.value', '3');
      cy.get('#tipoTrabajo').should('have.value', 'barandales');
      cy.get('#nombreProyecto').type('Barandal · Calle Roble 12');
      cy.contains('button', 'Agregar a mi cartera').click();
    });
    cy.wait('@crear').its('request.body').should('deep.equal', {
      empresaId: '3', nombre: 'Barandal · Calle Roble 12', tipoTrabajo: 'barandales', cotizacionId: 40,
    });
    cy.contains('.toast', 'el cliente ya está en tu cartera');
  });

  it('marca una actividad como realizada y guarda los datos del proyecto', () => {
    cy.intercept('PATCH', '/api/actividades/2/realizada', { statusCode: 204 }).as('realizada');
    cy.intercept('PATCH', '/api/proyectos/7', { proyecto: {} }).as('datos');
    cy.entrarComo('admin', '/arquitecto/proyectos/7');

    cy.contains('.act', 'Instalación de cancelería').contains('button', 'Marcar como realizada').click();
    cy.wait('@realizada');
    cy.get('#presupuesto').should('have.value', '185000.00').clear().type('190000');
    cy.contains('button', 'Guardar datos').click();
    cy.wait('@datos').its('request.body').should('include', { presupuesto: '190000', garantiaHasta: '2028-03-01' });
  });
});
