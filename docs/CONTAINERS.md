# Diagrama de contenedores (C4, nivel 2)

Módulo de Comunicación con el Cliente · Equipo 3 · Grupo 711

## Qué muestra este diagrama

Este es el nivel 2 del modelo C4. Abre la caja del Portal de Proyectos que aparece en [CONTEXT.md](CONTEXT.md) y muestra sus contenedores: las partes que se ejecutan o guardan datos por separado, con la tecnología de cada una y cómo se comunican.

La propuesta respeta la regla de `AGENTS.md`: las vistas (aplicación web) van separadas de la lógica de conexión (API).

## Diagrama


```mermaid
flowchart TB
    admin["<b>Administrador</b><br/>[Persona]<br/>Personal de la vidriería"]
    cliente["<b>Cliente</b><br/>[Persona]<br/>Empresa que contrata"]

    subgraph portal["Portal de Proyectos · Sistema de software"]
        web["<b>Aplicación web</b><br/>[Contenedor: HTML, CSS y JavaScript]<br/>Login, panel del administrador,<br/>panel del cliente y chat"]
        api["<b>API del portal</b><br/>[Contenedor: Node.js y Express]<br/>Sesiones y roles, clientes, solicitudes,<br/>chat, preguntas frecuentes e historial"]
        db[("<b>Base de datos</b><br/>[Contenedor: MySQL]<br/>Usuarios, empresas, obras, solicitudes,<br/>mensajes y preguntas frecuentes")]
        files[("<b>Archivos</b><br/>[Contenedor: carpeta en el servidor]<br/>Fotos de avance y documentos")]
    end

    actual["<b>Sistema actual de la empresa</b><br/>[Sistema externo]"]
    correo["<b>Servicio de correo</b><br/>[Sistema externo]"]

    admin -->|"Usa [HTTPS]"| web
    cliente -->|"Usa [HTTPS]"| web
    web -->|"Pide y envía datos [JSON por HTTPS]"| api
    api -->|"Lee y escribe [SQL]"| db
    api -->|"Guarda y lee fotos y documentos"| files
    api -->|"Consulta avance y fotos"| actual
    api -->|"Envía avisos [SMTP]"| correo

    classDef person fill:#08427b,stroke:#052e56,color:#ffffff
    classDef container fill:#438dd5,stroke:#2e6295,color:#ffffff
    classDef external fill:#8a8a8a,stroke:#6b6b6b,color:#ffffff
    class admin,cliente person
    class web,api,db,files container
    class actual,correo external
    style portal fill:none,stroke:#1168bd,stroke-dasharray:6 4
```


## **Contenedores**

| Contenedor | Tecnología | Qué hace | Requerimientos |
| :--- | :--- | :--- | :--- |
| Aplicación web | HTML, CSS y JavaScript | Contiene las pantallas de inicio de sesión, panel del administrador, panel del cliente y chat. Muestra los datos y los envía a la API, sin guardar información por su cuenta. | RNF-01, RNF-05, RNF-06 |
| API del portal | Node.js con Express | Valida usuarios, contraseñas y roles. Guarda y entrega clientes, obras, solicitudes, mensajes y preguntas frecuentes, y responde en formato JSON. | RF-01 a RF-08, RF-13, RNF-02, RNF-03 |
| Base de datos | MySQL | Guarda usuarios, empresas, obras, solicitudes, mensajes del chat durante al menos 12 meses y preguntas frecuentes. Se realizan respaldos diarios. | RF-06, RNF-07, RNF-08 |
| Archivos | Carpeta en el servidor | Guarda fotografías de avance y documentos de cada obra. | RF-07, RF-10 |

## **Qué se construye en el prototipo**

En la Iteración 5 se construirá únicamente la aplicación web. La API y la base de datos se simularán con datos de ejemplo almacenados en un archivo JavaScript independiente, para mantener separadas las vistas y los datos. Cuando se implemente la API real, se sustituirá el archivo que proporciona los datos simulados por la conexión correspondiente, sin necesidad de rehacer las pantallas.

Las pantallas del prototipo serán las definidas en `docs/diseno`:

- Inicio de sesión.
- Panel del administrador.
- Panel del cliente.
- Chat del administrador con lista de clientes.
- Chat del cliente con preguntas frecuentes.
