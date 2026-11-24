// Criterios de aceptación del formulario de cotización (CC-10).
const { validarCotizacion } = require('../src/validators/cotizacion.validator');

const COMPLETA = {
    telefono: '5512345678',
    tipoCliente: 'Particular',
    tipoTrabajo: 'ventanas',
    direccion: 'Av. Reforma 100, Juárez, Ciudad de México',
    descripcion: 'Cambiar tres ventanas de aluminio.',
};

// Devuelve el error que lanza el validador, o null si los datos pasan.
function errorDe(datos) {
    try {
        validarCotizacion(datos);
        return null;
    } catch (error) {
        return error;
    }
}

describe('formulario de cotización', () => {

    test('acepta una cotización completa y limpia los datos', () => {
        const resultado = validarCotizacion({
            ...COMPLETA,
            direccion: '  Av. Reforma 100, Juárez, Ciudad de México  '
        });

        expect(resultado.tipoCliente).toBe('particular');
        expect(resultado.direccion).toBe('Av. Reforma 100, Juárez, Ciudad de México');
        expect(resultado.medidas).toBeNull();
    });

    test('rechaza un tipo de trabajo que la vidriería no ofrece', () => {
        const error = errorDe({ ...COMPLETA, tipoTrabajo: 'puertas' });

        expect(error.estado).toBe(400);
        expect(Object.keys(error.detalles)).toEqual(['tipoTrabajo']);
    });

    test('pide la dirección de la obra', () => {
        const error = errorDe({ ...COMPLETA, direccion: '        ' });

        expect(error.estado).toBe(400);
        expect(error.detalles.direccion).toBe(
            'Escribe la dirección de la obra: calle, número, colonia y ciudad.'
        );
    });

});
