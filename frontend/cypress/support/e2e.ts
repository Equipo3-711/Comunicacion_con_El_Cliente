// Comandos que comparten las pruebas de Cypress.
// cy.apiFalsa() responde cada ruta de la API con cypress/fixtures/datos.json;
// cy.entrarComo('admin' | 'cliente') abre una pantalla con la sesión ya iniciada.

type Rol = 'admin' | 'cliente';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      apiFalsa(): Chainable<void>;
      entrarComo(rol: Rol, ruta: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('apiFalsa', () => {
  cy.fixture('datos.json').then((datos) => {
    const proyecto = datos.proyectos[0];
    const cotizacion = { ...datos.cotizaciones[0], archivos: [{ id: 3, nombre: 'plano baño.pdf', tipoMime: 'application/pdf' }] };
    cy.intercept('GET', '/api/pendientes', { total: datos.pendientes.length, pendientes: datos.pendientes });
    cy.intercept('GET', '/api/auth/yo', (peticion) => {
      peticion.reply({ usuario: peticion.headers.authorization === 'Bearer token-admin' ? datos.admin : datos.cliente });
    });
    cy.intercept('GET', '/api/proyectos', { proyectos: datos.proyectos }).as('proyectos');
    cy.intercept('GET', /\/api\/proyectos\/\d+$/, { proyecto });
    cy.intercept('GET', /\/api\/proyectos\/\d+\/historial$/, { historial: datos.historial });
    cy.intercept('GET', /\/api\/proyectos\/\d+\/resumen$/, { resumen: datos.resumen }).as('resumen');
    cy.intercept('GET', /\/api\/proyectos\/\d+\/documentos$/, { documentos: datos.documentos });
    cy.intercept('GET', /\/api\/proyectos\/\d+\/actividades$/, { actividades: datos.actividades });
    cy.intercept('GET', /\/api\/proyectos\/\d+\/mensajes$/, { mensajes: datos.mensajes });
    cy.intercept('GET', '/api/cotizaciones', { cotizaciones: datos.cotizaciones }).as('cotizaciones');
    cy.intercept('GET', /\/api\/cotizaciones\/\d+$/, { cotizacion });
    cy.intercept('GET', /\/api\/solicitudes(\?.*)?$/, { solicitudes: datos.solicitudes }).as('solicitudes');
    cy.intercept('GET', '/api/solicitudes/responsables', { responsables: datos.responsables });
    cy.intercept('GET', '/api/clientes', { clientes: datos.clientes });
    cy.intercept('GET', '/api/empresas', { empresas: datos.empresas });
    // El personal ve todas; el cliente, solo las activas y sin palabras clave.
    cy.intercept('GET', '/api/preguntas', (peticion) => {
      const esPersonal = peticion.headers.authorization === 'Bearer token-admin';
      const preguntas = esPersonal ? datos.preguntas : datos.preguntas
        .filter((pregunta: { activa: boolean }) => pregunta.activa)
        .map(({ id, pregunta, respuesta }: { id: number; pregunta: string; respuesta: string }) => ({ id, pregunta, respuesta }));
      peticion.reply({ preguntas });
    }).as('preguntas');
    cy.intercept('GET', /\/api\/preguntas\/sugerencias/, { sugerencias: [] }).as('sugerencias');
  });
});

Cypress.Commands.add('entrarComo', (rol: Rol, ruta: string) => {
  cy.fixture('datos.json').then((datos) => {
    const sesion = { token: `token-${rol}`, usuario: datos[rol] };
    cy.visit(ruta, {
      onBeforeLoad(ventana) {
        ventana.sessionStorage.setItem('portal-sesion', JSON.stringify(sesion));
      },
    });
  });
});

export {};
