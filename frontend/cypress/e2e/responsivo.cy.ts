// Cada pantalla se ve completa en celular, tableta y escritorio: sin scroll horizontal
// y con el encabezado dentro de la pantalla.
const TAMANOS: [string, number, number][] = [
  ['celular chico', 360, 740],
  ['celular', 390, 844],
  ['tableta', 768, 1024],
  ['escritorio', 1280, 800],
];

const PANTALLAS: { rol: 'admin' | 'cliente' | null; ruta: string; espera: string }[] = [
  { rol: null, ruta: '/', espera: 'Iniciar sesión' },
  { rol: null, ruta: '/registro', espera: 'Crear cuenta' },
  { rol: 'cliente', ruta: '/cliente', espera: 'Mis proyectos' },
  { rol: 'cliente', ruta: '/cliente/cotizacion', espera: 'Solicitar cotización' },
  { rol: 'cliente', ruta: '/cliente/proyectos/7', espera: 'Historial del proyecto' },
  { rol: 'cliente', ruta: '/cliente/proyectos/7/chat', espera: '¿Cuándo terminan' },
  { rol: 'admin', ruta: '/arquitecto', espera: 'Cotizaciones recibidas' },
  { rol: 'admin', ruta: '/arquitecto/solicitudes', espera: 'Roberto Díaz' },
  { rol: 'admin', ruta: '/arquitecto/preguntas', espera: 'Palabras clave' },
  { rol: 'admin', ruta: '/arquitecto/cotizaciones/40', espera: 'Fotos y planos' },
  { rol: 'admin', ruta: '/arquitecto/proyectos/7', espera: 'Datos del proyecto' },
  { rol: 'admin', ruta: '/arquitecto/proyectos/7/chat', espera: 'No atendido' },
];

function sinScrollHorizontal() {
  cy.document().then((documento) => {
    const raiz = documento.documentElement;
    expect(raiz.scrollWidth, 'ancho de la página').to.be.at.most(raiz.clientWidth);
  });
}

describe('Diseño responsivo', () => {
  beforeEach(() => cy.apiFalsa());

  TAMANOS.forEach(([nombre, ancho, alto]) => {
    describe(`${nombre} (${ancho} px)`, () => {
      beforeEach(() => cy.viewport(ancho, alto));

      PANTALLAS.forEach(({ rol, ruta, espera }) => {
        it(ruta, () => {
          if (rol) cy.entrarComo(rol, ruta);
          else cy.visit(ruta);
          cy.contains(espera).should('be.visible');
          sinScrollHorizontal();
          // Tema, logo y usuario se ven completos (en el celular se apilan, como en las interfaces V2).
          cy.get('.top .ic, .top .logo, .top .usr').each(($pieza) => {
            const caja = $pieza[0].getBoundingClientRect();
            expect(caja.left, 'borde izquierdo').to.be.at.least(0);
            expect(caja.right, 'borde derecho').to.be.at.most(ancho);
          });
        });
      });
    });
  });

  it('en el celular, el diálogo y el menú de la campana caben en la pantalla', () => {
    cy.viewport(360, 740);
    cy.entrarComo('admin', '/arquitecto/solicitudes');
    cy.contains('button', 'Registrar solicitud').click();
    cy.get('dialog[open]').then(($dialogo) => {
      const caja = $dialogo[0].getBoundingClientRect();
      expect(caja.left).to.be.at.least(0);
      expect(caja.right).to.be.at.most(360);
    });
    cy.contains('dialog button', 'Cerrar').click();
    cy.get('.bell').click();
    cy.get('.bm').then(($menu) => {
      const caja = $menu[0].getBoundingClientRect();
      expect(caja.left).to.be.at.least(0);
      expect(caja.right).to.be.at.most(360);
    });
  });
});
