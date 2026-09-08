/* =========================================================
   Unidad Educativa Particular OEA — main.js
   ========================================================= */

/* ---------- Navegación: menú móvil y header al hacer scroll ---------- */
document.addEventListener('error', (evento) => {
  if (evento.target instanceof HTMLImageElement) {
    evento.target.style.visibility = 'hidden';
  }
}, true);

document.querySelectorAll('img').forEach((imagen) => {
  if (imagen.complete && imagen.naturalWidth === 0) {
    imagen.style.visibility = 'hidden';
  }
});

(function initNav() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cierra el menú al elegir un enlace (útil en móvil)
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();

/* =========================================================
   Eventos dinámicos
   ---------------------------------------------------------
   El backend (NestJS + Prisma + Supabase) expone un endpoint
   REST del que este script consume los eventos que la
   directora del colegio publica manualmente desde un panel
   de administración.

   Formato esperado de la respuesta (JSON):
   [
     {
       "id": "uuid",
       "title": "Feria de Ciencias 2026",
       "description": "Nuestros estudiantes exponen sus proyectos...",
       "date": "2026-10-15T00:00:00.000Z",
       "imageUrl": "https://.../feria-ciencias.jpg"
     },
     ...
   ]
   ========================================================= */

/* =========================================================
   Eventos — publicados de forma manual
   ---------------------------------------------------------
   La directora (o cualquier persona del colegio) edita
   directamente el archivo data/eventos.json para agregar,
   quitar o modificar eventos, sin tocar código ni depender
   de un backend. Instrucciones en data/COMO-AGREGAR-EVENTOS.txt.

   Más adelante, cuando el backend (NestJS + Prisma + Supabase)
   esté listo, basta con cambiar EVENTOS_CONFIG.apiUrl para que
   apunte al endpoint real (por ejemplo
   'https://api.colegiooea.edu.ec/events'); el resto del código
   (estados de carga, formato de fecha, tarjetas) sigue
   funcionando igual.

   Formato esperado en el JSON:
   [
     {
       "title": "Feria de Ciencias 2026",
       "date": "2026-10-14",
       "description": "Nuestros estudiantes exponen sus proyectos...",
       "imageUrl": "../img/feria-ciencias.jpg"
     },
     ...
   ]
   ========================================================= */

const EVENTOS_CONFIG = {
  // Fuente manual actual: el archivo que edita el colegio.
  // Para conectar el backend real, reemplazar por su URL, ej:
  // 'https://api.colegiooea.edu.ec/events'
  apiUrl: `${CONFIG.API_URL}/events`,
  maxEventos: 6,
};

async function cargarEventos() {
  const grid = document.getElementById('eventos-grid');
  const estado = document.getElementById('eventos-estado');
  const errorBox = document.getElementById('eventos-error');
  const template = document.getElementById('evento-card-template');

  if (!grid || !template) return;

  mostrarCargando(estado, errorBox, grid);

  try {
    const respuesta = await fetch(EVENTOS_CONFIG.apiUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!respuesta.ok) {
      throw new Error(`No se pudo leer el archivo de eventos (estado ${respuesta.status})`);
    }

    const datos = await respuesta.json();
    const eventos = Array.isArray(datos) ? datos : datos.events || [];

    renderizarEventos(eventos.slice(0, EVENTOS_CONFIG.maxEventos), grid, template);
  } catch (error) {
    console.error('No se pudieron cargar los eventos:', error);
    mostrarError(
      errorBox,
      'No se pudieron cargar los eventos. La API no está disponible o el servidor ' +
      'está bloqueando la solicitud desde Vercel. Revisa el despliegue y la configuración ' +
      'CORS del backend.'
    );
    grid.innerHTML = '';
  } finally {
    ocultarCargando(estado);
  }
}

function mostrarCargando(estado, errorBox, grid) {
  if (estado) estado.hidden = false;
  if (errorBox) errorBox.hidden = true;
  if (grid) grid.innerHTML = '';
}

function ocultarCargando(estado) {
  if (estado) estado.hidden = true;
}

function mostrarError(errorBox, mensaje) {
  if (!errorBox) return;
  errorBox.hidden = false;
  errorBox.textContent = mensaje;
}

function renderizarEventos(eventos, grid, template) {
  grid.innerHTML = '';

  if (!eventos.length) {
    const vacio = document.createElement('p');
    vacio.className = 'eventos-vacio';
    vacio.textContent = 'Aún no hay eventos publicados. Vuelve pronto.';
    grid.appendChild(vacio);
    return;
  }

  const formatoFecha = new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fragmento = document.createDocumentFragment();

  eventos.forEach((evento) => {
    const nodo = template.content.cloneNode(true);

    const imagenWrap = nodo.querySelector('.evento-imagen');
    const img = nodo.querySelector('.evento-imagen img');
    const fecha = nodo.querySelector('.evento-fecha');
    const titulo = nodo.querySelector('.evento-titulo');
    const descripcion = nodo.querySelector('.evento-descripcion');

    const tieneFotoReal = Boolean(evento.imageUrl) && !/escudo-oea\.png$/i.test(evento.imageUrl);
    img.src = evento.imageUrl || 'img/escudo-oea.png';
    img.alt = evento.title ? `Imagen del evento: ${evento.title}` : 'Imagen del evento';
    imagenWrap.classList.toggle('evento-imagen--placeholder', !tieneFotoReal);

    fecha.textContent = evento.date
      ? formatoFecha.format(new Date(evento.date))
      : 'Fecha por confirmar';

    titulo.textContent = evento.title || 'Evento sin título';
    descripcion.textContent = evento.description || '';

    fragmento.appendChild(nodo);
  });

  grid.appendChild(fragmento);
}

document.addEventListener('DOMContentLoaded', cargarEventos);

/* =========================================================
   Formulario de Matriculación
   ---------------------------------------------------------
   Envía los datos al mismo backend que atiende /events.
   Mientras el backend no esté desplegado, MATRICULAS_CONFIG.apiUrl
   no va a responder y el formulario mostrará un mensaje de error
   pidiendo usar WhatsApp o correo como alternativa.
   ========================================================= */

const MATRICULAS_CONFIG = {
  // Cuando el backend esté desplegado, reemplazar por su URL real, ej:
  // 'https://oea-backend.onrender.com/matriculas'
  apiUrl: `${CONFIG.API_URL}/matriculas`,
};

(function initMatriculaForm() {
  const form = document.getElementById('matricula-form');
  if (!form) return;

  const estado = document.getElementById('matricula-estado');
  const nivelSelect = document.getElementById('nivel');
  const jornadaInput = document.getElementById('jornada');
  const jornadaValor = document.getElementById('jornada-valor');

  // La jornada depende del nivel, no es una elección libre:
  // Educación Inicial y Básica son en la mañana; Bachillerato en la tarde.
  const JORNADA_POR_NIVEL = {
    INICIAL: { valor: 'MATUTINA', etiqueta: 'Matutina' },
    BASICA: { valor: 'MATUTINA', etiqueta: 'Matutina' },
    BACHILLERATO: { valor: 'VESPERTINA', etiqueta: 'Vespertina' },
  };

  if (nivelSelect && jornadaInput && jornadaValor) {
    nivelSelect.addEventListener('change', () => {
      const jornada = JORNADA_POR_NIVEL[nivelSelect.value];
      if (jornada) {
        jornadaInput.value = jornada.valor;
        jornadaValor.textContent = jornada.etiqueta;
      } else {
        jornadaInput.value = '';
        jornadaValor.textContent = 'Selecciona un nivel primero';
      }
    });
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (!form.checkValidity() || !jornadaInput.value) {
      form.reportValidity();
      return;
    }

    const datos = Object.fromEntries(new FormData(form).entries());
    // Quita campos opcionales vacíos para no enviarlos como cadena vacía
    if (!datos.emailRepresentante) delete datos.emailRepresentante;
    if (!datos.mensaje) delete datos.mensaje;

    const boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = 'Enviando…';
    mostrarEstadoFormulario(estado, null);

    try {
      const respuesta = await fetch(MATRICULAS_CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (!respuesta.ok) {
        throw new Error(`El servidor respondió con estado ${respuesta.status}`);
      }

      form.reset();
      mostrarEstadoFormulario(
        estado,
        'ok',
        '¡Listo! Recibimos tu solicitud y nos pondremos en contacto pronto.'
      );
    } catch (error) {
      console.error('No se pudo enviar la matrícula:', error);
      mostrarEstadoFormulario(
        estado,
        'error',
        'No se pudo enviar el formulario en este momento. Por favor escríbenos ' +
        'directamente por WhatsApp o correo mientras lo solucionamos.'
      );
    } finally {
      boton.disabled = false;
      boton.textContent = 'Enviar solicitud';
    }
  });
})();

function mostrarEstadoFormulario(estadoEl, tipo, mensaje) {
  if (!estadoEl) return;
  if (!tipo) {
    estadoEl.hidden = true;
    return;
  }
  estadoEl.hidden = false;
  estadoEl.className = `matricula-form-estado ${tipo}`;
  estadoEl.textContent = mensaje;
}
