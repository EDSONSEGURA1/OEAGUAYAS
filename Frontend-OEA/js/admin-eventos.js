const estadoEventos = { lista: [], indiceEditando: -1 };
const $ = (selector) => document.querySelector(selector);

async function cargarEventosAdmin() {
  try {
    const respuesta = await fetch('data/eventos.json');
    if (!respuesta.ok) throw new Error('No se pudo leer eventos.json');
    estadoEventos.lista = await respuesta.json();
    renderizarLista();
  } catch (error) {
    mostrarMensaje('No se pudieron cargar los eventos. Abre esta página con Live Server.', true);
  }
}

function renderizarLista() {
  const contenedor = $('#eventos-admin-lista');
  contenedor.innerHTML = '';

  estadoEventos.lista.forEach((evento, indice) => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'admin-evento-item';
    tarjeta.innerHTML = `
      <div>
        <strong></strong>
        <span></span>
        <p></p>
      </div>
      <div class="admin-item-acciones">
        <button class="btn btn-secondary" type="button" data-editar="${indice}">Editar</button>
        <button class="btn btn-danger" type="button" data-eliminar="${indice}">Eliminar</button>
      </div>`;
    tarjeta.querySelector('strong').textContent = evento.title;
    tarjeta.querySelector('span').textContent = evento.date;
    tarjeta.querySelector('p').textContent = evento.description;
    contenedor.appendChild(tarjeta);
  });

  if (!estadoEventos.lista.length) {
    contenedor.innerHTML = '<p class="admin-vacio">Todavía no hay eventos guardados.</p>';
  }
}

async function leerFormulario() {
  const eventoAnterior = estadoEventos.lista[Number($('#evento-indice').value)];
  const fotoPrincipal = $('#evento-imagen').files[0];
  const fotosAdicionales = [...$('#evento-galeria').files];
  const imageUrl = fotoPrincipal
    ? await leerImagen(fotoPrincipal)
    : eventoAnterior?.imageUrl || 'img/escudo-oea.png';
  const imageUrls = fotosAdicionales.length
    ? [imageUrl, ...await Promise.all(fotosAdicionales.map(leerImagen))]
    : eventoAnterior?.imageUrls || undefined;

  return {
    title: $('#evento-titulo').value.trim(),
    date: $('#evento-fecha').value,
    description: $('#evento-descripcion').value.trim(),
    details: $('#evento-detalles').value.trim(),
    imageUrl,
    imageUrls,
  };
}

function leerImagen(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

function llenarFormulario(evento, indice) {
  $('#evento-indice').value = indice;
  $('#evento-titulo').value = evento.title || '';
  $('#evento-fecha').value = evento.date || '';
  $('#evento-descripcion').value = evento.description || '';
  $('#evento-detalles').value = evento.details || '';
  $('#evento-imagen').value = '';
  $('#evento-galeria').value = '';
  $('#form-titulo').textContent = 'Editar evento';
  $('#cancelar-edicion').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limpiarFormulario() {
  $('#evento-form').reset();
  $('#evento-indice').value = '-1';
  $('#form-titulo').textContent = 'Nuevo evento';
  $('#cancelar-edicion').hidden = true;
}

function mostrarMensaje(mensaje, error = false) {
  const elemento = $('#admin-mensaje');
  elemento.textContent = mensaje;
  elemento.classList.toggle('admin-mensaje-error', error);
}

$('#evento-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const evento = await leerFormulario();
  const indice = Number($('#evento-indice').value);
  if (indice >= 0) estadoEventos.lista[indice] = evento;
  else estadoEventos.lista.unshift(evento);
  renderizarLista();
  limpiarFormulario();
  mostrarMensaje('Evento preparado. Descarga eventos.json para publicarlo.');
});

$('#cancelar-edicion').addEventListener('click', limpiarFormulario);

$('#eventos-admin-lista').addEventListener('click', (event) => {
  const editar = event.target.closest('[data-editar]');
  const eliminar = event.target.closest('[data-eliminar]');
  if (editar) llenarFormulario(estadoEventos.lista[Number(editar.dataset.editar)], Number(editar.dataset.editar));
  if (eliminar) {
    estadoEventos.lista.splice(Number(eliminar.dataset.eliminar), 1);
    renderizarLista();
    mostrarMensaje('Evento eliminado del borrador. Descarga eventos.json para aplicar el cambio.');
  }
});

$('#descargar-eventos').addEventListener('click', () => {
  const contenido = JSON.stringify(estadoEventos.lista, null, 2);
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(new Blob([contenido], { type: 'application/json' }));
  enlace.download = 'eventos.json';
  enlace.click();
  URL.revokeObjectURL(enlace.href);
  mostrarMensaje('Archivo descargado. Reemplaza Frontend-OEA/data/eventos.json con él.');
});

cargarEventosAdmin();
