# Diagrama de contexto (C4, nivel 1)

Módulo de Comunicación con el Cliente · Equipo 3 · Grupo 711

## Qué muestra este diagrama

El modelo C4 describe un sistema en niveles, del más general al más detallado. Este es el nivel 1, el contexto: el sistema aparece como una sola caja, junto con las personas que lo usan y los sistemas externos con los que se comunica. No muestra tecnologías ni pantallas; eso está en [CONTAINERS.md](CONTAINERS.md).

Colores: azul oscuro = persona, azul = nuestro sistema, gris = sistema externo. La línea continua es comunicación a través del sistema; la punteada, comunicación fuera de él.

## Diagrama

```mermaid
flowchart TB
    admin["<b>Administrador</b><br/>[Persona]<br/>Personal de la vidriería"]
    cliente["<b>Cliente</b><br/>[Persona]<br/>Empresa que contrata a la vidriería"]

    portal["<b>Portal de Proyectos</b><br/>[Sistema de software]<br/>Centraliza solicitudes y permite consultar proyectos"]
    canales["<b>Canales de contacto</b><br/>[Sistema externo]<br/>WhatsApp, llamadas y redes sociales"]
    actual["<b>Sistema actual de la empresa</b><br/>[Sistema externo]<br/>Avance, fotografías y presupuestos"]
    correo["<b>Servicio de correo</b><br/>[Sistema externo]<br/>Envía avisos por correo electrónico"]

    cliente -->|"Consulta sus obras y usa el chat [HTTPS]"| portal
    admin -->|"Registra clientes y solicitudes, responde chats [HTTPS]"| portal
    cliente -.->|"Escribe o llama"| canales
    admin -.->|"Revisa lo que llega y lo captura en el portal"| canales
    portal -->|"Lee avance, fotos y presupuesto"| actual
    portal -->|"Pide enviar avisos"| correo
    correo -.->|"Avisa al responsable"| admin

    classDef person fill:#08427b,stroke:#052e56,color:#ffffff
    classDef system fill:#1168bd,stroke:#0b4884,color:#ffffff
    classDef external fill:#8a8a8a,stroke:#6b6b6b,color:#ffffff
    class admin,cliente person
    class portal system
    class canales,actual,correo external
```

## Personas


| Persona | Quién es | Qué hace en el sistema | Requerimientos |
| :--- | :--- | :--- | :--- |
| Administrador | Personal de la vidriería: operadores e ingenieros. | Registra clientes y solicitudes, clasifica y asigna responsables, consulta el historial y atiende mensajes. | RF-01, RF-04, RF-05, RF-06 |
| Cliente | Empresa que contrata a la vidriería (una constructora, un despacho o un negocio). | Consulta el avance de sus obras, fotografías, reportes y documentos autorizados mediante un acceso seguro. | RF-07, RF-08, RNF-06 |

## Sistemas externos

> Pendiente: tabla de sistemas externos (Jorge).

## Relaciones

> Pendiente: tabla de relaciones (Jorge).
