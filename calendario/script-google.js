// Script para el Google Calendar de Territorio Saludable.
// Se pega en script.google.com (con el Gmail dueño del calendario) y se publica como "Aplicación web".
// El bot de WhatsApp lo llama cuando se aprueba un pago, y aquí se crea el evento con sus recordatorios.

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var calendario = CalendarApp.getDefaultCalendar();
    var opciones = { description: d.descripcion || '', location: d.ubicacion || '' };
    if (d.invitados) {
      opciones.guests = d.invitados;
      opciones.sendInvites = true;
    }
    var evento = d.todoElDia
      ? calendario.createAllDayEvent(d.titulo, new Date(d.inicio), opciones)
      : calendario.createEvent(d.titulo, new Date(d.inicio), new Date(d.fin), opciones);
    evento.removeAllReminders();
    (d.recordatoriosMinutos || [1440, 120]).forEach(function (minutos) {
      evento.addPopupReminder(minutos);
    });
    return respuesta({ ok: true, id: evento.getId() });
  } catch (error) {
    return respuesta({ ok: false, error: String(error) });
  }
}

// Para probar que quedó publicado: al abrir el enlace en el navegador debe decir {"ok":true,"listo":true}
function doGet() {
  return respuesta({ ok: true, listo: true });
}

function respuesta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
