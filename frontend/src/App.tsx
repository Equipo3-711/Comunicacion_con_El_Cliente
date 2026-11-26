// Rutas del portal. Cada pantalla se descarga solo cuando se abre.
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ProveedorAvisos } from './componentes/Avisos';
import { Cargando } from './componentes/Estados';
import { ProveedorSesion, RutaProtegida } from './sesion/Sesion';

const Login = lazy(() => import('./paginas/Login'));
const Registro = lazy(() => import('./paginas/Registro'));
const NoEncontrada = lazy(() => import('./paginas/NoEncontrada'));
const MisProyectos = lazy(() => import('./paginas/cliente/MisProyectos'));
const Cotizacion = lazy(() => import('./paginas/cliente/Cotizacion'));
const ProyectoDetalle = lazy(() => import('./paginas/cliente/ProyectoDetalle'));
const Documento = lazy(() => import('./paginas/cliente/Documento'));
const ChatCliente = lazy(() => import('./paginas/cliente/ChatCliente'));
const Inicio = lazy(() => import('./paginas/arquitecto/Inicio'));
const Solicitudes = lazy(() => import('./paginas/arquitecto/Solicitudes'));
const CotizacionDetalle = lazy(() => import('./paginas/arquitecto/CotizacionDetalle'));
const Proyecto = lazy(() => import('./paginas/arquitecto/Proyecto'));
const ChatArquitecto = lazy(() => import('./paginas/arquitecto/ChatArquitecto'));
const Preguntas = lazy(() => import('./paginas/arquitecto/Preguntas'));

export function Rutas() {
  return (
    <Suspense fallback={<div className="w"><Cargando /></div>}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route element={<RutaProtegida roles={['cliente']} />}>
          <Route path="/cliente" element={<MisProyectos />} />
          <Route path="/cliente/cotizacion" element={<Cotizacion />} />
          <Route path="/cliente/cotizacion/:id" element={<Cotizacion />} />
          <Route path="/cliente/proyectos/:id/chat" element={<ChatCliente />} />
        </Route>

        {/* El arquitecto también abre la vista del cliente y sus documentos. */}
        <Route element={<RutaProtegida roles={['cliente', 'admin']} />}>
          <Route path="/cliente/proyectos/:id" element={<ProyectoDetalle />} />
          <Route path="/cliente/proyectos/:id/documentos/:documentoId" element={<Documento />} />
        </Route>

        <Route element={<RutaProtegida roles={['admin']} />}>
          <Route path="/arquitecto" element={<Inicio />} />
          <Route path="/arquitecto/solicitudes" element={<Solicitudes />} />
          <Route path="/arquitecto/preguntas" element={<Preguntas />} />
          <Route path="/arquitecto/cotizaciones/:id" element={<CotizacionDetalle />} />
          <Route path="/arquitecto/proyectos/:id" element={<Proyecto />} />
          <Route path="/arquitecto/proyectos/:id/chat" element={<ChatArquitecto />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProveedorSesion>
        <ProveedorAvisos>
          <Rutas />
        </ProveedorAvisos>
      </ProveedorSesion>
    </BrowserRouter>
  );
}
