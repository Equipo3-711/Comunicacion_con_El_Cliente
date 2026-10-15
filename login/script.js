
const usuarios = [
    {
        correo: "admin@proyecto.com",
        contrasena: "123456",
        rol: "admin",
        nombre: "Administrador"
    },
    {
        correo: "cliente@proyecto.com",
        contrasena: "123456",
        rol: "cliente",
        nombre: "Cliente de prueba"
    }
];

const formulario = document.getElementById("formLogin");
const login = document.getElementById("login");
const panel = document.getElementById("panel");
const mensaje = document.getElementById("mensaje");
const bienvenida = document.getElementById("bienvenida");
const datosAdmin = document.getElementById("datosAdmin");
const aviso = document.getElementById("aviso");

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    const usuario = usuarios.find(function(item) {
        return item.correo === correo &&
               item.contrasena === contrasena;
    });

    if (!usuario) {
        mensaje.textContent = "Correo o contraseña incorrectos.";
        return;
    }

    login.classList.add("oculto");
    panel.classList.remove("oculto");

    bienvenida.textContent =
        "Bienvenido/a, " + usuario.nombre +
        " | Rol: " + usuario.rol;

    if (usuario.rol === "admin") {
        datosAdmin.classList.remove("oculto");
        aviso.textContent = "Tienes acceso de administrador.";
    } else {
        datosAdmin.classList.add("oculto");
        aviso.textContent =
            "Solo puedes consultar la información autorizada de tu proyecto.";
    }
});

document.getElementById("cerrarSesion").addEventListener("click", function() {
    panel.classList.add("oculto");
    login.classList.remove("oculto");

    formulario.reset();
    mensaje.textContent = "";
    bienvenida.textContent = "";
    aviso.textContent = "";
    datosAdmin.classList.add("oculto");
});

const botonChat = document.getElementById("botonChat");
const ventanaChat = document.getElementById("ventanaChat");
const cerrarChat = document.getElementById("cerrarChat");
const formChat = document.getElementById("formChat");
const textoChat = document.getElementById("textoChat");
const mensajesChat = document.getElementById("mensajesChat");

botonChat.addEventListener("click", function() {
    ventanaChat.classList.remove("oculto");
});

cerrarChat.addEventListener("click", function() {
    ventanaChat.classList.add("oculto");
});

formChat.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const texto = textoChat.value.trim();

    if (texto === "") {
        return;
    }

    const mensaje = document.createElement("div");
    mensaje.classList.add("mensaje", "cliente");
    mensaje.textContent = texto;

    mensajesChat.appendChild(mensaje);
    textoChat.value = "";

    mensajesChat.scrollTop = mensajesChat.scrollHeight;
});
