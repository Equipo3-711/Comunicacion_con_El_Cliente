// Pantalla 6 · Visor de documentos: se ven en el portal, sin opción de descarga (RF-08, CC-02).
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { proyectos } from '../../api';
import { SegunCarga } from '../../componentes/Estados';
import { Pantalla } from '../../componentes/Pantalla';
import { Visor } from '../../componentes/Visor';
import { useCarga } from '../../hooks/useCarga';

export default function Documento() {
  const { id = '', documentoId = '' } = useParams();
  const carga = useCarga(async () => {
    const [{ proyecto }, { documentos }] = await Promise.all([proyectos.obtener(id), proyectos.documentos(id)]);
    const registro = documentos.find((documento) => String(documento.id) === documentoId);
    return { titulo: `${registro ? registro.nombre : 'Documento'} · ${proyecto.nombre}` };
  }, [id, documentoId]);
  const [archivo, setArchivo] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setArchivo(null);
    setError('');
    proyectos.verDocumento(documentoId).then(setArchivo).catch((fallo: Error) => setError(fallo.message));
  }, [documentoId]);

  const titulo = carga.datos?.titulo ?? 'Documento';
  return (
    <Pantalla titulo={titulo} className="card media" regresar={{ a: `/cliente/proyectos/${id}`, texto: 'Proyecto' }}>
      <SegunCarga carga={carga}>
        {() => (
          <>
            <div className="row">
              <h2 className="sin-margen">{titulo}</h2>
              <Link className="btn s" to={`/cliente/proyectos/${id}`}>Cerrar</Link>
            </div>
            <Visor className="mt" archivo={archivo} titulo={titulo} error={error} />
            <p className="nota">Solo lectura: el documento se ve dentro del portal, sin botones de descargar ni imprimir.</p>
          </>
        )}
      </SegunCarga>
    </Pantalla>
  );
}
